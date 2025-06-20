import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom"; // Add this import
import "./ICSlider.css";

const ICSlider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const videoRef = useRef(null);
  const navigate = useNavigate(); // React Router navigation hook

  const slides = [
    {
      type: "image",
      src: "https://images.unsplash.com/photo-1723639487213-063242bef7e2?w=700&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8d2hpc2tleSUyMGhvcml6b250YWwlMjBpbWFnZXN8ZW58MHx8MHx8fDA%3D",
      title: "Premium Whiskey Collection",
      description: "Discover rich, smoky blends from around the world.",
      link: "#whiskey",
      button: "Shop Whiskey",
      isDark: true,
    },
    {
      type: "image",
      src: "https://plus.unsplash.com/premium_photo-1705325618857-68bb239378b8?w=700&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTN8fHdpbmUlMjBmZXN0aXZhbHxlbnwwfDB8MHx8fDA%3D",
      title: "Wine Festival",
      description: "Uncork up to 30% off on classic reds & whites.",
      link: "#wines",
      button: "Explore Wines",
      isDark: false,
    },
    {
      type: "image",
      src: "https://images.unsplash.com/photo-1562601579-599dec564e06?w=700&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8d2luZXxlbnwwfHwwfHx8MA%3D%3D",
      title: "Exclusive Vodka Launch",
      description: "Introducing our newest ultra-smooth vodka line.",
      link: "#vodka",
      button: "Try Now",
      isDark: true,
    },
    {
      type: "image",
      src: "https://images.unsplash.com/photo-1621644894301-cd6b2eaca610?w=700&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fHdpbmUlMjBmZXN0aXZhbHxlbnwwfDB8MHx8fDA%3D",
      title: "Bar Essentials & Gifts",
      description: "Glasses, shakers, openers & perfect presents.",
      link: "#essentials",
      button: "Browse Accessories",
      isDark: false,
    },
  ];

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
  };

  useEffect(() => {
    let timer;

    if (slides[currentIndex].type === "video" && videoRef.current) {
      videoRef.current.play();
      videoRef.current.onended = () => nextSlide();
    } else {
      timer = setInterval(nextSlide, 6000);
    }

    return () => clearInterval(timer);
  }, [currentIndex]);

  const handleButtonClick = () => {
    navigate("/gethelp"); // Navigate to /gethelp on button click
  };

  return (
    <>
    <div className="slider-container">
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`slide ${index === currentIndex ? "active" : ""} ${slide.isDark ? "white-font" : "dark-font"}`}
          style={{
            backgroundImage: slide.type === "image" ? `url(${slide.src})` : "none",
            backgroundColor: slide.bgColor,
          }}
        >
          {slide.type === "video" ? (
            <video ref={videoRef} className="slide-video" muted>
              <source src={slide.src} type="video/mp4" />
            </video>
          ) : null}

          <div className="content">
            <h2>{slide.title}</h2>
            <p>{slide.description}</p>
            <div className="content-actions">
              <a href={slide.link} className={`slide-link ${slide.isDark ? "white-link" : "dark-link"}`}>
                Learn More
              </a>
              <button
                onClick={handleButtonClick}
                className={slide.isDark ? "white-button" : "dark-button"}
              >
                {slide.button}
              </button>
            </div>
          </div>
        </div>
      ))}

      <button className="prev" onClick={nextSlide}>&#10094;</button>
      <button className="next" onClick={nextSlide}>&#10095;</button>
    </div>
    {/* Talk with Liquor Assistant Section */}
      <div className="liquor-assistant-section">
        <h2>Talk with the Liquor Assistant</h2>
        <button className="assistant-button" onClick={handleButtonClick}>
          Get Help
        </button>
      </div>
    </>
  );
};

export default ICSlider;
