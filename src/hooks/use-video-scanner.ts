import { useQRScannerStore } from "@/store";
import QrScanner from "qr-scanner";
import { RefObject, useCallback, useEffect, useRef, useState } from "react";

export const useVideoScanner = (
  ref: RefObject<HTMLVideoElement | null>,
  onDecode: (result: string) => void,
  onDecodeError?: ((error: string | Error) => void) | undefined,
  calculateScanRegion?:
    | ((video: HTMLVideoElement) => QrScanner.ScanRegion)
    | undefined,
  overlay?: HTMLDivElement | null,
  preferredCamera?: string | undefined
) => {
  const scannerRef = useRef<QrScanner | null>(null);
  const { setFlashlightOn } = useQRScannerStore();
  const [hasFlash, setHasFlash] = useState(false);

  useEffect(() => {
    if (ref.current) {
      scannerRef.current = new QrScanner(
        ref.current,
        onDecode,
        onDecodeError,
        calculateScanRegion,
        preferredCamera
      );
      scannerRef.current.start();

      // Check if the device has a flash
      QrScanner.hasCamera().then(() => {
        scannerRef.current?.hasFlash().then(setHasFlash);
      });

      return () => scannerRef.current?.destroy();
    }
  }, [
    calculateScanRegion,
    onDecode,
    onDecodeError,
    preferredCamera,
    ref,
    overlay,
  ]);

  const toggleFlashlight = useCallback(async () => {
    if (!scannerRef.current || !hasFlash) return;

    try {
      const currentState = useQRScannerStore.getState().flashlightOn;
      await scannerRef.current.toggleFlash();
      setFlashlightOn(!currentState);
    } catch (error) {
      console.error("Flashlight error:", error);
      setFlashlightOn(false);
    }
  }, [hasFlash, setFlashlightOn]);

  return { toggleFlashlight, hasFlash };
};
