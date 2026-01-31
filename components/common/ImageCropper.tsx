
import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import Button from './Button';

// Utility function to generate cropped image
const getCroppedImg = async (imageSrc: string, pixelCrop: any): Promise<string> => {
    const image = new Image();
    image.src = imageSrc;
    await new Promise(resolve => image.onload = resolve);
    const canvas = document.createElement('canvas');
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
        throw new Error('Could not get canvas context');
    }

    ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
    );

    return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (!blob) {
                reject(new Error('Canvas is empty'));
                return;
            }
            const reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onloadend = () => {
                resolve(reader.result as string);
            };
            reader.onerror = error => reject(error);
        }, 'image/jpeg');
    });
};


interface ImageCropperProps {
    imageSrc: string;
    onCropComplete: (croppedImageUrl: string) => void;
    onClose: () => void;
}

const ImageCropper: React.FC<ImageCropperProps> = ({ imageSrc, onCropComplete, onClose }) => {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

    const onCropCompleteCallback = useCallback((croppedArea: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);
    
    const showCroppedImage = useCallback(async () => {
        if (!croppedAreaPixels) return;
        try {
            const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
            onCropComplete(croppedImage);
        } catch (e) {
            console.error(e);
        }
    }, [imageSrc, croppedAreaPixels, onCropComplete]);

    return (
        <div className="fixed inset-0 bg-black/80 z-[60] flex flex-col justify-center items-center p-4">
            <div className="relative w-full max-w-lg h-[60vh] bg-gray-700 rounded-2xl overflow-hidden">
                <Cropper
                    image={imageSrc}
                    crop={crop}
                    zoom={zoom}
                    aspect={1}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={onCropCompleteCallback}
                    cropShape="round"
                    showGrid={false}
                />
            </div>
            <div className="w-full max-w-lg p-4 space-y-4">
                 <div className="flex items-center space-x-4">
                    <span className="material-icons-sharp text-white">zoom_out</span>
                    <input
                        type="range"
                        value={zoom}
                        min={1}
                        max={3}
                        step={0.1}
                        aria-labelledby="Zoom"
                        onChange={(e) => setZoom(Number(e.target.value))}
                        className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="material-icons-sharp text-white">zoom_in</span>
                </div>
                <div className="flex justify-center gap-4">
                    <Button variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button onClick={showCroppedImage} icon="crop">Crop & Save</Button>
                </div>
            </div>
        </div>
    );
};

export default ImageCropper;
