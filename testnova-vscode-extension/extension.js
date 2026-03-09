"use strict";

const vscode = require("vscode");
const { createGenerateTestsCommand } = require("./src/commands/generateTests");
const { createGenerateFromSelectionCommand } = require("./src/commands/generateFromSelection");
const { setApiBaseUrl, setToken, clearToken } = require("./src/utils/config");

function activate(context) {
  context.subscriptions.push(
    vscode.commands.registerCommand("testnova.generateTests", createGenerateTestsCommand(context)),
    vscode.commands.registerCommand(
      "testnova.generateFromSelection",
      createGenerateFromSelectionCommand(context)
    ),
    vscode.commands.registerCommand("testnova.setApiBaseUrl", setApiBaseUrl),
    vscode.commands.registerCommand("testnova.setToken", () => setToken(context)),
    vscode.commands.registerCommand("testnova.clearToken", () => clearToken(context))
  );
}

function deactivate() {
  // no-op
}

module.exports = {
  activate,
  deactivate,
};
