import { useEffect, useState } from "react";

const Noise = ({
  patternSize = 250, // Ukuran tile (lebih kecil lebih ringan)
  patternAlpha = 15, // Transparansi
  className,
}) => {
  const [noiseDataUri, setNoiseDataUri] = useState("");

  useEffect(() => {
    // 1. Buat canvas virtual (tidak di-render ke DOM)
    const canvas = document.createElement("canvas");
    canvas.width = patternSize;
    canvas.height = patternSize;
    const ctx = canvas.getContext("2d");

    // 2. Gambar noise SEKALI SAJA
    const imageData = ctx.createImageData(patternSize, patternSize);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const value = Math.random() * 255;
      data[i] = value;     // R
      data[i + 1] = value; // G
      data[i + 2] = value; // B
      data[i + 3] = patternAlpha; // Alpha (Transparansi)
    }

    ctx.putImageData(imageData, 0, 0);

    // 3. Ubah jadi gambar Base64 string
    setNoiseDataUri(canvas.toDataURL());
  }, [patternSize, patternAlpha]);

  return (
    <div
      className={`pointer-events-none absolute inset-0 z-0 overflow-hidden ${className || ''}`}
    >
      <div
        className="absolute inset-[-200%] h-[400%] w-[400%]"
        style={{
          backgroundImage: `url(${noiseDataUri})`,
          backgroundRepeat: "repeat",
          // Animasi CSS murni (Jauh lebih ringan daripada JS Loop)
          animation: "noiseAnimation 0.2s infinite steps(10)", 
        }}
      />
      
      {/* Inject Keyframes untuk animasi getar */}
      <style>{`
        @keyframes noiseAnimation {
          0% { transform: translate(0, 0); }
          10% { transform: translate(-5%, -5%); }
          20% { transform: translate(-10%, 5%); }
          30% { transform: translate(5%, -10%); }
          40% { transform: translate(-5%, 15%); }
          50% { transform: translate(-10%, 5%); }
          60% { transform: translate(15%, 0); }
          70% { transform: translate(0, 10%); }
          80% { transform: translate(-15%, 0); }
          90% { transform: translate(10%, 5%); }
          100% { transform: translate(5%, 0); }
        }
      `}</style>
    </div>
  );
};

export default Noise;