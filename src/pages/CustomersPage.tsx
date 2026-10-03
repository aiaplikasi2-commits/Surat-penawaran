import React, { useState, useMemo, useRef } from 'react';
import { useData } from '../context/DataContext';
import { Customer } from '../types';
import * as XLSX from 'xlsx';
import {
  Users,
  Plus,
  Search,
  Edit2,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Building,
  Share2,
  X,
  FileSpreadsheet,
  Download,
  Upload,
  MessageCircle,
  FileCheck,
} from 'lucide-react';

export const CustomersPage: React.FC = () => {
  const { customers, saveCustomer, deleteCustomer } = useData();

  const [searchTerm, setSearchTerm] = useState('');
  const [editingCustomer, setEditingCustomer] = useState<Partial<Customer> | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    if (!searchTerm.trim()) return customers;
    const term = searchTerm.toLowerCase();
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        c.companyName?.toLowerCase().includes(term) ||
        c.pic?.toLowerCase().includes(term) ||
        c.phone?.toLowerCase().includes(term) ||
        c.email?.toLowerCase().includes(term) ||
        c.address?.toLowerCase().includes(term)
    );
  }, [customers, searchTerm]);

  const handleCreateNew = () => {
    setEditingCustomer({
      name: '',
      companyName: '',
      pic: '',
      address: '',
      phone: '',
      whatsapp: '',
      email: '',
      notes: '',
    });
    setShowModal(true);
  };

  const handleEdit = (cust: Customer) => {
    setEditingCustomer(cust);
    setShowModal(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Hapus data pelanggan ${name}?`)) {
      await deleteCustomer(id);
    }
  };

  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer?.name?.trim()) {
      alert('Nama pelanggan / kontak wajib diisi.');
      return;
    }
    await saveCustomer(editingCustomer);
    setShowModal(false);
    setEditingCustomer(null);
  };

  const openWhatsApp = (phone?: string, name?: string) => {
    if (!phone) return;
    let clean = phone.replace(/[^0-9]/g, '');
    if (clean.startsWith('0')) clean = '62' + clean.slice(1);
    const msg = `Halo Bapak/Ibu ${name || ''}, saya menghubungi dari bagian penawaran.`;
    window.open(`https://wa.me/${clean}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  // Download Template Excel
  const handleDownloadTemplate = () => {
    const templateData = [
      {
        'Nama Pelanggan': 'Bapak Andi Saputra',
        'Nama Perusahaan': 'PT INDO MAJU MANDIRI',
        'PIC': 'Bapak Andi',
        'Alamat Lengkap': 'Jl. Gatot Subroto Kav. 52, Jakarta Selatan',
        'Nomor Telepon': '021-5290123',
        'WhatsApp': '081234567890',
        'Email': 'andi@indomaju.co.id',
        'Catatan': 'Klien prioritas pekerjaan maintenance',
      },
      {
        'Nama Pelanggan': 'Ibu Ratna Dewi',
        'Nama Perusahaan': 'CV BERKAH SEJAHTERA',
        'PIC': 'Ibu Ratna',
        'Alamat Lengkap': 'Kawasan Industri Jababeka Blok C-12, Cikarang',
        'Nomor Telepon': '021-8980345',
        'WhatsApp': '081798765432',
        'Email': 'ratna@berkahsejahtera.com',
        'Catatan': 'Termin pembayaran 30 hari kalender',
      },
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template Pelanggan');
    XLSX.writeFile(wb, 'Template_Data_Pelanggan.xlsx');
  };

  // Export Current Customers to Excel
  const handleExportExcel = () => {
    if (customers.length === 0) {
      alert('Belum ada data pelanggan untuk diekspor.');
      return;
    }
    const rows = customers.map((c, i) => ({
      No: i + 1,
      'Nama Pelanggan': c.name,
      'Nama Perusahaan': c.companyName || '-',
      'PIC': c.pic || '-',
      'Alamat Lengkap': c.address || '-',
      'Nomor Telepon': c.phone || '-',
      'WhatsApp': c.whatsapp || '-',
      'Email': c.email || '-',
      'Catatan': c.notes || '-',
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data Pelanggan');
    XLSX.writeFile(wb, `Data_Pelanggan_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  // Import Excel / CSV
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const data = new Uint8Array(evt.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rows: any[] = XLSX.utils.sheet_to_json(worksheet);

        let successCount = 0;
        for (const row of rows) {
          const name = String(row['Nama Pelanggan'] || row['Nama'] || row['Name'] || row['Kontak'] || '').trim();
          const companyName = String(row['Nama Perusahaan'] || row['Perusahaan'] || row['Company'] || '').trim();
          const pic = String(row['PIC'] || row['Nama Kontak (PIC)'] || row['Kontak PIC'] || '').trim();
          const address = String(row['Alamat Lengkap'] || row['Alamat'] || row['Address'] || '').trim();
          const phone = String(row['Nomor Telepon'] || row['Telepon'] || row['Phone'] || '').trim();
          const whatsapp = String(row['WhatsApp'] || row['WA'] || row['No WhatsApp'] || phone || '').trim();
          const email = String(row['Email'] || row['E-mail'] || '').trim();
          const notes = String(row['Catatan'] || row['Notes'] || '').trim();

          const primaryName = name || companyName || pic;
          if (!primaryName) continue;

          await saveCustomer({
            name: primaryName,
            companyName: companyName || primaryName,
            pic: pic || name,
            address,
            phone,
            whatsapp,
            email,
            notes,
          });
          successCount++;
        }

        setImportStatus(`Berhasil mengimpor ${successCount} data pelanggan dari Excel!`);
        setTimeout(() => setImportStatus(null), 6000);
      } catch (err) {
        console.error('Import error:', err);
        alert('Gagal mengimpor file. Pastikan format file Excel/CSV sesuai dengan template.');
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20">
      {/* Top Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Master Data Pelanggan & Mitra Usaha
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Kelola kontak, PIC, dan alamat customer. Tersedia fitur download template Excel & import massal.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Download Template Excel */}
          <button
            onClick={handleDownloadTemplate}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition active:scale-95 shadow-2xs cursor-pointer"
            title="Download Template Excel untuk Pengisian Data Pelanggan"
          >
            <Download className="w-3.5 h-3.5 text-blue-600" />
            <span>Download Template Excel</span>
          </button>

          {/* Import Excel Button */}
          <label className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-emerald-50 border border-emerald-300 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition active:scale-95 shadow-2xs cursor-pointer">
            <Upload className="w-3.5 h-3.5 text-emerald-600" />
            <span>Import Excel / CSV</span>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={handleImportFile}
              className="hidden"
            />
          </label>

          {/* Export to Excel */}
          {customers.length > 0 && (
            <button
              onClick={handleExportExcel}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition active:scale-95 shadow-2xs cursor-pointer"
              title="Ekspor Seluruh Pelanggan ke Excel"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Ekspor Excel</span>
            </button>
          )}

          {/* Add Customer Manual */}
          <button
            onClick={handleCreateNew}
            className="flex items-center justify-center gap-1.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 text-xs font-extrabold shadow-md shadow-blue-600/25 active:scale-95 transition cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Tambah Pelanggan</span>
          </button>
        </div>
      </div>

      {/* Notification Banner when Import Succeeded */}
      {importStatus && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-emerald-600" />
            <span>{importStatus}</span>
          </div>
          <button
            onClick={() => setImportStatus(null)}
            className="text-emerald-700 hover:text-emerald-950 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nama perusahaan, PIC, alamat, atau nomor WhatsApp..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
          />
        </div>
      </div>

      {/* Customers List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center shadow-xs">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">Tidak ada pelanggan ditemukan</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            Gunakan tombol <strong>Download Template Excel</strong> di atas untuk mengisi data pelanggan secara banyak, atau klik <strong>Tambah Pelanggan</strong> untuk mengisi manual.
          </p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <button
              onClick={handleDownloadTemplate}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer"
            >
              Download Template Excel
            </button>
            <button
              onClick={handleCreateNew}
              className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 cursor-pointer"
            >
              Tambah Pelanggan Manual
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 font-extrabold flex items-center justify-center shrink-0 text-sm">
                    {(c.companyName || c.name).slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEdit(c)}
                      className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 cursor-pointer"
                      title="Edit Data Pelanggan"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(c.id, c.name)}
                      className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 cursor-pointer"
                      title="Hapus Pelanggan"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="text-sm font-black text-slate-900 mt-3 line-clamp-1">
                  {c.companyName || c.name}
                </h3>
                {c.pic && (
                  <p className="text-xs text-slate-500 font-semibold mt-0.5">
                    PIC: {c.pic}
                  </p>
                )}

                <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                  {c.address && (
                    <div className="flex items-start gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{c.address}</span>
                    </div>
                  )}
                  {(c.phone || c.whatsapp) && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{c.whatsapp || c.phone}</span>
                    </div>
                  )}
                  {c.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{c.email}</span>
                    </div>
                  )}
                </div>

                {c.notes && (
                  <p className="mt-3 p-2 bg-slate-50 rounded-xl text-[11px] text-slate-500 border border-slate-100 italic">
                    {c.notes}
                  </p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => openWhatsApp(c.whatsapp || c.phone, c.pic || c.name)}
                  className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl transition cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Kirim WhatsApp</span>
                </button>
                <button
                  onClick={() => handleEdit(c)}
                  className="text-xs font-bold text-slate-600 hover:underline cursor-pointer"
                >
                  Detail / Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL EDIT / TAMBAH CUSTOMER */}
      {showModal && editingCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in">
            <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                {editingCustomer.id ? 'Edit Data Pelanggan' : 'Tambah Pelanggan Baru'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="p-4 sm:p-6 space-y-3.5 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Kontak / PIC <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editingCustomer.name || ''}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, name: e.target.value })}
                  placeholder="Contoh: Bapak Andi / Ibu Ratna"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Perusahaan / Instansi Customer
                </label>
                <input
                  type="text"
                  value={editingCustomer.companyName || ''}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, companyName: e.target.value })}
                  placeholder="Contoh: PT INDO MAJU MANDIRI"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Sebutan Penerima (Up.)
                </label>
                <input
                  type="text"
                  value={editingCustomer.pic || ''}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, pic: e.target.value })}
                  placeholder="Contoh: Bapak Andi / Tim Purchasing"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Alamat Lengkap</label>
                <textarea
                  rows={2}
                  value={editingCustomer.address || ''}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, address: e.target.value })}
                  placeholder="Jl. Gatot Subroto Kav. 52, Jakarta Selatan"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nomor WhatsApp</label>
                  <input
                    type="text"
                    value={editingCustomer.whatsapp || ''}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, whatsapp: e.target.value })}
                    placeholder="081234567890"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nomor Telepon</label>
                  <input
                    type="text"
                    value={editingCustomer.phone || ''}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, phone: e.target.value })}
                    placeholder="021-5290123"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Alamat Email</label>
                <input
                  type="email"
                  value={editingCustomer.email || ''}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, email: e.target.value })}
                  placeholder="andi@indomaju.co.id"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Catatan Tambahan</label>
                <textarea
                  rows={2}
                  value={editingCustomer.notes || ''}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, notes: e.target.value })}
                  placeholder="Catatan khusus pelanggan..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 text-white text-xs font-extrabold hover:bg-blue-700 shadow-md shadow-blue-600/20 active:scale-95 transition cursor-pointer"
                >
                  Simpan Pelanggan
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
