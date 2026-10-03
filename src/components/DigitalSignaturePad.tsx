import React, { useRef, useState, useEffect } from 'react';
import { RotateCcw, Check, Upload, PenTool } from 'lucide-react';

interface DigitalSignaturePadProps {
  value?: string;
  onChange: (dataUrl: string) => void;
  title?: string;
}

export const DigitalSignaturePad: React.FC<DigitalSignaturePadProps> = ({
  value,
  onChange,
  title = 'Tanda Tangan Digital',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [mode, setMode] = useState<'draw' | 'upload'>('draw');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // High DPI scaling
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);

    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // If initial value exists and is image
    if (value && value.startsWith('data:image')) {
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, rect.width, rect.height);
        ctx.drawImage(img, 0, 0, rect.width, rect.height);
      };
      img.src = value;
    }
  }, [value]);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      const touch = e.touches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      };
    }
    return {
      x: (e as React.MouseEvent).clientX - rect.left,
      y: (e as React.MouseEvent).clientY - rect.top,
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (!canvas) return;
    // Save to PNG dataUrl
    const dataUrl = canvas.toDataURL('image/png');
    onChange(dataUrl);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);
    onChange('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        onChange(result);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
      <div className="flex items-center justify-between mb-3">
        <label className="text-xs font-bold text-slate-700">{title}</label>
        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs">
          <button
            type="button"
            onClick={() => setMode('draw')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition font-medium ${
              mode === 'draw' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600'
            }`}
          >
            <PenTool className="w-3 h-3" />
            <span>Gores Tangan</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('upload')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition font-medium ${
              mode === 'upload' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600'
            }`}
          >
            <Upload className="w-3 h-3" />
            <span>Upload File</span>
          </button>
        </div>
      </div>

      {mode === 'draw' ? (
        <div>
          <div className="relative border-2 border-dashed border-slate-300 rounded-xl overflow-hidden bg-slate-50 touch-none">
            <canvas
              ref={canvasRef}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="w-full h-36 cursor-crosshair"
            />
            {!value && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-slate-400 text-xs font-medium">
                Tanda tangan di sini dengan jari atau mouse
              </div>
            )}
          </div>
          <div className="flex justify-between items-center mt-2.5">
            <button
              type="button"
              onClick={clearCanvas}
              className="flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 font-semibold px-2 py-1 rounded hover:bg-rose-50 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Hapus Goresan</span>
            </button>
            {value && (
              <span className="flex items-center gap-1 text-xs text-emerald-600 font-semibold">
                <Check className="w-3.5 h-3.5" /> Tanda tangan tersimpan
              </span>
            )}
          </div>
        </div>
      ) : (
        <div>
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-xl p-4 cursor-pointer hover:bg-slate-50 transition">
            <Upload className="w-8 h-8 text-blue-500 mb-1" />
            <span className="text-xs font-bold text-slate-700">Pilih gambar tanda tangan (PNG transparan)</span>
            <span className="text-[11px] text-slate-400 mt-0.5">Format PNG atau JPG maks 2MB</span>
            <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
          </label>
          {value && (
            <div className="mt-3 flex items-center gap-3 p-2 bg-slate-50 rounded-xl border border-slate-200">
              <img src={value} alt="Signature preview" className="h-12 object-contain bg-white rounded p-1 border" />
              <button
                type="button"
                onClick={() => onChange('')}
                className="text-xs text-rose-600 hover:underline font-semibold"
              >
                Hapus
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
