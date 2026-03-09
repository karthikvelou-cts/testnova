"use strict";

function getSelectedCode(editor) {
  if (!editor) {
    return "";
  }

  const selection = editor.selection;
  if (!selection || selection.isEmpty) {
    return "";
  }

  return editor.document.getText(selection).trim();
}

module.exports = {
  getSelectedCode,
};

