import QrScanner from "qr-scanner";
import { RefObject, useEffect } from "react";

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
  useEffect(() => {
    if (ref.current) {
      const scanner = new QrScanner(
        ref.current,
        onDecode,
        onDecodeError,
        calculateScanRegion,
        preferredCamera
      );
      scanner.start();
      return () => scanner.destroy();
    }
  }, [
    calculateScanRegion,
    onDecode,
    onDecodeError,
    preferredCamera,
    ref,
    overlay,
  ]);
};
