const express = require("express");
const { extractLiquorsFromText } = require("../services/geminiClient");
const { findLiquors } = require("../db/liquorSearch");
const { synthesizeSpeech } = require("../utils/tts");

const router = express.Router();

// Helper: Create available liquors message
function createAvailableLiquorsMessage(liquorList) {
  const items = liquorList.map(item => `${item.name} (${item.type})`);
  return `The available liquors are: ${items.join(", ")}.`;
}

router.post("/userreply", async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: "Text is required" });

  try {
    // Step 1: Extract clean text and liquors using Gemini
    const { cleanText, liquors } = await extractLiquorsFromText(text);

    // Step 2: Search in Turso DB for matching liquors
    const matchedLiquors = await findLiquors(liquors);

    // Step 3: Format reply
    const replyText = matchedLiquors.length
      ? createAvailableLiquorsMessage(matchedLiquors)
      : "Sorry, none of the mentioned liquors were found in our inventory.";

    // Step 4: Generate audio & viseme data
    const { visemes, audio } = await synthesizeSpeech(replyText);

    // Step 5: Return response
    res.json({
      cleanText,
      extractedLiquors: liquors,
      matchedLiquors,
      replyText,
      visemes,
      audio,
    });

  } catch (err) {
    console.error("Error processing user reply:", err);
    res.status(500).json({ error: "User reply processing failed." });
  }
});

module.exports = router;
