import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { usePwaStore, BeforeInstallPromptEvent } from "./store/pwaStore";

function initPwa() {
  const { setDeferredPrompt } = usePwaStore.getState();
  window.addEventListener(
    "beforeinstallprompt",
    (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);
    }
  );
  window.addEventListener("appinstalled", () => {
    usePwaStore.getState().clear();
  });
}

initPwa();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
