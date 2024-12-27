import QrScanner from "qr-scanner";
import { RefObject, useEffect, useRef } from "react";

export const useVideoScanner = (
  ref: RefObject<HTMLVideoElement | null>,
  onDecode: (result: string) => void,
  onDecodeError?: ((error: string | Error) => void) | undefined,
  calculateScanRegion?:
    | ((video: HTMLVideoElement) => QrScanner.ScanRegion)
    | undefined,
  overlay?: HTMLDivElement | null,
  initializeCamera?: (() => Promise<void>) | undefined
) => {
  const scannerRef = useRef<QrScanner | null>(null);

  useEffect(() => {
    const setupScanner = async () => {
      if (initializeCamera) {
        await initializeCamera();
      }

      if (ref.current) {
        scannerRef.current = new QrScanner(
          ref.current,
          onDecode,
          onDecodeError,
          calculateScanRegion
        );
        scannerRef.current.start();
      }
    };

    setupScanner().catch((error) => {
      console.error("Error setting up video scanner:", error);
    });

    return () => {
      scannerRef.current?.destroy();
      scannerRef.current = null;
    };
  }, [
    calculateScanRegion,
    initializeCamera,
    onDecode,
    onDecodeError,
    overlay,
    ref,
  ]);
};
