import React, { useEffect, useState, useRef } from 'react';

// Declare the Html5Qrcode class to be available in the scope.
// This is necessary because it's loaded from a script tag in index.html.
declare const Html5Qrcode: any;

interface ScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanError: (errorMessage: string) => void;
  isPaused: boolean;
}

const qrConfig = { fps: 10, qrbox: { width: 250, height: 250 } };
const SCANNER_ID = "qr-reader";

const Scanner: React.FC<ScannerProps> = ({ onScanSuccess, onScanError, isPaused }) => {
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(null);
  const scannerRef = useRef<any>(null);

  useEffect(() => {
    const startScanner = async () => {
        try {
            const devices = await Html5Qrcode.getCameras();
            if (devices && devices.length) {
                setCameraPermission(true);
                const html5QrCode = new Html5Qrcode(SCANNER_ID);
                scannerRef.current = html5QrCode;
                html5QrCode.start(
                    { facingMode: "environment" },
                    qrConfig,
                    onScanSuccess,
                    (errorMessage: string) => { /* console.warn(errorMessage) */ }
                ).catch((err: any) => {
                    onScanError(`Erro ao iniciar a câmera: ${err}`);
                    setCameraPermission(false);
                });
            } else {
                setCameraPermission(false);
                onScanError("Nenhuma câmera encontrada.");
            }
        } catch (err) {
            setCameraPermission(false);
            onScanError("Erro ao solicitar permissão da câmera.");
        }
    };

    if (!scannerRef.current) {
        startScanner();
    }

    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch((err: any) => console.error("Falha ao parar o scanner.", err));
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (scannerRef.current && scannerRef.current.isScanning) {
        if(isPaused) {
            scannerRef.current.pause(true);
        } else {
            scannerRef.current.resume();
        }
    }
  }, [isPaused]);


  return (
    <div className="w-full max-w-md mx-auto relative">
      <div id={SCANNER_ID} className="w-full border-4 border-gray-600 rounded-lg overflow-hidden"></div>
      {cameraPermission === false && (
        <div className="absolute inset-0 bg-gray-900 bg-opacity-80 flex flex-col items-center justify-center text-center p-4">
          <p className="text-red-400 font-bold">Câmera não disponível.</p>
          <p className="text-gray-300">Por favor, habilite a permissão da câmera no seu navegador.</p>
        </div>
      )}
    </div>
  );
};

export default Scanner;
