import React, { useState } from 'react';
import { useData } from '../context/DataContext';

export const RulesNoticeBanner: React.FC = () => {
  const { rulesPermissionError, dismissRulesError } = useData();
  const [copied, setCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(true);

  if (!rulesPermissionError) return null;

  const rulesCode = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(rulesCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="bg-amber-500/10 border-b border-amber-500/30 px-4 py-3 text-amber-200">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 shrink-0 mt-0.5">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h4 className="font-semibold text-sm text-amber-100">
              Database Firestore di Proyek Firebase Anda Perlu Izin Akses (Rules)
            </h4>
            <p className="text-xs text-amber-200/80 mt-0.5">
              Proyek <strong className="text-white">river-nation-mpthm</strong>, jika rules belum di-publish, pasang aturan izin baca/tulis agar dokumen tersimpan rapi di akun Anda.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end md:self-center shrink-0">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-xs font-semibold text-amber-100 transition-colors cursor-pointer"
          >
            {isOpen ? 'Tutup Petunjuk' : 'Buka Cara Aktifkan (1 Menit)'}
          </button>
          <button
            onClick={dismissRulesError}
            className="p-1.5 text-amber-400 hover:text-white transition-colors cursor-pointer"
            title="Sembunyikan peringatan"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="max-w-5xl mx-auto mt-3 pt-3 border-t border-amber-500/20 grid md:grid-cols-3 gap-3 text-xs">
          <div className="bg-slate-900/80 rounded-xl p-3 border border-amber-500/20 flex flex-col justify-between">
            <div>
              <span className="inline-block px-2 py-0.5 rounded bg-amber-500/30 font-bold text-amber-300 text-[10px] mb-1">
                Langkah 1
              </span>
              <p className="font-medium text-slate-200">Salin Kode Aturan Rules</p>
              <pre className="mt-1 p-2 bg-slate-950 rounded border border-slate-800 text-[11px] text-emerald-400 font-mono overflow-x-auto">
                {rulesCode}
              </pre>
            </div>
            <button
              onClick={handleCopy}
              className="mt-2 w-full py-1.5 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              {copied ? '✓ Berhasil Disalin!' : '📋 Salin Kode Rules'}
            </button>
          </div>

          <div className="bg-slate-900/80 rounded-xl p-3 border border-amber-500/20 flex flex-col justify-between">
            <div>
              <span className="inline-block px-2 py-0.5 rounded bg-blue-500/30 font-bold text-blue-300 text-[10px] mb-1">
                Langkah 2
              </span>
              <p className="font-medium text-slate-200">Buka Tab Rules di Firebase</p>
              <p className="text-slate-400 mt-1">
                Buka halaman Rules proyek Anda, tempelkan kode yang sudah disalin tadi, lalu klik tombol biru <strong>Publish</strong>.
              </p>
            </div>
            <a
              href="https://console.firebase.google.com/project/river-nation-mpthm/firestore/rules"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 w-full py-1.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center justify-center gap-1.5 transition-colors text-center cursor-pointer"
            >
              🚀 Buka Halaman Rules Firebase ↗
            </a>
          </div>

          <div className="bg-slate-900/80 rounded-xl p-3 border border-amber-500/20 flex flex-col justify-between">
            <div>
              <span className="inline-block px-2 py-0.5 rounded bg-emerald-500/30 font-bold text-emerald-300 text-[10px] mb-1">
                Langkah 3
              </span>
              <p className="font-medium text-slate-200">Selesai & Muat Ulang</p>
              <p className="text-slate-400 mt-1">
                Setelah tombol Publish diklik di Firebase Console, klik tombol di bawah untuk langsung menyambungkan database.
              </p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 w-full py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              🔄 Muat Ulang Halaman
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
