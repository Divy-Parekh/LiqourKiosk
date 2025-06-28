const express = require("express");
const { suggestLiquorsFromMood } = require("../services/geminiClient");
const { findLiquors } = require("../db/liquorSearch");
const { synthesizeSpeech } = require("../utils/tts");

const router = express.Router();

// Helper: Create suggestion message
function createSuggestionMessage(matchedLiquors) {
  const items = matchedLiquors.map((item) => `${item.name} `);
  return `Based on your mood, we suggest: ${items.join(
    ", "
  )}. Enjoy responsibly!`;
}

router.post("/suggest", async (req, res) => {
  const { text } = req.body;
  if (!text)
    return res.status(400).json({ error: "Mood/experience text is required" });

  try {
    // Step 1: Extract suggested liquors from mood text using Gemini
    const { suggestedLiquors, moodSummary } = await suggestLiquorsFromMood(
      text
    );

    // Step 2: Search the DB for available liquors
    const matchedLiquors = await findLiquors(suggestedLiquors);

    // Step 3: Create response message
    const replyText = matchedLiquors.length
      ? createSuggestionMessage(matchedLiquors)
      : "Sorry, we couldn't find suitable liquors based on your mood in our inventory.";

    // Step 4: Generate audio and viseme data
    const { visemes, audio } = await synthesizeSpeech(replyText);

    // Step 5: Respond
    res.json({
      moodSummary,
      suggestedLiquors,
      matchedLiquors,
      replyText,
      visemes,
      audio,
    });
  } catch (err) {
    console.error("Error generating liquor suggestions:", err);
    res.status(500).json({ error: "Liquor suggestion processing failed." });
  }
});

module.exports = router;
