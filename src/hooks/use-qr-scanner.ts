import { useQRScannerStore } from "@/store";
import QrScanner from "qr-scanner";
import { RefObject, useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

type UseQRScannerProps = {
  videoRef: RefObject<HTMLVideoElement | null>;
  onDecode: (result: string) => void;
  onDecodeError?: (error: string | Error) => void;
  overlay?: HTMLDivElement,
  calculateScanRegion?: (video: HTMLVideoElement) => QrScanner.ScanRegion;
  preferredCamera?: string;
}


export const useQRScanner = ({ onDecode, videoRef, calculateScanRegion, onDecodeError, overlay, preferredCamera }: UseQRScannerProps) => {
  const scannerRef = useRef<QrScanner | null>(null);
  const [flashlightOn, setFlashlightOn] = useState(false);
  const { setScanResult } = useQRScannerStore();

  useEffect(() => {
    if (videoRef.current) {
      scannerRef.current = new QrScanner(
        videoRef.current,
        (result) => onDecode(result.data),
        {
          onDecodeError,
          returnDetailedScanResult: true,
          highlightScanRegion: false,
          highlightCodeOutline: false,
          overlay,
          preferredCamera
        }
      );
      scannerRef.current.start();

      return () => scannerRef.current?.destroy();
    }
  }, [
    calculateScanRegion,
    onDecode,
    onDecodeError,
    preferredCamera,
    videoRef,
    overlay,
  ]);

  const toggleFlashlight = useCallback(async () => {
    if (!scannerRef.current) return;

    try {
      await scannerRef.current.toggleFlash();
      setFlashlightOn((prev) => !prev);
    } catch (error) {
      toast.error("បើកពិលមានបញ្ហា!", {
        duration: 3000,
        position: "top-right",
        style: {
          fontFamily: "Koh Santepheap",
          fontSize: "11pt"
        }
      },);
    }
  }, []);

  const handleFileInput = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || typeof window === "undefined") return;

      try {
        const result = await QrScanner.scanImage(file);
        setScanResult(result);
      } catch (error) {
        toast.error("រកមិនឃើញ QR ដើម្បីស្កែនទេ!", {
          duration: 3000,
          position: "top-right",
          style: {
            fontFamily: "Koh Santepheap",
            fontSize: "11pt"
          }
        });
      }
      e.target.value = "";
    },
    []
  );

  return {
    toggleFlashlight,
    flashlightOn,
    handleFileInput
  }
};