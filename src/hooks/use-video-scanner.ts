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
  const { flashlightOn, setFlashlightOn } = useQRScannerStore();

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
    if (!scannerRef.current) return;

    try {
      await scannerRef.current.toggleFlash();
      setFlashlightOn(!flashlightOn);
    } catch (error) {
      console.error("Flashlight error:", error);
    }
  }, []);

  return { toggleFlashlight };
};
