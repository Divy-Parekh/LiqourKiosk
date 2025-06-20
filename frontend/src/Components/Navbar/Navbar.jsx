import React, { useEffect, useState } from "react";
import "./Navbar.css"; // ←  make sure the path is correct for your project

const Navbar = () => {
  const [dateTime, setDateTime] = useState(new Date());

  // Update every second
  useEffect(() => {
    const timer = setInterval(() => setDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const date = dateTime.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const time = dateTime.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <header className="navbar">
      <div className="navbar__content">
        {/* Branding (left) */}
        <div className="branding">
          <img
            src="/images/logo.webp"
            alt="Brand Logo"
            className="brand-logo"
          />
          <span className="brand-name">Liquor&nbsp;Brand</span>
        </div>

        {/* Date & Time (right) */}
        <div className="datetime">
          {date} — {time}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
