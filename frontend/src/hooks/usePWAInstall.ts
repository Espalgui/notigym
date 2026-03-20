import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function usePWAInstall() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(
    () => (window as any).__pwaInstallPrompt ?? null
  );
  const [isInstalled, setIsInstalled] = useState(
    () => window.matchMedia("(display-mode: standalone)").matches
  );

  useEffect(() => {
    const onReady = () => setPrompt((window as any).__pwaInstallPrompt ?? null);
    window.addEventListener("pwa-install-ready", onReady);

    const mq = window.matchMedia("(display-mode: standalone)");
    const onInstalled = (e: MediaQueryListEvent) => {
      if (e.matches) setIsInstalled(true);
    };
    mq.addEventListener("change", onInstalled);

    return () => {
      window.removeEventListener("pwa-install-ready", onReady);
      mq.removeEventListener("change", onInstalled);
    };
  }, []);

  const install = async () => {
    if (!prompt) return;
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === "accepted") {
      setPrompt(null);
      (window as any).__pwaInstallPrompt = null;
      setIsInstalled(true);
    }
  };

  return { canInstall: !!prompt && !isInstalled, install };
}
