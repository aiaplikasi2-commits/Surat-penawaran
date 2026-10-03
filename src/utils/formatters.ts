/**
 * Format angka ke format mata uang Rupiah
 * Contoh: 15000000 -> "Rp 15.000.000"
 */
export function formatRupiah(value: number): string {
  if (isNaN(value)) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Format angka murni pemisah ribuan
 * Contoh: 15000 -> "15.000"
 */
export function formatNumber(value: number): string {
  if (isNaN(value)) return '0';
  return new Intl.NumberFormat('id-ID').format(value);
}

/**
 * Konversi angka bulan (1-12) ke angka romawi
 */
export function toRomanMonth(monthIndexOneBased: number): string {
  const romanMonths = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
  const idx = Math.max(1, Math.min(12, monthIndexOneBased)) - 1;
  return romanMonths[idx] || 'I';
}

/**
 * Format tanggal dalam bahasa Indonesia
 * Contoh: "2026-09-30" -> "30 September 2026"
 */
export function formatIndonesianDate(dateString?: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  const months = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
  ];

  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();

  return `${day} ${month} ${year}`;
}

/**
 * Generate nomor surat otomatis berdasarkan pola format
 * Default pattern: "{Nomor}/SP/MTA/{BulanRomawi}/{Tahun}"
 */
export function generateQuotationNumber(
  pattern: string = '{Nomor}/SP/{BulanRomawi}/{Tahun}',
  seq: number = 1,
  dateStr?: string
): string {
  const date = dateStr ? new Date(dateStr) : new Date();
  const year = isNaN(date.getTime()) ? new Date().getFullYear() : date.getFullYear();
  const monthNum = isNaN(date.getTime()) ? new Date().getMonth() + 1 : date.getMonth() + 1;
  const romanMonth = toRomanMonth(monthNum);
  const formattedSeq = String(seq).padStart(3, '0');

  let result = pattern;
  result = result.replace(/\{Nomor\}/gi, formattedSeq);
  result = result.replace(/\{BulanRomawi\}/gi, romanMonth);
  result = result.replace(/\{Bulan\}/gi, String(monthNum).padStart(2, '0'));
  result = result.replace(/\{Tahun\}/gi, String(year));

  return result;
}

/**
 * Generate nama file PDF otomatis sesuai aturan prioritas:
 * 1. Nama Perusahaan Tujuan -> Penawaran_PT_KANSAI_PAINT_INDONESIA.pdf
 * 2. Jika kosong: Nama PIC -> Penawaran_BUDI_SANTOSO.pdf
 * 3. Jika masih kosong: Nomor Surat -> SP_001-SP-MTA-IX-2026.pdf
 * Menghapus karakter khusus, simbol, dan ganti spasi dengan underscore
 */
export function generatePdfFileName(
  customerCompany?: string,
  customerPic?: string,
  quotationNumber?: string
): string {
  const sanitize = (text: string) => {
    return text
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9\s_-]/g, '') // Hapus karakter khusus
      .replace(/\s+/g, '_') // Spasi jadi underscore
      .replace(/_+/g, '_'); // Hapus double underscore
  };

  if (customerCompany && customerCompany.trim().length > 0) {
    const cleanCompany = sanitize(customerCompany);
    if (cleanCompany) return `Penawaran_${cleanCompany}.pdf`;
  }

  if (customerPic && customerPic.trim().length > 0) {
    const cleanPic = sanitize(customerPic);
    if (cleanPic) return `Penawaran_${cleanPic}.pdf`;
  }

  if (quotationNumber && quotationNumber.trim().length > 0) {
    const cleanNo = quotationNumber
      .trim()
      .toUpperCase()
      .replace(/[\/\\]/g, '-')
      .replace(/[^A-Z0-9_-]/g, '');
    return `SP_${cleanNo || 'DRAFT'}.pdf`;
  }

  return `Penawaran_Surat_Resmi.pdf`;
}
