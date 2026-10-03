import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { Quotation } from '../types';
import { formatRupiah, formatIndonesianDate, generatePdfFileName } from '../utils/formatters';
import { generateQuotationPdf } from '../utils/pdfGenerator';
import {
  FileText,
  Search,
  Plus,
  Eye,
  Edit,
  Copy,
  Download,
  Share2,
  Trash2,
  CheckCircle2,
  TrendingUp,
  Clock,
  XCircle,
  Filter,
  MessageCircle,
} from 'lucide-react';

interface QuotationsPageProps {
  onNewQuotation: () => void;
  onEditQuotation: (q: Quotation) => void;
  onViewQuotation: (q: Quotation) => void;
}

export const QuotationsPage: React.FC<QuotationsPageProps> = ({
  onNewQuotation,
  onEditQuotation,
  onViewQuotation,
}) => {
  const { quotations, companies, deleteQuotation, duplicateQuotation, updateQuotationStatus } = useData();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredQuotations = useMemo(() => {
    return quotations.filter((q) => {
      // Status filter
      if (statusFilter !== 'all' && q.status !== statusFilter) {
        return false;
      }
      // Search term
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      const numMatch = q.quotationNumber?.toLowerCase().includes(term);
      const compMatch = q.customerCompany?.toLowerCase().includes(term);
      const picMatch = q.customerPic?.toLowerCase().includes(term);
      const toMatch = q.toRecipient?.toLowerCase().includes(term);
      const subjMatch = q.subject?.toLowerCase().includes(term);
      const dateMatch = q.date?.toLowerCase().includes(term);
      return numMatch || compMatch || picMatch || toMatch || subjMatch || dateMatch;
    });
  }, [quotations, searchTerm, statusFilter]);

  const handleDuplicate = async (q: Quotation) => {
    if (confirm(`Duplikasi surat penawaran ${q.quotationNumber}?`)) {
      await duplicateQuotation(q);
    }
  };

  const handleDelete = async (id: string, num: string) => {
    if (confirm(`Hapus permanen surat penawaran ${num}?`)) {
      await deleteQuotation(id);
    }
  };

  const handleDirectDownload = async (q: Quotation) => {
    try {
      const activeCompany =
        companies.find((c) => c.id === q.companyProfileId) ||
        companies.find((c) => c.isDefault) ||
        companies[0] ||
        q.companySnapshot;
      const resolvedQuotation: Quotation = {
        ...q,
        companySnapshot: {
          ...(q.companySnapshot || {}),
          ...activeCompany,
        },
      };
      const res = await generateQuotationPdf(resolvedQuotation);
      res.doc.save(res.fileName);
    } catch (e) {
      console.error(e);
      alert('Gagal mendownload PDF');
    }
  };

  const handleWhatsAppSend = (q: Quotation) => {
    const fileName = generatePdfFileName(q.customerCompany, q.customerPic, q.quotationNumber);
    const picGreeting = q.customerPic ? `Bapak/Ibu ${q.customerPic}` : 'Bapak/Ibu';
    const compName = q.customerCompany ? ` (${q.customerCompany})` : '';

    const text = `Yth. ${picGreeting}${compName},

Bersama pesan ini kami kirimkan Surat Penawaran Harga resmi kami:
📄 *No. Surat:* ${q.quotationNumber}
📌 *Perihal:* ${q.subject}
💰 *Total Nilai:* ${formatRupiah(q.grandTotal)}
📑 *Nama File PDF:* ${fileName}

File PDF penawaran telah kami persiapkan. Mohon dapat dipelajari lebih lanjut.
Terima kasih atas perhatian dan kerja samanya.
Hormat Kami,
*${q.companySnapshot?.name || 'CV Mulia Tekhnik Abadi'}*`;

    let phone = q.customerPhone || '';
    phone = phone.replace(/[^0-9]/g, '');
    if (phone.startsWith('0')) {
      phone = '62' + phone.slice(1);
    }

    const waUrl = phone
      ? `https://wa.me/${phone}?text=${encodeURIComponent(text)}`
      : `https://wa.me/?text=${encodeURIComponent(text)}`;

    window.open(waUrl, '_blank');
  };

  const getStatusBadge = (status: Quotation['status']) => {
    switch (status) {
      case 'disetujui':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-3 h-3" /> Disetujui
          </span>
        );
      case 'terkirim':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
            <TrendingUp className="w-3 h-3" /> Terkirim
          </span>
        );
      case 'revisi':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
            <Clock className="w-3 h-3" /> Revisi
          </span>
        );
      case 'ditolak':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
            <XCircle className="w-3 h-3" /> Ditolak
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
            <Clock className="w-3 h-3" /> Draft
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Surat Penawaran
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Kelola seluruh arsip penawaran harga, ekspor PDF premium, dan lacak status pesanan.
          </p>
        </div>

        <button
          onClick={onNewQuotation}
          className="flex items-center justify-center gap-2 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 text-xs sm:text-sm font-extrabold shadow-md shadow-blue-600/25 active:scale-95 transition cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Buat Penawaran Baru</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari no surat, nama customer, PIC, perihal..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {[
              { id: 'all', label: 'Semua' },
              { id: 'draft', label: 'Draft' },
              { id: 'terkirim', label: 'Terkirim' },
              { id: 'revisi', label: 'Revisi' },
              { id: 'disetujui', label: 'Disetujui' },
              { id: 'ditolak', label: 'Ditolak' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  statusFilter === tab.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Quotation List */}
      {filteredQuotations.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
            <FileText className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Tidak ada surat ditemukan</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            {searchTerm || statusFilter !== 'all'
              ? 'Coba ganti kata kunci pencarian atau filter status.'
              : 'Anda belum memiliki surat penawaran. Klik tombol di bawah untuk membuat surat baru.'}
          </p>
          <button
            onClick={onNewQuotation}
            className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-md shadow-blue-600/20 active:scale-95 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Surat Penawaran Sekarang</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredQuotations.map((q) => (
            <div
              key={q.id}
              className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                {/* Header: No Surat & Status */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-black text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md truncate">
                    {q.quotationNumber}
                  </span>
                  {getStatusBadge(q.status)}
                </div>

                {/* Target Company & Subject */}
                <h3 className="text-sm font-black text-slate-900 line-clamp-1 mt-1">
                  {q.customerCompany || q.toRecipient || 'Customer'}
                </h3>
                {q.customerPic && (
                  <p className="text-xs text-slate-500 line-clamp-1">Up. {q.customerPic}</p>
                )}

                <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  {q.subject}
                </p>

                {/* Grand Total & Tanggal */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-semibold text-slate-400 block">Total Nilai</span>
                    <span className="text-sm font-black text-slate-900">{formatRupiah(q.grandTotal)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-semibold text-slate-400 block">Tanggal</span>
                    <span className="text-xs font-bold text-slate-600">{formatIndonesianDate(q.date)}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-1.5">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onViewQuotation(q)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition active:scale-95 cursor-pointer"
                    title="Preview PDF"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Lihat</span>
                  </button>

                  <button
                    onClick={() => onEditQuotation(q)}
                    className="p-1.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
                    title="Edit Surat"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDuplicate(q)}
                    className="p-1.5 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition cursor-pointer"
                    title="Duplikasi Surat"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleDirectDownload(q)}
                    className="p-1.5 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition cursor-pointer"
                    title="Download PDF"
                  >
                    <Download className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleWhatsAppSend(q)}
                    className="p-1.5 rounded-xl text-emerald-600 hover:bg-emerald-50 transition cursor-pointer"
                    title="Kirim ke WhatsApp"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDelete(q.id, q.quotationNumber)}
                    className="p-1.5 rounded-xl text-rose-500 hover:bg-rose-50 transition cursor-pointer"
                    title="Hapus Surat"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATED BY JAMHUR WA LINK FOOTER */}
      <div className="text-center pt-2">
        <a
          href="https://wa.me/628179015181?text=Halo%20Jamhur,%20saya%20menghubungi%20mengenai%20aplikasi%20Surat%20Penawaran"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 text-xs font-bold shadow-xs transition cursor-pointer"
        >
          <MessageCircle className="w-4 h-4 text-emerald-600" />
          <span>Created by <strong className="text-slate-900">jamhur</strong> (WhatsApp: 628179015181)</span>
        </a>
      </div>
    </div>
  );
};
