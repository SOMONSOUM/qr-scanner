import { create } from "zustand";

interface QRScannerState {
  flashlightOn: boolean;
  scanResult: string | null;
  setFlashlightOn: (flashlightOn: boolean) => void;
  setScanResult: (scanResult: string | null) => void;
}

export const useQRScannerStore = create<QRScannerState>((set) => ({
  flashlightOn: false,
  scanResult: null,
  setFlashlightOn: (flashlightOn) => set({ flashlightOn }),
  setScanResult: (scanResult) => set({ scanResult }),
}));
