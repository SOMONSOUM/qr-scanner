"use client";

import { useCallback, useRef, useState } from "react";
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
import { CameraScan } from "../custom/camera-scan";
import { useQRScannerStore } from "@/store";

export const QRScanner = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const { flashlightOn, toggleFlashlight, setScanResult, scanResult } =
    useQRScannerStore();

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

  return (
    <div className="fixed inset-0 bg-black">
      <div className="relative h-[100dvh] w-full overflow-hidden">
        {/* Header */}
        <CameraScan
          onBack={() => router.push("/")}
          onError={(error) => console.log({ error })}
          setResult={(result) => setScanResult(result)}
        />

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
          onChange={handleFileInput}
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
