import axios from "axios";

const ollama = {
  chat: async ({ model, messages }) => {
    const headers = { "Content-Type": "application/json" };

    // Support generic LLM env vars or fallback to Ollama specific
    const apiKey = process.env.LLM_API_KEY || process.env.OLLAMA_API_KEY;
    const apiUrl = process.env.LLM_API_URL || process.env.OLLAMA_API_URL || "https://ollama.com/api/chat";

    if (apiKey) {
      headers.Authorization = `Bearer ${apiKey}`;
    }

    const isOllamaNative = apiUrl.includes("/api/chat") || apiUrl.includes("/api/generate");
    const payload = {
      model,
      messages,
      stream: false,
    };

    if (isOllamaNative) {
      payload.options = {
        temperature: 0.2,
        num_predict: 4096,
      };
    } else {
      payload.temperature = 0.2;
      payload.max_tokens = 4096;
    }

    const { data } = await axios.post(apiUrl, payload, { headers, timeout: 120000 });
    return data;
  },
};

export const sendPromptToOllama = async (promptOrMessages) => {
  const model = process.env.LLM_MODEL || process.env.OLLAMA_MODEL || "devstral-small-2:24b";

  const messages = Array.isArray(promptOrMessages) 
    ? promptOrMessages 
    : [{ role: "user", content: promptOrMessages }];

  try {
    // Required chat call shape for conversation memory flow
    const data = await ollama.chat({
      model,
      messages,
    });

    // Support multiple response formats (OpenAI, Ollama Chat, Ollama Generate)
    return data?.choices?.[0]?.message?.content || 
           data?.message?.content || 
           data?.response || 
           "No response from model.";
  } catch (error) {
    console.error("AI Client Error:", error.message);
    if (error.response) {
      console.error("Response data:", error.response.data);
    }
    throw error;
  }
};
