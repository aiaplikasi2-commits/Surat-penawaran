export interface CompanyProfile {
  id: string;
  userId: string;
  name: string;
  logoUrl?: string;
  address: string;
  city: string;
  postalCode?: string;
  phone: string;
  whatsapp?: string;
  email: string;
  website?: string;
  npwp?: string;
  directorName: string;
  directorTitle: string;
  signatureUrl?: string;
  stampUrl?: string;
  backgroundUrl?: string;
  isDefault?: boolean;
  logoPosition?: 'left' | 'right' | 'top' | 'center';
  logoSize?: number; // mm
  companyNameSize?: number; // pt
  companyDetailsSize?: number; // pt
  headerAlignment?: 'left' | 'center' | 'right';
  letterheadDividerStyle?: 'double' | 'single' | 'thick' | 'none';
  logoOffsetX?: number;
  logoOffsetY?: number;
  logoScalePercent?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Customer {
  id: string;
  userId: string;
  name: string;
  companyName?: string;
  pic?: string;
  address: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface QuotationLineItem {
  id: string;
  description: string;
  dimension?: string; // Dimensi / Spesifikasi
  qty: number;
  unit: string;
  price: number;
  total: number;
}

export type QuotationStatus = 'draft' | 'terkirim' | 'revisi' | 'disetujui' | 'ditolak';

export interface Quotation {
  id: string;
  userId: string;
  quotationNumber: string;
  date: string; // YYYY-MM-DD
  attachment?: string; // Lampiran (bisa diatur ada atau tidaknya)
  hasAttachment?: boolean; // Toggle ada lampiran atau tidak
  toRecipient: string; // Kepada Yth
  customerCompany: string; // Nama Perusahaan Tujuan
  customerPic: string; // PIC (Up.)
  customerAddress: string;
  customerPhone?: string;
  customerEmail?: string;
  subject: string; // Perihal
  companyProfileId: string;
  companySnapshot: Partial<CompanyProfile>; // Snapshot profil perusahaan dari pengaturan
  openingText: string;
  closingText: string;
  items: QuotationLineItem[];
  subtotal: number;
  discountType: 'percent' | 'nominal';
  discountValue: number;
  discountAmount: number;
  ppnPercent: number; // 0, 11, 12
  ppnAmount: number;
  hasTradeIn?: boolean; // Fitur pengurang / Trade-in opsional
  tradeInTitle?: string; // Label pengurang (contoh: "Trade-In / Tukar Tambah")
  tradeInAmount?: number; // Nominal pengurang (Rp)
  tradeInDescription?: string; // Keterangan unit trade-in / potongan
  validityPeriod?: string; // Masa Berlaku Penawaran (contoh: "14 hari kalender sejak tanggal surat")
  paymentScheme?: string; // Skema & Termin Pembayaran (contoh: "DP 50%, Pelunasan 50%")
  grandTotal: number;
  terbilang?: string;
  additionalNotes?: string; // Catatan tambahan / No Rekening bank (opsional)
  status: QuotationStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface QuotationTemplate {
  id: string;
  userId: string;
  title: string;
  type: 'opening' | 'closing' | 'notes';
  content: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserSettings {
  userId: string;
  numberFormat: string; // contoh "{Nomor}/SP/MTA/{BulanRomawi}/{Tahun}"
  currentSequence: number;
  sessionTimeoutMinutes: number;
  updatedAt?: string;
}
