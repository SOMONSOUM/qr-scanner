import { create } from "zustand";

interface QRScannerState {
  hasCamera: boolean;
  isScanning: boolean;
  flashlightOn: boolean;
  scanResult: string | null;
  cameraReady: boolean;
  setHasCamera: (hasCamera: boolean) => void;
  setIsScanning: (isScanning: boolean) => void;
  setFlashlightOn: (flashlightOn: boolean) => void;
  setScanResult: (scanResult: string | null) => void;
  setCameraReady: (cameraReady: boolean) => void;
}

export const useQRScannerStore = create<QRScannerState>((set) => ({
  hasCamera: false,
  isScanning: false,
  flashlightOn: false,
  scanResult: null,
  cameraReady: false,
  setHasCamera: (hasCamera) => set({ hasCamera }),
  setIsScanning: (isScanning) => set({ isScanning }),
  setFlashlightOn: (flashlightOn) => set({ flashlightOn }),
  setScanResult: (scanResult) => set({ scanResult }),
  setCameraReady: (cameraReady) => set({ cameraReady }),
}));
