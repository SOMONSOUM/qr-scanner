import { useRef, useCallback, useEffect } from "react";
import { useQRScannerStore } from "@/store";

export const useQRScanner = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerRef = useRef<any>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);

  const {
    setHasCamera,
    setIsScanning,
    setFlashlightOn,
    setScanResult,
    setCameraReady,
    flashlightOn,
  } = useQRScannerStore();

  const startScanner = useCallback(async () => {
    if (!videoRef.current || typeof window === "undefined") return;

    try {
      const QrScannerModule = await import("qr-scanner");
      const scanner = new QrScannerModule.default(
        videoRef.current,
        (result: any) => {
          setScanResult(result.data);
          stopScanner();
        },
        {
          returnDetailedScanResult: true,
          highlightScanRegion: false,
          highlightCodeOutline: false,
          overlay: overlayRef.current || undefined,
        }
      );

      const hasCamera = await QrScannerModule.default.hasCamera();
      setHasCamera(hasCamera);

      if (!hasCamera) {
        console.error("No camera found");
        return;
      }

      await scanner.start();
      scannerRef.current = scanner;
      setIsScanning(true);
      setCameraReady(true);
    } catch (error) {
      console.error("Scanner error:", error);
    }
  }, [setHasCamera, setIsScanning, setScanResult, setCameraReady]);

  const stopScanner = useCallback(() => {
    if (scannerRef.current) {
      scannerRef.current.stop();
      scannerRef.current.destroy();
      scannerRef.current = null;
      setIsScanning(false);
      setFlashlightOn(false);
      setCameraReady(false);
    }
  }, [setIsScanning, setFlashlightOn, setCameraReady]);

  const toggleFlashlight = useCallback(async () => {
    if (!scannerRef.current) return;

    try {
      await scannerRef.current.toggleFlash();
      setFlashlightOn(!flashlightOn);
    } catch (error) {
      console.error("Flashlight error:", error);
    }
  }, [flashlightOn, setFlashlightOn]);

  // Auto-start camera when component mounts
  useEffect(() => {
    startScanner();
    return () => {
      stopScanner();
    };
  }, [startScanner, stopScanner]);

  return {
    videoRef,
    overlayRef,
    startScanner,
    stopScanner,
    toggleFlashlight,
  };
};