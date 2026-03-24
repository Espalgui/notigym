import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { registerSW } from "virtual:pwa-register";
import App from "./App";
import "./lib/i18n";
import "./index.css";
import "./stores/themeStore";

// Capturer l'event AVANT que React soit monté — il arrive très tôt
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  (window as any).__pwaInstallPrompt = e;
  window.dispatchEvent(new Event("pwa-install-ready"));
});

// Enregistrer le service worker — reload auto quand une MAJ est dispo
registerSW({
  immediate: true,
  onNeedRefresh() {
    // Nouvelle version détectée → reload silencieux
    window.location.reload();
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
