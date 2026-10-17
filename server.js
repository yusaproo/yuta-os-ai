const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");

const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));

const PORT = process.env.PORT || 10000;
const apiKey = process.env.OPENAI_API_KEY;

app.get("/", (req, res) => {
  res.send("YUTA OS AI sunucusu çalışıyor!");
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

    const message = req.body?.message;

    if (typeof message !== "string" || !message.trim()) {
      return res.status(400).json({
        error: "Bir mesaj yazmalısın."
      });
    }

    const client = new OpenAI({ apiKey });

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Sen YUTA AI'sın. Türkçe konuşan, yardımcı ve güvenli bir asistansın."
        },
        {
          role: "user",
          content: message.trim().slice(0, 10000)
        }
      ]
    });

    res.json({
      reply: response.choices[0]?.message?.content || "Yanıt oluşturulamadı."
    });
  } catch (error) {
    console.error("YUTA AI hatası:", error.message);
    res.status(500).json({
      error: "Yapay zekâ yanıt veremedi. Sunucu ayarlarını kontrol et."
    });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`YUTA OS AI sunucusu ${PORT} portunda çalışıyor.`);
});
