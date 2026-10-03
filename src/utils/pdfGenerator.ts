import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Quotation } from '../types';
import { formatIndonesianDate, formatRupiah, generatePdfFileName } from './formatters';

export interface PdfGenerationOptions {
  logoOffsetX?: number; // mm
  logoOffsetY?: number; // mm
  logoScalePercent?: number; // %
}

export async function generateQuotationPdf(
  quotation: Quotation,
  customFileName?: string,
  options?: PdfGenerationOptions
): Promise<{ doc: jsPDF; fileName: string; blobUrl?: string }> {
  // A4 dimensions: 210 x 297 mm
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const marginLeft = 15;
  const marginRight = 15;
  const contentWidth = pageWidth - marginLeft - marginRight; // 180mm
  const centerX = pageWidth / 2; // 105mm (RATA TENGAH SEMPURNA)

  const company = quotation.companySnapshot || {};

  // --- 1. KOP SURAT PROFESIONAL (TEKS RATA TENGAH & LOGO FLEKSIBEL BISA DIGESER) ---
  const kopTopY = 14; // Batas atas Kop Surat

  const companyName = (company.name || 'PERUSAHAAN').trim().toUpperCase();
  const addressStr = `${company.address || ''}${company.city ? ', ' + company.city : ''}${company.postalCode ? ' ' + company.postalCode : ''}`.trim();

  const contactsArr: string[] = [];
  if (company.phone) contactsArr.push(`Telp: ${company.phone}`);
  if (company.whatsapp) contactsArr.push(`WA: ${company.whatsapp}`);
  if (company.email) contactsArr.push(`Email: ${company.email}`);
  if (company.website) contactsArr.push(`Web: ${company.website}`);
  const contactStr = contactsArr.join('  |  ');

  const npwpStr = company.npwp ? `NPWP: ${company.npwp}` : '';

  // Brand Blue dari acuan gambar user (#2559a0 / RGB: 37, 89, 160)
  const BRAND_BLUE: [number, number, number] = [37, 89, 160];
  const LINK_BLUE: [number, number, number] = [37, 99, 235]; // Biru tautan (#2563eb)
  const TEXT_BLACK: [number, number, number] = [0, 0, 0]; // Hitam biasa

  // Pengaturan Kop Surat dari Profil Perusahaan & Interaksi Preview
  const logoPos = (company.logoPosition || 'left') as 'left' | 'right' | 'top' | 'center';
  const baseLogoSizeMm = Math.min(50, Math.max(16, Number(company.logoSize) || 26));
  const scalePercent = options?.logoScalePercent ?? company.logoScalePercent ?? 100;
  const logoScale = Math.max(0.4, Math.min(2.5, scalePercent / 100));

  const hasLogo = Boolean(
    company.logoUrl &&
    (company.logoUrl.startsWith('data:image') || company.logoUrl.startsWith('blob:') || company.logoUrl.startsWith('http'))
  );

  // Hitung aspek rasio asli gambar agar panjang dan lebar proporsional sesuai yang diupload
  let logoWidth = baseLogoSizeMm * logoScale;
  let logoHeight = baseLogoSizeMm * logoScale;

  if (hasLogo && company.logoUrl) {
    try {
      const imgProps = doc.getImageProperties(company.logoUrl);
      if (imgProps.width && imgProps.height && imgProps.height > 0) {
        const aspect = imgProps.width / imgProps.height;
        if (aspect >= 1) {
          // Gambar Melebar / Landscape
          logoWidth = baseLogoSizeMm * logoScale;
          logoHeight = logoWidth / aspect;
        } else {
          // Gambar Meninggi / Portrait
          logoHeight = baseLogoSizeMm * logoScale;
          logoWidth = logoHeight * aspect;
        }
      }
    } catch {
      // fallback jika decode gagal
    }
  }

  const offsetX = options?.logoOffsetX ?? company.logoOffsetX ?? 0;
  const offsetY = options?.logoOffsetY ?? company.logoOffsetY ?? 0;

  const nameFontSize = Math.min(24, Math.max(13, Number(company.companyNameSize) || 18)); // Rentang 13pt - 24pt
  const subFontSize = Math.min(12, Math.max(8, Number(company.companyDetailsSize) || 9.5)); // Rentang 8pt - 12pt
  const dividerStyle = company.letterheadDividerStyle || 'double';

  const normalLineHeight = subFontSize * 0.44; // mm spasi baris detail
  const nameLineHeight = nameFontSize * 0.42; // mm spasi nama perusahaan

  doc.setFont('times', 'normal');
  doc.setFontSize(subFontSize);

  // Kalkulasi ruang teks RATA TENGAH agar ANTI-TABRAKAN dengan logo
  // Bila logo di kiri/kanan, batas simetris kiri-kanan menjamin teks tetap di tengah tanpa menabrak logo
  const gap = 5;
  let maxTextWidth = contentWidth;
  if (hasLogo && (logoPos === 'left' || logoPos === 'right')) {
    const clearance = marginLeft + logoWidth + gap;
    maxTextWidth = Math.max(90, pageWidth - 2 * clearance);
  } else {
    maxTextWidth = contentWidth;
  }

  // Pecah baris teks secara dinamis
  const addressLines: string[] = addressStr ? doc.splitTextToSize(addressStr, maxTextWidth) : [];
  const contactLines: string[] = contactStr ? doc.splitTextToSize(contactStr, maxTextWidth) : [];
  const npwpLines: string[] = npwpStr ? doc.splitTextToSize(npwpStr, maxTextWidth) : [];

  // Hitung total tinggi teks
  const textTotalHeight =
    nameLineHeight +
    (addressLines.length * normalLineHeight) +
    (contactLines.length * normalLineHeight) +
    (npwpLines.length * normalLineHeight) +
    2.5;

  let baseLogoX = marginLeft;
  let baseLogoY = kopTopY;
  let textStartY = kopTopY;

  if (hasLogo && logoPos === 'left') {
    baseLogoX = marginLeft;
    const headerHeight = Math.max(logoHeight, textTotalHeight);
    baseLogoY = kopTopY + Math.max(0, (headerHeight - logoHeight) / 2);
    textStartY = kopTopY + Math.max(0, (headerHeight - textTotalHeight) / 2) + nameLineHeight * 0.85;
  } else if (hasLogo && logoPos === 'right') {
    baseLogoX = pageWidth - marginRight - logoWidth;
    const headerHeight = Math.max(logoHeight, textTotalHeight);
    baseLogoY = kopTopY + Math.max(0, (headerHeight - logoHeight) / 2);
    textStartY = kopTopY + Math.max(0, (headerHeight - textTotalHeight) / 2) + nameLineHeight * 0.85;
  } else if (hasLogo && (logoPos === 'top' || logoPos === 'center')) {
    baseLogoX = centerX - (logoWidth / 2);
    baseLogoY = kopTopY;
    textStartY = kopTopY + logoHeight + 4 + nameLineHeight * 0.85;
  } else {
    textStartY = kopTopY + nameLineHeight * 0.85;
  }

  // Posisi Akhir Logo (Memperhitungkan pergeseran geser-geser offsetX & offsetY)
  const finalLogoX = baseLogoX + offsetX;
  const finalLogoY = baseLogoY + offsetY;

  // Cetak Logo jika tersedia
  if (hasLogo && company.logoUrl) {
    try {
      doc.addImage(company.logoUrl, 'PNG', finalLogoX, finalLogoY, logoWidth, logoHeight, undefined, 'FAST');
    } catch {
      // fallback jika decode gambar gagal
    }
  }

  // Tulis Teks Kop Surat — SELALU RATA TENGAH (CENTER ALIGNED) DI TENGAH HALAMAN (centerX = 105mm)
  let currentTextY = textStartY;

  // 1. Nama Perusahaan (Times Bold, Brand Blue sesuai gambar user, Rata Tengah)
  doc.setFont('times', 'bold');
  doc.setFontSize(nameFontSize);
  doc.setTextColor(BRAND_BLUE[0], BRAND_BLUE[1], BRAND_BLUE[2]);
  doc.text(companyName, centerX, currentTextY, { align: 'center' });

  // 2. Alamat Lengkap (Rata Tengah - Hitam Biasa)
  doc.setFont('times', 'normal');
  doc.setFontSize(subFontSize);
  doc.setTextColor(TEXT_BLACK[0], TEXT_BLACK[1], TEXT_BLACK[2]);

  if (addressLines.length > 0) {
    currentTextY += normalLineHeight + 1.2;
    doc.text(addressLines, centerX, currentTextY, { align: 'center' });
    currentTextY += (addressLines.length - 1) * normalLineHeight;
  }

  // 3. Kontak (Telp, WA, Email berbentuk tautan biru, Web - Rata Tengah)
  interface ContactBlock {
    segments: Array<{ text: string; color: [number, number, number]; url?: string; isLink?: boolean }>;
  }
  const contactBlocks: ContactBlock[] = [];

  if (company.phone) {
    contactBlocks.push({
      segments: [{ text: `Telp: ${company.phone}`, color: TEXT_BLACK }],
    });
  }
  if (company.whatsapp) {
    contactBlocks.push({
      segments: [{ text: `WA: ${company.whatsapp}`, color: TEXT_BLACK }],
    });
  }
  if (company.email) {
    contactBlocks.push({
      segments: [
        { text: 'Email: ', color: TEXT_BLACK },
        {
          text: company.email,
          color: LINK_BLUE,
          url: `mailto:${company.email}`,
          isLink: true,
        },
      ],
    });
  }
  if (company.website) {
    const webUrl = company.website.startsWith('http') ? company.website : `https://${company.website}`;
    contactBlocks.push({
      segments: [
        { text: 'Web: ', color: TEXT_BLACK },
        {
          text: company.website,
          color: LINK_BLUE,
          url: webUrl,
          isLink: true,
        },
      ],
    });
  }

  if (contactBlocks.length > 0) {
    currentTextY += normalLineHeight + 0.6;
    const sepText = '   |   ';
    const sepWidth = doc.getTextWidth(sepText);

    // Hitung total lebar jika 1 baris
    let fullWidth = 0;
    contactBlocks.forEach((b, bIdx) => {
      if (bIdx > 0) fullWidth += sepWidth;
      b.segments.forEach((s) => {
        fullWidth += doc.getTextWidth(s.text);
      });
    });

    const renderLine = (blocks: ContactBlock[], yPos: number) => {
      let lineWidth = 0;
      blocks.forEach((b, bIdx) => {
        if (bIdx > 0) lineWidth += sepWidth;
        b.segments.forEach((s) => {
          lineWidth += doc.getTextWidth(s.text);
        });
      });

      let startX = centerX - lineWidth / 2;
      blocks.forEach((b, bIdx) => {
        if (bIdx > 0) {
          doc.setTextColor(TEXT_BLACK[0], TEXT_BLACK[1], TEXT_BLACK[2]);
          doc.text(sepText, startX, yPos);
          startX += sepWidth;
        }
        b.segments.forEach((s) => {
          doc.setTextColor(s.color[0], s.color[1], s.color[2]);
          const strW = doc.getTextWidth(s.text);
          if (s.isLink && s.url) {
            doc.textWithLink(s.text, startX, yPos, { url: s.url });
            // Buat garis bawah halus untuk tautan
            doc.setDrawColor(s.color[0], s.color[1], s.color[2]);
            doc.setLineWidth(0.18);
            doc.line(startX, yPos + 0.35, startX + strW, yPos + 0.35);
          } else {
            doc.text(s.text, startX, yPos);
          }
          startX += strW;
        });
      });
    };

    if (fullWidth <= maxTextWidth) {
      renderLine(contactBlocks, currentTextY);
    } else {
      // Jika terlalu panjang, bagi dua baris dengan rapi
      const mid = Math.ceil(contactBlocks.length / 2);
      const line1Blocks = contactBlocks.slice(0, mid);
      const line2Blocks = contactBlocks.slice(mid);
      renderLine(line1Blocks, currentTextY);
      currentTextY += normalLineHeight;
      renderLine(line2Blocks, currentTextY);
    }
  }

  // 4. NPWP (Rata Tengah - Hitam Biasa)
  if (npwpLines.length > 0) {
    currentTextY += normalLineHeight + 0.6;
    doc.setTextColor(TEXT_BLACK[0], TEXT_BLACK[1], TEXT_BLACK[2]);
    doc.text(npwpLines, centerX, currentTextY, { align: 'center' });
    currentTextY += (npwpLines.length - 1) * normalLineHeight;
  }

  // Posisi Garis Pemisah Kop Surat (di bawah elemen logo atau teks yang tertinggi)
  const kopEndY = Math.max(hasLogo ? (finalLogoY + logoHeight) : 0, currentTextY) + 3.5;

  // Gambar Garis Pembatas Sesuai Gaya yang Dipilih (Hitam Biasa)
  let currentY = kopEndY + 6;

  if (dividerStyle === 'double') {
    doc.setDrawColor(0, 0, 0); // Hitam biasa
    doc.setLineWidth(1.2);
    doc.line(marginLeft, kopEndY, pageWidth - marginRight, kopEndY);

    const thinLineY = kopEndY + 1.2;
    doc.setLineWidth(0.4);
    doc.line(marginLeft, thinLineY, pageWidth - marginRight, thinLineY);
    currentY = thinLineY + 6;
  } else if (dividerStyle === 'single') {
    doc.setDrawColor(0, 0, 0); // Hitam biasa
    doc.setLineWidth(0.8);
    doc.line(marginLeft, kopEndY, pageWidth - marginRight, kopEndY);
    currentY = kopEndY + 6;
  } else if (dividerStyle === 'thick') {
    doc.setDrawColor(0, 0, 0); // Hitam biasa
    doc.setLineWidth(1.8);
    doc.line(marginLeft, kopEndY, pageWidth - marginRight, kopEndY);
    currentY = kopEndY + 6;
  } else {
    // none
    currentY = kopEndY + 4;
  }

  // --- 2. INFORMASI SURAT & TUJUAN ---
  const dateFormatted = formatIndonesianDate(quotation.date);
  const city = company.city || '';

  // Tanggal & Tempat di sisi kanan atas (Hitam Biasa)
  doc.setFont('times', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(TEXT_BLACK[0], TEXT_BLACK[1], TEXT_BLACK[2]);
  const placeDate = city ? `${city}, ${dateFormatted}` : dateFormatted;
  doc.text(placeDate, pageWidth - marginRight, currentY, { align: 'right' });

  // Nomor, Lampiran (opsional/bisa diedit ada atau tidaknya), Perihal di kiri (Hitam Biasa)
  const metaLabelX = marginLeft;
  const metaValX = marginLeft + 24;

  doc.text('Nomor', metaLabelX, currentY);
  doc.text(`:  ${quotation.quotationNumber}`, metaValX, currentY);
  currentY += 4.5;

  // Lampiran: bisa diedit ada atau tidaknya
  const showAttachment =
    quotation.hasAttachment !== false &&
    Boolean(quotation.attachment && quotation.attachment.trim() !== '' && quotation.attachment !== '-');

  if (showAttachment) {
    doc.text('Lampiran', metaLabelX, currentY);
    doc.text(`:  ${quotation.attachment}`, metaValX, currentY);
    currentY += 4.5;
  }

  doc.text('Perihal', metaLabelX, currentY);
  doc.setFont('times', 'bold');
  doc.text(`:  ${quotation.subject || 'Surat Penawaran Harga'}`, metaValX, currentY);
  doc.setFont('times', 'normal');
  currentY += 7;

  // Tujuan Surat (Kepada Yth) (Hitam Biasa)
  doc.text('Kepada Yth.', marginLeft, currentY);
  currentY += 4.5;

  doc.setFont('times', 'bold');
  doc.text(quotation.customerCompany || quotation.toRecipient || 'Pimpinan / Management', marginLeft, currentY);
  currentY += 4.5;

  doc.setFont('times', 'normal');
  if (quotation.customerPic && quotation.customerPic.trim()) {
    const rawPic = quotation.customerPic.trim();
    const picText = rawPic.toLowerCase().startsWith('up.') ? rawPic : `Up. ${rawPic}`;
    doc.text(picText, marginLeft, currentY);
    currentY += 4.5;
  }

  if (quotation.customerAddress) {
    const addrLines = doc.splitTextToSize(quotation.customerAddress, 110);
    doc.text(addrLines, marginLeft, currentY);
    currentY += addrLines.length * 4.2;
  }
  currentY += 3;

  // --- 3. ISI SURAT PEMBUKA ---
  const openingText =
    quotation.openingText ||
    'Dengan hormat,\nBersama surat ini kami mengajukan penawaran pekerjaan sesuai kebutuhan yang Bapak/Ibu sampaikan. Adapun rincian penawaran kami sebagai berikut:';

  doc.setFont('times', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(TEXT_BLACK[0], TEXT_BLACK[1], TEXT_BLACK[2]);

  const safeOpeningWidth = contentWidth - 4;
  const openingLines = doc.splitTextToSize(openingText, safeOpeningWidth);
  doc.text(openingLines, marginLeft, currentY, { maxWidth: safeOpeningWidth, align: 'left' });
  currentY += openingLines.length * 4.4 + 3;

  // --- 4. TABEL PENAWARAN ---
  const tableData = quotation.items.map((item, idx) => [
    idx + 1,
    item.description,
    item.dimension || '-',
    item.qty,
    item.unit,
    formatRupiah(item.price).replace('Rp', '').trim(),
    formatRupiah(item.total).replace('Rp', '').trim(),
  ]);

  autoTable(doc, {
    startY: currentY,
    margin: { left: marginLeft, right: marginRight },
    head: [['No', 'Deskripsi Pekerjaan', 'Dimensi / Spesifikasi', 'Qty', 'Satuan', 'Harga (Rp)', 'Total (Rp)']],
    body: tableData,
    theme: 'grid',
    styles: {
      font: 'times',
    },
    headStyles: {
      font: 'times',
      fillColor: [37, 89, 160], // Brand Blue (#2559a0)
      textColor: [255, 255, 255],
      fontSize: 9,
      fontStyle: 'bold',
      halign: 'center',
      valign: 'middle',
      cellPadding: 2.5,
    },
    bodyStyles: {
      font: 'times',
      fontSize: 8.5,
      cellPadding: 2.2,
      textColor: [0, 0, 0], // Hitam biasa
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10 },
      1: { halign: 'left', cellWidth: 'auto' },
      2: { halign: 'center', cellWidth: 26 },
      3: { halign: 'center', cellWidth: 14 },
      4: { halign: 'center', cellWidth: 16 },
      5: { halign: 'right', cellWidth: 28 },
      6: { halign: 'right', cellWidth: 32 },
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const lastTableInfo = (doc as any).lastAutoTable;
  currentY = lastTableInfo ? lastTableInfo.finalY + 3 : currentY + 40;

  // Cek overflow jika sisa halaman kurang dari 80mm
  if (currentY > pageHeight - 85) {
    doc.addPage();
    currentY = 20;
  }

  // --- 5. RINGKASAN HARGA (Subtotal, Diskon, PPN, Trade-in, Grand Total) ---
  const summaryBoxWidth = 92;
  const summaryX = pageWidth - marginRight - summaryBoxWidth;

  doc.setFontSize(9);

  // Subtotal
  doc.setFont('times', 'normal');
  doc.text('Subtotal', summaryX, currentY);
  doc.text(formatRupiah(quotation.subtotal), pageWidth - marginRight, currentY, { align: 'right' });
  currentY += 4.5;

  // Diskon jika ada
  if (quotation.discountAmount > 0) {
    const discLabel =
      quotation.discountType === 'percent'
        ? `Diskon (${quotation.discountValue}%)`
        : 'Diskon Khusus';
    doc.text(discLabel, summaryX, currentY);
    doc.text(`- ${formatRupiah(quotation.discountAmount)}`, pageWidth - marginRight, currentY, { align: 'right' });
    currentY += 4.5;
  }

  // PPN jika ada
  if (quotation.ppnAmount > 0) {
    doc.text(`PPN (${quotation.ppnPercent}%)`, summaryX, currentY);
    doc.text(formatRupiah(quotation.ppnAmount), pageWidth - marginRight, currentY, { align: 'right' });
    currentY += 4.5;
  }

  // Fitur Pengurang / Trade-In (jika aktif & diisi)
  if (quotation.hasTradeIn && (quotation.tradeInAmount || 0) > 0) {
    const tradeInLabel = (quotation.tradeInTitle || 'Trade-In / Tukar Tambah').trim();
    doc.text(tradeInLabel, summaryX, currentY);
    doc.text(`- ${formatRupiah(quotation.tradeInAmount || 0)}`, pageWidth - marginRight, currentY, { align: 'right' });
    currentY += 4.5;
  }

  // Grand Total Box
  doc.setFillColor(239, 246, 255);
  doc.setDrawColor(191, 219, 254);
  doc.setLineWidth(0.5);
  doc.roundedRect(summaryX - 2, currentY - 3.5, summaryBoxWidth + 2, 7.5, 1.5, 1.5, 'FD');

  doc.setFont('times', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(30, 64, 175);
  doc.text('GRAND TOTAL', summaryX, currentY + 1.2);
  doc.text(formatRupiah(quotation.grandTotal), pageWidth - marginRight, currentY + 1.2, { align: 'right' });

  // Catatan kecil unit trade-in (jika ada deskripsi)
  if (quotation.hasTradeIn && quotation.tradeInDescription && quotation.tradeInDescription.trim()) {
    doc.setFont('times', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(`* Ket. Pengurang: ${quotation.tradeInDescription.trim()}`, marginLeft, currentY + 1.2);
  }

  currentY += 9;

  // --- 6. TEKS PENUTUP RESMI ---
  const closingText =
    quotation.closingText ||
    'Demikian surat penawaran ini kami sampaikan. Besar harapan kami untuk dapat bekerjasama dengan perusahaan Bapak/Ibu. Atas perhatian dan kesempatannya kami ucapkan terima kasih.';

  // Tentukan font dan ukuran DULU sebelum splitTextToSize agar kalkulasi lebar presisi
  doc.setFont('times', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(TEXT_BLACK[0], TEXT_BLACK[1], TEXT_BLACK[2]);

  // Gunakan safe width dalam batas margin agar tidak melewati batas kanan
  const safeContentWidth = contentWidth - 4;
  const closingLines = doc.splitTextToSize(closingText, safeContentWidth);
  doc.text(closingLines, marginLeft, currentY, { maxWidth: safeContentWidth, align: 'left' });
  currentY += closingLines.length * 4.4 + 5;

  // Cek overflow sebelum tanda tangan
  if (currentY > pageHeight - 65) {
    doc.addPage();
    currentY = 20;
  }

  // --- 8. BLOK TANDA TANGAN PENGIRIM SURAT (KANAN) ---
  const signWidth = 70;
  const signX = pageWidth - marginRight - signWidth;
  let signY = currentY;

  doc.setFont('times', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(TEXT_BLACK[0], TEXT_BLACK[1], TEXT_BLACK[2]);
  doc.text('Hormat Kami,', signX, signY, { align: 'left' });
  signY += 5;

  doc.setFont('times', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(BRAND_BLUE[0], BRAND_BLUE[1], BRAND_BLUE[2]);
  doc.text((company.name || '').toUpperCase(), signX, signY, { align: 'left' });
  signY += 4.5;

  // Stempel & Tanda Tangan (Bertumpuk Resmi: TTD Tertimpa Stempel)
  const signAreaY = signY;
  const signAreaHeight = 22;

  // 1. Gambar TTD TERLEBIH DAHULU (di bawah stempel)
  if (company.signatureUrl && (company.signatureUrl.startsWith('data:image') || company.signatureUrl.startsWith('blob:') || company.signatureUrl.startsWith('http'))) {
    try {
      doc.addImage(company.signatureUrl, 'PNG', signX + 4, signAreaY, 34, signAreaHeight, undefined, 'FAST');
    } catch {
      // ignore
    }
  }

  // 2. Gambar STEMPEL KEDUA (menimpa di atas TTD dengan posisi tumpang-tindih resmi di sisi kiri TTD)
  if (company.stampUrl && (company.stampUrl.startsWith('data:image') || company.stampUrl.startsWith('blob:') || company.stampUrl.startsWith('http'))) {
    try {
      // Posisi stempel menumpuk 40%-50% di atas tanda tangan sebelah kiri
      doc.addImage(company.stampUrl, 'PNG', signX - 2, signAreaY - 1, 23, 23, undefined, 'FAST');
    } catch {
      // ignore
    }
  }

  signY += signAreaHeight + 2;

  // Nama Direktur & Jabatan (Diambil dari Pengaturan)
  const directorName = company.directorName || '';
  const directorTitle = company.directorTitle || 'Direktur';

  if (directorName) {
    doc.setFont('times', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(TEXT_BLACK[0], TEXT_BLACK[1], TEXT_BLACK[2]);
    doc.text(directorName, signX, signY);

    const nameWidth = doc.getTextWidth(directorName);
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.4);
    doc.line(signX, signY + 0.8, signX + nameWidth, signY + 0.8);

    signY += 4.5;
  }

  doc.setFont('times', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(TEXT_BLACK[0], TEXT_BLACK[1], TEXT_BLACK[2]);
  doc.text(directorTitle, signX, signY);
  signY += 6; // Jarak setelah tanda tangan selesai

  // --- 9. KETENTUAN PENAWARAN & SYARAT PEMBAYARAN (HANYA DITAMPILKAN JIKA DIISI OLEH USER) ---
  const validityText = (quotation.validityPeriod || '').trim();
  const paymentSchemeText = (quotation.paymentScheme || '').trim();
  const notesText = (quotation.additionalNotes || '').trim();
  const hasPaymentTerms = Boolean(validityText || paymentSchemeText || notesText);

  if (hasPaymentTerms) {
    let notesY = Math.max(currentY + 36, signY) + 2;
    const notesWidth = contentWidth; // 180mm
    const labelColWidth = 38; // mm untuk kolom label
    const valColWidth = notesWidth - labelColWidth - 10;

    doc.setFont('times', 'normal');
    doc.setFontSize(8.5);

    const validityLines = validityText ? doc.splitTextToSize(`:  ${validityText}`, valColWidth) : [];
    const schemeLines = paymentSchemeText ? doc.splitTextToSize(`:  ${paymentSchemeText}`, valColWidth) : [];
    const notesLines = notesText ? doc.splitTextToSize(`:  ${notesText}`, valColWidth) : [];

    const totalContentLines = validityLines.length + schemeLines.length + notesLines.length;
    const boxHeight = 8 + (totalContentLines * 4.2) + (notesLines.length > 0 ? 3 : 2);

    // Cek overflow jika butuh halaman baru
    if (notesY + boxHeight > pageHeight - 14) {
      doc.addPage();
      notesY = 20;
    }

    // Desain Box Resmi di Sisi Kiri
    doc.setFillColor(248, 250, 252); // slate-50 lembut
    doc.setDrawColor(0, 0, 0); // border hitam
    doc.setLineWidth(0.3);
    doc.roundedRect(marginLeft, notesY, notesWidth, boxHeight, 1.5, 1.5, 'FD');

    // Judul Box Ketentuan Resmi
    doc.setFont('times', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(TEXT_BLACK[0], TEXT_BLACK[1], TEXT_BLACK[2]);
    doc.text('KETENTUAN & SYARAT PEMBAYARAN :', marginLeft + 4, notesY + 5.5);

    let curLineY = notesY + 10;
    let stepNum = 1;

    // 1. Masa Berlaku Penawaran
    if (validityLines.length > 0) {
      doc.setFont('times', 'bold');
      doc.setFontSize(8.2);
      doc.setTextColor(TEXT_BLACK[0], TEXT_BLACK[1], TEXT_BLACK[2]);
      doc.text(`${stepNum}. Masa Berlaku`, marginLeft + 4, curLineY);

      doc.setFont('times', 'normal');
      doc.setTextColor(TEXT_BLACK[0], TEXT_BLACK[1], TEXT_BLACK[2]);
      doc.text(validityLines, marginLeft + 4 + labelColWidth, curLineY);
      curLineY += validityLines.length * 4.2;
      stepNum++;
    }

    // 2. Skema & Termin Pembayaran
    if (schemeLines.length > 0) {
      doc.setFont('times', 'bold');
      doc.setFontSize(8.2);
      doc.setTextColor(TEXT_BLACK[0], TEXT_BLACK[1], TEXT_BLACK[2]);
      doc.text(`${stepNum}. Skema Pembayaran`, marginLeft + 4, curLineY);

      doc.setFont('times', 'normal');
      doc.setTextColor(TEXT_BLACK[0], TEXT_BLACK[1], TEXT_BLACK[2]);
      doc.text(schemeLines, marginLeft + 4 + labelColWidth, curLineY);
      curLineY += schemeLines.length * 4.2;
      stepNum++;
    }

    // 3. Rekening Transfer / Catatan (jika diisi)
    if (notesLines.length > 0) {
      doc.setFont('times', 'bold');
      doc.setFontSize(8.2);
      doc.setTextColor(TEXT_BLACK[0], TEXT_BLACK[1], TEXT_BLACK[2]);
      doc.text(`${stepNum}. Rekening / Catatan`, marginLeft + 4, curLineY);

      doc.setFont('times', 'normal');
      doc.setTextColor(TEXT_BLACK[0], TEXT_BLACK[1], TEXT_BLACK[2]);
      doc.text(notesLines, marginLeft + 4 + labelColWidth, curLineY);
    }
  }

  // --- 9. FOOTER RESMI ---
  const totalPages = doc.getNumberOfPages();
  const todayFormatted = formatIndonesianDate(new Date().toISOString().slice(0, 10));

  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    // Watermark jika status khusus
    if (quotation.status === 'draft') {
      doc.saveGraphicsState();
      doc.setFont('times', 'bold');
      doc.setFontSize(48);
      doc.setTextColor(226, 232, 240);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (doc as any).text('D R A F T', pageWidth / 2, pageHeight / 2, {
        align: 'center',
        angle: 45,
      });
      doc.restoreGraphicsState();
    } else if (quotation.status === 'revisi') {
      doc.saveGraphicsState();
      doc.setFont('times', 'bold');
      doc.setFontSize(46);
      doc.setTextColor(254, 226, 226);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (doc as any).text('R E V I S I', pageWidth / 2, pageHeight / 2, {
        align: 'center',
        angle: 45,
      });
      doc.restoreGraphicsState();
    }

    // Garis & Teks Footer Dihapus Sesuai Permintaan User
  }

  const fileName =
    customFileName ||
    generatePdfFileName(
      quotation.customerCompany,
      quotation.customerPic,
      quotation.quotationNumber
    );

  const blobUrl = doc.output('bloburl').toString();

  return { doc, fileName, blobUrl };
}
