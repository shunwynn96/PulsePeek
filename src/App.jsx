import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { CssVarsProvider, extendTheme, useColorScheme } from "@mui/joy/styles";
import Home from "./components/Home";
import Search from "./components/Search";
import Navbar from "./components/Navbar.jsx";
import DarkMode from "@mui/icons-material/DarkMode";
import { Sheet, Box } from "@mui/joy";
import LightMode from "@mui/icons-material/LightMode.js";
import { Switch } from "@mui/joy";
import { useStore } from "./store/store.jsx";
import { useLocation } from "react-router-dom";
import "./App.css";

import "@fontsource/inter";

const theme = extendTheme({
  components: {
    JoySkeleton: {
      defaultProps: {
        animation: "pulse",
        variant: "overlay",
      },
    },
  },
});

export function ModeToggle() {
  const { mode, setMode } = useColorScheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) {
    return null;
  }

  return (
    <Switch
      size="lg"
      slotProps={{
        input:
          mode === "light"
            ? { "aria-label": "Dark mode switch" }
            : { "aria-label": "Light mode switch" },
        thumb:
          mode === "light"
            ? { children: <DarkMode /> }
            : { children: <LightMode /> },
      }}
      onChange={() => setMode(mode === "light" ? "dark" : "light")}
      sx={{
        "--Switch-thumbSize": "16px",
      }}
    />
  );
}

const App = () => {
  const store = useStore();
  const category = useLocation();

  useEffect(() => {
    if (category.pathname !== "/") {
      store.getCategoryData(category.pathname.replace("/", ""));
    } else {
      store.getTopHeadlineData();
    }
  }, []);

  return (
    <Sheet className="main-container">
      <CssVarsProvider theme={theme}>
        <Navbar />
        <Box className="body-container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/category/:category" element={<Home />} />
            <Route path="/search/:query" element={<Search />} />
          </Routes>
        </Box>
      </CssVarsProvider>
    </Sheet>
  );
};

export default App;
