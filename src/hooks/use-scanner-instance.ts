import { useState } from "react";
import QrScanner from "qr-scanner";
import { useQRScannerStore } from "@/store/qr-scanner-store";

export const useScannerInstance = () => {
  const [scanner, setScanner] = useState<QrScanner | null>(null);
  const { setFlashlightOn } = useQRScannerStore();

  const toggleFlashlight = async () => {
    if (!scanner) return;

    try {
      const isFlashOn = await scanner.hasFlash();
      if (isFlashOn) {
        await scanner.turnFlashOff();
        setFlashlightOn(false);
      } else {
        await scanner.turnFlashOn();
        setFlashlightOn(true);
      }
    } catch (error) {
      console.error("Flashlight error:", error);
    }
  };

  return {
    scanner,
    setScanner,
    toggleFlashlight,
  };
};
