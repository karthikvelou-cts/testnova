"use strict";

const axios = require("axios");

function buildPrompt(code, sourceType) {
  const label = sourceType === "selection" ? "selected code snippet" : "source file";
  return [
    "Generate production-ready unit tests for the following code.",
    "Return only test code in markdown-free plain text.",
    "Use realistic edge cases and clear test names.",
    "",
    `Code (${label}):`,
    code,
  ].join("\n");
}

function extractResponse(payload) {
  if (typeof payload === "string") {
    return payload;
  }

  if (payload && typeof payload.response === "string") {
    return payload.response;
  }

  if (payload && typeof payload.generatedTests === "string") {
    return payload.generatedTests;
  }

  if (payload && typeof payload.tests === "string") {
    return payload.tests;
  }

  if (payload && typeof payload.result === "string") {
    return payload.result;
  }

  return JSON.stringify(payload, null, 2);
}

async function generateTests(params) {
  const { apiBaseUrl, token, code, conversationId, sourceType } = params;
  const prompt = buildPrompt(code, sourceType);
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  try {
    const chatResponse = await axios.post(
      `${apiBaseUrl}/chat`,
      {
        conversationId,
        prompt,
      },
      { timeout: 60000, headers }
    );
    return extractResponse(chatResponse.data);
  } catch (error) {
    const status = error?.response?.status;
    if (status !== 404) {
      throw error;
    }

    const promptsResponse = await axios.post(
      `${apiBaseUrl}/prompts`,
      { prompt },
      { timeout: 60000, headers }
    );

    return extractResponse(promptsResponse.data);
  }
}

module.exports = {
  generateTests,
};
