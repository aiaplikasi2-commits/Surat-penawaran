import React from 'react';
import { useData } from '../context/DataContext';
import { formatRupiah, formatIndonesianDate } from '../utils/formatters';
import { PWAInstallButton } from '../components/PWAInstallButton';
import {
  FileText,
  Users,
  Coins,
  CheckCircle2,
  Clock,
  XCircle,
  TrendingUp,
  Plus,
  ArrowUpRight,
  Building2,
  ChevronRight,
  MessageCircle,
} from 'lucide-react';
import { Quotation } from '../types';

interface DashboardPageProps {
  onNewQuotation: () => void;
  onViewQuotation: (q: Quotation) => void;
  onEditQuotation: (q: Quotation) => void;
  onNavigateTab: (tab: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNewQuotation,
  onViewQuotation,
  onEditQuotation,
  onNavigateTab,
}) => {
  const { quotations, customers, companies } = useData();

  // Metrics Calculations
  const totalQuotations = quotations.length;
  const totalCustomers = customers.length;
  const totalValue = quotations.reduce((acc, q) => acc + (q.grandTotal || 0), 0);

  const draftQuotations = quotations.filter((q) => q.status === 'draft');
  const approvedQuotations = quotations.filter((q) => q.status === 'disetujui');
  const rejectedQuotations = quotations.filter((q) => q.status === 'ditolak');

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const thisMonthQuotations = quotations.filter((q) => {
    const d = new Date(q.date || q.createdAt || '');
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });
  const thisMonthTotal = thisMonthQuotations.reduce((acc, q) => acc + (q.grandTotal || 0), 0);

  const thisYearQuotations = quotations.filter((q) => {
    const d = new Date(q.date || q.createdAt || '');
    return d.getFullYear() === currentYear;
  });
  const thisYearTotal = thisYearQuotations.reduce((acc, q) => acc + (q.grandTotal || 0), 0);

  const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const monthlyValues = new Array(12).fill(0);
  const monthlyCounts = new Array(12).fill(0);

  thisYearQuotations.forEach((q) => {
    const d = new Date(q.date || q.createdAt || '');
    const m = d.getMonth();
    if (m >= 0 && m < 12) {
      monthlyValues[m] += q.grandTotal || 0;
      monthlyCounts[m] += 1;
    }
  });

  const maxVal = Math.max(...monthlyValues, 1000000);
  const maxCount = Math.max(...monthlyCounts, 5);

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
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* PWA Install Banner */}
      <PWAInstallButton variant="banner" />

      {/* Top Welcome & Quick Action Card */}
      <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-8 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 text-blue-200 text-xs font-semibold mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              SaaS Surat Penawaran Resmi
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight">
              Ringkasan Kinerja Penawaran
            </h1>
            <p className="text-xs sm:text-sm text-blue-100/90 mt-1 max-w-xl">
              Buat surat penawaran standar resmi perusahaan, hitung otomatis PPN & diskon, cetak PDF rapi siap kirim ke klien.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onNewQuotation}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white text-blue-900 hover:bg-blue-50 font-extrabold px-5 py-3.5 rounded-2xl text-xs sm:text-sm shadow-lg shadow-black/20 active:scale-95 transition cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Buat Penawaran Baru</span>
            </button>
          </div>
        </div>

        {/* Quick Shortcut Buttons in Banner */}
        <div className="mt-6 pt-5 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
          <button
            onClick={() => onNavigateTab('customers')}
            className="flex items-center justify-between p-2.5 rounded-xl bg-white/10 hover:bg-white/15 transition cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-300" />
              <span className="font-semibold">{totalCustomers} Pelanggan</span>
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-white/50" />
          </button>
          <button
            onClick={() => onNavigateTab('companies')}
            className="flex items-center justify-between p-2.5 rounded-xl bg-white/10 hover:bg-white/15 transition cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-300" />
              <span className="font-semibold">{companies.length} Kop Surat</span>
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-white/50" />
          </button>
          <button
            onClick={() => onNavigateTab('quotations')}
            className="flex items-center justify-between p-2.5 rounded-xl bg-white/10 hover:bg-white/15 transition cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-300" />
              <span className="font-semibold">{draftQuotations.length} Draft Surat</span>
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-white/50" />
          </button>
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Nilai Penawaran */}
        <div className="col-span-2 sm:col-span-1 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Total Nilai Penawaran</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-2 text-lg sm:text-xl font-black text-slate-900 truncate">
            {formatRupiah(totalValue)}
          </p>
          <p className="mt-1 text-[11px] text-slate-500">
            Dari {totalQuotations} surat dibuat
          </p>
        </div>

        {/* Nilai Bulan Ini */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Bulan Ini ({monthLabels[currentMonth]})</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-2 text-base sm:text-lg font-black text-slate-900 truncate">
            {formatRupiah(thisMonthTotal)}
          </p>
          <p className="mt-1 text-[11px] text-emerald-600 font-semibold">
            {thisMonthQuotations.length} surat dibuat
          </p>
        </div>

        {/* Nilai Tahun Ini */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Tahun {currentYear}</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-2 text-base sm:text-lg font-black text-slate-900 truncate">
            {formatRupiah(thisYearTotal)}
          </p>
          <p className="mt-1 text-[11px] text-indigo-600 font-semibold">
            {thisYearQuotations.length} surat tahun ini
          </p>
        </div>

        {/* Disetujui vs Ditolak */}
        <div className="col-span-2 sm:col-span-1 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Status Penawaran</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-center gap-3">
            <div>
              <span className="text-xs text-slate-400 block">Disetujui</span>
              <span className="text-base font-black text-emerald-600">{approvedQuotations.length}</span>
            </div>
            <div className="h-6 w-px bg-slate-200" />
            <div>
              <span className="text-xs text-slate-400 block">Ditolak</span>
              <span className="text-base font-black text-rose-600">{rejectedQuotations.length}</span>
            </div>
            <div className="h-6 w-px bg-slate-200" />
            <div>
              <span className="text-xs text-slate-400 block">Draft</span>
              <span className="text-base font-black text-slate-700">{draftQuotations.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Chart 1: Nilai Penawaran Bulanan */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Nilai Penawaran Bulanan ({currentYear})</h3>
              <p className="text-xs text-slate-400">Total nominal penawaran per bulan</p>
            </div>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
              Dalam Rupiah
            </span>
          </div>

          <div className="h-48 w-full flex items-end gap-1.5 sm:gap-2 pt-6 pb-2 px-1">
            {monthlyValues.map((val, idx) => {
              const heightPercent = Math.max(8, Math.round((val / maxVal) * 100));
              const isCurrent = idx === currentMonth;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                  <div className="relative w-full flex justify-center">
                    <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition pointer-events-none bg-slate-900 text-white text-[10px] px-1.5 py-0.5 rounded shadow whitespace-nowrap z-20">
                      {formatRupiah(val)}
                    </div>
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full max-w-[22px] rounded-t-md transition-all ${
                        isCurrent
                          ? 'bg-blue-600 shadow-md shadow-blue-500/30'
                          : 'bg-slate-200 group-hover:bg-blue-300'
                      }`}
                    />
                  </div>
                  <span
                    className={`text-[10px] font-bold ${
                      isCurrent ? 'text-blue-700 font-extrabold' : 'text-slate-400'
                    }`}
                  >
                    {monthLabels[idx]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 2: Jumlah Surat Bulanan */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Jumlah Surat Penawaran ({currentYear})</h3>
              <p className="text-xs text-slate-400">Volume surat dibuat per bulan</p>
            </div>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
              Jumlah Dokumen
            </span>
          </div>

          <div className="h-48 w-full flex items-end gap-1.5 sm:gap-2 pt-6 pb-2 px-1">
            {monthlyCounts.map((cnt, idx) => {
              const heightPercent = Math.max(8, Math.round((cnt / maxCount) * 100));
              const isCurrent = idx === currentMonth;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                  <div className="relative w-full flex justify-center">
                    <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition pointer-events-none bg-slate-900 text-white text-[10px] px-1.5 py-0.5 rounded shadow whitespace-nowrap z-20">
                      {cnt} Dokumen
                    </div>
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full max-w-[22px] rounded-t-md transition-all ${
                        isCurrent
                          ? 'bg-indigo-600 shadow-md shadow-indigo-500/30'
                          : 'bg-slate-200 group-hover:bg-indigo-300'
                      }`}
                    />
                  </div>
                  <span
                    className={`text-[10px] font-bold ${
                      isCurrent ? 'text-indigo-700 font-extrabold' : 'text-slate-400'
                    }`}
                  >
                    {monthLabels[idx]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Surat Terbaru Section */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Surat Penawaran Terbaru</h3>
            <p className="text-xs text-slate-400">Daftar penawaran terakhir yang Anda buat</p>
          </div>
          <button
            onClick={() => onNavigateTab('quotations')}
            className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
          >
            <span>Lihat Semua</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {quotations.length === 0 ? (
          <div className="py-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
              <FileText className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">Belum Ada Surat Penawaran</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              Mulai buat penawaran resmi pertama Anda dengan kop surat profesional dan kalkulasi otomatis.
            </p>
            <button
              onClick={onNewQuotation}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-md shadow-blue-600/20 active:scale-95 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Buat Surat Sekarang</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {quotations.slice(0, 5).map((q) => (
              <div
                key={q.id}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 -mx-2 px-2 rounded-xl transition"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 font-bold text-xs">
                    SP
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-extrabold text-blue-700">{q.quotationNumber}</span>
                      {getStatusBadge(q.status)}
                    </div>
                    <p className="text-xs font-bold text-slate-900 truncate mt-0.5">
                      {q.customerCompany || q.toRecipient || 'Customer'}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">{q.subject}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-1 sm:pt-0">
                  <div className="text-left sm:text-right">
                    <p className="text-xs font-black text-slate-900">{formatRupiah(q.grandTotal)}</p>
                    <p className="text-[10px] text-slate-400">{formatIndonesianDate(q.date)}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onViewQuotation(q)}
                      className="px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition cursor-pointer"
                    >
                      Lihat PDF
                    </button>
                    <button
                      onClick={() => onEditQuotation(q)}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition cursor-pointer"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CREATED BY JAMHUR WA LINK FOOTER */}
      <div className="text-center pt-4">
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
