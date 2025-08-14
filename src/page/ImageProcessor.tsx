import React, { useState } from 'react';
import PixelifyImage from '@/util/PixelifyImage';

interface ImageProcessorProps {
  pixelSize: number;
  centered: boolean;
  fillColor: string;
}

export default function ImageProcessor({
  pixelSize,
  centered,
  fillColor,
}: ImageProcessorProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  // --- Event Handlers (No changes needed here) ---
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => setImageSrc(reader.result as string);
        reader.readAsDataURL(file);
      } else {
        alert('Please drop an image file.');
      }
    }
  };

  // --- Dynamic Class for the main container ---
  // It handles drag-over styling and changes layout based on content.
  const containerClasses = `
    w-full p-6 border-4 border-dashed rounded-lg flex transition-colors duration-200
    ${isDraggingOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
    ${imageSrc ? 'flex-row gap-6' : 'min-h-[300px] items-center justify-center'}
  `;

  return (
    <div
      className={containerClasses}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* 
        Use a ternary operator to switch between the two states:
        1. Before an image is dropped (!imageSrc)
        2. After an image is dropped (imageSrc)
      */}
      {!imageSrc ? (
        // --- STATE 1: Initial Drop Zone Message ---
        <p className="text-gray-500 text-2xl font-semibold">
          Drag & Drop Your Image Here
        </p>
      ) : (
        // --- STATE 2: Three Columns in a Row ---
        // Use a React Fragment <> to return multiple sibling elements
        <>
          {/* Column 1: A smaller "Re-Drop" Zone */}
          <div className="flex-1 flex flex-col items-center justify-center text-center p-4 border-2 border-dashed rounded-md text-gray-400">
            <h3 className="text-xl font-bold mb-4">Drop New Image</h3>
            <p>Drag another image here to replace the current one.</p>
          </div>

          {/* Column 2: Original Image */}
          <div className="flex-1 text-center">
            <h3 className="text-xl font-bold mb-4">Original</h3>
            <img
              src={imageSrc}
              alt="Original upload"
              className="max-w-full h-auto mx-auto border-2 border-gray-200 rounded-md"
              style={{ width: '250px', height: '250px', objectFit: 'contain' }}
            />
          </div>

          {/* Column 3: Pixelated Image */}
          <div className="flex-1 text-center">
            <h3 className="text-xl font-bold mb-4">Pixelated</h3>
            <PixelifyImage
              src={imageSrc}
              width={250}
              height={250}
              pixelSize={pixelSize}
              centered={centered}
              fillTransparencyColor={fillColor}
            />
          </div>
        </>
      )}
    </div>
  );
}