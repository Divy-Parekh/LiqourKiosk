const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function extractLiquorsFromText(userText) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  const prompt = `
You are a helpful assistant that specializes in liquor identification.
From the input text, identify only the liquors explicitly mentioned by the user.
Fix spelling, and respond only in JSON with this format:
{ "cleanText": "...", "liquors": ["Tequila", ...] }.
User: "${userText}"
`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  let text = await response.text();

  // ✅ Remove triple backticks and any leading/trailing code markers
  text = text
    .trim()
    .replace(/^```(?:json)?/, "")
    .replace(/```$/, "")
    .trim();

  return JSON.parse(text);
}

async function suggestLiquorsFromMood(userText) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `
You are a helpful assistant that recommends liquors based on user mood or feelings.
From the input, extract a short mood summary, and suggest 2–5 suitable liquors.
Respond strictly in JSON format like this:
{ "moodSummary": "Short summary here", "suggestedLiquors": ["Vodka", "Rum", ...] }

User mood: "${userText}"
`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  let text = await response.text();

  // Clean up response
  text = text
    .trim()
    .replace(/^```(?:json)?/, "")
    .replace(/```$/, "")
    .trim();

  return JSON.parse(text);
}

module.exports = { extractLiquorsFromText, suggestLiquorsFromMood };
