import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { QuickPasteApp } from "./QuickPasteApp";
import "./styles.css";

const RootApp = window.location.hash === "#quick-paste" ? QuickPasteApp : App;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RootApp />
  </StrictMode>
);
