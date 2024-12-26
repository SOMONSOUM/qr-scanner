import { useVideoScanner } from "@/hooks/use-video-scanner";
import { useRef } from "react";
import { motion } from "framer-motion";
import QrScanner from "qr-scanner";
import { X } from "lucide-react";
import useMediaQuery from "@/hooks/use-media-query";

export interface CameraScanProps {
  onBack: VoidFunction;
  setResult: (result: string) => void;
  onError: (error: string) => void;
}

export const CameraScan: React.FC<CameraScanProps> = ({
  onBack,
  setResult,
  onError,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const isMobile = useMediaQuery("(max-width: 768px)");

  const onDecode = (result: string) => {
    console.log("result", result);
    return setResult(result);
  };

  const onDecodeError = (error: string | Error) => {
    const err = error.toString();

    if (err === QrScanner.NO_QR_CODE_FOUND) return;
    if (err === "Scanner error: No QR code found") return;

    onError(error.toString());
  };

  interface ScanRegion {
    x: number;
    y: number;
    width: number;
    height: number;
  }

  const calculateScanRegion = (video: HTMLVideoElement): ScanRegion => {
    const smallestDimension = Math.min(video.videoWidth, video.videoHeight);
    const scanRegionSize = isMobile
      ? Math.round(smallestDimension * 0.6)
      : Math.round(smallestDimension * 0.4);
    const offsetX = Math.round((video.videoWidth - scanRegionSize) / 2);
    const offsetY = Math.round((video.videoHeight - scanRegionSize) / 2);

    return {
      x: offsetX,
      y: offsetY,
      width: scanRegionSize,
      height: scanRegionSize,
    };
  };

  useVideoScanner(
    videoRef,
    onDecode,
    onDecodeError,
    calculateScanRegion,
    overlayRef.current
  );

  return (
    <>
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-gradient-to-b from-black/50 to-transparent">
        <h1 className="text-xl font-bold text-white">AAS ស្កែន</h1>
        <button
          className="text-white hover:bg-white/20 rounded-full p-2"
          onClick={onBack}
        >
          <X className="w-6 h-6" />
        </button>
      </div>
      <div className="relative h-full w-full">
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover"
        />

        {/* Scanning Frame */}
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
            {/* Corner Markers */}
            <div className="absolute -top-1 -left-1 w-12 h-12 border-t-[6px] border-l-[6px] border-white rounded-tl-3xl" />
            <div className="absolute -top-1 -right-1 w-12 h-12 border-t-[6px] border-r-[6px] border-white rounded-tr-3xl" />
            <div className="absolute -bottom-1 -left-1 w-12 h-12 border-b-[6px] border-l-[6px] border-white rounded-bl-3xl" />
            <div className="absolute -bottom-1 -right-1 w-12 h-12 border-b-[6px] border-r-[6px] border-white rounded-br-3xl" />
          </motion.div>
        </div>
      </div>
    </>
  );
};
