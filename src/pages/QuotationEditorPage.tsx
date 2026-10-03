import React, { useState, useMemo, useEffect } from 'react';
import { useData } from '../context/DataContext';
import {
  Quotation,
  QuotationLineItem,
  Customer,
} from '../types';
import { terbilang } from '../utils/terbilang';
import { generateQuotationNumber, formatRupiah } from '../utils/formatters';
import {
  ArrowLeft,
  Save,
  Eye,
  Plus,
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  Building2,
  Users,
  Paperclip,
  Calculator,
  CheckCircle2,
  AlertTriangle,
  MessageCircle,
} from 'lucide-react';

interface QuotationEditorPageProps {
  initialQuotation: Quotation | null;
  onBack: () => void;
  onSaved: (q: Quotation) => void;
  onPreview: (q: Quotation) => void;
  onNavigateToCompanies?: () => void;
}

export const QuotationEditorPage: React.FC<QuotationEditorPageProps> = ({
  initialQuotation,
  onBack,
  onSaved,
  onPreview,
  onNavigateToCompanies,
}) => {
  const {
    companies,
    customers,
    settings,
    saveQuotation,
  } = useData();

  // Selected Company Profile from Settings (NO HARDCODED DEFAULT)
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(
    initialQuotation?.companyProfileId || companies.find((c) => c.isDefault)?.id || companies[0]?.id || ''
  );

  // Auto-sync company ID once companies load from Firestore
  useEffect(() => {
    if (!selectedCompanyId && companies.length > 0) {
      const target = companies.find((c) => c.isDefault) || companies[0];
      if (target) {
        setSelectedCompanyId(target.id);
      }
    }
  }, [companies, selectedCompanyId]);

  // Form State (Clean - No dummy sample customer or sample fake data)
  const [quotationNumber, setQuotationNumber] = useState(
    initialQuotation?.quotationNumber ||
      generateQuotationNumber(
        settings?.numberFormat || '{Nomor}/SP/{BulanRomawi}/{Tahun}',
        settings?.currentSequence || 1
      )
  );
  const [date, setDate] = useState(
    initialQuotation?.date || new Date().toISOString().slice(0, 10)
  );

  // Lampiran: bisa diedit ada atau tidaknya
  const [hasAttachment, setHasAttachment] = useState<boolean>(
    initialQuotation ? (initialQuotation.hasAttachment ?? Boolean(initialQuotation.attachment && initialQuotation.attachment.trim())) : false
  );
  const [attachment, setAttachment] = useState<string>(
    initialQuotation?.attachment || '1 (satu) Berkas'
  );

  const [toRecipient, setToRecipient] = useState(initialQuotation?.toRecipient || '');
  const [customerCompany, setCustomerCompany] = useState(initialQuotation?.customerCompany || '');
  const [customerPic, setCustomerPic] = useState(initialQuotation?.customerPic || '');
  const [customerAddress, setCustomerAddress] = useState(initialQuotation?.customerAddress || '');
  const [customerPhone, setCustomerPhone] = useState(initialQuotation?.customerPhone || '');
  const [customerEmail, setCustomerEmail] = useState(initialQuotation?.customerEmail || '');
  const [subject, setSubject] = useState(
    initialQuotation?.subject || 'Surat Penawaran Harga'
  );

  // Letter Body Opening
  const [openingText, setOpeningText] = useState(
    initialQuotation?.openingText ||
      'Dengan hormat,\nBersama surat ini kami mengajukan penawaran pekerjaan sesuai kebutuhan yang Bapak/Ibu sampaikan. Adapun rincian penawaran kami sebagai berikut:'
  );

  // Letter Body Closing (Sesuai instruksi khusus: dipertahankan dan dirapihkan)
  const [closingText, setClosingText] = useState(
    initialQuotation?.closingText ||
      'Demikian surat penawaran ini kami sampaikan. Besar harapan kami untuk dapat bekerjasama dengan perusahaan Bapak/Ibu. Atas perhatian dan kesempatannya kami ucapkan terima kasih.'
  );

  // Optional Notes / Bank Transfer info
  const [additionalNotes, setAdditionalNotes] = useState(
    initialQuotation?.additionalNotes || ''
  );

  // Line items (Starts with 1 empty clean row if creating new)
  const [lineItems, setLineItems] = useState<QuotationLineItem[]>(
    initialQuotation?.items && initialQuotation.items.length > 0
      ? initialQuotation.items
      : [
          {
            id: 'line_' + Date.now(),
            description: '',
            dimension: '',
            qty: 1,
            unit: 'Unit',
            price: 0,
            total: 0,
          },
        ]
  );

  // Discount & Tax
  const [discountType, setDiscountType] = useState<'percent' | 'nominal'>(
    initialQuotation?.discountType || 'percent'
  );
  const [discountValue, setDiscountValue] = useState<number>(initialQuotation?.discountValue || 0);
  const [ppnPercent, setPpnPercent] = useState<number>(initialQuotation?.ppnPercent ?? 11);

  // Trade-In / Menu Pengurang Khusus (Opsional - tidak selalu ada tapi disediakan)
  const [hasTradeIn, setHasTradeIn] = useState<boolean>(initialQuotation?.hasTradeIn || false);
  const [tradeInTitle, setTradeInTitle] = useState<string>(
    initialQuotation?.tradeInTitle || 'Trade-In / Tukar Tambah Unit Lama'
  );
  const [tradeInAmount, setTradeInAmount] = useState<number>(initialQuotation?.tradeInAmount || 0);
  const [tradeInDescription, setTradeInDescription] = useState<string>(
    initialQuotation?.tradeInDescription || ''
  );

  // Masa Berlaku Penawaran & Skema Pembayaran (Bisa diedit - Standar Kantor)
  const [validityPeriod, setValidityPeriod] = useState<string>(
    initialQuotation?.validityPeriod || '14 (empat belas) hari kalender sejak tanggal surat'
  );
  const [paymentScheme, setPaymentScheme] = useState<string>(
    initialQuotation?.paymentScheme ||
      'Uang Muka (DP) 50% saat SPK / PO disetujui, Pelunasan 50% setelah pekerjaan selesai / serah terima'
  );

  const [status, setStatus] = useState<Quotation['status']>(initialQuotation?.status || 'draft');

  // Active Company snapshot from user's settings
  const activeCompany = useMemo(() => {
    return companies.find((c) => c.id === selectedCompanyId) || companies[0] || {};
  }, [companies, selectedCompanyId]);

  // Handle Item calculations
  const handleItemChange = (index: number, field: keyof QuotationLineItem, value: unknown) => {
    setLineItems((prev) => {
      const updated = [...prev];
      const item = { ...updated[index], [field]: value };

      if (field === 'qty' || field === 'price') {
        const qty = Number(field === 'qty' ? value : item.qty) || 0;
        const price = Number(field === 'price' ? value : item.price) || 0;
        item.total = Math.round(qty * price);
      }

      updated[index] = item;
      return updated;
    });
  };

  const addEmptyItem = () => {
    setLineItems((prev) => [
      ...prev,
      {
        id: 'line_' + Date.now() + Math.random().toString(36).substring(2, 6),
        description: '',
        dimension: '',
        qty: 1,
        unit: 'Unit',
        price: 0,
        total: 0,
      },
    ]);
  };

  const removeItem = (index: number) => {
    if (lineItems.length <= 1) {
      alert('Minimal harus ada 1 baris item dalam surat penawaran.');
      return;
    }
    setLineItems((prev) => prev.filter((_, i) => i !== index));
  };

  const duplicateItem = (index: number) => {
    const target = lineItems[index];
    const duplicated: QuotationLineItem = {
      ...target,
      id: 'line_' + Date.now() + Math.random().toString(36).substring(2, 6),
    };
    setLineItems((prev) => {
      const copy = [...prev];
      copy.splice(index + 1, 0, duplicated);
      return copy;
    });
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === lineItems.length - 1)) {
      return;
    }
    setLineItems((prev) => {
      const copy = [...prev];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return copy;
    });
  };

  // Auto Calculations
  const subtotal = useMemo(() => {
    return lineItems.reduce((acc, itm) => acc + (itm.total || 0), 0);
  }, [lineItems]);

  const discountAmount = useMemo(() => {
    if (discountType === 'percent') {
      return Math.round((subtotal * Math.max(0, Math.min(100, discountValue))) / 100);
    }
    return Math.min(subtotal, Math.max(0, discountValue));
  }, [subtotal, discountType, discountValue]);

  const afterDiscount = Math.max(0, subtotal - discountAmount);

  const ppnAmount = useMemo(() => {
    return Math.round((afterDiscount * Math.max(0, ppnPercent)) / 100);
  }, [afterDiscount, ppnPercent]);

  // Trade-In Deduction
  const tradeInDeduction = useMemo(() => {
    return hasTradeIn ? Math.max(0, tradeInAmount || 0) : 0;
  }, [hasTradeIn, tradeInAmount]);

  const grandTotal = Math.max(0, afterDiscount + ppnAmount - tradeInDeduction);

  // Customer autofill
  const handleSelectCustomer = (cust: Customer) => {
    setCustomerCompany(cust.companyName || cust.name);
    setCustomerPic(cust.pic || cust.name);
    setCustomerAddress(cust.address || '');
    setCustomerPhone(cust.whatsapp || cust.phone || '');
    setCustomerEmail(cust.email || '');
    setToRecipient(cust.companyName || cust.name);
  };

  // Build Quotation object
  const constructQuotationObject = (): Quotation => {
    return {
      id: initialQuotation?.id || 'quot_' + Date.now(),
      userId: initialQuotation?.userId || '',
      quotationNumber,
      date,
      hasAttachment,
      attachment: hasAttachment ? attachment : '',
      toRecipient: toRecipient || customerCompany || 'Pimpinan Perusahaan',
      customerCompany,
      customerPic,
      customerAddress,
      customerPhone,
      customerEmail,
      subject,
      companyProfileId: selectedCompanyId,
      companySnapshot: activeCompany,
      openingText,
      closingText,
      items: lineItems,
      subtotal,
      discountType,
      discountValue,
      discountAmount,
      ppnPercent,
      ppnAmount,
      hasTradeIn,
      tradeInTitle: hasTradeIn ? tradeInTitle : '',
      tradeInAmount: hasTradeIn ? tradeInAmount : 0,
      tradeInDescription: hasTradeIn ? tradeInDescription : '',
      validityPeriod: validityPeriod.trim(),
      paymentScheme: paymentScheme.trim(),
      grandTotal,
      additionalNotes,
      status,
      createdAt: initialQuotation?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  };

  const handleSave = async (targetStatus?: Quotation['status']) => {
    if (!quotationNumber.trim()) {
      alert('Nomor surat wajib diisi.');
      return;
    }
    const finalStatus = targetStatus || status;
    const quotObj = {
      ...constructQuotationObject(),
      status: finalStatus,
    };
    await saveQuotation(quotObj);
    onSaved(quotObj);
  };

  const handleOpenPreview = () => {
    const quotObj = constructQuotationObject();
    onPreview(quotObj);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-24">
      {/* Warning if user has not set up company profile yet */}
      {companies.length === 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <p className="text-xs font-semibold">
              Anda belum membuat profil Kop Surat Perusahaan di menu Pengaturan. Silakan buat kop surat agar nama perusahaan, logo, dan penandatangan otomatis tercetak resmi di surat penawaran.
            </p>
          </div>
          {onNavigateToCompanies && (
            <button
              onClick={onNavigateToCompanies}
              className="shrink-0 px-3 py-1.5 rounded-xl bg-amber-600 text-white font-bold text-xs hover:bg-amber-700 cursor-pointer"
            >
              Atur Kop Surat
            </button>
          )}
        </div>
      )}

      {/* Top Header Actions */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs flex flex-wrap items-center justify-between gap-3 sticky top-16 z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
              {initialQuotation ? 'Edit Surat Penawaran' : 'Buat Surat Penawaran Baru'}
            </h1>
            <p className="text-xs text-slate-500">
              Kop Surat:{' '}
              <strong className="text-blue-700">
                {activeCompany.name || 'Belum diatur (Buka menu Kop Surat)'}
              </strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleOpenPreview}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold transition active:scale-95 cursor-pointer"
          >
            <Eye className="w-4 h-4" />
            <span>Preview PDF</span>
          </button>

          <button
            onClick={() => handleSave('draft')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold transition active:scale-95 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Draft</span>
          </button>

          <button
            onClick={() => handleSave('terkirim')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold shadow-md shadow-blue-600/25 transition active:scale-95 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
            <span>Selesai & Finalkan</span>
          </button>
        </div>
      </div>

      {/* 1. KOP SURAT PICKER (TERHUBUNG DARI PENGATURAN) */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Profil Kop Surat (Terhubung dari Pengaturan)
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">Pilih Kop Surat Aktif</span>
        </div>

        {companies.length === 0 ? (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
            <p className="text-xs text-slate-600 mb-2">
              Belum ada profil perusahaan tersimpan. Buat profil kop surat Anda terlebih dahulu di Pengaturan.
            </p>
            {onNavigateToCompanies && (
              <button
                type="button"
                onClick={onNavigateToCompanies}
                className="px-3.5 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700"
              >
                + Tambah Kop Surat di Pengaturan
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {companies.map((comp) => (
              <div
                key={comp.id}
                onClick={() => setSelectedCompanyId(comp.id)}
                className={`p-3.5 rounded-2xl border-2 cursor-pointer transition flex items-start gap-3 ${
                  selectedCompanyId === comp.id
                    ? 'border-blue-600 bg-blue-50/50 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                {comp.logoUrl ? (
                  <img
                    src={comp.logoUrl}
                    alt={comp.name}
                    className="w-10 h-10 object-contain rounded-lg border bg-white p-0.5 shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-500 font-bold flex items-center justify-center shrink-0 text-xs">
                    KOP
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">{comp.name}</p>
                  <p className="text-[10px] text-slate-500 truncate">{comp.city || comp.phone}</p>
                  {comp.isDefault && (
                    <span className="inline-block mt-1 text-[9px] font-bold text-blue-600 bg-blue-100 px-1.5 py-0.2 rounded">
                      Utama
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* PRATINJAU KOP SURAT AKTIF (RATA TENGAH & SEJAJAR) */}
        {activeCompany.name && (
          <div className="mt-4 pt-3 border-t border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 block mb-2 uppercase">
              Tampilan Kop Surat Pada Dokumen Resmi:
            </span>
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-center gap-4 text-center max-w-xl mx-auto">
                {activeCompany.logoUrl ? (
                  <div className="shrink-0 flex items-center justify-center">
                    <img
                      src={activeCompany.logoUrl}
                      alt={activeCompany.name}
                      className="w-16 h-16 object-contain rounded-xl border bg-white p-1"
                    />
                  </div>
                ) : null}

                <div className="min-w-0 flex-1">
                  <h4 className="text-sm sm:text-base font-black text-slate-900 tracking-tight uppercase leading-snug">
                    {activeCompany.name}
                  </h4>
                  <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                    {activeCompany.address}
                    {activeCompany.city ? `, ${activeCompany.city}` : ''}
                    {activeCompany.postalCode ? ` ${activeCompany.postalCode}` : ''}
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5 text-[10px] text-slate-500 mt-1 font-medium">
                    {activeCompany.phone && <span>Telp: {activeCompany.phone}</span>}
                    {activeCompany.whatsapp && <span>| WA: {activeCompany.whatsapp}</span>}
                    {activeCompany.email && <span>| Email: {activeCompany.email}</span>}
                    {activeCompany.website && <span>| Web: {activeCompany.website}</span>}
                  </div>
                  {activeCompany.npwp && (
                    <p className="text-[10px] text-slate-600 font-semibold mt-0.5">
                      NPWP: {activeCompany.npwp}
                    </p>
                  )}
                </div>
              </div>

              {/* Garis Ganda Kop Surat Resmi */}
              <div className="pt-2">
                <div className="h-[2px] bg-slate-800 w-full" />
                <div className="h-[0.7px] bg-slate-800 w-full mt-[1.5px]" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. INFORMASI SURAT & CUSTOMER */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
          Informasi Surat & Pelanggan
        </h3>

        {/* Nomor & Tanggal */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Nomor Surat</label>
            <input
              type="text"
              value={quotationNumber}
              onChange={(e) => setQuotationNumber(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Surat</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>
        </div>

        {/* Lampiran (Bisa diedit ada atau tidaknya) */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={hasAttachment}
                onChange={(e) => setHasAttachment(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
              />
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Paperclip className="w-3.5 h-3.5 text-blue-600" />
                Cantumkan Lampiran di Surat
              </span>
            </label>
          </div>

          {hasAttachment && (
            <div className="flex items-center gap-2 flex-1 sm:max-w-xs">
              <span className="text-xs text-slate-500 shrink-0">Keterangan:</span>
              <input
                type="text"
                value={attachment}
                onChange={(e) => setAttachment(e.target.value)}
                placeholder="Contoh: 1 (satu) Berkas"
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          )}
        </div>

        {/* Perihal / Hal */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Perihal / Hal</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Contoh: Penawaran Harga Pengadaan dan Pekerjaan Jasa..."
            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
          />
        </div>

        {/* Customer Auto-picker from user's master data */}
        {customers.length > 0 && (
          <div className="p-3 rounded-2xl bg-blue-50/60 border border-blue-100 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600 shrink-0" />
              <span className="text-xs font-bold text-blue-900">Pilih dari Master Pelanggan:</span>
            </div>
            <select
              onChange={(e) => {
                const target = customers.find((c) => c.id === e.target.value);
                if (target) handleSelectCustomer(target);
              }}
              className="bg-white border border-blue-200 rounded-xl text-xs font-medium px-3 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 max-w-xs truncate"
              defaultValue=""
            >
              <option value="" disabled>
                -- Pilih Pelanggan Tersimpan --
              </option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.companyName || c.name} {c.pic ? `(${c.pic})` : ''}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Customer Detail Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nama Perusahaan Tujuan (Kepada Yth)
            </label>
            <input
              type="text"
              value={customerCompany}
              onChange={(e) => setCustomerCompany(e.target.value)}
              placeholder="Nama Perusahaan Customer"
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nama PIC / Kontak (Up. Bapak/Ibu)
            </label>
            <input
              type="text"
              value={customerPic}
              onChange={(e) => setCustomerPic(e.target.value)}
              placeholder="Nama PIC"
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1">Alamat Tujuan</label>
            <textarea
              rows={2}
              value={customerAddress}
              onChange={(e) => setCustomerAddress(e.target.value)}
              placeholder="Alamat kantor / lokasi pekerjaan..."
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">WhatsApp / No Telp Customer</label>
            <input
              type="text"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="08..."
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Email Customer</label>
            <input
              type="email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              placeholder="email@customer.com"
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* 3. ISI SURAT PEMBUKA */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3">
        <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
          Isi Surat Pembuka
        </h3>
        <textarea
          rows={3}
          value={openingText}
          onChange={(e) => setOpeningText(e.target.value)}
          className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none leading-relaxed"
        />
      </div>

      {/* 4. TABEL PENAWARAN (ITEM PEKERJAAN) */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-slate-100 gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Rincian Item Pekerjaan & Biaya</h3>
            <p className="text-xs text-slate-400">Total {lineItems.length} baris pekerjaan</p>
          </div>

          <button
            type="button"
            onClick={addEmptyItem}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition active:scale-95 cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Baris</span>
          </button>
        </div>

        {/* Item Rows */}
        <div className="space-y-3">
          {lineItems.map((item, index) => (
            <div
              key={item.id}
              className="p-3.5 sm:p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-xs transition space-y-2.5"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-extrabold flex items-center justify-center shrink-0">
                    {index + 1}
                  </span>
                  <span className="text-xs font-bold text-slate-700">Baris #{index + 1}</span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => moveItem(index, 'up')}
                    disabled={index === 0}
                    className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-30"
                    title="Geser ke atas"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveItem(index, 'down')}
                    disabled={index === lineItems.length - 1}
                    className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-30"
                    title="Geser ke bawah"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => duplicateItem(index)}
                    className="p-1 rounded text-slate-400 hover:text-blue-600"
                    title="Duplikasi baris ini"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="p-1 rounded text-slate-400 hover:text-rose-600"
                    title="Hapus baris"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Deskripsi & Dimensi */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                <div className="sm:col-span-8">
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                    Deskripsi Pekerjaan / Layanan
                  </label>
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                    placeholder="Masukkan uraian pekerjaan..."
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-4">
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                    Dimensi / Spesifikasi (Opsional)
                  </label>
                  <input
                    type="text"
                    value={item.dimension || ''}
                    onChange={(e) => handleItemChange(index, 'dimension', e.target.value)}
                    placeholder="Spesifikasi..."
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Qty, Satuan, Harga, Total */}
              <div className="grid grid-cols-2 sm:grid-cols-12 gap-2.5 items-end">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Qty</label>
                  <input
                    type="number"
                    min="1"
                    value={item.qty}
                    onChange={(e) => handleItemChange(index, 'qty', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 text-center focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Satuan</label>
                  <input
                    type="text"
                    value={item.unit}
                    onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                    placeholder="Unit / Titik / Pcs"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-4">
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                    Harga Satuan (Rp)
                  </label>
                  <input
                    type="number"
                    value={item.price}
                    onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 text-right focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div className="col-span-2 sm:col-span-3 text-right">
                  <span className="block text-[11px] font-semibold text-slate-400">Total Baris</span>
                  <span className="text-xs font-extrabold text-blue-700">{formatRupiah(item.total)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addEmptyItem}
          className="w-full py-2.5 rounded-xl border-2 border-dashed border-slate-300 text-slate-600 hover:text-blue-600 hover:border-blue-400 hover:bg-blue-50/50 text-xs font-bold flex items-center justify-center gap-1.5 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Baris Pekerjaan</span>
        </button>
      </div>

      {/* 5. RINGKASAN & KALKULASI OTOMATIS */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <Calculator className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-900">Ringkasan & Kalkulasi Penawaran</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Settings Diskon, PPN, dan Trade-In */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Diskon Penawaran</label>
              <div className="flex items-center gap-2">
                <select
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value as 'percent' | 'nominal')}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800"
                >
                  <option value="percent">Persen (%)</option>
                  <option value="nominal">Nominal (Rp)</option>
                </select>
                <input
                  type="number"
                  min="0"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(Number(e.target.value) || 0)}
                  placeholder={discountType === 'percent' ? '5%' : 'Rp 50.000'}
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Pajak Pertambahan Nilai (PPN)</label>
              <div className="flex items-center gap-2">
                {[0, 11, 12].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => setPpnPercent(pct)}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition border ${
                      ppnPercent === pct
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {pct === 0 ? 'Non PPN (0%)' : `${pct}%`}
                  </button>
                ))}
              </div>
            </div>

            {/* Menu Pengurang / Trade-In (Opsional) */}
            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2.5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasTradeIn}
                  onChange={(e) => setHasTradeIn(e.target.checked)}
                  className="w-4 h-4 text-amber-600 rounded border-amber-300 focus:ring-amber-500"
                />
                <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                  <span>Aktifkan Menu Pengurang / Trade-In</span>
                  <span className="text-[10px] font-semibold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">
                    Opsional
                  </span>
                </span>
              </label>

              {hasTradeIn && (
                <div className="space-y-2 pt-1 pl-6">
                  <div>
                    <label className="block text-[11px] font-bold text-amber-900 mb-0.5">
                      Judul Pengurang / Trade-In
                    </label>
                    <input
                      type="text"
                      value={tradeInTitle}
                      onChange={(e) => setTradeInTitle(e.target.value)}
                      placeholder="Contoh: Trade-In / Tukar Tambah Unit Lama"
                      className="w-full px-3 py-1.5 bg-white border border-amber-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-amber-900 mb-0.5">
                      Nominal Pemotongan (Rp)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={tradeInAmount || ''}
                      onChange={(e) => setTradeInAmount(Number(e.target.value) || 0)}
                      placeholder="Contoh: 5000000"
                      className="w-full px-3 py-1.5 bg-white border border-amber-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-amber-900 mb-0.5">
                      Keterangan / Detail Unit (Opsional)
                    </label>
                    <input
                      type="text"
                      value={tradeInDescription}
                      onChange={(e) => setTradeInDescription(e.target.value)}
                      placeholder="Contoh: 1 Unit Mesin Lama Merk X Kondisi Bekas"
                      className="w-full px-3 py-1.5 bg-white border border-amber-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Breakdown Box */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2.5 text-xs h-fit">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal Item</span>
              <span className="font-bold text-slate-900">{formatRupiah(subtotal)}</span>
            </div>

            {discountAmount > 0 && (
              <div className="flex justify-between text-rose-600 font-medium">
                <span>Potongan Diskon</span>
                <span>- {formatRupiah(discountAmount)}</span>
              </div>
            )}

            {ppnAmount > 0 && (
              <div className="flex justify-between text-slate-600 font-medium">
                <span>PPN ({ppnPercent}%)</span>
                <span>+ {formatRupiah(ppnAmount)}</span>
              </div>
            )}

            {hasTradeIn && tradeInDeduction > 0 && (
              <div className="flex justify-between text-amber-800 font-medium bg-amber-100/70 px-2.5 py-1.5 rounded-xl border border-amber-200">
                <span className="truncate mr-2 font-bold">{tradeInTitle || 'Trade-In / Tukar Tambah'}</span>
                <span className="shrink-0 font-bold">- {formatRupiah(tradeInDeduction)}</span>
              </div>
            )}

            <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
              <span className="text-xs font-black text-slate-900 uppercase">Grand Total</span>
              <span className="text-base sm:text-lg font-black text-blue-700">{formatRupiah(grandTotal)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 6. KETENTUAN PENAWARAN: MASA BERLAKU & SKEMA PEMBAYARAN (STANDAR KANTOR) */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Syarat & Ketentuan Penawaran (Standar Kantor & Profesional)
            </h3>
            <p className="text-[11px] text-slate-500">
              Atur masa berlaku penawaran harga dan skema termin pembayaran agar jelas dan mengikat resmi.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Masa Berlaku Penawaran */}
          <div className="space-y-2 bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200">
            <label className="block text-xs font-bold text-slate-800">
              1. Masa Berlaku Penawaran
            </label>
            <div className="flex flex-wrap gap-1.5 pb-1">
              {[
                { label: '7 Hari', val: '7 (tujuh) hari kalender sejak tanggal surat diterbitkan' },
                { label: '14 Hari (Standar)', val: '14 (empat belas) hari kalender sejak tanggal surat diterbitkan' },
                { label: '30 Hari', val: '30 (tiga puluh) hari kalender sejak tanggal surat diterbitkan' },
              ].map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setValidityPeriod(preset.val)}
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition ${
                    validityPeriod === preset.val
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={validityPeriod}
              onChange={(e) => setValidityPeriod(e.target.value)}
              placeholder="Contoh: 14 (empat belas) hari kalender sejak tanggal surat"
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          {/* Skema & Termin Pembayaran */}
          <div className="space-y-2 bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200">
            <label className="block text-xs font-bold text-slate-800">
              2. Skema & Termin Pembayaran
            </label>
            <div className="flex flex-wrap gap-1.5 pb-1">
              {[
                { label: 'DP 50% - 50%', val: 'Uang Muka (DP) 50% saat PO disetujui, Pelunasan 50% setelah pekerjaan selesai / BAST' },
                { label: 'DP 30% - 40% - 30%', val: 'DP 30% saat SPK/PO, Termin Progress 40%, Pelunasan 30% setelah serah terima' },
                { label: '100% Di Muka', val: 'Pembayaran 100% penuh di muka sebelum proses pekerjaan / pengiriman' },
                { label: 'COD / Selesai', val: 'Pembayaran 100% setelah barang / pekerjaan diterima dengan baik (COD)' },
                { label: 'Tempo Net 30', val: 'Pembayaran dengan termin jatuh tempo Net 30 hari setelah invoice diterima' },
              ].map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setPaymentScheme(preset.val)}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border transition ${
                    paymentScheme === preset.val
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
            <textarea
              rows={2}
              value={paymentScheme}
              onChange={(e) => setPaymentScheme(e.target.value)}
              placeholder="Contoh: DP 50% saat PO disetujui, Pelunasan 50% setelah pekerjaan selesai"
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 leading-snug"
            />
          </div>
        </div>

        {/* Instruksi Rekening Transfer Bank & Catatan */}
        <div className="pt-2">
          <label className="block text-xs font-bold text-slate-700 mb-1">
            3. Instruksi Nomor Rekening Bank Pembayaran & Catatan Tambahan (Opsional)
          </label>
          <input
            type="text"
            value={additionalNotes}
            onChange={(e) => setAdditionalNotes(e.target.value)}
            placeholder="Contoh: Pembayaran dapat ditransfer ke Bank BCA No. Rek: 1234567890 a/n Perusahaan"
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none"
          />
        </div>

        {/* Isi Surat Penutup */}
        <div className="pt-2 border-t border-slate-100">
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Isi Kalimat Penutup Surat
          </label>
          <textarea
            rows={2}
            value={closingText}
            onChange={(e) => setClosingText(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none leading-relaxed"
          />
        </div>
      </div>

      {/* 7. PREVIEW BLOK TANDA TANGAN DARI PENGATURAN */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 pb-2 mb-3 border-b border-slate-100">
          Penandatangan Resmi (Sesuai Kop Surat dari Pengaturan)
        </h3>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 max-w-sm">
          <p className="text-xs text-slate-500">Hormat Kami,</p>
          <p className="text-xs font-bold text-slate-900 mt-0.5 uppercase">
            {activeCompany.name || '(Nama Perusahaan Belum Diatur)'}
          </p>

          <div className="h-16 my-2 relative flex items-center">
            {activeCompany.stampUrl && (
              <img
                src={activeCompany.stampUrl}
                alt="Stempel"
                className="h-14 object-contain absolute left-14 opacity-80 pointer-events-none"
              />
            )}
            {activeCompany.signatureUrl ? (
              <img
                src={activeCompany.signatureUrl}
                alt="Tanda Tangan"
                className="h-14 object-contain relative z-10"
              />
            ) : (
              <span className="text-[11px] text-slate-400 italic">
                (Tanda tangan belum diatur di menu Kop Surat)
              </span>
            )}
          </div>

          <p className="text-xs font-bold text-slate-900 underline">
            {activeCompany.directorName || '-'}
          </p>
          <p className="text-[11px] text-slate-500">{activeCompany.directorTitle || 'Direktur'}</p>
        </div>
      </div>
    </div>
  );
};
