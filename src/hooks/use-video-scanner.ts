import QrScanner from 'qr-scanner';
import { RefObject, useEffect } from 'react';
import { useScannerInstance } from './use-scanner-instance';

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
  const { setScanner } = useScannerInstance();
  useEffect(() => {
    if (ref.current) {
      const scanner = new QrScanner(
        ref.current,
        onDecode,
        onDecodeError,
        calculateScanRegion,
        preferredCamera
      );
      setScanner(scanner);
      scanner.start();
      return () => scanner.destroy();
    }
  }, [calculateScanRegion, onDecode, onDecodeError, preferredCamera, ref, overlay]);
};