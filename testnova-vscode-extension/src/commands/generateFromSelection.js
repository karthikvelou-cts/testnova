"use strict";

const vscode = require("vscode");
const { generateTests } = require("../api/testnovaApi");
const { getApiBaseUrl, getToken } = require("../utils/config");
const { getSelectedCode } = require("../utils/getSelectedCode");

function createConversationId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function createGenerateFromSelectionCommand(context) {
  return async function generateFromSelectionCommand() {
    try {
      const token = await getToken(context);
      if (!token) {
        vscode.window.showErrorMessage("TestNova: Auth token missing. Run 'TestNova: Set Auth Token'.");
        return;
      }

      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showErrorMessage("TestNova: Open an editor and select code first.");
        return;
      }

      const selectedCode = getSelectedCode(editor);
      if (!selectedCode) {
        vscode.window.showErrorMessage("TestNova: No code selected.");
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
            code: selectedCode,
            sourceType: "selection",
            conversationId: createConversationId(),
          })
      );

      const doc = await vscode.workspace.openTextDocument({
        language: "javascript",
        content: generated,
      });

      await vscode.window.showTextDocument(doc, {
        preview: false,
        viewColumn: vscode.ViewColumn.Beside,
      });

      vscode.window.showInformationMessage("TestNova: Tests generated from selection.");
    } catch (error) {
      const message = error?.response?.data?.message || error?.message || "Unknown error";
      vscode.window.showErrorMessage(`TestNova: Failed to generate tests. ${message}`);
    }
  };
}

module.exports = {
  createGenerateFromSelectionCommand,
};
