import { useEffect, useRef } from "react";

interface QRCodeProps {
  value: string;
  size?: number;
  className?: string;
}

export default function QRCode({ value, size = 200, className = "" }: QRCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Simple QR code pattern generation (for demonstration)
    // In a real implementation, you would use a proper QR code library
    const generateQRPattern = () => {
      const gridSize = 25;
      const cellSize = size / gridSize;
      
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, size, size);
      
      ctx.fillStyle = '#000000';
      
      // Generate a simple pattern based on the hash of the value
      let hash = 0;
      for (let i = 0; i < value.length; i++) {
        const char = value.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
      }
      
      // Create deterministic pattern
      for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
          const seed = (hash + row * gridSize + col) & 0xFFFFFF;
          
          // Corner markers
          if ((row < 7 && col < 7) || 
              (row < 7 && col >= gridSize - 7) || 
              (row >= gridSize - 7 && col < 7)) {
            if ((row === 0 || row === 6 || col === 0 || col === 6) ||
                (row >= 2 && row <= 4 && col >= 2 && col <= 4)) {
              ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
            }
          } else if (seed % 3 === 0) {
            ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
          }
        }
      }
    };

    generateQRPattern();
  }, [value, size]);

  return (
    <div className={`inline-block p-4 bg-white rounded-xl ${className}`}>
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        className="block"
      />
    </div>
  );
}
