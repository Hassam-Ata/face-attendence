"use client";

import { useRef, useState, useCallback } from "react";
import Webcam from "react-webcam";
import { Camera, RotateCcw, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function WebcamCapture({ onCapture, disabled = false }) {
  const webcamRef = useRef(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [isCameraReady, setIsCameraReady] = useState(false);

  const videoConstraints = {
    width: 640,
    height: 480,
    facingMode: "user",
  };

  const handleCapture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setCapturedImage(imageSrc);
      if (onCapture) {
        onCapture(imageSrc);
      }
    }
  }, [onCapture]);

  const handleRetake = () => {
    setCapturedImage(null);
    if (onCapture) {
      onCapture(null);
    }
  };

  const handleUserMedia = () => {
    setIsCameraReady(true);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Camera/Image Display */}
          <div className="relative aspect-video  rounded-lg overflow-hidden">
            {!capturedImage ? (
              <>
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  videoConstraints={videoConstraints}
                  onUserMedia={handleUserMedia}
                  className="w-full h-full object-cover"
                />
                {!isCameraReady && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                    <div className="text-center">
                      <Camera className="w-12 h-12 mx-auto mb-2 text-gray-400 animate-pulse" />
                      <p className="text-sm text-gray-600">Loading camera...</p>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <img
                src={capturedImage}
                alt="Captured"
                className="w-full h-full object-cover"
              />
            )}
          </div>

          {/* Instructions */}
          <div className="text-center text-sm ">
            {!capturedImage ? (
              <p>Position your face in the center and click capture</p>
            ) : (
              <p className="text-green-600 font-medium">
                ✓ Image captured successfully
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-center">
            {!capturedImage ? (
              <Button
                onClick={handleCapture}
                disabled={!isCameraReady || disabled}
                size="lg"
                className="gap-2"
              >
                <Camera className="w-5 h-5" />
                Capture Photo
              </Button>
            ) : (
              <>
                <Button
                  onClick={handleRetake}
                  variant="outline"
                  size="lg"
                  className="gap-2"
                  disabled={disabled}
                >
                  <RotateCcw className="w-5 h-5" />
                  Retake
                </Button>
                <Button
                  size="lg"
                  className="gap-2 bg-green-600 hover:bg-green-700"
                  disabled
                >
                  <Check className="w-5 h-5" />
                  Photo Ready
                </Button>
              </>
            )}
          </div>

          {/* Tips */}
          <div className="rounded-lg p-4">
            <p className="text-sm font-medium  mb-2">
              📸 Tips for best results:
            </p>
            <ul className="text-xs  space-y-1">
              <li>• Ensure good lighting on your face</li>
              <li>• Look directly at the camera</li>
              <li>• Remove glasses or hats if possible</li>
              <li>• Keep a neutral expression</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
