import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { X, Camera } from "lucide-react";
import { BrowserMultiFormatReader } from "@zxing/library";

interface BarcodeScannerProps {
  stream: MediaStream;
  onScan: (barcode: string) => void;
  onClose: () => void;
}

export default function BarcodeScanner({ stream, onScan, onClose }: BarcodeScannerProps) {
  const { t } = useTranslation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);

  useEffect(() => {
    const reader = new BrowserMultiFormatReader();
    readerRef.current = reader;

    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().then(() => {
        reader.decodeFromVideoElementContinuously(videoRef.current!, (result) => {
          if (result) {
            const code = result.getText();
            reader.reset();
            onScan(code);
          }
        });
      });
    }

    return () => {
      reader.reset();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black/80 relative z-10">
        <div className="flex items-center gap-2 text-white">
          <Camera className="w-5 h-5" />
          <span className="text-sm font-semibold">{t("nutrition.scanning")}</span>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Camera feed */}
      <div className="flex-1 relative flex items-center justify-center">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Scan overlay */}
        <div className="relative z-10 w-64 h-64">
          {/* Corner markers */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-onair-cyan rounded-tl-lg" />
          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-onair-cyan rounded-tr-lg" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-onair-cyan rounded-bl-lg" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-onair-cyan rounded-br-lg" />

          {/* Scan line animation */}
          <motion.div
            className="absolute left-2 right-2 h-0.5 bg-onair-cyan/80 shadow-[0_0_8px_var(--cyan)]"
            animate={{ top: ["10%", "90%", "10%"] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

      </div>
    </motion.div>
  );
}
