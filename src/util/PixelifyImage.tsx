import React, { useRef, useEffect } from 'react';

interface pixelifyProps{
  src: string;
  width?: number;
  height?: number;
  pixelSize?: number; 
  fillTransparencyColor?: string;
  className?: string;
  centered?: boolean;
}

export default function PixelifyImage({
  src,
  width,
  height,
  pixelSize = 10, // Default pixel size to 10 if not provided
  fillTransparencyColor,
  centered = false,
  className,
}: pixelifyProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(()=>{
    const canvas = canvasRef.current;
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    if(!ctx) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src =src;
    img.onload=()=>{
      const finalWidth = width || img.naturalWidth;
      const finalHeight = height || img.naturalHeight;
      canvas.width = finalWidth;
      canvas.height = finalHeight;
      ctx.drawImage(img, 0, 0, finalWidth, finalHeight);
      const offsetX = centered ? (finalWidth % pixelSize) / 2 : 0;
      const offsetY = centered ? (finalHeight % pixelSize) / 2 : 0;
      for(let y = 0; y< finalHeight; y+=pixelSize){
        for(let x= 0; x < finalWidth; x += pixelSize){
          const sampleX = x + Math.floor(pixelSize / 2);
          const sampleY = y + Math.floor(pixelSize / 2);
          const [r, g, b, a] = ctx.getImageData(sampleX, sampleY, 1, 1).data;
          if(a === 0 && fillTransparencyColor){
            ctx.fillStyle = fillTransparencyColor;
          }else{
            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a / 255})`;
          }
          ctx.fillRect(offsetX + x, offsetY + y, Math.ceil(pixelSize), Math.ceil(pixelSize));
        }
      }
    }

    img.onerror=()=>{
      console.error(`Failed to load image from src: ${src}`);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    return()=>{
      img.onload = null;
      img.onerror = null;
    }
  },[src, width, height, pixelSize, fillTransparencyColor])
  return (
    <canvas ref={canvasRef} className={className}/>
  )
}