import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { CompanyProfile } from '../types';
import { DigitalSignaturePad } from '../components/DigitalSignaturePad';
import {
  Building2,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Upload,
  ShieldCheck,
  Star,
  Globe,
  Phone,
  Mail,
  MapPin,
  X,
  MessageCircle,
  Sliders,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Eye,
} from 'lucide-react';

export const CompaniesPage: React.FC = () => {
  const { companies, saveCompany, deleteCompany, setDefaultCompany } = useData();

  const [editingCompany, setEditingCompany] = useState<Partial<CompanyProfile> | null>(null);
  const [showModal, setShowModal] = useState(false);

  const handleCreateNew = () => {
    setEditingCompany({
      name: '',
      address: '',
      city: '',
      postalCode: '',
      phone: '',
      whatsapp: '',
      email: '',
      website: '',
      npwp: '',
      directorName: '',
      directorTitle: 'Direktur Utama',
      logoUrl: '',
      signatureUrl: '',
      stampUrl: '',
      isDefault: companies.length === 0,
      logoPosition: 'left',
      logoSize: 26,
      companyNameSize: 18,
      companyDetailsSize: 9.5,
      headerAlignment: 'left',
      letterheadDividerStyle: 'double',
    });
    setShowModal(true);
  };

  const handleEdit = (comp: CompanyProfile) => {
    setEditingCompany({
      ...comp,
      logoPosition: comp.logoPosition || 'left',
      logoSize: comp.logoSize || 26,
      companyNameSize: comp.companyNameSize || 18,
      companyDetailsSize: comp.companyDetailsSize || 9.5,
      headerAlignment: comp.headerAlignment || (comp.logoPosition === 'top' || comp.logoPosition === 'center' ? 'center' : 'left'),
      letterheadDividerStyle: comp.letterheadDividerStyle || 'double',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (companies.length <= 1) {
      alert('Minimal harus ada 1 profil kop surat perusahaan.');
      return;
    }
    if (confirm(`Hapus profil kop surat ${name}?`)) {
      await deleteCompany(id);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const res = event.target?.result as string;
      if (res && editingCompany) {
        setEditingCompany({ ...editingCompany, logoUrl: res });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleStampUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const res = event.target?.result as string;
      if (res && editingCompany) {
        setEditingCompany({ ...editingCompany, stampUrl: res });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCompany?.name?.trim()) {
      alert('Nama perusahaan wajib diisi.');
      return;
    }
    await saveCompany(editingCompany);
    setShowModal(false);
    setEditingCompany(null);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Setting Kop Surat & Identitas Perusahaan
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Atur tata letak logo anti-tabrakan, ukuran teks kop surat, legalitas, stempel, dan tanda tangan digital resmi.
          </p>
        </div>

        <button
          onClick={handleCreateNew}
          className="flex items-center justify-center gap-2 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 text-xs sm:text-sm font-extrabold shadow-md shadow-blue-600/25 active:scale-95 transition cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Tambah Kop Surat Baru</span>
        </button>
      </div>

      {/* Grid of Company Profiles */}
      <div className="grid grid-cols-1 gap-6">
        {companies.map((comp) => {
          const logoPos = comp.logoPosition || 'left';
          const headerAlign = comp.headerAlignment || (logoPos === 'top' || logoPos === 'center' ? 'center' : 'left');
          const dividerStyle = comp.letterheadDividerStyle || 'double';
          const logoSizePx = Math.min(100, Math.max(50, Math.round((comp.logoSize || 26) * 2.2)));

          return (
            <div
              key={comp.id}
              className={`bg-white rounded-3xl p-5 sm:p-6 border transition shadow-xs ${
                comp.isDefault
                  ? 'border-blue-500 ring-2 ring-blue-500/10'
                  : 'border-slate-200/80 hover:border-slate-300'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {comp.isDefault ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-[11px] font-extrabold border border-blue-200">
                        <Star className="w-3 h-3 fill-blue-600 text-blue-600" />
                        <span>Kop Surat Utama (Default)</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => setDefaultCompany(comp.id)}
                        className="text-[11px] text-slate-500 hover:text-blue-600 font-bold hover:underline cursor-pointer"
                      >
                        Jadikan Kop Surat Utama
                      </button>
                    )}
                    <span className="text-[10px] text-slate-400 font-medium">
                      Posisi Logo: {logoPos === 'left' ? 'Kiri' : logoPos === 'right' ? 'Kanan' : 'Atas Tengah'} | Rata:{' '}
                      {headerAlign === 'center' ? 'Tengah' : headerAlign === 'right' ? 'Kanan' : 'Kiri'}
                    </span>
                  </div>

                  {/* REALISTIC KOP SURAT PREVIEW BOX (ANTI-TABRAKAN & RESPONSIF) */}
                  <div className="p-4 sm:p-6 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-3">
                    <div
                      className={`flex gap-4 items-center ${
                        logoPos === 'top' || logoPos === 'center'
                          ? 'flex-col text-center'
                          : logoPos === 'right'
                          ? 'flex-row-reverse justify-between'
                          : 'flex-row'
                      }`}
                    >
                      {/* Logo Perusahaan */}
                      {comp.logoUrl ? (
                        <div className="shrink-0 flex items-center justify-center">
                          <img
                            src={comp.logoUrl}
                            alt={comp.name}
                            style={{ width: `${logoSizePx}px`, height: `${logoSizePx}px` }}
                            className="object-contain rounded-xl border bg-white p-1 shadow-2xs"
                          />
                        </div>
                      ) : (
                        <div
                          style={{ width: `${logoSizePx}px`, height: `${logoSizePx}px` }}
                          className="rounded-xl border-2 border-dashed border-slate-300 bg-white flex flex-col items-center justify-center text-slate-400 shrink-0 text-center p-1"
                        >
                          <Building2 className="w-5 h-5 text-slate-300" />
                          <span className="text-[8px] font-bold mt-0.5">LOGO</span>
                        </div>
                      )}

                      {/* Teks Kop Surat Menyesuaikan Bersih Tanpa Tabrakan */}
                      <div
                        className={`min-w-0 flex-1 font-serif ${
                          headerAlign === 'center'
                            ? 'text-center'
                            : headerAlign === 'right'
                            ? 'text-right'
                            : 'text-left'
                        }`}
                      >
                        <h3
                          style={{
                            fontSize: `${comp.companyNameSize ? comp.companyNameSize * 1.05 : 19}px`,
                            color: '#2559a0',
                          }}
                          className="font-black tracking-wide uppercase leading-tight"
                        >
                          {comp.name || 'NAMA PERUSAHAAN'}
                        </h3>
                        <p
                          style={{
                            fontSize: `${comp.companyDetailsSize ? comp.companyDetailsSize * 1.15 : 11}px`,
                          }}
                          className="text-black mt-1 leading-relaxed"
                        >
                          {comp.address}
                          {comp.city ? `, ${comp.city}` : ''}
                          {comp.postalCode ? ` ${comp.postalCode}` : ''}
                        </p>
                        <div
                          style={{
                            fontSize: `${comp.companyDetailsSize ? comp.companyDetailsSize * 1.05 : 10}px`,
                          }}
                          className={`flex flex-wrap gap-x-3 gap-y-0.5 text-black mt-1 font-medium ${
                            headerAlign === 'center'
                              ? 'justify-center'
                              : headerAlign === 'right'
                              ? 'justify-end'
                              : 'justify-start'
                          }`}
                        >
                          {comp.phone && <span>Telp: {comp.phone}</span>}
                          {comp.whatsapp && <span>WA: {comp.whatsapp}</span>}
                          {comp.email && (
                            <span>
                              Email:{' '}
                              <a
                                href={`mailto:${comp.email}`}
                                className="text-blue-600 underline font-semibold hover:text-blue-800"
                              >
                                {comp.email}
                              </a>
                            </span>
                          )}
                          {comp.website && (
                            <span>
                              Web:{' '}
                              <a
                                href={comp.website.startsWith('http') ? comp.website : `https://${comp.website}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-blue-600 underline font-semibold hover:text-blue-800"
                              >
                                {comp.website}
                              </a>
                            </span>
                          )}
                        </div>
                        {comp.npwp && (
                          <p
                            style={{
                              fontSize: `${comp.companyDetailsSize ? comp.companyDetailsSize * 1.05 : 10}px`,
                            }}
                            className="text-black font-semibold mt-0.5"
                          >
                            NPWP: {comp.npwp}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Garis Pembatas Kop Surat Sesuai Pilihan */}
                    <div className="pt-2">
                      {dividerStyle === 'double' && (
                        <div>
                          <div className="h-[2px] bg-black w-full" />
                          <div className="h-[0.7px] bg-black w-full mt-[1.5px]" />
                        </div>
                      )}
                      {dividerStyle === 'single' && <div className="h-[1.2px] bg-black w-full" />}
                      {dividerStyle === 'thick' && <div className="h-[3px] bg-black w-full" />}
                      {dividerStyle === 'none' && <div className="h-0" />}
                    </div>
                  </div>

                  {/* Tanda Tangan & Stempel Preview */}
                  <div className="mt-4 flex items-center justify-between text-xs text-slate-600 bg-white p-3 rounded-2xl border border-slate-100">
                    <div>
                      <span className="text-[10px] font-semibold text-slate-400 block">Penandatangan Resmi</span>
                      <p className="font-extrabold text-slate-900">{comp.directorName || '-'}</p>
                      <p className="text-[11px] text-slate-500">{comp.directorTitle || 'Direktur Utama'}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      {comp.stampUrl && (
                        <div className="text-center">
                          <img src={comp.stampUrl} alt="Stempel" className="h-10 object-contain mx-auto" />
                          <span className="text-[9px] text-slate-400">Stempel</span>
                        </div>
                      )}
                      {comp.signatureUrl ? (
                        <div className="text-center">
                          <img src={comp.signatureUrl} alt="Tanda Tangan" className="h-10 object-contain mx-auto" />
                          <span className="text-[9px] text-slate-400">Ttd Digital</span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-amber-600 font-semibold bg-amber-50 px-2 py-1 rounded">
                          Belum ada TTD
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>Tersimpan di Cloud Database</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDelete(comp.id, comp.name)}
                    className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 transition cursor-pointer"
                    title="Hapus Kop Surat"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleEdit(comp)}
                    className="px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit Kop Surat</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL FORM KOP SURAT LENGKAP DENGAN KONTROL POSISI & UKURAN TEKS */}
      {showModal && editingCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in">
            <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  {editingCompany.id ? 'Edit Desain & Identitas Kop Surat' : 'Buat Desain Kop Surat Baru'}
                </h3>
                <p className="text-xs text-slate-500">
                  Atur posisi logo, ukuran teks, dan legalitas yang otomatis tercetak pada dokumen PDF resmi
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
              {/* 1. INFORMASI DASAR PERUSAHAAN */}
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase text-blue-600 tracking-wider flex items-center gap-1.5 pb-1 border-b border-slate-100">
                  <Building2 className="w-4 h-4" />
                  <span>1. Identitas Badan Usaha</span>
                </h4>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Perusahaan / Instansi <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editingCompany.name || ''}
                    onChange={(e) => setEditingCompany({ ...editingCompany, name: e.target.value })}
                    placeholder="Contoh: PT KARYA TEKNIK MANDIRI / CV MITRA UTAMA"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                {/* Upload Logo Perusahaan */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Logo Perusahaan</label>
                  <div className="flex items-center gap-4">
                    {editingCompany.logoUrl ? (
                      <div className="relative">
                        <img
                          src={editingCompany.logoUrl}
                          alt="Logo"
                          className="w-20 h-20 object-contain rounded-2xl border bg-white p-1 shadow-2xs"
                        />
                        <button
                          type="button"
                          onClick={() => setEditingCompany({ ...editingCompany, logoUrl: '' })}
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px] font-bold cursor-pointer"
                        >
                          ×
                        </button>
                      </div>
                    ) : null}

                    <label className="flex-1 border-2 border-dashed border-slate-300 rounded-2xl p-4 cursor-pointer hover:bg-slate-50 transition text-center">
                      <Upload className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                      <span className="text-xs font-bold text-slate-700 block">Pilih File Logo</span>
                      <span className="text-[11px] text-slate-400">Format PNG transparan atau JPG (otomatis diatur)</span>
                      <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                    </label>
                  </div>
                </div>
              </div>

              {/* 2. PENGATURAN TATA LETAK & UKURAN TEKS KOP (SESUAI REQUEST USER) */}
              <div className="p-4 sm:p-5 rounded-2xl bg-blue-50/60 border border-blue-200/80 space-y-4">
                <h4 className="text-xs font-black uppercase text-blue-800 tracking-wider flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-blue-600" />
                  <span>2. Pengaturan Posisi Logo & Ukuran Teks Kop Surat</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Posisi Logo */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Posisi Penempatan Logo
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingCompany({ ...editingCompany, logoPosition: 'left' })}
                        className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition text-center cursor-pointer ${
                          (editingCompany.logoPosition || 'left') === 'left'
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        Kiri (Standar)
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingCompany({ ...editingCompany, logoPosition: 'right' })}
                        className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition text-center cursor-pointer ${
                          editingCompany.logoPosition === 'right'
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        Kanan
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setEditingCompany({
                            ...editingCompany,
                            logoPosition: 'top',
                            headerAlignment: 'center',
                          })
                        }
                        className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition text-center cursor-pointer ${
                          editingCompany.logoPosition === 'top' || editingCompany.logoPosition === 'center'
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        Atas Tengah
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">
                      Ketika logo diatur di kiri/kanan, teks otomatis bergeser agar tidak saling menumpuk.
                    </p>
                  </div>

                  {/* Ukuran Logo */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-slate-700">Ukuran Logo</label>
                      <span className="text-[11px] font-bold text-blue-700">
                        {editingCompany.logoSize || 26} mm
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-1.5">
                      {[
                        { label: 'Kecil', val: 20 },
                        { label: 'Standar', val: 26 },
                        { label: 'Sedang', val: 32 },
                        { label: 'Besar', val: 40 },
                      ].map((item) => (
                        <button
                          key={item.val}
                          type="button"
                          onClick={() => setEditingCompany({ ...editingCompany, logoSize: item.val })}
                          className={`py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                            (editingCompany.logoSize || 26) === item.val
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-blue-100">
                  {/* Ukuran Teks Nama Perusahaan */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Ukuran Teks Nama Perusahaan
                    </label>
                    <select
                      value={editingCompany.companyNameSize || 18}
                      onChange={(e) =>
                        setEditingCompany({ ...editingCompany, companyNameSize: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    >
                      <option value={15}>Sedang (15 pt)</option>
                      <option value={18}>Standar Resmi (18 pt)</option>
                      <option value={21}>Besar & Tegas (21 pt)</option>
                      <option value={24}>Ekstra Besar (24 pt)</option>
                    </select>
                  </div>

                  {/* Ukuran Teks Alamat & Detail */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Ukuran Teks Alamat & Kontak
                    </label>
                    <select
                      value={editingCompany.companyDetailsSize || 9.5}
                      onChange={(e) =>
                        setEditingCompany({
                          ...editingCompany,
                          companyDetailsSize: Number(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    >
                      <option value={8.5}>Kompak (8.5 pt)</option>
                      <option value={9.5}>Standar Jelas (9.5 pt)</option>
                      <option value={10.5}>Besar (10.5 pt)</option>
                    </select>
                  </div>

                  {/* Perataan Teks Kop */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Perataan Teks Kop
                    </label>
                    <div className="grid grid-cols-3 gap-1">
                      <button
                        type="button"
                        onClick={() => setEditingCompany({ ...editingCompany, headerAlignment: 'left' })}
                        className={`p-2 rounded-xl border text-xs font-bold flex items-center justify-center transition cursor-pointer ${
                          (editingCompany.headerAlignment || 'left') === 'left'
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                        title="Rata Kiri"
                      >
                        <AlignLeft className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingCompany({ ...editingCompany, headerAlignment: 'center' })}
                        className={`p-2 rounded-xl border text-xs font-bold flex items-center justify-center transition cursor-pointer ${
                          editingCompany.headerAlignment === 'center'
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                        title="Rata Tengah"
                      >
                        <AlignCenter className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingCompany({ ...editingCompany, headerAlignment: 'right' })}
                        className={`p-2 rounded-xl border text-xs font-bold flex items-center justify-center transition cursor-pointer ${
                          editingCompany.headerAlignment === 'right'
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                        title="Rata Kanan"
                      >
                        <AlignRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Gaya Garis Pembatas */}
                <div className="pt-2 border-t border-blue-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">Gaya Garis Pembatas Kop Surat:</span>
                  <div className="flex gap-2">
                    {[
                      { id: 'double', label: 'Garis Ganda (Resmi)' },
                      { id: 'single', label: 'Tunggal' },
                      { id: 'thick', label: 'Tebal' },
                      { id: 'none', label: 'Tanpa Garis' },
                    ].map((st) => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() =>
                          setEditingCompany({
                            ...editingCompany,
                            letterheadDividerStyle: st.id as any,
                          })
                        }
                        className={`px-3 py-1.5 rounded-xl text-[11px] font-bold border transition cursor-pointer ${
                          (editingCompany.letterheadDividerStyle || 'double') === st.id
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* LIVE INTERACTIVE PREVIEW INSIDE FORM */}
                <div className="mt-3 pt-3 border-t border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-extrabold text-blue-900 flex items-center gap-1.5 uppercase">
                      <Eye className="w-3.5 h-3.5 text-blue-600" />
                      <span>Live Preview Kop Surat (Otomatis Menyesuaikan)</span>
                    </span>
                    <span className="text-[10px] text-slate-500">Tampilan cetak PDF</span>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs font-serif">
                    <div
                      className={`flex gap-3 items-center ${
                        editingCompany.logoPosition === 'top' || editingCompany.logoPosition === 'center'
                          ? 'flex-col text-center'
                          : editingCompany.logoPosition === 'right'
                          ? 'flex-row-reverse justify-between'
                          : 'flex-row'
                      }`}
                    >
                      {editingCompany.logoUrl ? (
                        <img
                          src={editingCompany.logoUrl}
                          alt="Logo Preview"
                          style={{
                            width: `${Math.round((editingCompany.logoSize || 26) * 1.8)}px`,
                            height: `${Math.round((editingCompany.logoSize || 26) * 1.8)}px`,
                          }}
                          className="object-contain shrink-0 border bg-white p-0.5 rounded-lg"
                        />
                      ) : (
                        <div
                          style={{
                            width: `${Math.round((editingCompany.logoSize || 26) * 1.8)}px`,
                            height: `${Math.round((editingCompany.logoSize || 26) * 1.8)}px`,
                          }}
                          className="border border-dashed border-slate-300 rounded-lg flex items-center justify-center text-[9px] text-slate-400 shrink-0 font-sans"
                        >
                          Logo
                        </div>
                      )}

                      <div
                        className={`min-w-0 flex-1 ${
                          (editingCompany.headerAlignment || 'left') === 'center'
                            ? 'text-center'
                            : editingCompany.headerAlignment === 'right'
                            ? 'text-right'
                            : 'text-left'
                        }`}
                      >
                        <h4
                          style={{
                            fontSize: `${(editingCompany.companyNameSize || 18) * 0.9}px`,
                            color: '#2559a0',
                          }}
                          className="font-bold uppercase tracking-wide leading-tight"
                        >
                          {editingCompany.name || 'NAMA PERUSAHAAN ANDA'}
                        </h4>
                        <p
                          style={{
                            fontSize: `${(editingCompany.companyDetailsSize || 9.5) * 1.05}px`,
                          }}
                          className="text-black mt-0.5 leading-snug"
                        >
                          {editingCompany.address || 'Alamat lengkap kantor pusat / cabang'}
                          {editingCompany.city ? `, ${editingCompany.city}` : ''}
                        </p>
                        <div
                          style={{
                            fontSize: `${(editingCompany.companyDetailsSize || 9.5) * 0.95}px`,
                          }}
                          className="text-black mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5"
                        >
                          <span>Telp: {editingCompany.phone || '021-xxxx'}</span>
                          <span>|</span>
                          <span>WA: {editingCompany.whatsapp || '08xx-xxxx'}</span>
                          <span>|</span>
                          <span>
                            Email:{' '}
                            <a
                              href={`mailto:${editingCompany.email || 'info@perusahaan.co.id'}`}
                              className="text-blue-600 underline font-semibold"
                            >
                              {editingCompany.email || 'info@perusahaan.co.id'}
                            </a>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Pembatas Garis Live */}
                    <div className="pt-2">
                      {(editingCompany.letterheadDividerStyle || 'double') === 'double' && (
                        <div>
                          <div className="h-[1.8px] bg-black w-full" />
                          <div className="h-[0.5px] bg-black w-full mt-[1.5px]" />
                        </div>
                      )}
                      {editingCompany.letterheadDividerStyle === 'single' && (
                        <div className="h-[1px] bg-black w-full" />
                      )}
                      {editingCompany.letterheadDividerStyle === 'thick' && (
                        <div className="h-[2.5px] bg-black w-full" />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. ALAMAT & KONTAK LENGKAP */}
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase text-blue-600 tracking-wider flex items-center gap-1.5 pb-1 border-b border-slate-100">
                  <MapPin className="w-4 h-4" />
                  <span>3. Alamat & Kontak Resmi</span>
                </h4>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Alamat Kantor / Workshop</label>
                  <textarea
                    rows={2}
                    value={editingCompany.address || ''}
                    onChange={(e) => setEditingCompany({ ...editingCompany, address: e.target.value })}
                    placeholder="Contoh: Jl. Merdeka Pratama No. 88, Kawasan Niaga Barat"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Kota / Kabupaten</label>
                    <input
                      type="text"
                      value={editingCompany.city || ''}
                      onChange={(e) => setEditingCompany({ ...editingCompany, city: e.target.value })}
                      placeholder="Jakarta Selatan"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Kode Pos</label>
                    <input
                      type="text"
                      value={editingCompany.postalCode || ''}
                      onChange={(e) => setEditingCompany({ ...editingCompany, postalCode: e.target.value })}
                      placeholder="12870"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Nomor Telepon Kantor</label>
                    <input
                      type="text"
                      value={editingCompany.phone || ''}
                      onChange={(e) => setEditingCompany({ ...editingCompany, phone: e.target.value })}
                      placeholder="(021) 7890123"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Nomor WhatsApp Resmi</label>
                    <input
                      type="text"
                      value={editingCompany.whatsapp || ''}
                      onChange={(e) => setEditingCompany({ ...editingCompany, whatsapp: e.target.value })}
                      placeholder="08179015181"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Email Perusahaan</label>
                    <input
                      type="email"
                      value={editingCompany.email || ''}
                      onChange={(e) => setEditingCompany({ ...editingCompany, email: e.target.value })}
                      placeholder="info@karyateknik.co.id"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Website</label>
                    <input
                      type="text"
                      value={editingCompany.website || ''}
                      onChange={(e) => setEditingCompany({ ...editingCompany, website: e.target.value })}
                      placeholder="www.karyateknik.co.id"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">NPWP Perusahaan</label>
                  <input
                    type="text"
                    value={editingCompany.npwp || ''}
                    onChange={(e) => setEditingCompany({ ...editingCompany, npwp: e.target.value })}
                    placeholder="01.234.567.8-012.000"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              {/* 4. PENANDATANGAN & LEGALITAS */}
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase text-blue-600 tracking-wider flex items-center gap-1.5 pb-1 border-b border-slate-100">
                  <ShieldCheck className="w-4 h-4" />
                  <span>4. Pejabat Penandatangan & Stempel</span>
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Nama Pejabat Penandatangan</label>
                    <input
                      type="text"
                      value={editingCompany.directorName || ''}
                      onChange={(e) => setEditingCompany({ ...editingCompany, directorName: e.target.value })}
                      placeholder="Jamhur, S.T."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Jabatan Resmi</label>
                    <input
                      type="text"
                      value={editingCompany.directorTitle || ''}
                      onChange={(e) => setEditingCompany({ ...editingCompany, directorTitle: e.target.value })}
                      placeholder="Direktur Utama"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>

                <DigitalSignaturePad
                  title="Tanda Tangan Digital Resmi"
                  value={editingCompany.signatureUrl}
                  onChange={(url) => setEditingCompany({ ...editingCompany, signatureUrl: url })}
                />

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Upload Stempel Perusahaan (Opsional)
                  </label>
                  <div className="flex items-center gap-4">
                    {editingCompany.stampUrl && (
                      <div className="relative">
                        <img
                          src={editingCompany.stampUrl}
                          alt="Stempel"
                          className="w-16 h-16 object-contain rounded-xl border bg-white p-1"
                        />
                        <button
                          type="button"
                          onClick={() => setEditingCompany({ ...editingCompany, stampUrl: '' })}
                          className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px] cursor-pointer"
                        >
                          ×
                        </button>
                      </div>
                    )}
                    <label className="flex-1 border-2 border-dashed border-slate-300 rounded-2xl p-3 cursor-pointer hover:bg-slate-50 transition text-center">
                      <span className="text-xs font-bold text-slate-700 block">Pilih File Stempel</span>
                      <span className="text-[10px] text-slate-400">PNG transparan (akan ditumpangkan pada TTD)</span>
                      <input type="file" accept="image/*" onChange={handleStampUpload} className="hidden" />
                    </label>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 -mx-4 -mb-4 sm:-mx-6 sm:-mb-6 flex items-center justify-end gap-3 sticky bottom-0 z-10">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold shadow-md shadow-blue-600/25 active:scale-95 transition cursor-pointer"
                >
                  Simpan Desain Kop Surat
                </button>
              </div>
            </form>
          </div>
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
