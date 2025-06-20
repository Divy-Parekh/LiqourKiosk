import { Canvas } from "@react-three/fiber";
import { Experience } from "../Components/Experience";
import { useEffect, useRef, useState } from "react";
import { useAvatarStore } from "../store";
import { useNavigate } from "react-router-dom";
import Navbar from "../Components/Navbar/Navbar";
import "./GetHelp.css";

function GetHelp() {
  const [selectedOption, setSelectedOption] = useState(null);
  const [audioData, setAudioData] = useState(null);
  const [visemeData, setVisemeData] = useState(null);
  const [scriptText, setScriptText] = useState("");
  const [matchedLiquors, setMatchedLiquors] = useState([]);
  const recognitionRef = useRef(null);
  const [showSpeakAgain, setShowSpeakAgain] = useState(false);
  const [isGreeting, setIsGreeting] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [latestUserText, setLatestUserText] = useState("");
  const { setAvatarData } = useAvatarStore();
  const navigate = useNavigate();

  const options = [
    { label: "Find Products", icon: "symbols/findproducts.svg" },
    {
      label: "Liquor Information",
      icon: "symbols/info_40dp_FAF0E6_FILL0_wght400_GRAD0_opsz40.svg",
    },
    {
      label: "Offers",
      icon: "symbols/sell_40dp_FAF0E6_FILL0_wght400_GRAD0_opsz40.svg",
    },
    {
      label: "Suggestions",
      icon: "symbols/lightbulb_40dp_FAF0E6_FILL0_wght400_GRAD0_opsz40.svg",
    },
  ];

  useEffect(() => {
    const introMessage = `Welcome! I’m here to help you with:
    First. Finding liquor products,
    Second. Learning about different types of liquor,
    Third. Viewing current offers, Or
    Fourth. getting personalized suggestions.
    Please choose an option to begin!`;

    playAvatarResponse(introMessage).then(() => {
      setIsGreeting(false);
    });
  }, []);

  const playAvatarResponse = (text) => {
    return new Promise(async (resolve) => {
      try {
        const res = await fetch("http://localhost:3000/texttospeech", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
        });
        const data = await res.json();
        setScriptText(data.originalText);
        setAvatarData(data.audio, data.visemes); // Set in global store
      } catch (err) {
        console.error("TTS Error:", err);
      } finally {
        setTimeout(() => {
          // setIsSpeaking(false); // Allow some buffer time for animation/speech
          resolve();
        }, 1000); // Slight delay after speech ends
      }
    });
  };

  const handleOptionClick = async (option) => {
    setSelectedOption(option.label);
    setMatchedLiquors([]);

    if (option.label === "Suggestions") {
      await playAvatarResponse(
        `You selected ${option.label}. Tell me how you're feeling or what you're in the mood for.`
      );
      setTimeout(startListening, 800); // Start listening after brief pause
    } else if (option.label === "Find Products") {
      await playAvatarResponse(
        `You selected ${option.label}. What product are you looking for?`
      );
      setTimeout(startListening, 800); // Start listening after brief pause
    } else {
      // For Offers and Liquor Information
      await playAvatarResponse(
        `You selected ${option.label}. This feature will be available soon.`
      );
    }
  };

  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Speech recognition not supported.");

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognitionRef.current = recognition;

    setIsListening(true);
    recognition.onresult = async (event) => {
      const userText = event.results[0][0].transcript;
      setLatestUserText(userText); // <-- Set latest user input
      await sendUserQuery(userText);
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      console.error("Recognition error", event);
      setIsListening(false);
      setShowSpeakAgain(true);
    };

    recognition.onend = () => {
      console.log("Recognition ended");
      setIsListening(false);
      setShowSpeakAgain(true);
    };

    recognition.start();
    setShowSpeakAgain(false);

    // Extend time to 15 seconds
    setTimeout(() => {
      if (recognitionRef.current) recognitionRef.current.stop();
    }, 15000); // 15 seconds
  };

  const handleSpeakAgain = async () => {
    await playAvatarResponse(
      "Sure, I'm listening. What would you like to know?"
    );
    startListening();
  };

  const sendUserQuery = async (text) => {
    setIsLoading(true);
    try {
      const endpoint =
        selectedOption === "Suggestions" ? "/suggest" : "/userreply";

      const res = await fetch(`http://localhost:3000${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, option: selectedOption }),
      });

      const data = await res.json();

      setScriptText(data.replyText);
      setAvatarData(data.audio, data.visemes);
      setMatchedLiquors(data.matchedLiquors || []);
      setShowSpeakAgain(true);
    } catch (err) {
      console.error("UserQuery Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (selectedOption) {
      setSelectedOption(null);
      setScriptText("");
      setAudioData(null);
      setVisemeData(null);
      setMatchedLiquors([]);
      setShowSpeakAgain(false);
    } else {
      navigate("/");
    }
  };

  return (
    <div className="get-help-container">
      <Navbar />
      <div className="main-content">
        {/* Canvas */}
        <div className="canvas-section">
          <Canvas shadows camera={{ position: [0, 0, 8], fov: 50 }}>
            <Experience />
          </Canvas>
        </div>

        {/* Right Panel */}
        <div className={`right-panel`}>
          <button
            className="back-button"
            onClick={handleBack}
            // disabled={isSpeaking}
          >
            ← Back
          </button>

          {scriptText && (
            <div className="current-script">
              <p>
                <strong>Assistant:</strong> {scriptText}
              </p>
              {latestUserText && (
                <p>
                  <strong>You:</strong> {latestUserText}
                </p>
              )}
            </div>
          )}

          {!selectedOption ? (
            <>
              <h2>Choose an Option</h2>
              {options.map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => handleOptionClick(opt)}
                  className={`option-button`}
                  disabled={isGreeting}
                >
                  <div className="svg-container-option">
                    <img
                      src={opt.icon}
                      alt={opt.label}
                      className="animated-svg"
                    />
                  </div>
                  {opt.label}
                </button>
              ))}
            </>
          ) : (
            <h2>{selectedOption}</h2>
          )}

          {/* Liquor Cards */}
          {matchedLiquors.length > 0 && (
            <div className="liquor-results">
              <h3>Matched Liquors</h3>
              <div className="liquor-cards">
                {matchedLiquors.map((liq, idx) => (
                  <div key={idx} className="liquor-card">
                    <h4>{liq.name}</h4>
                    <p>{liq.type}</p>
                    {/* Add more liquor details if needed */}
                  </div>
                ))}
              </div>
            </div>
          )}
          {/*Speak Again */}
          {showSpeakAgain &&
            (selectedOption === "Find Products" ||
              selectedOption === "Suggestions") && (
              <div style={{ textAlign: "center" }}>
                {!isListening && (
                  <p className="speak-again-message">
                    You can Click Speak-Again and tell your question
                  </p>
                )}
                {isListening ? (
                  <div className="speak-again-btn">🎧 Listening...</div>
                ) : (
                  <button
                    className="speak-again-btn"
                    onClick={handleSpeakAgain}
                  >
                    Speak Again
                  </button>
                )}
              </div>
            )
          }

          {/* Loading Spinner */}
          {isLoading && (
            <div className="loading-overlay">
              <div className="spinner" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default GetHelp;
