import * as vscode from "vscode";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { createGenerateTestsCommand } = require("./commands/generateTests");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { createGenerateFromSelectionCommand } = require("./commands/generateFromSelection");

const TOKEN_KEY = "testnova.token";
const BASE_URL_KEY = "testnova.apiBaseUrl";

export function activate(context: vscode.ExtensionContext): void {
  const provider = new TestNovaSidebarProvider(context);

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider("testnova.sidebar", provider)
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("testnova.openChat", () => {
      provider.reveal();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "testnova.generateTests",
      createGenerateTestsCommand(context)
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "testnova.generateFromSelection",
      createGenerateFromSelectionCommand(context)
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("testnova.setApiBaseUrl", async () => {
      const current = getApiBaseUrl(context);
      const value = await vscode.window.showInputBox({
        title: "Set TestNova API Base URL",
        value: current,
        placeHolder: "https://testnovatool.vercel.app/api",
        ignoreFocusOut: true,
      });

      if (!value) {
        return;
      }

      await context.workspaceState.update(BASE_URL_KEY, value.trim());
      provider.postState();
      vscode.window.showInformationMessage("TestNova API Base URL updated.");
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("testnova.setToken", async () => {
      const token = await vscode.window.showInputBox({
        title: "Set TestNova Auth Token",
        password: true,
        ignoreFocusOut: true,
        placeHolder: "Paste JWT token",
      });

      if (!token) {
        return;
      }

      await context.secrets.store(TOKEN_KEY, token.trim());
      provider.postState();
      vscode.window.showInformationMessage("TestNova token saved.");
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("testnova.clearToken", async () => {
      await context.secrets.delete(TOKEN_KEY);
      provider.postState();
      vscode.window.showInformationMessage("TestNova token cleared.");
    })
  );
}

export function deactivate(): void {
  // no-op
}

class TestNovaSidebarProvider implements vscode.WebviewViewProvider {
  private view?: vscode.WebviewView;
  private editorListener?: vscode.Disposable;

  constructor(private readonly context: vscode.ExtensionContext) {}

  resolveWebviewView(webviewView: vscode.WebviewView): void {
    this.view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
    };

    webviewView.webview.html = this.getHtml(webviewView.webview);

    this.editorListener?.dispose();
    this.editorListener = vscode.window.onDidChangeActiveTextEditor((editor) => {
      this.postActiveEditorContext(editor);
    });

    webviewView.webview.onDidReceiveMessage(async (message: Record<string, unknown>) => {
      const type = String(message.type || "");

      if (type === "ready") {
        await this.postState();
        await this.postActiveEditorContext(vscode.window.activeTextEditor);
        return;
      }

      if (type === "saveConfig") {
        const apiBaseUrl = String(message.apiBaseUrl || "").trim();
        const token = String(message.token || "").trim();

        if (apiBaseUrl) {
          await this.context.workspaceState.update(BASE_URL_KEY, apiBaseUrl);
        }

        if (token) {
          await this.context.secrets.store(TOKEN_KEY, token);
        }

        await this.postState();
        return;
      }

      if (type === "saveApiBaseUrl") {
        const apiBaseUrl = String(message.apiBaseUrl || "").trim();
        if (apiBaseUrl) {
          await this.context.workspaceState.update(BASE_URL_KEY, apiBaseUrl);
          await this.postState();
        }
        return;
      }

      if (type === "login" || type === "register") {
        const email = String(message.email || "").trim();
        const password = String(message.password || "").trim();
        const name = String(message.name || "").trim();
        if (!email || !password || (type === "register" && !name)) {
          await this.postMessage({ type: "authError", message: "Missing fields." });
          return;
        }

        const apiBaseUrl = getApiBaseUrl(this.context);
        const endpoint = type === "register" ? "/auth/register" : "/auth/login";
        try {
          const response = await fetch(`${apiBaseUrl}${endpoint}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(
              type === "register" ? { name, email, password } : { email, password }
            ),
          });
          const data = (await response.json()) as { token?: string; user?: { name?: string; email?: string } ; message?: string };
          if (!response.ok) {
            throw new Error(data.message || `HTTP ${response.status}`);
          }
          if (data.token) {
            await this.context.secrets.store(TOKEN_KEY, data.token);
          }
          if (data.user) {
            await this.context.workspaceState.update("testnova.user", data.user);
          }
          await this.postState();
        } catch (error) {
          const messageText = error instanceof Error ? error.message : "Authentication failed";
          await this.postMessage({ type: "authError", message: messageText });
        }
        return;
      }

      if (type === "clearToken") {
        await this.context.secrets.delete(TOKEN_KEY);
        await this.context.workspaceState.update("testnova.user", undefined);
        await this.postState();
        return;
      }

      if (type === "openLogin") {
        const apiBaseUrl = getApiBaseUrl(this.context);
        const loginUrl = getLoginUrl(apiBaseUrl);
        await vscode.env.openExternal(vscode.Uri.parse(loginUrl));
        return;
      }

      if (type === "requestEditorContext") {
        const scope = String(message.scope || "selection");
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
          await this.postMessage({ type: "error", message: "No active editor. Open a file first." });
          return;
        }

        const text =
          scope === "file"
            ? editor.document.getText()
            : editor.document.getText(editor.selection);

        if (!text.trim()) {
          await this.postMessage({ type: "error", message: "Selected context is empty." });
          return;
        }

        await this.postMessage({
          type: "editorContext",
          scope,
          text,
          languageId: editor.document.languageId,
          fileName: editor.document.fileName,
        });
        return;
      }

      if (type === "sendPrompt") {
        const prompt = String(message.prompt || "").trim();
        const conversationId = String(message.conversationId || "").trim();

        if (!prompt || !conversationId) {
          await this.postMessage({ type: "error", message: "Prompt and conversation id are required." });
          return;
        }

        const token = await this.context.secrets.get(TOKEN_KEY);
        if (!token) {
          await this.postMessage({ type: "error", message: "Token not set. Run 'TestNova: Set Auth Token'." });
          return;
        }

        const apiBaseUrl = getApiBaseUrl(this.context);

        try {
          const response = await fetch(`${apiBaseUrl}/chat`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ conversationId, prompt }),
          });

          const data = (await response.json()) as { response?: string; message?: string };

          if (!response.ok) {
            throw new Error(data.message || `HTTP ${response.status}`);
          }

          await this.postMessage({
            type: "assistantResponse",
            response: data.response || "",
          });
        } catch (error) {
          const messageText = error instanceof Error ? error.message : "Unknown error";
          await this.postMessage({ type: "error", message: messageText });
        }
      }
    });
  }

  reveal(): void {
    this.view?.show?.(true);
  }

  async postState(): Promise<void> {
    const token = await this.context.secrets.get(TOKEN_KEY);
    const user = this.context.workspaceState.get("testnova.user");
    await this.postMessage({
      type: "state",
      apiBaseUrl: getApiBaseUrl(this.context),
      loginUrl: getLoginUrl(getApiBaseUrl(this.context)),
      hasToken: Boolean(token),
      user,
    });
  }

  private async postMessage(message: Record<string, unknown>): Promise<void> {
    if (!this.view) {
      return;
    }

    await this.view.webview.postMessage(message);
  }

  private async postActiveEditorContext(editor?: vscode.TextEditor): Promise<void> {
    if (!editor) {
      await this.postMessage({ type: "contextCleared" });
      return;
    }

    const text = editor.document.getText();
    if (!text.trim()) {
      await this.postMessage({ type: "contextCleared" });
      return;
    }

    await this.postMessage({
      type: "editorContext",
      scope: "file",
      text,
      languageId: editor.document.languageId,
      fileName: editor.document.fileName,
      auto: true,
    });
  }

  private getHtml(webview: vscode.Webview): string {
    const nonce = String(Date.now());

    return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}';" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>TestNova</title>
  <style>
    :root {
      --panel: var(--vscode-sideBar-background);
      --border: var(--vscode-panel-border);
      --muted: color-mix(in srgb, var(--vscode-foreground) 60%, transparent);
      --accent: var(--vscode-textLink-foreground);
      --surface: color-mix(in srgb, var(--panel) 92%, white);
      --bubble-user: color-mix(in srgb, var(--vscode-editorInfo-foreground) 14%, transparent);
      --bubble-assistant: color-mix(in srgb, var(--vscode-terminal-ansiGreen) 12%, transparent);
    }
    * { box-sizing: border-box; }
    body { font-family: var(--vscode-font-family); color: var(--vscode-foreground); padding: 10px 12px 12px; margin: 0; height: 100vh; }
    button, input, textarea { font-family: inherit; }
    .app { display: flex; flex-direction: column; gap: 10px; height: 100%; }
    .topbar { display: flex; align-items: center; justify-content: space-between; }
    .brand { font-weight: 600; letter-spacing: 0.02em; }
    .status { font-size: 12px; color: var(--muted); }
    .card { border: 1px solid var(--border); border-radius: 10px; padding: 8px; background: var(--surface); }
    .section { padding-bottom: 8px; border-bottom: 1px solid var(--border); }
    .section:last-of-type { border-bottom: none; }
    .section-title { font-size: 10px; text-transform: uppercase; letter-spacing: 0.12em; color: var(--muted); margin-bottom: 4px; }
    .row { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
    input, textarea {
      width: 100%;
      background: var(--vscode-input-background);
      color: var(--vscode-input-foreground);
      border: 1px solid var(--vscode-input-border);
      border-radius: 8px;
      padding: 8px 10px;
    }
    textarea { min-height: 84px; resize: vertical; }
    button {
      border: 1px solid var(--border);
      background: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
      padding: 6px 10px;
      border-radius: 8px;
      cursor: pointer;
    }
    button.ghost { background: transparent; color: var(--vscode-foreground); }
    button:disabled { opacity: 0.6; cursor: not-allowed; }
    .tabs { display: inline-flex; gap: 4px; border-bottom: 1px solid var(--border); }
    .tab { border: none; background: transparent; padding: 4px 6px; border-radius: 6px 6px 0 0; }
    .tab.active { background: var(--surface); border: 1px solid var(--border); border-bottom-color: transparent; }
    .hint { color: var(--muted); font-size: 12px; }
    .ok { color: var(--vscode-testing-iconPassed); font-size: 12px; }
    .err { color: var(--vscode-testing-iconFailed); font-size: 12px; }
    .chat { flex: 1; border: 1px solid var(--border); border-radius: 12px; background: var(--panel); padding: 8px; overflow: auto; }
    .messages { display: flex; flex-direction: column; gap: 8px; }
    .msg { border-radius: 10px; padding: 8px 10px; white-space: pre-wrap; }
    .msg.user { align-self: flex-end; background: var(--bubble-user); border: 1px solid color-mix(in srgb, var(--bubble-user) 70%, var(--border)); }
    .msg.assistant { align-self: flex-start; background: var(--bubble-assistant); border: 1px solid color-mix(in srgb, var(--bubble-assistant) 70%, var(--border)); }
    .composer { background: var(--panel); padding-top: 6px; }
    .composer-actions { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-top: 6px; }
    .pill {
      border: 1px solid var(--border);
      border-radius: 999px;
      padding: 2px 8px;
      font-size: 10px;
      color: var(--muted);
      background: color-mix(in srgb, var(--panel) 90%, transparent);
    }
    .row-inline { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
    .toggle { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; color: var(--muted); }
    details summary { cursor: pointer; color: var(--muted); font-size: 12px; }
    .preview { background: color-mix(in srgb, var(--panel) 70%, transparent); border-radius: 8px; border: 1px dashed var(--border); padding: 8px; max-height: 120px; overflow: auto; white-space: pre-wrap; font-size: 12px; }
    .auth-fields { display: grid; gap: 6px; }
    .auth-row { display: flex; gap: 6px; align-items: center; }
    .auth-toggle { font-size: 12px; color: var(--muted); cursor: pointer; }
  </style>
</head>
<body>
  <div class="app">
    <div class="topbar">
      <div class="brand">TestNova</div>
      <div id="authStatus" class="status">Signed out</div>
    </div>

    <div class="section" id="authCard">
      <div class="section-title">Account</div>
      <div class="auth-fields">
        <input id="authName" placeholder="Name (for sign up)" />
        <input id="authEmail" placeholder="Email" />
        <input id="authPassword" type="password" placeholder="Password" />
        <div class="auth-row">
          <button id="authSubmit">Sign In</button>
          <button id="authSignOut" class="ghost">Sign Out</button>
          <span id="authToggle" class="auth-toggle">Create account</span>
        </div>
        <div id="authMessage" class="hint"></div>
      </div>
    </div>

    <div class="section">
      <div class="row-inline" style="justify-content: space-between;">
        <span class="section-title" style="margin: 0;">Mode</span>
        <div class="tabs" id="modeToggle">
          <button data-mode="chat" class="tab active">Chat</button>
          <button data-mode="tests" class="tab">Tests</button>
          <button data-mode="code" class="tab">Code</button>
        </div>
      </div>
      <div class="hint" id="modeHint">Chat with TestNova.</div>
    </div>

    <div class="section">
      <div class="section-title">Context</div>
      <div class="row-inline">
        <span id="contextMeta" class="pill">No context attached.</span>
        <label class="toggle">
          <input id="autoAttach" type="checkbox" checked />
          Auto-attach active file
        </label>
      </div>
      <div class="row" style="margin-top: 8px;">
        <button id="useSelection">Use Selection</button>
        <button id="useFile" class="ghost">Use Active File</button>
        <button id="clearContext" class="ghost">Clear</button>
      </div>
      <details style="margin-top: 6px;">
        <summary>Context preview</summary>
        <pre id="contextPreview" class="preview"></pre>
      </details>
    </div>

    <div class="chat">
      <div id="messages" class="messages"></div>
    </div>

    <div class="composer">
      <div class="composer-field">
        <textarea id="prompt" placeholder="Ask or describe what to generate..."></textarea>
      </div>
      <div class="composer-actions">
        <div id="status" class="hint"></div>
        <button id="sendPrompt" class="primary">Send</button>
      </div>
      <div class="hint">Enter to send. Shift+Enter for newline.</div>
    </div>

    <details class="settings" style="margin-top: 6px;">
      <summary>Settings</summary>
      <div class="section" style="margin-top: 8px;">
        <div class="section-title">API Base URL</div>
        <input id="apiBaseUrl" placeholder="https://testnovatool.vercel.app/api" />
        <div class="row" style="margin-top: 8px;">
          <button id="saveApiBaseUrl" class="ghost">Save Base URL</button>
        </div>
        <div class="hint">Default: https://testnovatool.vercel.app/api</div>
      </div>
      <div class="section">
        <div class="section-title">Conversation</div>
        <div class="row" style="width: 100%;">
          <input id="conversationId" />
          <button id="newConversation" class="ghost">New Chat</button>
        </div>
        <div class="hint">Each conversation keeps context on the server.</div>
      </div>
    </details>
  </div>

  <script nonce="${nonce}">
    const vscode = acquireVsCodeApi();

    const apiBaseUrlInput = document.getElementById("apiBaseUrl");
    const authName = document.getElementById("authName");
    const authEmail = document.getElementById("authEmail");
    const authPassword = document.getElementById("authPassword");
    const authSubmit = document.getElementById("authSubmit");
    const authSignOut = document.getElementById("authSignOut");
    const authToggle = document.getElementById("authToggle");
    const authMessage = document.getElementById("authMessage");
    const authStatus = document.getElementById("authStatus");
    const conversationIdInput = document.getElementById("conversationId");
    const promptInput = document.getElementById("prompt");
    const status = document.getElementById("status");
    const messages = document.getElementById("messages");
    const modeHint = document.getElementById("modeHint");
    const contextPreview = document.getElementById("contextPreview");
    const contextMeta = document.getElementById("contextMeta");
    const autoAttach = document.getElementById("autoAttach");

    let currentMode = "chat";
    let contextText = "";
    let contextLabel = "";
    let contextLanguage = "";
    let autoAttachEnabled = true;
    let isRegister = false;

    const createConversationId = () => {
      if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
      return Date.now() + "-" + Math.random().toString(36).slice(2, 10);
    };

    conversationIdInput.value = createConversationId();

    const renderMessage = (text, cls) => {
      const el = document.createElement("div");
      el.className = "msg " + cls;
      el.textContent = text;
      messages.appendChild(el);
      messages.scrollTop = messages.scrollHeight;
    };

    const setStatus = (text, kind) => {
      status.className = kind || "hint";
      status.textContent = text || "";
    };

    const clearContext = () => {
      contextText = "";
      contextLabel = "";
      contextLanguage = "";
      contextMeta.textContent = "No context attached.";
      contextPreview.textContent = "";
    };

    const updateContext = (text, label, languageId) => {
      contextText = text || "";
      contextLabel = label || "context";
      contextLanguage = languageId || "code";
      const lines = contextText.split("\\n").length;
      contextMeta.textContent = contextText
        ? contextLabel + " - " + lines + " lines - " + contextLanguage
        : "No context attached.";
      contextPreview.textContent = contextText.slice(0, 2000);
    };

    const modeHints = {
      chat: "Chat with TestNova.",
      tests: "Generate unit tests from the selected context.",
      code: "Generate code from your request and the selected context.",
    };

    const setMode = (mode) => {
      currentMode = mode;
      document.querySelectorAll("#modeToggle button").forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.mode === mode);
      });
      modeHint.textContent = modeHints[mode] || "";
    };

    document.getElementById("newConversation").addEventListener("click", () => {
      conversationIdInput.value = createConversationId();
      messages.textContent = "";
      setStatus("New chat started.", "hint");
    });

    authSubmit.addEventListener("click", () => {
      const email = String(authEmail.value || "").trim();
      const password = String(authPassword.value || "").trim();
      const name = String(authName.value || "").trim();
      if (!email || !password || (isRegister && !name)) {
        authMessage.className = "err";
        authMessage.textContent = "Enter required fields.";
        return;
      }
      authMessage.className = "hint";
      authMessage.textContent = isRegister ? "Creating account..." : "Signing in...";
      vscode.postMessage({
        type: isRegister ? "register" : "login",
        email,
        password,
        name,
      });
    });

    authSignOut.addEventListener("click", () => {
      vscode.postMessage({ type: "clearToken" });
    });

    authToggle.addEventListener("click", () => {
      isRegister = !isRegister;
      authSubmit.textContent = isRegister ? "Create Account" : "Sign In";
      authToggle.textContent = isRegister ? "Use sign in" : "Create account";
      authName.style.display = isRegister ? "block" : "none";
    });

    document.getElementById("saveApiBaseUrl").addEventListener("click", () => {
      vscode.postMessage({
        type: "saveApiBaseUrl",
        apiBaseUrl: apiBaseUrlInput.value,
      });
    });

    document.getElementById("useSelection").addEventListener("click", () => {
      vscode.postMessage({ type: "requestEditorContext", scope: "selection" });
    });

    document.getElementById("useFile").addEventListener("click", () => {
      vscode.postMessage({ type: "requestEditorContext", scope: "file" });
    });

    document.getElementById("clearContext").addEventListener("click", () => {
      clearContext();
    });

    autoAttach.addEventListener("change", () => {
      autoAttachEnabled = autoAttach.checked;
      if (!autoAttachEnabled) {
        clearContext();
      } else {
        vscode.postMessage({ type: "requestEditorContext", scope: "file" });
      }
    });

    document.getElementById("modeToggle").addEventListener("click", (event) => {
      const target = event.target;
      if (target && target.dataset && target.dataset.mode) {
        setMode(target.dataset.mode);
      }
    });

    const buildPrompt = (userPrompt) => {
      if (currentMode === "chat") {
        return userPrompt;
      }

      if (!contextText.trim()) {
        setStatus("Attach code context first.", "err");
        return "";
      }

      const languageLabel = contextLanguage || "code";
      if (currentMode === "tests") {
        return [
          "Generate production-ready unit tests for the following " + languageLabel + " code.",
          "Return only test code in plain text (no markdown).",
          "Use realistic edge cases and clear test names.",
          "",
          "Code (" + contextLabel + "):",
          contextText,
          "",
          "User request:",
          userPrompt || "Generate tests.",
        ].join("\\n");
      }

      return [
        "Generate production-ready " + languageLabel + " code for the following request.",
        "Use the provided context if relevant.",
        "",
        "Request:",
        userPrompt || "Generate code.",
        "",
        "Context (" + contextLabel + "):",
        contextText,
      ].join("\\n");
    };

    const sendPrompt = () => {
      const userPrompt = promptInput.value.trim();
      if (!userPrompt && currentMode === "chat") return;

      const prompt = buildPrompt(userPrompt);
      if (!prompt) return;

      const label =
        currentMode === "chat"
          ? userPrompt
          : (currentMode === "tests" ? "Generate tests" : "Generate code") +
            (contextLabel ? " using " + contextLabel : "") +
            (userPrompt ? "\\n\\nRequest: " + userPrompt : "");

      renderMessage(label, "user");
      setStatus("Sending...", "hint");

      vscode.postMessage({
        type: "sendPrompt",
        prompt,
        conversationId: conversationIdInput.value,
      });

      promptInput.value = "";
    };

    document.getElementById("sendPrompt").addEventListener("click", sendPrompt);
    promptInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        sendPrompt();
      }
    });

    window.addEventListener("message", (event) => {
      const message = event.data || {};

      if (message.type === "state") {
        apiBaseUrlInput.value = message.apiBaseUrl || "";
        const user = message.user || null;
        const hasToken = Boolean(message.hasToken);
        authStatus.textContent = hasToken
          ? "Signed in as " + (user && (user.name || user.email) ? (user.name || user.email) : "user")
          : "Signed out";
        authMessage.className = hasToken ? "ok" : "hint";
        authMessage.textContent = hasToken ? "Authenticated" : "";
        authSignOut.style.display = hasToken ? "inline-flex" : "none";
        authSubmit.style.display = hasToken ? "none" : "inline-flex";
        authToggle.style.display = hasToken ? "none" : "inline-flex";
        authName.style.display = isRegister ? "block" : "none";
      }

      if (message.type === "authError") {
        authMessage.className = "err";
        authMessage.textContent = message.message || "Authentication failed";
      }

      if (message.type === "editorContext") {
        if (message.auto && !autoAttachEnabled) {
          return;
        }
        updateContext(message.text || "", message.scope === "file" ? "active file" : "selection", message.languageId || "code");
        setStatus(message.auto ? "Active file attached." : "Context attached.", "ok");
      }

      if (message.type === "contextCleared") {
        if (!autoAttachEnabled) {
          return;
        }
        clearContext();
      }

      if (message.type === "assistantResponse") {
        setStatus("Done", "ok");
        renderMessage(message.response || "", "assistant");
      }

      if (message.type === "error") {
        setStatus(message.message || "Request failed", "err");
      }
    });

    vscode.postMessage({ type: "ready" });
    setMode("chat");
    authName.style.display = "none";
  </script>
</body>
</html>`;
  }
}

function getApiBaseUrl(context: vscode.ExtensionContext): string {
  const fromWorkspaceState = context.workspaceState.get<string>(BASE_URL_KEY);
  if (fromWorkspaceState && fromWorkspaceState.trim()) {
    return fromWorkspaceState.trim().replace(/\/$/, "");
  }

  const fromConfig = vscode.workspace.getConfiguration("testnova").get<string>("apiBaseUrl");
  if (fromConfig && fromConfig.trim()) {
    return fromConfig.trim().replace(/\/$/, "");
  }

  return "https://testnovatool.vercel.app/api";
}

function getLoginUrl(apiBaseUrl: string): string {
  if (!apiBaseUrl) {
    return "https://testnovatool.vercel.app";
  }

  try {
    const url = new URL(apiBaseUrl);
    url.pathname = url.pathname.replace(/\/?api\/?$/, "");
    url.search = "";
    return url.toString().replace(/\/$/, "");
  } catch {
    return apiBaseUrl.replace(/\/?api\/?$/, "");
  }
}
