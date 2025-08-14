import React, { useState } from "react";
import PixelifyImage from "../util/PixelifyImage";
import ImageProcessor from "./ImageProcessor";
import { Separator } from "@assets/components/ui/separator";
import fingerprint from "@assets/fingerprint.png";
import policebadge from "@assets/policebadge.png";

// Import the stylesheet

export default function Demo() {
  // State variables to control the Pixelify component's props
  const [pixelSize, setPixelSize] = useState(14);
  const [centered, setCentered] = useState(true);
  const [fillColor, setFillColor] = useState('#ffff11');

  return (
    <div className="flex gap-[20px] flex-col items-left">
      <div className="w-[250px] grow">
        <header>
          <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight text-balance">
            React Pixelify
          </h1>
        </header>
      </div>
      <div className="w-[250px] grow">
        <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
          Change Properties
        </h3>
      </div>
      <Separator />
      <div className="w-[650px] grow">
        <table className="w-full">
          <thead>
            <tr className="text-left even:bg-muted m-0 border-t p-0">
              <th className="border px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right">
                Property
              </th>
              <th className="w-[450px] text-center border px-4 py-2 font-bold [&[align=center]]:text-center [&[align=right]]:text-right">
                Parameter
              </th>
              <th className="border px-4 py-2 text-center font-bold [&[align=center]]:text-center [&[align=right]]:text-right">
                Value
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="even:bg-muted m-0 border-t p-0">
              <td className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right">
                centered
              </td>
              <td className="border px-4 py-2 text-center [&[align=center]]:text-center [&[align=right]]:text-right">
                <input
                  type="checkbox"
                  checked={centered}
                  onChange={(e) => setCentered(e.target.checked)}
                />
              </td>
              <td className="border px-4 py-2 text-center [&[align=center]]:text-center [&[align=right]]:text-right">
                {String(centered)}
              </td>
            </tr>
            <tr className="even:bg-muted m-0 border-t p-0">
              <td className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right">
                pixelSize
              </td>
              <td className="border px-4 py-2 text-center [&[align=center]]:text-center [&[align=right]]:text-right">
                <input
                  type="range"
                  min="3"
                  max="50"
                  value={pixelSize}
                  onChange={(e) => setPixelSize(parseInt(e.target.value, 10))}
                />
              </td>
              <td className="border px-4 py-2 text-center [&[align=center]]:text-center [&[align=right]]:text-right">
                {pixelSize}
              </td>
            </tr>
            <tr className="even:bg-muted m-0 border-t p-0">
              <td className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right">
                fillTransparencyColor
              </td>
              <td className="border px-4 py-2 text-center [&[align=center]]:text-center [&[align=right]]:text-right">
                <input
                  type="color"
                  value={fillColor}
                  onChange={(e) => setFillColor(e.target.value)}
                  className="h-10 p-1 border-gray-300 rounded-md cursor-pointer"
                />
              </td>
              <td className="border px-4 py-2 text-center [&[align=center]]:text-center [&[align=right]]:text-right">
                {fillColor}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="w-[650px] grow">
      <section className="flex gap-[120px] flex-row">
        {/* <PixelifyImage
          src={policebadge}
          width={250}
          height={250}
          pixelSize={pixelSize}
          centered={centered}
          fillTransparencyColor={fillColor}
        />
        <PixelifyImage
          src={fingerprint}
          width={250}
          height={250}
          pixelSize={pixelSize}
          centered={centered}
          fillTransparencyColor={fillColor}
        /> */}
                   <ImageProcessor
        pixelSize={pixelSize}
        centered={centered}
        fillColor={fillColor}
      />
      </section>

      </div>


    </div>
  );
}
