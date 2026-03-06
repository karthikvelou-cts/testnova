import axios from "axios";

export const sendPromptToOllama = async (prompt) => {
  const headers = { "Content-Type": "application/json" };

  if (process.env.OLLAMA_API_KEY) {
    headers.Authorization = `Bearer ${process.env.OLLAMA_API_KEY}`;
  }

  const payload = {
    model: process.env.OLLAMA_MODEL || "devstral-small-2:24b",
    messages: [{ role: "user", content: prompt }],
    stream: false,
    options: {
      temperature: 0.2,
      num_predict: 300
    }
  };

  const { data } = await axios.post(
    process.env.OLLAMA_API_URL || "https://ollama.com/api/chat",
    payload,
    { headers, timeout: 120000 }
  );

  return data?.message?.content || data?.response || "No response from model.";
};
