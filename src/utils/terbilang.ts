/**
 * Mengubah angka nominal menjadi terbilang dalam bahasa Indonesia.
 * Contoh: 15000000 -> "Lima Belas Juta Rupiah"
 */
export function terbilang(n: number): string {
  if (isNaN(n) || n === 0) return 'Nol Rupiah';
  
  const bilangan = [
    '',
    'Satu',
    'Dua',
    'Tiga',
    'Empat',
    'Lima',
    'Enam',
    'Tujuh',
    'Delapan',
    'Sembilan',
    'Sepuluh',
    'Sebelas',
  ];

  function konversi(angka: number): string {
    const num = Math.floor(angka);
    if (num < 12) {
      return bilangan[num];
    } else if (num < 20) {
      return konversi(num - 10) + ' Belas';
    } else if (num < 100) {
      const sisa = num % 10;
      return konversi(Math.floor(num / 10)) + ' Puluh' + (sisa ? ' ' + konversi(sisa) : '');
    } else if (num < 200) {
      const sisa = num - 100;
      return 'Seratus' + (sisa ? ' ' + konversi(sisa) : '');
    } else if (num < 1000) {
      const sisa = num % 100;
      return konversi(Math.floor(num / 100)) + ' Ratus' + (sisa ? ' ' + konversi(sisa) : '');
    } else if (num < 2000) {
      const sisa = num - 1000;
      return 'Seribu' + (sisa ? ' ' + konversi(sisa) : '');
    } else if (num < 1000000) {
      const sisa = num % 1000;
      return konversi(Math.floor(num / 1000)) + ' Ribu' + (sisa ? ' ' + konversi(sisa) : '');
    } else if (num < 1000000000) {
      const sisa = num % 1000000;
      return konversi(Math.floor(num / 1000000)) + ' Juta' + (sisa ? ' ' + konversi(sisa) : '');
    } else if (num < 1000000000000) {
      const sisa = num % 1000000000;
      return konversi(Math.floor(num / 1000000000)) + ' Miliar' + (sisa ? ' ' + konversi(sisa) : '');
    } else if (num < 1000000000000000) {
      const sisa = num % 1000000000000;
      return konversi(Math.floor(num / 1000000000000)) + ' Triliun' + (sisa ? ' ' + konversi(sisa) : '');
    }
    return '';
  }

  const result = konversi(Math.abs(n)).trim();
  return (n < 0 ? 'Minus ' : '') + result + ' Rupiah';
}
