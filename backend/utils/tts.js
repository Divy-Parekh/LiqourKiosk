const sdk = require("microsoft-cognitiveservices-speech-sdk");
const { PassThrough } = require("stream");
require("dotenv").config();

/**
 * Maps Microsoft viseme IDs to your custom viseme names.
 */
const visemeMap = {
  0: "sil",
  1: "aa",
  2: "aa",
  3: "O",
  4: "U",
  5: "aa",
  6: "I",
  7: "U",
  8: "O",
  9: "O",
  10: "O",
  11: "I",
  12: "sil",
  13: "RR",
  14: "nn",
  15: "SS",
  16: "CH",
  17: "TH",
  18: "FF",
  19: "DD",
  20: "kk",
  21: "PP",
};

/**
 * Converts a viseme ID to its custom label with the `viseme_` prefix.
 * @param {number} id
 * @returns {string}
 */
const mapVisemeIdToLabel = (id) => `viseme_${visemeMap[id] || "sil"}`;

/**
 * Synthesizes speech and returns visemes and audio as base64 MP3.
 * @param {string} text - Text to synthesize.
 * @returns {Promise<{ visemes: {start: number, end: number, value: string}[], audio: string }>}}
 */
const synthesizeSpeech = async (text) => {
  const voiceName = `en-US-AndrewMultilingualNeural`;

  const speechConfig = sdk.SpeechConfig.fromSubscription(
    process.env.SPEECH_KEY,
    process.env.SPEECH_REGION
  );
  speechConfig.speechSynthesisVoiceName = voiceName;

  const audioConfig = null;
  const speechSynthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);

  const rawVisemes = [];

  speechSynthesizer.visemeReceived = function (_, e) {
    const offsetMs = e.audioOffset / 10000;
    const visemeId = e.visemeId;
    rawVisemes.push({ time: offsetMs / 1000, id: visemeId });
  };

  const audioStream = await new Promise((resolve, reject) => {
    speechSynthesizer.speakTextAsync(
      text,
      (result) => {
        if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
          const bufferStream = new PassThrough();
          bufferStream.end(Buffer.from(result.audioData));
          resolve(bufferStream);
        } else {
          reject(new Error("Synthesis failed"));
        }
        speechSynthesizer.close();
      },
      (err) => {
        speechSynthesizer.close();
        reject(err);
      }
    );
  });

  const chunks = [];
  for await (const chunk of audioStream) {
    chunks.push(chunk);
  }

  const audioBase64 = Buffer.concat(chunks).toString("base64");

  const formattedVisemes = [];
  for (let i = 0; i < rawVisemes.length; i++) {
    const current = rawVisemes[i];
    const next = rawVisemes[i + 1];
    formattedVisemes.push({
      start: parseFloat(current.time.toFixed(2)),
      end: parseFloat((next ? next.time : current.time + 0.03).toFixed(2)),
      value: mapVisemeIdToLabel(current.id),
    });
  }

  return { visemes: formattedVisemes, audio: audioBase64 };
};

module.exports = { synthesizeSpeech };
