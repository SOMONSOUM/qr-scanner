import { useQRScannerStore } from "@/store";
import QrScanner from "qr-scanner";
import { RefObject, useRef, useState } from "react";
import { toast } from "sonner";

type UseQRScannerProps = {
  videoRef: RefObject<HTMLVideoElement | null>,
  calculateScanRegion?: (video: HTMLVideoElement) => QrScanner.ScanRegion;
  overlay?: HTMLDivElement,
}

export const useQRScanner = ({ calculateScanRegion, overlay, videoRef }: UseQRScannerProps) => {
  const qrScannerRef = useRef<QrScanner | null>(null);
  const { scanResult, setScanResult, flashlightOn, setFlashlightOn } = useQRScannerStore();
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [currentCamera, setCurrentCamera] = useState<"user" | "environment">(
    "environment"
  );

  const toggleFlashlight = async () => {
    if (qrScannerRef.current) {
      try {
        if (flashlightOn) {
          await qrScannerRef.current.turnFlashOff();
        } else {
          await qrScannerRef.current.turnFlashOn();
        }
        setFlashlightOn(!flashlightOn);
      } catch (error) {
        toast.error("បើកពិលមានបញ្ហា!", {
          duration: 3000,
          position: "top-right",
          style: {
            fontFamily: "Koh Santepheap",
            fontSize: "11pt",
          },
        });
      }
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || typeof window === "undefined") return;

    try {
      const responseQrdata = await QrScanner.scanImage(file, {
        returnDetailedScanResult: true,
      });
      setScanResult(responseQrdata.data);
    } catch (error) {
      toast.error("រកមិនឃើញ QR ដើម្បីស្កែនទេ!", {
        duration: 3000,
        position: "top-right",
        style: {
          fontFamily: "Koh Santepheap",
          fontSize: "11pt"
        }
      });
    }
    e.target.value = "";
  }

  const copyToClipboard = () => {
    if (scanResult) {
      navigator.clipboard.writeText(scanResult);
    }
  };

  const startCamera = async () => {
    if (videoRef.current) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: currentCamera },
        });
        videoRef.current.srcObject = stream;

        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch((error) => {
            console.error("Error playing video:", error);
          });
        };

        qrScannerRef.current = new QrScanner(
          videoRef.current,
          (result) => {
            setScanResult(result.data);
            qrScannerRef.current?.stop();
            setIsCameraActive(false);
            setFlashlightOn(false);
          },
          {
            returnDetailedScanResult: true,
            highlightScanRegion: false,
            highlightCodeOutline: true,
            calculateScanRegion,
            overlay,
          }
        );

        qrScannerRef.current.start();
        setIsCameraActive(true);
      } catch (error) {
        console.error("Error accessing camera:", error);
      }
    }
  };

  const stopCamera = () => {
    if (qrScannerRef.current) {
      qrScannerRef.current.stop();
    }
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const tracks = stream.getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    setFlashlightOn(false);
  };

  const switchCamera = async () => {
    setCurrentCamera(currentCamera === "environment" ? "user" : "environment");
    await startCamera();
  };

  return {
    toggleFlashlight,
    flashlightOn,
    handleFileChange,
    copyToClipboard,
    startCamera,
    switchCamera,
    stopCamera,
    isCameraActive
  }
};
