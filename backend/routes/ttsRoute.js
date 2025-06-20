const express = require("express");
const { synthesizeSpeech } = require("../utils/tts");

const router = express.Router();

router.post("/texttospeech", async (req, res) => {
  try {
    const text = req.body.text;
    if (!text) return res.status(400).json({ error: "Text is required" });

    const { visemes, audio } = await synthesizeSpeech(text);
    res.json({ originalText: text, visemes, audio });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "TTS failed" });
  }
});

module.exports = router;
