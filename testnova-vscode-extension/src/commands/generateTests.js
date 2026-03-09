"use strict";

const path = require("path");
const vscode = require("vscode");
const { generateTests } = require("../api/testnovaApi");
const { getApiBaseUrl, getToken } = require("../utils/config");

function resolveCodeInput(fileUri) {
  if (fileUri && fileUri.fsPath) {
    return vscode.workspace.openTextDocument(fileUri);
  }

  const activeEditor = vscode.window.activeTextEditor;
  if (!activeEditor) {
    throw new Error("No file selected. Open a file or right-click a file in Explorer.");
  }

  return Promise.resolve(activeEditor.document);
}

function buildGeneratedFileName(sourceFilePath) {
  if (!sourceFilePath) {
    return "testnova.generated.test.js";
  }

  const parsed = path.parse(sourceFilePath);
  return `${parsed.name}.test.js`;
}

async function showGeneratedTests(generatedTests, fileName) {
  const doc = await vscode.workspace.openTextDocument({
    language: "javascript",
    content: generatedTests,
  });

  await vscode.window.showTextDocument(doc, {
    preview: false,
    viewColumn: vscode.ViewColumn.Beside,
  });

  vscode.window.showInformationMessage(`TestNova: Tests generated (${fileName}).`);
}

function createConversationId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function createGenerateTestsCommand(context) {
  return async function generateTestsCommand(fileUri) {
    try {
      const token = await getToken(context);
      if (!token) {
        vscode.window.showErrorMessage("TestNova: Auth token missing. Run 'TestNova: Set Auth Token'.");
        return;
      }

      const sourceDocument = await resolveCodeInput(fileUri);
      const sourceCode = sourceDocument.getText().trim();

      if (!sourceCode) {
        vscode.window.showErrorMessage("TestNova: File is empty. Nothing to generate.");
        return;
      }

      const generated = await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: "Generating tests using TestNova...",
          cancellable: false,
        },
        async () =>
          generateTests({
            apiBaseUrl: getApiBaseUrl(),
            token,
            code: sourceCode,
            sourceType: "file",
            conversationId: createConversationId(),
          })
      );

      const outputName = buildGeneratedFileName(sourceDocument.fileName);
      await showGeneratedTests(generated, outputName);
    } catch (error) {
      const message = error?.response?.data?.message || error?.message || "Unknown error";
      vscode.window.showErrorMessage(`TestNova: Failed to generate tests. ${message}`);
    }
  };
}

module.exports = {
  createGenerateTestsCommand,
};
