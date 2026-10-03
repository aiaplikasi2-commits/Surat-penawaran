import React, { useState, useEffect, useRef } from 'react';
import { Quotation } from '../types';
import { generateQuotationPdf, PdfGenerationOptions } from '../utils/pdfGenerator';
import { generatePdfFileName, formatRupiah } from '../utils/formatters';
import { useData } from '../context/DataContext';
import {
  ArrowLeft,
  X,
  Download,
  Printer,
  Share2,
  Mail,
  Edit,
  FileCheck,
  AlertCircle,
  ChevronDown,
  Maximize2,
  Minimize2,
  Move,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  RotateCcw,
  Minus,
  Plus,
  Save,
  Check,
} from 'lucide-react';

interface QuotationPreviewModalProps {
  quotation: Quotation | null;
  onClose: () => void;
  onEdit: (q: Quotation) => void;
}

export const QuotationPreviewModal: React.FC<QuotationPreviewModalProps> = ({
  quotation,
  onClose,
  onEdit,
}) => {
  const { updateQuotationStatus, companies, saveCompany } = useData();

  // Find active letterhead profile
  const activeCompany =
    companies.find((c) => c.id === quotation?.companyProfileId) ||
    companies.find((c) => c.isDefault) ||
    companies[0] ||
    quotation?.companySnapshot ||
    {};

  // Position & Size control states (SESUAI GAMBAR ACUAN USER)
  const [logoScale, setLogoScale] = useState<number>(activeCompany.logoScalePercent || 100);
  const [logoOffsetX, setLogoOffsetX] = useState<number>(activeCompany.logoOffsetX || 0);
  const [logoOffsetY, setLogoOffsetY] = useState<number>(activeCompany.logoOffsetY || 0);
  const [showDragStage, setShowDragStage] = useState<boolean>(true);

  // Drag interaction state
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ startX: number; startY: number; initOffsetX: number; initOffsetY: number }>({
    startX: 0,
    startY: 0,
    initOffsetX: 0,
    initOffsetY: 0,
  });

  const handlePointerDown = (e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setIsDragging(true);
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initOffsetX: logoOffsetX,
      initOffsetY: logoOffsetY,
    };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const dx = Math.round((e.clientX - dragStartRef.current.startX) * 0.4);
    const dy = Math.round((e.clientY - dragStartRef.current.startY) * 0.4);
    setLogoOffsetX(dragStartRef.current.initOffsetX + dx);
    setLogoOffsetY(dragStartRef.current.initOffsetY + dy);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging) {
      setIsDragging(false);
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
    }
  };

  const [zoomMode, setZoomMode] = useState<'fit' | 'width' | '100'>('fit');
  const [isSavingPos, setIsSavingPos] = useState(false);
  const [posSavedMsg, setPosSavedMsg] = useState(false);

  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState('');
  const [isEditingFileName, setIsEditingFileName] = useState(false);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);

  const quotationWithCompany: Quotation | null = quotation
    ? {
        ...quotation,
        companySnapshot: {
          ...(quotation.companySnapshot || {}),
          ...activeCompany,
          logoScalePercent: logoScale,
          logoOffsetX,
          logoOffsetY,
        },
      }
    : null;

  // Debounced PDF regeneration when shifting logo or size
  useEffect(() => {
    if (!quotationWithCompany) return;

    const initialFileName =
      fileName ||
      generatePdfFileName(
        quotationWithCompany.customerCompany,
        quotationWithCompany.customerPic,
        quotationWithCompany.quotationNumber
      );
    if (!fileName) setFileName(initialFileName);

    let activeUrl: string | null = null;
    setLoadingPdf(true);

    const pdfOptions: PdfGenerationOptions = {
      logoOffsetX,
      logoOffsetY,
      logoScalePercent: logoScale,
    };

    const timer = setTimeout(() => {
      generateQuotationPdf(quotationWithCompany, initialFileName, pdfOptions)
        .then((res) => {
          setPdfBlobUrl(res.blobUrl || null);
          activeUrl = res.blobUrl || null;
        })
        .catch((err) => {
          console.error('Failed to generate preview PDF:', err);
        })
        .finally(() => {
          setLoadingPdf(false);
        });
    }, 120);

    return () => {
      clearTimeout(timer);
      if (activeUrl) {
        URL.revokeObjectURL(activeUrl);
      }
    };
  }, [
    quotationWithCompany?.id,
    quotationWithCompany?.updatedAt,
    activeCompany.updatedAt,
    logoScale,
    logoOffsetX,
    logoOffsetY,
  ]);

  if (!quotation || !quotationWithCompany) return null;
  const curQuotation = quotationWithCompany;

  const currentPdfOptions: PdfGenerationOptions = {
    logoOffsetX,
    logoOffsetY,
    logoScalePercent: logoScale,
  };

  const handleDownload = async () => {
    try {
      const res = await generateQuotationPdf(curQuotation, fileName, currentPdfOptions);
      res.doc.save(fileName || res.fileName);
    } catch (err) {
      console.error('Download error:', err);
    }
  };

  const handlePrint = async () => {
    try {
      const res = await generateQuotationPdf(curQuotation, fileName, currentPdfOptions);
      res.doc.autoPrint();
      const printUrl = res.doc.output('bloburl');
      window.open(printUrl, '_blank');
    } catch (err) {
      console.error('Print error:', err);
    }
  };

  const handleSendWhatsApp = () => {
    const picGreeting = curQuotation.customerPic ? `Bapak/Ibu ${curQuotation.customerPic}` : 'Bapak/Ibu';
    const compName = curQuotation.customerCompany ? ` (${curQuotation.customerCompany})` : '';

    const text = `Yth. ${picGreeting}${compName},

Bersama pesan ini kami kirimkan Surat Penawaran Harga resmi kami:
📄 *No. Surat:* ${curQuotation.quotationNumber}
📌 *Perihal:* ${curQuotation.subject}
💰 *Total Nilai:* ${formatRupiah(curQuotation.grandTotal)}
📑 *Nama File PDF:* ${fileName}

File PDF penawaran telah kami persiapkan. Mohon dapat dipelajari lebih lanjut.
Apabila ada pertanyaan mengenai spesifikasi teknis maupun negosiasi, kami siap membantu.

Terima kasih atas perhatian dan kerja samanya.
Hormat Kami,
*${curQuotation.companySnapshot?.name || ''}*`;

    let phone = curQuotation.customerPhone || '';
    phone = phone.replace(/[^0-9]/g, '');
    if (phone.startsWith('0')) {
      phone = '62' + phone.slice(1);
    }

    const waUrl = phone
      ? `https://wa.me/${phone}?text=${encodeURIComponent(text)}`
      : `https://wa.me/?text=${encodeURIComponent(text)}`;

    window.open(waUrl, '_blank');
  };

  const handleSendEmail = () => {
    const subject = encodeURIComponent(`Surat Penawaran: ${curQuotation.quotationNumber} - ${curQuotation.subject}`);
    const body = encodeURIComponent(
      `Kepada Yth. ${curQuotation.customerPic || curQuotation.customerCompany || 'Bapak/Ibu'},\n\nTerlampir kami kirimkan Surat Penawaran No. ${curQuotation.quotationNumber} dengan perihal ${curQuotation.subject}.\nTotal Nilai Penawaran: ${formatRupiah(curQuotation.grandTotal)}.\n\nFile dokumen PDF: ${fileName}\n\nTerima kasih.`
    );
    const mailto = `mailto:${curQuotation.customerEmail || ''}?subject=${subject}&body=${body}`;
    window.location.href = mailto;
  };

  const handleStatusChange = async (newStatus: Quotation['status']) => {
    setStatusMenuOpen(false);
    await updateQuotationStatus(curQuotation.id, newStatus);
  };

  // Nudge movement handlers
  const handleNudge = (dx: number, dy: number) => {
    setLogoOffsetX((prev) => prev + dx);
    setLogoOffsetY((prev) => prev + dy);
  };

  const handleResetPosition = () => {
    setLogoOffsetX(0);
    setLogoOffsetY(0);
    setLogoScale(100);
  };

  // Simpan posisi kop yang sudah digeser ke profil kop surat perusahaan
  const handleSavePositionToCompany = async () => {
    if (!activeCompany?.id) return;
    setIsSavingPos(true);
    try {
      await saveCompany({
        ...activeCompany,
        logoOffsetX,
        logoOffsetY,
        logoScalePercent: logoScale,
      });
      setPosSavedMsg(true);
      setTimeout(() => setPosSavedMsg(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingPos(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-1 sm:p-3 animate-in fade-in">
      <div className="bg-white rounded-3xl w-full max-w-6xl h-[96vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
        {/* TOP TOOLBAR SESUAI GAMBAR ACUAN USER */}
        <div className="bg-slate-50/95 border-b border-slate-200 px-3 sm:px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
          {/* Sisi Kiri: Tombol Kembali & Info Dokumen */}
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs shadow-2xs transition active:scale-95 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali</span>
            </button>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 text-xs sm:text-sm">
                  VIEW PDF — A4 ({zoomMode === '100' ? '100%' : zoomMode === 'width' ? 'Fit Lebar' : 'Fit Full'})
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                <span className="font-bold text-blue-700">{curQuotation.quotationNumber}</span>
                <span>•</span>
                <span className="capitalize">{curQuotation.status}</span>
              </div>
            </div>
          </div>

          {/* Sisi Tengah & Kanan: Fit Mode, Ukuran Logo & Posisi Logo (Geser-Geser) */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            {/* View Mode Presets */}
            <div className="hidden sm:flex items-center bg-slate-200/80 p-0.5 rounded-xl text-[11px] font-bold text-slate-700">
              <button
                onClick={() => setZoomMode('fit')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition cursor-pointer ${
                  zoomMode === 'fit' ? 'bg-blue-600 text-white shadow-xs' : 'hover:text-slate-900'
                }`}
              >
                <Maximize2 className="w-3 h-3" />
                <span>Fit Full</span>
              </button>
              <button
                onClick={() => setZoomMode('width')}
                className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                  zoomMode === 'width' ? 'bg-blue-600 text-white shadow-xs' : 'hover:text-slate-900'
                }`}
              >
                Fit Lebar
              </button>
              <button
                onClick={() => setZoomMode('100')}
                className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                  zoomMode === '100' ? 'bg-blue-600 text-white shadow-xs' : 'hover:text-slate-900'
                }`}
              >
                100%
              </button>
            </div>

            {/* PENGATUR UKURAN LOGO (SESUAI GAMBAR) */}
            <div className="flex items-center gap-1.5 bg-blue-50/90 border border-blue-200/90 px-2.5 py-1 rounded-xl text-blue-950 font-bold text-xs shadow-2xs">
              <span className="text-[11px] text-blue-900 whitespace-nowrap">Ukuran Logo:</span>
              <button
                type="button"
                onClick={() => setLogoScale((s) => Math.max(40, s - 5))}
                className="w-5 h-5 rounded-md bg-white border border-blue-200 text-blue-800 flex items-center justify-center hover:bg-blue-100 transition active:scale-95 cursor-pointer"
                title="Perkecil Logo"
              >
                <Minus className="w-3 h-3" />
              </button>
              <input
                type="range"
                min="40"
                max="200"
                step="5"
                value={logoScale}
                onChange={(e) => setLogoScale(Number(e.target.value))}
                className="w-16 sm:w-20 accent-blue-600 cursor-pointer h-1.5 bg-blue-200 rounded-lg"
              />
              <span className="text-[11px] font-mono text-blue-900 min-w-[36px] text-center">
                {logoScale}%
              </span>
              <button
                type="button"
                onClick={() => setLogoScale((s) => Math.min(220, s + 5))}
                className="w-5 h-5 rounded-md bg-white border border-blue-200 text-blue-800 flex items-center justify-center hover:bg-blue-100 transition active:scale-95 cursor-pointer"
                title="Perbesar Logo"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>

            {/* PENGGESER POSISI LOGO / KOP (SESUAI GAMBAR DENGAN PANAH & KOORDINAT) */}
            <div className="flex items-center gap-1 bg-blue-50/90 border border-blue-200/90 p-1 px-2 rounded-xl text-blue-950 font-bold text-xs shadow-2xs">
              <div className="flex items-center gap-1 mr-1 text-[11px] text-blue-900 whitespace-nowrap">
                <Move className="w-3.5 h-3.5 text-blue-600" />
                <span className="hidden sm:inline">Posisi Logo:</span>
              </div>

              {/* Panah Kiri */}
              <button
                type="button"
                onClick={() => handleNudge(-2, 0)}
                className="w-6 h-6 rounded-md bg-white border border-blue-200 text-blue-800 flex items-center justify-center hover:bg-blue-100 transition active:scale-95 cursor-pointer"
                title="Geser Kiri (2mm)"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>

              {/* Panah Atas */}
              <button
                type="button"
                onClick={() => handleNudge(0, -2)}
                className="w-6 h-6 rounded-md bg-white border border-blue-200 text-blue-800 flex items-center justify-center hover:bg-blue-100 transition active:scale-95 cursor-pointer"
                title="Geser Atas (2mm)"
              >
                <ArrowUp className="w-3.5 h-3.5" />
              </button>

              {/* Panah Bawah */}
              <button
                type="button"
                onClick={() => handleNudge(0, 2)}
                className="w-6 h-6 rounded-md bg-white border border-blue-200 text-blue-800 flex items-center justify-center hover:bg-blue-100 transition active:scale-95 cursor-pointer"
                title="Geser Bawah (2mm)"
              >
                <ArrowDown className="w-3.5 h-3.5" />
              </button>

              {/* Panah Kanan */}
              <button
                type="button"
                onClick={() => handleNudge(2, 0)}
                className="w-6 h-6 rounded-md bg-white border border-blue-200 text-blue-800 flex items-center justify-center hover:bg-blue-100 transition active:scale-95 cursor-pointer"
                title="Geser Kanan (2mm)"
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              {/* Reset & Tampilan Koordinat (SESUAI GAMBAR ACUAN USER: ↺ X, Y) */}
              <button
                type="button"
                onClick={handleResetPosition}
                className="ml-1 px-1.5 py-0.5 rounded-md bg-white border border-blue-200 text-blue-800 hover:bg-blue-100 font-mono text-[10px] flex items-center gap-1 transition cursor-pointer"
                title="Klik untuk Reset Posisi ke (0, 0)"
              >
                <RotateCcw className="w-2.5 h-2.5 text-blue-600" />
                <span>
                  {logoOffsetX},{logoOffsetY}
                </span>
              </button>
            </div>

            {/* Tombol Simpan Posisi ke Profil Perusahaan */}
            <button
              type="button"
              onClick={handleSavePositionToCompany}
              disabled={isSavingPos}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-bold border transition cursor-pointer ${
                posSavedMsg
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
              }`}
              title="Simpan posisi dan ukuran logo ini ke profil kop surat"
            >
              {posSavedMsg ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5 text-blue-600" />}
              <span className="hidden md:inline">{posSavedMsg ? 'Tersimpan!' : 'Simpan Posisi'}</span>
            </button>

            {/* Edit & Tutup */}
            <button
              onClick={() => {
                onClose();
                onEdit(curQuotation);
              }}
              className="p-1.5 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition cursor-pointer"
              title="Edit Data Penawaran"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
              title="Tutup Preview"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Secondary Info Bar: Status Dropdown, File Name, and Toggle Drag Stage */}
        <div className="px-3 sm:px-4 py-1.5 bg-blue-50/50 border-b border-blue-100 flex items-center justify-between text-xs text-blue-900 gap-2 flex-wrap">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <FileCheck className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="font-semibold text-slate-500 shrink-0 text-[11px]">Nama Dokumen:</span>
            {isEditingFileName ? (
              <input
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                onBlur={() => setIsEditingFileName(false)}
                onKeyDown={(e) => e.key === 'Enter' && setIsEditingFileName(false)}
                autoFocus
                className="bg-white border border-blue-300 rounded px-2 py-0.5 text-xs text-blue-900 font-bold focus:outline-none focus:ring-1 focus:ring-blue-600 w-full max-w-sm"
              />
            ) : (
              <span
                onClick={() => setIsEditingFileName(true)}
                className="font-bold text-blue-800 truncate cursor-pointer hover:underline text-[11px]"
                title="Klik untuk mengubah nama file"
              >
                {fileName}
              </span>
            )}
            <button
              onClick={() => setIsEditingFileName(!isEditingFileName)}
              className="text-[10px] font-bold text-blue-600 hover:underline shrink-0"
            >
              {isEditingFileName ? 'Simpan' : 'Ubah'}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowDragStage(!showDragStage)}
              className={`flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-bold border transition cursor-pointer ${
                showDragStage
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
              }`}
              title="Aktifkan papan geser langsung untuk menekan & memindahkan logo"
            >
              <Move className="w-3 h-3" />
              <span>{showDragStage ? 'Tutup Papan Geser' : '✋ Tekan & Geser Logo Langsung'}</span>
            </button>

            <span className="text-[11px] text-slate-500 hidden sm:inline">Status:</span>
            <div className="relative">
              <button
                onClick={() => setStatusMenuOpen(!statusMenuOpen)}
                className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <span className="capitalize">{curQuotation.status}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>
              {statusMenuOpen && (
                <div className="absolute right-0 mt-1 w-32 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-30 text-xs">
                  {(['draft', 'terkirim', 'revisi', 'disetujui', 'ditolak'] as Quotation['status'][]).map(
                    (st) => (
                      <button
                        key={st}
                        onClick={() => handleStatusChange(st)}
                        className={`w-full text-left px-3 py-1.5 capitalize hover:bg-blue-50 transition cursor-pointer ${
                          curQuotation.status === st ? 'font-bold text-blue-600' : 'text-slate-700'
                        }`}
                      >
                        {st}
                      </button>
                    )
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* INTERACTIVE DRAG-TO-MOVE LOGO CANVAS (Papan Geser Logo Interaktif) */}
        {showDragStage && (
          <div className="bg-slate-100 border-b border-slate-200 px-3 py-2 animate-in slide-in-from-top-2">
            <div className="max-w-4xl mx-auto bg-white rounded-2xl p-3 border border-slate-300 shadow-inner relative select-none">
              <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-100 text-[11px]">
                <span className="font-extrabold text-blue-900 flex items-center gap-1.5">
                  <Move className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
                  <span>Tekan & Geser Logo di Bawah Ini (Mouse / Touch Screen)</span>
                </span>
                <span className="font-mono text-slate-500 font-semibold">
                  Offset: X={logoOffsetX}mm, Y={logoOffsetY}mm | Skala: {logoScale}%
                </span>
              </div>

              {/* Simulated Header Stage where Logo can be dragged freely */}
              <div className="relative min-h-[90px] flex items-center justify-center p-2 font-serif overflow-hidden bg-slate-50/60 rounded-xl border border-dashed border-slate-200">
                {/* Drag Target: Logo */}
                {activeCompany.logoUrl ? (
                  <div
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    style={{
                      transform: `translate(${logoOffsetX * 2.8}px, ${logoOffsetY * 2.8}px) scale(${logoScale / 100})`,
                      touchAction: 'none',
                    }}
                    className={`absolute left-4 top-2 z-20 transition-transform ${
                      isDragging ? 'cursor-grabbing scale-105 shadow-xl ring-2 ring-blue-500' : 'cursor-grab hover:scale-105 shadow-md'
                    } rounded-xl bg-white p-1 border border-blue-300`}
                    title="Tekan dan tahan untuk menggeser logo ini ke posisi yang diinginkan"
                  >
                    <img
                      src={activeCompany.logoUrl}
                      alt="Logo Draggable"
                      className="h-14 object-contain pointer-events-none"
                    />
                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded shadow whitespace-nowrap pointer-events-none">
                      ✋ Tarik Saya
                    </div>
                  </div>
                ) : (
                  <div
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    style={{
                      transform: `translate(${logoOffsetX * 2.8}px, ${logoOffsetY * 2.8}px)`,
                      touchAction: 'none',
                    }}
                    className={`absolute left-4 top-2 z-20 ${
                      isDragging ? 'cursor-grabbing ring-2 ring-blue-500' : 'cursor-grab'
                    } w-14 h-14 rounded-xl border-2 border-dashed border-blue-400 bg-white flex flex-col items-center justify-center text-blue-600 text-[9px] font-bold p-1`}
                  >
                    <span>LOGO</span>
                    <span className="text-[7px] text-slate-400">Tarik</span>
                  </div>
                )}

                {/* Symmetrical Centered Letterhead Text */}
                <div className="text-center w-full px-16 pointer-events-none">
                  <h4 style={{ color: '#2559a0' }} className="font-black uppercase text-sm tracking-wide">
                    {activeCompany.name || 'NAMA PERUSAHAAN ANDA'}
                  </h4>
                  <p className="text-[11px] text-black mt-0.5 leading-snug">
                    {activeCompany.address || 'Alamat Lengkap Perusahaan'}
                    {activeCompany.city ? `, ${activeCompany.city}` : ''}
                    {activeCompany.postalCode ? ` ${activeCompany.postalCode}` : ''}
                  </p>
                  <div className="text-[10px] text-black mt-0.5 flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5">
                    {activeCompany.phone && <span>Telp: {activeCompany.phone}</span>}
                    {activeCompany.phone && (activeCompany.whatsapp || activeCompany.email) && <span>|</span>}
                    {activeCompany.whatsapp && <span>WA: {activeCompany.whatsapp}</span>}
                    {activeCompany.whatsapp && activeCompany.email && <span>|</span>}
                    {activeCompany.email ? (
                      <span>
                        Email:{' '}
                        <a
                          href={`mailto:${activeCompany.email}`}
                          className="text-blue-600 underline font-semibold pointer-events-auto"
                        >
                          {activeCompany.email}
                        </a>
                      </span>
                    ) : (
                      <span>Email: info@perusahaan.co.id</span>
                    )}
                    {activeCompany.website && (
                      <>
                        <span>|</span>
                        <span>
                          Web:{' '}
                          <a
                            href={activeCompany.website.startsWith('http') ? activeCompany.website : `https://${activeCompany.website}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 underline font-semibold pointer-events-auto"
                          >
                            {activeCompany.website}
                          </a>
                        </span>
                      </>
                    )}
                  </div>
                  {activeCompany.npwp && (
                    <p className="text-[10px] text-black mt-0.5">NPWP: {activeCompany.npwp}</p>
                  )}
                  <div className="pt-1.5 mt-1 border-b-2 border-black w-full" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PDF Viewer Body */}
        <div className="flex-1 bg-slate-900/10 overflow-y-auto p-2 sm:p-4 flex items-center justify-center">
          {loadingPdf ? (
            <div className="flex flex-col items-center gap-3 text-slate-500 py-16">
              <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-semibold">Memperbarui Pratinjau PDF A4...</p>
            </div>
          ) : pdfBlobUrl ? (
            <div
              className={`w-full h-full flex items-center justify-center transition-all ${
                zoomMode === 'width' ? 'max-w-5xl' : zoomMode === '100' ? 'max-w-4xl' : 'max-w-full'
              }`}
            >
              <iframe
                src={`${pdfBlobUrl}#toolbar=0&navpanes=0`}
                title="Quotation PDF Preview"
                className="w-full h-full rounded-2xl shadow-xl border border-slate-300 bg-white"
              />
            </div>
          ) : (
            <div className="p-8 text-center text-rose-600 text-xs">
              <AlertCircle className="w-6 h-6 mx-auto mb-2" />
              Gagal memuat pratinjau dokumen PDF. Silakan gunakan tombol unduh di bawah.
            </div>
          )}
        </div>

        {/* Modal Action Bar (Cetak, Kirim WhatsApp, Email, Download) */}
        <div className="p-3 sm:p-4 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">
              Total Nilai Penawaran: <strong className="text-slate-900">{formatRupiah(curQuotation.grandTotal)}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold transition active:scale-95 cursor-pointer shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Dokumen</span>
            </button>

            <button
              onClick={handleSendEmail}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold transition active:scale-95 cursor-pointer shadow-2xs"
            >
              <Mail className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Kirim Email</span>
            </button>

            <button
              onClick={handleSendWhatsApp}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition active:scale-95 cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Kirim WhatsApp</span>
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/25 transition active:scale-95 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF Resmi</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
