import * as vscode from "vscode";

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

  constructor(private readonly context: vscode.ExtensionContext) {}

  resolveWebviewView(webviewView: vscode.WebviewView): void {
    this.view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
    };

    webviewView.webview.html = this.getHtml(webviewView.webview);

    webviewView.webview.onDidReceiveMessage(async (message: Record<string, unknown>) => {
      const type = String(message.type || "");

      if (type === "ready") {
        await this.postState();
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
    await this.postMessage({
      type: "state",
      apiBaseUrl: getApiBaseUrl(this.context),
      hasToken: Boolean(token),
    });
  }

  private async postMessage(message: Record<string, unknown>): Promise<void> {
    if (!this.view) {
      return;
    }

    await this.view.webview.postMessage(message);
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
    body { font-family: var(--vscode-font-family); color: var(--vscode-foreground); padding: 12px; }
    input, textarea, button { width: 100%; box-sizing: border-box; margin-top: 8px; }
    textarea { min-height: 90px; }
    .row { margin-bottom: 12px; }
    .hint { opacity: 0.8; font-size: 12px; }
    .ok { color: #4caf50; font-size: 12px; }
    .err { color: #f44336; font-size: 12px; }
    .msg { border: 1px solid var(--vscode-panel-border); border-radius: 6px; padding: 8px; margin-top: 8px; white-space: pre-wrap; }
    .user { background: rgba(33, 150, 243, 0.12); }
    .assistant { background: rgba(76, 175, 80, 0.12); }
  </style>
</head>
<body>
  <div class="row">
    <label>API Base URL</label>
    <input id="apiBaseUrl" placeholder="https://testnovatool.vercel.app/api" />
    <div class="hint">Default: https://testnovatool.vercel.app/api</div>
  </div>

  <div class="row">
    <label>Auth Token</label>
    <input id="token" type="password" placeholder="Paste JWT token" />
    <button id="saveConfig">Save Config</button>
    <div id="tokenState" class="hint">Token not set</div>
  </div>

  <div class="row">
    <label>Conversation ID</label>
    <input id="conversationId" />
    <button id="newConversation">New Conversation ID</button>
  </div>

  <div class="row">
    <label>Prompt</label>
    <textarea id="prompt" placeholder="Ask TestNova..."></textarea>
    <button id="sendPrompt">Send</button>
    <div class="hint">Tip: Press Ctrl/Cmd+Enter to send.</div>
  </div>

  <div id="status" class="hint"></div>
  <div id="messages"></div>

  <script nonce="${nonce}">
    const vscode = acquireVsCodeApi();

    const apiBaseUrlInput = document.getElementById("apiBaseUrl");
    const tokenInput = document.getElementById("token");
    const tokenState = document.getElementById("tokenState");
    const conversationIdInput = document.getElementById("conversationId");
    const promptInput = document.getElementById("prompt");
    const status = document.getElementById("status");
    const messages = document.getElementById("messages");

    const createConversationId = () => {
      if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
      return Date.now() + "-" + Math.random().toString(36).slice(2, 10);
    };

    conversationIdInput.value = createConversationId();

    const renderMessage = (text, cls) => {
      const el = document.createElement("div");
      el.className = "msg " + cls;
      el.textContent = text;
      messages.prepend(el);
    };

    document.getElementById("newConversation").addEventListener("click", () => {
      conversationIdInput.value = createConversationId();
    });

    document.getElementById("saveConfig").addEventListener("click", () => {
      vscode.postMessage({
        type: "saveConfig",
        apiBaseUrl: apiBaseUrlInput.value,
        token: tokenInput.value,
      });
    });

    const sendPrompt = () => {
      const prompt = promptInput.value.trim();
      if (!prompt) return;

      renderMessage(prompt, "user");
      status.className = "hint";
      status.textContent = "Sending...";

      vscode.postMessage({
        type: "sendPrompt",
        prompt,
        conversationId: conversationIdInput.value,
      });

      promptInput.value = "";
    };

    document.getElementById("sendPrompt").addEventListener("click", sendPrompt);
    promptInput.addEventListener("keydown", (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
        sendPrompt();
      }
    });

    window.addEventListener("message", (event) => {
      const message = event.data || {};

      if (message.type === "state") {
        apiBaseUrlInput.value = message.apiBaseUrl || "";
        tokenState.className = message.hasToken ? "ok" : "hint";
        tokenState.textContent = message.hasToken ? "Token stored securely" : "Token not set";
      }

      if (message.type === "assistantResponse") {
        status.className = "ok";
        status.textContent = "Done";
        renderMessage(message.response || "", "assistant");
      }

      if (message.type === "error") {
        status.className = "err";
        status.textContent = message.message || "Request failed";
      }
    });

    vscode.postMessage({ type: "ready" });
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
