import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import FlashcardApp from "./flashinput.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <FlashcardApp />
  </StrictMode>
);
