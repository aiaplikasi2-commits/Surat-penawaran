import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { PWAInstallButton } from '../components/PWAInstallButton';
import { DigitalSignaturePad } from '../components/DigitalSignaturePad';
import { generateQuotationNumber } from '../utils/formatters';
import { CompanyProfile } from '../types';
import {
  Building2,
  UserCheck,
  Hash,
  Shield,
  Download,
  Upload,
  Lock,
  LogOut,
  Save,
  Sparkles,
  Database,
  Smartphone,
  MessageCircle,
  CheckCircle2,
  X,
  FileCheck,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user, changePassword, logout } = useAuth();
  const { settings, updateSettings, exportDataJson, importDataJson, companies, saveCompany } = useData();

  // Connected default company profile
  const defaultCompany = companies.find((c) => c.isDefault) || companies[0];

  // Business Profile Form States
  const [businessName, setBusinessName] = useState('');
  const [directorName, setDirectorName] = useState('');
  const [directorTitle, setDirectorTitle] = useState('Direktur Utama');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [npwp, setNpwp] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [signatureUrl, setSignatureUrl] = useState('');
  const [stampUrl, setStampUrl] = useState('');

  const [businessSavedMsg, setBusinessSavedMsg] = useState(false);
  const [isSavingBusiness, setIsSavingBusiness] = useState(false);

  // Sync state when defaultCompany loads/changes
  useEffect(() => {
    if (defaultCompany) {
      setBusinessName(defaultCompany.name || '');
      setDirectorName(defaultCompany.directorName || '');
      setDirectorTitle(defaultCompany.directorTitle || 'Direktur Utama');
      setAddress(defaultCompany.address || '');
      setCity(defaultCompany.city || '');
      setPostalCode(defaultCompany.postalCode || '');
      setPhone(defaultCompany.phone || '');
      setWhatsapp(defaultCompany.whatsapp || '');
      setEmail(defaultCompany.email || '');
      setWebsite(defaultCompany.website || '');
      setNpwp(defaultCompany.npwp || '');
      setLogoUrl(defaultCompany.logoUrl || '');
      setSignatureUrl(defaultCompany.signatureUrl || '');
      setStampUrl(defaultCompany.stampUrl || '');
    }
  }, [defaultCompany?.id, defaultCompany?.updatedAt]);

  // Numbering and session timeout
  const [numberFormat, setNumberFormat] = useState(
    settings?.numberFormat || '{Nomor}/SP/MTA/{BulanRomawi}/{Tahun}'
  );
  const [currentSeq, setCurrentSeq] = useState(settings?.currentSequence || 1);
  const [timeoutMins, setTimeoutMins] = useState(settings?.sessionTimeoutMinutes || 30);

  const [newPassword, setNewPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const samplePreview = generateQuotationNumber(numberFormat, currentSeq);

  // Logo upload handler
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const res = event.target?.result as string;
      if (res) setLogoUrl(res);
    };
    reader.readAsDataURL(file);
  };

  // Stamp upload handler
  const handleStampUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const res = event.target?.result as string;
      if (res) setStampUrl(res);
    };
    reader.readAsDataURL(file);
  };

  // Save Business Profile (Connects to all other menus in real-time)
  const handleSaveBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim()) {
      alert('Nama Usaha / Perusahaan wajib diisi.');
      return;
    }
    setIsSavingBusiness(true);
    try {
      const targetId = defaultCompany?.id || 'comp_' + Date.now();
      await saveCompany({
        id: targetId,
        name: businessName.trim(),
        directorName: directorName.trim(),
        directorTitle: directorTitle.trim() || 'Direktur Utama',
        address: address.trim(),
        city: city.trim(),
        postalCode: postalCode.trim(),
        phone: phone.trim(),
        whatsapp: whatsapp.trim(),
        email: email.trim(),
        website: website.trim(),
        npwp: npwp.trim(),
        logoUrl,
        signatureUrl,
        stampUrl,
        isDefault: true,
      });
      setBusinessSavedMsg(true);
      setTimeout(() => setBusinessSavedMsg(false), 4000);
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan profil usaha.');
    } finally {
      setIsSavingBusiness(false);
    }
  };

  const handleSaveNumbering = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSettings({
      numberFormat,
      currentSequence: currentSeq,
      sessionTimeoutMinutes: timeoutMins,
    });
    alert('Pengaturan nomor surat dan sesi berhasil disimpan!');
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);
    if (newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'Password baru minimal 6 karakter.' });
      return;
    }
    try {
      await changePassword(newPassword);
      setPasswordMsg({ type: 'success', text: 'Password berhasil diperbarui!' });
      setNewPassword('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal memperbarui password.';
      setPasswordMsg({ type: 'error', text: msg });
    }
  };

  const handleExportBackup = () => {
    const jsonStr = exportDataJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Backup_SuratPenawaranPro_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string;
        const res = await importDataJson(content);
        setImportStatus(`Berhasil memulihkan ${res.count} data dokumen & profil!`);
      } catch (err) {
        console.error(err);
        setImportStatus('Gagal memulihkan file backup. Format file tidak sesuai.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-24">
      {/* Top Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Pengaturan Aplikasi & Profil Usaha
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Atur nama usaha, pemilik usaha, logo, stempel, tanda tangan digital (TTD), penomoran surat, dan backup.
        </p>
      </div>

      {/* 1. PROFIL USAHA & TANDA TANGAN (TERHUBUNG KE SEMUA MENU & KOP SURAT) */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Identitas Usaha, Pemilik Usaha, Stempel & TTD
              </h3>
              <p className="text-[11px] text-slate-500">
                Data ini otomatis terkoneksi ke kop surat, surat penawaran, dan tanda tangan dokumen resmi.
              </p>
            </div>
          </div>
          <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
            Terkoneksi Otomatis
          </span>
        </div>

        {businessSavedMsg && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Profil usaha, logo, stempel, dan tanda tangan digital berhasil disimpan dan tersambung ke seluruh menu!
            </span>
          </div>
        )}

        <form onSubmit={handleSaveBusiness} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Nama Usaha */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nama Usaha / Perusahaan <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Contoh: PT KARYA TEKNIK MANDIRI / CV ABADI JAYA"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            {/* Nama Pemilik / Pejabat */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nama Pejabat / Pemilik Usaha <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={directorName}
                onChange={(e) => setDirectorName(e.target.value)}
                placeholder="Contoh: Jamhur, S.T."
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Jabatan Pemilik */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Jabatan Resmi</label>
              <input
                type="text"
                value={directorTitle}
                onChange={(e) => setDirectorTitle(e.target.value)}
                placeholder="Direktur Utama / Pemilik Usaha"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none"
              />
            </div>

            {/* WhatsApp */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">No. WhatsApp Resmi</label>
              <input
                type="text"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="08179015181"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none"
              />
            </div>

            {/* Telepon */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">No. Telepon Kantor</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(021) 7890123"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Perusahaan</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="kontak@karyateknik.co.id"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none"
              />
            </div>

            {/* Website */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Website</label>
              <input
                type="text"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="www.karyateknik.co.id"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none"
              />
            </div>

            {/* NPWP */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">NPWP Perusahaan</label>
              <input
                type="text"
                value={npwp}
                onChange={(e) => setNpwp(e.target.value)}
                placeholder="01.234.567.8-012.000"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* Alamat Lengkap */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Alamat Kantor / Workshop</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Jl. Merdeka Pratama No. 88, Kawasan Niaga Barat"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Kota / Kabupaten</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Jakarta Selatan"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Kode Pos</label>
              <input
                type="text"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                placeholder="12870"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* Upload Logo Perusahaan */}
          <div className="pt-2 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Logo Usaha (Untuk Kop Surat Resmi)
            </label>
            <div className="flex items-center gap-4">
              {logoUrl ? (
                <div className="relative">
                  <img
                    src={logoUrl}
                    alt="Logo"
                    className="w-16 h-16 object-contain rounded-xl border bg-white p-1 shadow-2xs"
                  />
                  <button
                    type="button"
                    onClick={() => setLogoUrl('')}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px] font-bold cursor-pointer"
                  >
                    ×
                  </button>
                </div>
              ) : null}

              <label className="flex-1 border-2 border-dashed border-slate-300 rounded-2xl p-3 cursor-pointer hover:bg-slate-50 transition text-center">
                <Upload className="w-4 h-4 text-blue-600 mx-auto mb-1" />
                <span className="text-xs font-bold text-slate-700 block">Upload Logo Usaha</span>
                <span className="text-[10px] text-slate-400">PNG atau JPG transparan</span>
                <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
              </label>
            </div>
          </div>

          {/* Tanda Tangan Digital (TTD) */}
          <div className="pt-2 border-t border-slate-100">
            <DigitalSignaturePad
              title="Tanda Tangan Digital Resmi (TTD)"
              value={signatureUrl}
              onChange={(url) => setSignatureUrl(url)}
            />
          </div>

          {/* Upload Stempel Perusahaan */}
          <div className="pt-2 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Upload Stempel Perusahaan (Untuk dicetak di atas TTD)
            </label>
            <div className="flex items-center gap-4">
              {stampUrl && (
                <div className="relative">
                  <img
                    src={stampUrl}
                    alt="Stempel"
                    className="w-16 h-16 object-contain rounded-xl border bg-white p-1"
                  />
                  <button
                    type="button"
                    onClick={() => setStampUrl('')}
                    className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px] cursor-pointer"
                  >
                    ×
                  </button>
                </div>
              )}
              <label className="flex-1 border-2 border-dashed border-slate-300 rounded-2xl p-3 cursor-pointer hover:bg-slate-50 transition text-center">
                <span className="text-xs font-bold text-slate-700 block">Pilih Gambar Stempel</span>
                <span className="text-[10px] text-slate-400">Format PNG transparan</span>
                <input type="file" accept="image/*" onChange={handleStampUpload} className="hidden" />
              </label>
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t border-slate-100">
            <button
              type="submit"
              disabled={isSavingBusiness}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold shadow-md shadow-blue-600/25 active:scale-95 transition cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Profil Usaha, Stempel & TTD</span>
            </button>
          </div>
        </form>
      </div>

      {/* 2. FORMAT NOMOR SURAT */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <Hash className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-900">Format Penomoran Surat Otomatis</h3>
        </div>

        <form onSubmit={handleSaveNumbering} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Pola Format Nomor Surat
            </label>
            <input
              type="text"
              value={numberFormat}
              onChange={(e) => setNumberFormat(e.target.value)}
              placeholder="{Nomor}/SP/KTM/{BulanRomawi}/{Tahun}"
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none"
            />
            <div className="mt-2 text-[11px] text-slate-500 space-y-0.5">
              <p>Tag yang tersedia:</p>
              <ul className="list-disc list-inside font-mono text-[10px] text-blue-700 space-y-0.5">
                <li>{`{Nomor}`} : Urutan 3 digit (contoh: 001, 002)</li>
                <li>{`{BulanRomawi}`} : Bulan Romawi (contoh: I, II, X, XII)</li>
                <li>{`{Bulan}`} : Bulan angka 2 digit (contoh: 10)</li>
                <li>{`{Tahun}`} : Tahun 4 digit (contoh: 2026)</li>
              </ul>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nomor Urut Surat Berikutnya
              </label>
              <input
                type="number"
                min="1"
                value={currentSeq}
                onChange={(e) => setCurrentSeq(Number(e.target.value) || 1)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Durasi Timeout Inaktivitas Sesi
              </label>
              <select
                value={timeoutMins}
                onChange={(e) => setTimeoutMins(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none"
              >
                <option value={15}>15 Menit (Sangat Aman)</option>
                <option value={30}>30 Menit (Direkomendasikan)</option>
                <option value={60}>60 Menit (1 Jam)</option>
              </select>
            </div>
          </div>

          {/* Realtime Live Preview Box */}
          <div className="p-3.5 rounded-2xl bg-blue-50/80 border border-blue-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-blue-600 block uppercase">
                Preview Hasil Format Nomor:
              </span>
              <span className="text-sm font-black text-blue-900">{samplePreview}</span>
            </div>
            <Sparkles className="w-5 h-5 text-blue-600" />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Format Penomoran</span>
            </button>
          </div>
        </form>
      </div>

      {/* 3. PWA & INSTALASI */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <Smartphone className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-900">Instalasi Aplikasi (PWA)</h3>
        </div>
        <p className="text-xs text-slate-600">
          Instal aplikasi ini di layar utama Android, iPhone, Tablet, atau Laptop Anda untuk pengalaman kerja cepat seperti aplikasi native.
        </p>
        <div className="pt-2">
          <PWAInstallButton variant="settings" />
        </div>
      </div>

      {/* 4. BACKUP & RESTORE DATA */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <Database className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-900">Backup & Pemulihan Data (Export / Restore)</h3>
        </div>

        <p className="text-xs text-slate-600">
          Seluruh data surat penawaran, master pelanggan, profil kop surat, dan katalog pekerjaan dapat diunduh ke komputer/HP Anda sebagai cadangan privat.
        </p>

        {importStatus && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
            {importStatus}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={handleExportBackup}
            className="flex items-center justify-center gap-2 p-3 rounded-2xl border-2 border-blue-600 text-blue-700 hover:bg-blue-50 text-xs font-bold transition active:scale-95 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Ekspor / Download Backup Data (JSON)</span>
          </button>

          <label className="flex items-center justify-center gap-2 p-3 rounded-2xl border-2 border-dashed border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold transition active:scale-95 cursor-pointer text-center">
            <Upload className="w-4 h-4 text-slate-500" />
            <span>Pulihkan / Restore Data dari File</span>
            <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
          </label>
        </div>
      </div>

      {/* 5. KEAMANAN & GANTI PASSWORD */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <Shield className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-900">Keamanan Akun & Kata Sandi</h3>
        </div>

        <div className="text-xs text-slate-600">
          Akun saat ini:{' '}
          <strong className="text-slate-900">{user?.isDemo ? 'Pengguna Demo (Lokal Offline)' : user?.email}</strong>
        </div>

        {!user?.isDemo && (
          <>
            {passwordMsg && (
              <div
                className={`p-3 rounded-xl text-xs font-bold ${
                  passwordMsg.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {passwordMsg.text}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-3 max-w-sm">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Ganti Password Baru</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-bold hover:bg-slate-900 transition cursor-pointer"
              >
                Perbarui Password
              </button>
            </form>
          </>
        )}

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-900">Keluar dari Sesi</p>
            <p className="text-[11px] text-slate-400">
              Logout akan membersihkan seluruh memori dan cache lokal di perangkat ini.
            </p>
          </div>
          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-bold transition active:scale-95 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout Sekarang</span>
          </button>
        </div>
      </div>

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
