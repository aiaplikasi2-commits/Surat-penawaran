import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  Mail,
  Lock,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  MessageCircle,
  Sparkles,
  ExternalLink,
  HelpCircle,
  Laptop,
  X,
  Check,
} from 'lucide-react';

export const AuthPage: React.FC = () => {
  const { loginWithGoogle, loginWithEmail, registerWithEmail, resetPasswordEmail, loginAsDemo } = useAuth();
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showActivationModal, setShowActivationModal] = useState(false);

  const firebaseConsoleUrl = 'https://console.firebase.google.com/project/river-nation-mpthm/authentication/providers';

  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      await loginWithGoogle();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal login dengan Google.';
      if (msg.includes('auth/unauthorized-domain')) {
        setError(
          `Domain "${window.location.hostname}" belum diizinkan di Firebase. Silakan tambahkan domain ini di Firebase Console -> Authentication -> Settings -> Authorized Domains.`
        );
      } else if (msg.includes('auth/popup-closed-by-user') || msg.includes('popup_closed_by_user')) {
        setError('Jendela popup login Google tertutup sebelum selesai. Pastikan browser tidak memblokir popup.');
      } else if (msg.includes('auth/popup-blocked')) {
        setError('Popup diblokir oleh browser. Silakan izinkan pop-up untuk situs ini.');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      await loginAsDemo();
    } catch (err) {
      console.error(err);
      setError('Gagal memulai Mode Demo.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        try {
          await loginWithEmail(email, password);
        } catch (loginErr: unknown) {
          const msg = loginErr instanceof Error ? loginErr.message : String(loginErr);
          if (msg.includes('auth/operation-not-allowed')) {
            setShowActivationModal(true);
            throw new Error(
              'Provider Email/Password belum diaktifkan di Firebase Console. Buka panduan aktivasi di bawah atau gunakan Masuk 1-Klik dengan Google.'
            );
          } else if (
            msg.includes('auth/user-not-found') ||
            msg.includes('auth/invalid-credential') ||
            msg.includes('auth/invalid-login-credentials')
          ) {
            throw new Error(
              'Akun belum terdaftar atau kombinasi email/password salah. Silakan klik tab "Daftar Baru" atau gunakan "Masuk 1-Klik dengan Akun Google".'
            );
          } else if (msg.includes('auth/wrong-password')) {
            throw new Error('Password salah. Silakan periksa kembali kata sandi Anda.');
          } else {
            throw loginErr;
          }
        }
      } else if (mode === 'register') {
        if (password.length < 6) {
          throw new Error('Password minimal harus 6 karakter.');
        }
        if (password !== confirmPassword) {
          throw new Error('Konfirmasi password tidak cocok.');
        }
        try {
          await registerWithEmail(email, password);
          setSuccess('Pendaftaran berhasil! Akun Anda telah siap.');
        } catch (regErr: unknown) {
          const msg = regErr instanceof Error ? regErr.message : String(regErr);
          if (msg.includes('auth/operation-not-allowed')) {
            setShowActivationModal(true);
            throw new Error(
              'Pendaftaran email membutuhkan aktivasi provider Email di Firebase Console (proyek: river-nation-mpthm). Klik panduan di bawah atau gunakan Masuk 1-Klik dengan Google.'
            );
          }
          throw regErr;
        }
      } else if (mode === 'forgot') {
        await resetPasswordEmail(email);
        setSuccess('Tautan reset password telah dikirim ke email Anda. Silakan periksa inbox/spam.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan. Silakan coba lagi.';
      if (msg.includes('auth/email-already-in-use')) {
        setError('Email ini sudah terdaftar. Silakan langsung masuk di tab "Masuk Email".');
      } else if (msg.includes('auth/invalid-email')) {
        setError('Format penulisan email tidak valid.');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-950 to-slate-900 flex flex-col justify-between py-6 px-4 sm:px-6 lg:px-8 text-slate-100">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center pt-2">
        {/* App Logo */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 shadow-xl shadow-blue-500/25 mb-3">
          <span className="text-white text-2xl font-black">SP</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Surat Penawaran <span className="text-blue-400">Pro</span>
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-slate-300">
          SaaS Pembuat Surat Penawaran Resmi & PDF Premium Siap Kirim
        </p>
      </div>

      <div className="mt-4 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white text-slate-900 py-6 sm:py-8 px-5 sm:px-8 shadow-2xl rounded-3xl border border-slate-100">
          {/* PRIMARY: LOGIN 1-KLIK DENGAN GOOGLE (AKTIF & VERIFIKASI) */}
          <div className="mb-5">
            <div className="flex items-center justify-between text-[11px] font-extrabold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-100 mb-2.5">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Metode Masuk Utama (Instan & Aktif)</span>
              </div>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                ✓ Siap Pakai
              </span>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-black/15 active:scale-95 transition cursor-pointer disabled:opacity-50 group"
            >
              <svg className="w-5 h-5 shrink-0 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{loading ? 'Menghubungkan Akun...' : 'Masuk 1-Klik dengan Akun Google'}</span>
            </button>
            <p className="text-[11px] text-slate-500 text-center mt-1.5">
              Langsung masuk otomatis tanpa perlu mengingat atau mengatur password
            </p>
          </div>

          {/* OPSI DEMO CEPAT */}
          <div className="mb-5 p-2.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Laptop className="w-4 h-4 text-slate-500 shrink-0" />
              <div>
                <p className="text-xs font-bold text-slate-800">Coba Mode Demo (Tanpa Akun)</p>
                <p className="text-[10px] text-slate-500">Coba fitur & cetak PDF langsung di browser ini</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={loading}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-blue-700 text-xs font-bold border border-slate-200 shadow-2xs active:scale-95 transition cursor-pointer"
            >
              Masuk Demo
            </button>
          </div>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-2.5 text-slate-400 font-semibold">atau dengan akun email</span>
            </div>
          </div>

          {/* Tabs Email */}
          <div className="flex border-b border-slate-200 mb-3 pb-1">
            <button
              onClick={() => {
                setMode('login');
                setError(null);
                setSuccess(null);
              }}
              className={`flex-1 py-1.5 text-center text-xs font-bold transition border-b-2 cursor-pointer ${
                mode === 'login'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-400 hover:text-slate-700'
              }`}
            >
              Masuk Email
            </button>
            <button
              onClick={() => {
                setMode('register');
                setError(null);
                setSuccess(null);
              }}
              className={`flex-1 py-1.5 text-center text-xs font-bold transition border-b-2 cursor-pointer ${
                mode === 'register'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-400 hover:text-slate-700'
              }`}
            >
              Daftar Baru
            </button>
            <button
              onClick={() => {
                setMode('forgot');
                setError(null);
                setSuccess(null);
              }}
              className={`flex-1 py-1.5 text-center text-xs font-bold transition border-b-2 cursor-pointer ${
                mode === 'forgot'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-400 hover:text-slate-700'
              }`}
            >
              Lupa Password
            </button>
          </div>

          {/* Helper hint about email activation */}
          <div className="mb-3 flex items-center justify-between text-[11px] text-slate-500 bg-amber-50/70 p-2 rounded-xl border border-amber-200/60">
            <span className="text-amber-800">
              Provider email butuh aktivasi 1x di Firebase Console.
            </span>
            <button
              type="button"
              onClick={() => setShowActivationModal(true)}
              className="text-blue-600 font-bold hover:underline shrink-0 flex items-center gap-1 cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Cara Aktifkan</span>
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs space-y-2">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-snug">{error}</span>
              </div>
              {error.toLowerCase().includes('firebase console') && (
                <div className="pt-1 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowActivationModal(true)}
                    className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] transition cursor-pointer"
                  >
                    Buka Panduan & Link Aktivasi ↗
                  </button>
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 text-white font-bold text-[11px] transition cursor-pointer"
                  >
                    Pakai Google Saja
                  </button>
                </div>
              )}
            </div>
          )}

          {success && (
            <div className="mb-4 flex items-start gap-2.5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Alamat Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@perusahaan.co.id"
                  className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            {mode !== 'forgot' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Kata Sandi (Password)</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>
            )}

            {mode === 'register' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Konfirmasi Kata Sandi</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ulangi kata sandi"
                    className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/25 active:scale-95 transition cursor-pointer disabled:opacity-50"
            >
              <span>
                {loading
                  ? 'Memproses...'
                  : mode === 'login'
                  ? 'Masuk dengan Email'
                  : mode === 'register'
                  ? 'Daftar Akun Baru'
                  : 'Kirim Tautan Reset'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Security badges */}
        <div className="mt-4 flex flex-col items-center justify-center text-center gap-1.5 text-xs text-slate-400">
          <div className="flex items-center gap-1.5 text-blue-300 font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Sistem Multi-User Privat & Database Terenkripsi</span>
          </div>
          <p className="text-[11px] text-slate-400 max-w-xs">
            Setiap pengguna memiliki ruang data terisolasi berdasarkan akun masing-masing.
          </p>
        </div>
      </div>

      {/* CREATED BY JAMHUR - LINK WA */}
      <footer className="mt-6 text-center pb-2">
        <a
          href="https://wa.me/628179015181?text=Halo%20Jamhur,%20saya%20menghubungi%20mengenai%20aplikasi%20Surat%20Penawaran"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-blue-200 hover:text-white border border-white/15 text-xs font-semibold backdrop-blur-xs transition shadow-sm"
        >
          <MessageCircle className="w-4 h-4 text-emerald-400" />
          <span>
            Created by <strong className="text-white">jamhur</strong> (WhatsApp: 628179015181)
          </span>
        </a>
      </footer>

      {/* MODAL: PANDUAN AKTIVASI EMAIL PROVIDER DI FIREBASE CONSOLE */}
      {showActivationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white text-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowActivationModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center">
                <HelpCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 leading-tight">
                  Aktivasi Provider Email di Firebase
                </h3>
                <p className="text-xs text-slate-500">
                  Proyek: <strong className="text-slate-800 font-mono">river-nation-mpthm</strong>
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-600">
              <p>
                Secara default di Firebase, hanya <strong>Google Login</strong> yang aktif otomatis. Untuk mengizinkan pendaftaran menggunakan <strong>Email & Password</strong>, Anda cukup mengaktifkannya sekali di Firebase Console:
              </p>

              <div className="space-y-2 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </span>
                  <div>
                    <strong className="text-slate-900">Buka Halaman Sign-in Providers:</strong>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Klik tombol biru di bawah untuk membuka tab Authentication proyek Anda.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </span>
                  <div>
                    <strong className="text-slate-900">Pilih "Email/Password":</strong>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Pada daftar Sign-in providers, klik baris bertuliskan <strong>Email/Password</strong>.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </span>
                  <div>
                    <strong className="text-slate-900">Aktifkan Toggle & Simpan:</strong>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Geser tombol sakelar <strong>Enable</strong> pertama menjadi AKTIF, lalu klik tombol biru <strong>Save</strong> di pojok kanan bawah modal.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <a
                  href={firebaseConsoleUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/25 transition active:scale-95 text-center cursor-pointer"
                >
                  <span>Buka Firebase Console Sign-In Provider</span>
                  <ExternalLink className="w-4 h-4" />
                </a>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowActivationModal(false);
                      handleGoogleLogin();
                    }}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition cursor-pointer"
                  >
                    Masuk Google (Instan)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowActivationModal(false);
                      handleDemoLogin();
                    }}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition cursor-pointer"
                  >
                    Gunakan Mode Demo
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
