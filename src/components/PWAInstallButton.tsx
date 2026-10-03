import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Share, PlusSquare, X, CheckCircle2 } from 'lucide-react';

export const PWAInstallButton: React.FC<{ variant?: 'header' | 'banner' | 'settings' }> = ({
  variant = 'header',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already installed as standalone PWA
  if (isInstalled) {
    if (variant === 'settings') {
      return (
        <div className="flex items-center gap-2 text-xs font-medium text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          Aplikasi sudah terinstal di perangkat ini
        </div>
      );
    }
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    if (variant === 'banner') {
      return (
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-3 sm:p-4 rounded-2xl shadow-lg flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <Download className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="text-sm font-bold">Install Surat Penawaran Pro</h4>
              <p className="text-xs text-blue-100">Akses cepat dari Home Screen tanpa browser bar</p>
            </div>
          </div>
          <button
            onClick={install}
            className="shrink-0 bg-white text-blue-800 hover:bg-blue-50 font-bold px-3.5 py-2 rounded-xl text-xs shadow transition active:scale-95 cursor-pointer"
          >
            Install App
          </button>
        </div>
      );
    }

    return (
      <button
        onClick={install}
        className="flex items-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 text-xs font-bold shadow-sm transition active:scale-95 cursor-pointer"
        title="Install ke HP / Desktop"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Install App</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 px-3 py-1.5 text-xs font-semibold transition active:scale-95 cursor-pointer"
        >
          <Share className="w-3.5 h-3.5" />
          <span>Install di iPhone</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="w-full max-w-sm rounded-3xl bg-white p-5 shadow-2xl animate-in fade-in slide-in-from-bottom-6">
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                    SP
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">Install di iOS / Safari</h3>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-4 space-y-3 text-xs text-slate-600">
                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                    1
                  </span>
                  <p>
                    Ketuk tombol <strong className="text-blue-700">Bagikan (Share)</strong> <Share className="inline w-3.5 h-3.5 mx-0.5 text-blue-600" /> di menu bawah browser Safari.
                  </p>
                </div>

                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                    2
                  </span>
                  <p>
                    Geser menu ke bawah lalu pilih opsi{' '}
                    <strong className="text-blue-700">Tambah ke Layar Utama (Add to Home Screen)</strong> <PlusSquare className="inline w-3.5 h-3.5 mx-0.5 text-blue-600" />.
                  </p>
                </div>

                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                    3
                  </span>
                  <p>Ketuk <strong>Tambah</strong> di pojok kanan atas. Ikon aplikasi akan muncul di layar ponsel Anda.</p>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white hover:bg-blue-700 active:scale-95 transition"
              >
                Saya Mengerti
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
