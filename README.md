# Surat Penawaran Pro - PWA Pembuat Surat Penawaran & PDF Resmi

Aplikasi web modern (Progressive Web App - PWA) untuk membuat dan mencetak Surat Penawaran Harga resmi, profesional, dan siap kirim ke klien atau instansi pemerintah/swasta.

---

## 🚀 Fitur Utama
- **Tanpa Login / Registrasi**: Langsung pakai tanpa hambatan akun atau password.
- **Penyimpanan Lokal & Privat**: Seluruh data aman di browser Anda (offline-first PWA).
- **Kop Surat Resmi & Fleksibel**: Atur logo perusahaan, alamat, kontak WhatsApp, NPWP, direktur, stempel, dan tanda tangan digital.
- **Penomoran Surat Otomatis**: Format dinamis (contoh: `{Nomor}/SP/KTM/{BulanRomawi}/{Tahun}`).
- **Perhitungan Akurat & Terbilang Otomatis**: Subtotal, Diskon (persen/nominal), PPN (11%), dan konversi kalimat terbilang Rupiah otomatis tanpa library luar.
- **Generator PDF Premium**: Menggunakan jsPDF & jsPDF-autotable dengan layout standar surat dinas / penawaran proyek.
- **Backup & Restore Data**: Unduh seluruh database Anda dalam format JSON dan pulihkan kapan saja.
- **PWA Installable**: Dapat diinstal di Android, iPhone, Windows, dan MacOS.

---

## 📦 Cara Push ke GitHub

Jika Anda ingin menyimpan kode ini di repositori GitHub Anda:

```bash
# 1. Buka terminal di folder proyek ini

# 2. Inisialisasi git (jika belum)
git init

# 3. Tambahkan semua file dan buat commit awal
git add .
git commit -m "feat: aplikasi surat penawaran pro siap deploy ke vercel/netlify"

# 4. Ganti branch utama menjadi main
git branch -M main

# 5. Hubungkan ke repositori GitHub Anda (buat repo baru di https://github.com/new)
git remote add origin https://github.com/USERNAME_ANDA/NAMA_REPO_ANDA.git

# 6. Push kode ke GitHub
git push -u origin main
```

---

## ⚡ Panduan Deploy ke Vercel (Gratis & Cepat)

1. Buka [https://vercel.com](https://vercel.com) dan login dengan akun GitHub Anda.
2. Klik tombol **"Add New..."** lalu pilih **"Project"**.
3. Pilih repositori GitHub Anda (`NAMA_REPO_ANDA`) lalu klik **"Import"**.
4. Di bagian konfigurasi:
   - **Framework Preset**: Vite (terdeteksi otomatis)
   - **Root Directory**: `./` (biarkan default)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Klik **"Deploy"**.
6. Tunggu sekitar 1 menit, dan aplikasi Anda sudah live dengan domain gratis seperti:  
   `https://nama-proyek-anda.vercel.app`

---

## 🌐 Panduan Deploy ke Netlify (Gratis & Cepat)

1. Buka [https://www.netlify.com](https://www.netlify.com) dan login dengan akun GitHub Anda.
2. Klik **"Add new site"** > **"Import an existing project"**.
3. Pilih **GitHub**, lalu izinkan akses ke repositori proyek Anda.
4. Pada halaman konfigurasi:
   - **Branch to deploy**: `main`
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
5. Klik tombol **"Deploy site"**.
6. Website Anda langsung online dengan domain Netlify gratis, dan konfigurasi routing sudah terpasang otomatis di `netlify.toml` dan `public/_redirects`.

---

## 🛠️ Pengembangan Lokal

```bash
# Install dependensi
npm install

# Jalankan server lokal
npm run dev

# Build produksi
npm run build
```

---

Dibuat dengan ❤️ oleh **jamhur** (WhatsApp: [628179015181](https://wa.me/628179015181))
