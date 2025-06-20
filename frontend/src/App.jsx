import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Pages/Home";
import GetHelp from "./Pages/GetHelp";

function App() {
  return (
    <>
      <div className="background" />
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/gethelp" element={<GetHelp />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
