
const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");

const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));

const PORT = process.env.PORT || 10000;
const apiKey = process.env.OPENAI_API_KEY;

app.get("/", (req, res) => {
  res.send("YUTA OS AI sunucusu çalışıyor! 💜");
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    openaiConfigured: Boolean(apiKey)
  });
});

app.post("/api/chat", async (req, res) => {
  try {
    if (!apiKey) {
      return res.status(503).json({
        error: "OpenAI API anahtarı Render ayarlarına eklenmemiş."
      });
    }

    const body = req.body || {};
    let message = "";

    if (typeof body.message === "string") {
      message = body.message;
    } else if (typeof body.text === "string") {
      message = body.text;
    } else if (typeof body.prompt === "string") {
      message = body.prompt;
    } else if (Array.isArray(body.messages)) {
      const lastUserMessage = [...body.messages]
        .reverse()
        .find(item =>
          item &&
          item.role === "user" &&
          typeof item.content === "string"
        );

      if (lastUserMessage) {
        message = lastUserMessage.content;
      }
    }

    if (!message.trim()) {
      return res.status(400).json({
        error: "Mesaj bulunamadı. message, text veya prompt alanı gönder."
      });
    }

    const client = new OpenAI({
      apiKey,
      timeout: 30000,
      maxRetries: 1
    });

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Sen YUTA AI'sın. Türkçe konuşan, yardımcı, " +
            "samimi ve güvenli bir yapay zekâ asistanısın. " +
            "Kullanıcının sorularına açık ve anlaşılır cevap ver."
        },
        {
          role: "user",
          content: message.trim().slice(0, 10000)
        }
      ]
    });

    const reply =
      response.choices?.[0]?.message?.content ||
      "Üzgünüm, şu anda yanıt oluşturamadım.";

    return res.json({ reply });
  } catch (error) {
    console.error("YUTA AI hata ayrıntısı:", {
      name: error.name,
      message: error.message,
      status: error.status,
      code: error.code
    });

    return res.status(500).json({
      error: "Yapay zekâ isteği başarısız oldu.",
      details: error.message || "Bilinmeyen hata"
    });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`YUTA OS AI sunucusu ${PORT} portunda çalışıyor.`);
});
