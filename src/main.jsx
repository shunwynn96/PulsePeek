import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { StoreProvider } from "./store/store.jsx";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  // <StrictMode>
  <Router>
    <StoreProvider>
      <App />
    </StoreProvider>
  </Router>
  // {/* </StrictMode> */}
);
