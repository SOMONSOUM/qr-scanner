"use client";

import { useCallback, useRef } from "react";
import { Flashlight, QrCode, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useQRScannerStore } from "@/store";
import useMediaQuery from "@/hooks/use-media-query";
import QrScanner from "qr-scanner";
import { useVideoScanner } from "@/hooks/use-video-scanner";

export const QRScanner = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { flashlightOn, setScanResult, scanResult } = useQRScannerStore();

  const onDecode = (result: string) => {
    console.log("result", result);
    return setScanResult(result);
  };

  const onDecodeError = (error: string | Error) => {
    const err = error.toString();

    if (err === QrScanner.NO_QR_CODE_FOUND) return;
    if (err === "Scanner error: No QR code found") return;

    console.log("error", error.toString());
  };

  interface ScanRegion {
    x: number;
    y: number;
    width: number;
    height: number;
  }

  const calculateScanRegion = (): ScanRegion => {
    const smallestDimension = Math.min(window.innerWidth, window.innerHeight);
    const scanRegionSize = isMobile
      ? Math.round(smallestDimension * 0.6)
      : Math.round(smallestDimension * 0.4);
    const offsetX = Math.round((window.innerWidth - scanRegionSize) / 2);
    const offsetY = Math.round((window.innerHeight - scanRegionSize) / 2);

    return {
      x: offsetX,
      y: offsetY,
      width: scanRegionSize,
      height: scanRegionSize,
    };
  };

  const closeDialog = useCallback(() => {
    setScanResult(null);
  }, [setScanResult]);

  const handleFileInput = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || typeof window === "undefined") return;

      try {
        const QrScannerModule = await import("qr-scanner");
        const result = await QrScannerModule.default.scanImage(file);
        setScanResult(result);
      } catch (error) {
        console.error("File scanning error:", error);
      }
      e.target.value = "";
    },
    []
  );

  const { toggleFlashlight } = useVideoScanner(
    videoRef,
    onDecode,
    onDecodeError,
    calculateScanRegion,
    overlayRef.current
  );

  return (
    <div className="fixed inset-0 bg-black">
      <div className="relative h-[100dvh] w-full overflow-hidden">
        <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-gradient-to-b from-black/50 to-transparent">
          <h1 className="text-xl font-bold text-white">AAS ស្កែន</h1>
          <button
            className="text-white hover:bg-white/20 rounded-full p-2"
            onClick={() => router.back()}
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="relative h-full w-full">
          <video
            ref={videoRef}
            className="absolute inset-0 h-full w-full object-cover"
          />

          <div className="absolute inset-0 flex items-center justify-center">
            <div className="absolute inset-0" />
            <motion.div
              ref={overlayRef}
              className="relative w-72 h-72"
              initial={{ scale: 0.8, opacity: 0.5 }}
              animate={{
                scale: [0.8, 1, 0.8],
                opacity: [0.5, 1, 0.5],
                borderColor: ["#FCD34D", "#FBBF24", "#FCD34D"],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <div className="absolute -top-1 -left-1 w-12 h-12 border-t-[6px] border-l-[6px] border-white rounded-tl-3xl" />
              <div className="absolute -top-1 -right-1 w-12 h-12 border-t-[6px] border-r-[6px] border-white rounded-tr-3xl" />
              <div className="absolute -bottom-1 -left-1 w-12 h-12 border-b-[6px] border-l-[6px] border-white rounded-bl-3xl" />
              <div className="absolute -bottom-1 -right-1 w-12 h-12 border-b-[6px] border-r-[6px] border-white rounded-br-3xl" />
            </motion.div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 pb-safe">
          <div className="flex justify-center gap-4 p-4">
            <Button
              variant="ghost"
              className="h-12 flex-1 max-w-40 bg-neutral-900/90 text-white hover:bg-neutral-800/90 rounded-full"
              onClick={toggleFlashlight}
            >
              <Flashlight
                className={`w-5 h-5 mr-2 ${
                  flashlightOn ? "text-yellow-300" : "text-white"
                }`}
              />
              <span className="text-white">ពិល</span>
            </Button>
            <Button
              variant="ghost"
              className="h-12 flex-1 max-w-40 bg-neutral-900/90 text-white hover:bg-neutral-800/90 rounded-full"
              onClick={() => fileInputRef.current?.click()}
            >
              <QrCode className="w-5 h-5 mr-2 text-white" />
              <span className="text-white">បើក QR</span>
            </Button>
          </div>

          <div className="bg-black p-4">
            <div className="flex justify-center items-center gap-2 overflow-x-auto py-2 px-4">
              {[
                "/bakong.svg",
                "/nbc.svg",
                "/unionpay.svg",
                "/visa.svg",
                "/mastercard.svg",
              ].map((src, index) => (
                <div key={index} className="flex-shrink-0 w-10 h-6">
                  <Image
                    src={src}
                    alt="Payment method"
                    width={40}
                    height={24}
                    className="w-full h-full object-contain"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileInput}
        />

        <AlertDialog
          open={!!scanResult}
          onOpenChange={() => scanResult && closeDialog()}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>QR Code Detected</AlertDialogTitle>
              <AlertDialogDescription className="break-all">
                {scanResult}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction onClick={closeDialog}>Close</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};
