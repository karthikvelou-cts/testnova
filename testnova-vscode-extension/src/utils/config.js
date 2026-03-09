"use strict";

const vscode = require("vscode");

const TOKEN_KEY = "testnova.token";
const DEFAULT_API_BASE_URL = "https://testnovatool.vercel.app/api";

function getApiBaseUrl() {
  const configured = vscode.workspace.getConfiguration("testnova").get("apiBaseUrl");
  const value = (configured || DEFAULT_API_BASE_URL).trim();
  return value.replace(/\/$/, "");
}

async function getToken(context) {
  return context.secrets.get(TOKEN_KEY);
}

async function setToken(context) {
  const token = await vscode.window.showInputBox({
    title: "Set TestNova Auth Token",
    password: true,
    placeHolder: "Paste JWT token from TestNova login",
    ignoreFocusOut: true,
  });

  if (!token) {
    return;
  }

  await context.secrets.store(TOKEN_KEY, token.trim());
  vscode.window.showInformationMessage("TestNova: Auth token saved.");
}

async function clearToken(context) {
  await context.secrets.delete(TOKEN_KEY);
  vscode.window.showInformationMessage("TestNova: Auth token cleared.");
}

async function setApiBaseUrl() {
  const current = getApiBaseUrl();
  const value = await vscode.window.showInputBox({
    title: "Set TestNova API Base URL",
    value: current,
    placeHolder: "https://testnovatool.vercel.app/api",
    ignoreFocusOut: true,
  });

  if (!value) {
    return;
  }

  await vscode.workspace
    .getConfiguration("testnova")
    .update("apiBaseUrl", value.trim().replace(/\/$/, ""), vscode.ConfigurationTarget.Global);

  vscode.window.showInformationMessage("TestNova: API base URL updated.");
}

module.exports = {
  getApiBaseUrl,
  getToken,
  setToken,
  clearToken,
  setApiBaseUrl,
};

