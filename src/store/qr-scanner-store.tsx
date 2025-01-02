import { create } from "zustand";
import { persist } from "zustand/middleware";

interface QRScannerState {
  openCamera: boolean;
  flashlightOn: boolean;
  scanResult: string | null;
  setFlashlightOn: (flashlightOn: boolean) => void;
  setScanResult: (scanResult: string | null) => void;
  setOpenCamera: (openCamera: boolean) => void;
}

export const useQRScannerStore = create<QRScannerState>()(
  persist(
    (set) => ({
      openCamera: false,
      flashlightOn: false,
      scanResult: null,
      setFlashlightOn: (flashlightOn) => set({ flashlightOn }),
      setScanResult: (scanResult) => set({ scanResult }),
      setOpenCamera: (openCamera) => set({ openCamera }),
    }),
    {
      name: "open-camera",
      partialize: (state) => ({ openCamera: state.openCamera }),
    }
  )
);
