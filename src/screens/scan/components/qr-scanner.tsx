"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
import useMediaQuery from "@/hooks/use-media-query";

export const QRScanner = () => {
  const [, setHasCamera] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [flashlightOn, setFlashlightOn] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const overlayRef = useRef<HTMLDivElement | null>(null);

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
          overlay: overlayRef.current ? overlayRef.current : undefined,
          calculateScanRegion(video) {
            const smallestDimension = Math.min(
              video.videoWidth,
              video.videoHeight
            );
            const scanRegionSize = isMobile
              ? Math.round(smallestDimension * 0.6)
              : Math.round(smallestDimension * 0.4);
            const offsetX = Math.round((video.videoWidth - scanRegionSize) / 2);
            const offsetY = Math.round(
              (video.videoHeight - scanRegionSize) / 2
            );
            return {
              x: offsetX,
              y: offsetY,
              width: scanRegionSize,
              height: scanRegionSize,
            };
          },
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
      setCameraReady(true); // Set camera ready to true after starting the scanner
    } catch (error) {
      console.error("Scanner error:", error);
    }
  }, [isMobile]);

  const stopScanner = useCallback(() => {
    if (scannerRef.current) {
      scannerRef.current.stop();
      scannerRef.current.destroy();
      scannerRef.current = null;
      setIsScanning(false);
      setFlashlightOn(false);
      setCameraReady(false); // Set camera ready to false after stopping the scanner
    }
  }, []);

  const toggleFlashlight = useCallback(async () => {
    if (!scannerRef.current) return;

    try {
      await scannerRef.current.toggleFlash();
      setFlashlightOn((prev) => !prev);
    } catch (error) {
      console.error("Flashlight error:", error);
    }
  }, []);

  const closeDialog = () => {
    setScanResult(null);
    startScanner();
  };

  useEffect(() => {
    startScanner();
    return () => {
      stopScanner();
    };
  }, [startScanner, stopScanner]);

  const handleBack = () => {
    stopScanner();
    router.push("/");
  };

  return (
    <div className="fixed inset-0 bg-black">
      <div className="relative h-[100dvh] w-full overflow-hidden">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-gradient-to-b from-black/50 to-transparent">
          <h1 className="text-xl font-bold text-white">AAS ស្កែន</h1>
          <button
            className="text-white hover:bg-transparent rounded-full p-2"
            onClick={handleBack}
          >
            <X className="w-6 h-6 hover:text-white" />
          </button>
        </div>

        {/* Camera View */}
        <div className="relative h-full w-full">
          <video
            ref={videoRef}
            className="absolute inset-0 h-full w-full object-cover"
          />

          {/* Scanning Frame */}
          {cameraReady && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="absolute inset-0" />
              <motion.div
                ref={overlayRef}
                className="relative w-72 h-72 max-w-[80vw] max-h-[80vw]"
                initial={{ borderColor: "#FCD34D" }}
                animate={{
                  scale: isScanning ? [1, 1.02, 1] : 1,
                  borderColor: ["#FCD34D", "#FBBF24", "#FCD34D"],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                {/* Corner Markers */}
                <div className="absolute -top-1 -left-1 w-12 h-12 border-t-4 border-l-4 border-blue-300 rounded-tl-xl" />
                <div className="absolute -top-1 -right-1 w-12 h-12 border-t-4 border-r-4 border-blue-300 rounded-tr-xl" />
                <div className="absolute -bottom-1 -left-1 w-12 h-12 border-b-4 border-l-4 border-blue-300 rounded-bl-xl" />
                <div className="absolute -bottom-1 -right-1 w-12 h-12 border-b-4 border-r-4 border-blue-300 rounded-br-xl" />
              </motion.div>
            </div>
          )}
        </div>

        {/* Bottom Controls */}
        <div className="absolute bottom-0 left-0 right-0 pb-safe">
          {/* Action Buttons */}
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
              <span className="text-white">ភ្លើង</span>
            </Button>
            <Button
              variant="ghost"
              className="h-12 flex-1 max-w-40 bg-neutral-900/90 text-white hover:bg-neutral-800/90 rounded-full"
              onClick={() => fileInputRef.current?.click()}
            >
              <QrCode className="w-5 h-5 mr-2 text-white" />
              <span className="text-white">ថែត QR</span>
            </Button>
          </div>

          {/* Payment Methods */}
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

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={async (e) => {
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
          }}
        />

        {/* Result Dialog */}
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
