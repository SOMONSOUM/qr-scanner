"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
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

export default function QRScanner() {
  const [hasCamera, setHasCamera] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [flashlightOn, setFlashlightOn] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
          highlightScanRegion: true,
          highlightCodeOutline: true,
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
    } catch (error) {
      console.error("Scanner error:", error);
    }
  }, []);

  const stopScanner = useCallback(() => {
    if (scannerRef.current) {
      scannerRef.current.stop();
      scannerRef.current.destroy();
      scannerRef.current = null;
      setIsScanning(false);
      setFlashlightOn(false);
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

  return (
    <div className="fixed inset-0 bg-black">
      <div className="relative h-full max-h-[100dvh] w-full overflow-hidden">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-gradient-to-b from-black/50 to-transparent">
          <h1 className="text-xl font-bold text-white">ABA&apos; ស្កែន</h1>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
            onClick={stopScanner}
          >
            <X className="w-6 h-6" />
          </Button>
        </div>

        {/* Camera View */}
        <div className="relative h-full">
          <video ref={videoRef} className="h-full w-full object-cover" />

          {/* Scanning Frame */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/60" />
            <div className="relative w-72 h-72 max-w-[80vw] max-h-[80vw]">
              {/* Corner Markers */}
              <div className="absolute -top-1 -left-1 w-12 h-12 border-t-4 border-l-4 border-white rounded-tl-xl" />
              <div className="absolute -top-1 -right-1 w-12 h-12 border-t-4 border-r-4 border-white rounded-tr-xl" />
              <div className="absolute -bottom-1 -left-1 w-12 h-12 border-b-4 border-l-4 border-white rounded-bl-xl" />
              <div className="absolute -bottom-1 -right-1 w-12 h-12 border-b-4 border-r-4 border-white rounded-br-xl" />
            </div>
          </div>
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
                  flashlightOn ? "text-yellow-300" : ""
                }`}
              />
              ភ្លើង
            </Button>
            <Button
              variant="ghost"
              className="h-12 flex-1 max-w-40 bg-neutral-900/90 text-white hover:bg-neutral-800/90 rounded-full"
              onClick={() => fileInputRef.current?.click()}
            >
              <QrCode className="w-5 h-5 mr-2" />
              ថែត QR
            </Button>
          </div>

          {/* Payment Methods */}
          <div className="bg-black p-4">
            <div className="flex justify-center items-center gap-2 overflow-x-auto py-2 px-4">
              {[
                "/payment/bakong.png",
                "/payment/cashIn.png",
                "/payment/aba-pay.png",
                "/payment/khqr.png",
                "/payment/wing.png",
                "/payment/unionpay.png",
                "/payment/qr.png",
                "/payment/victor.png",
                "/payment/visa.png",
                "/payment/mastercard.png",
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
}
