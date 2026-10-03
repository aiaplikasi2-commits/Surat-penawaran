import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { PWAInstallButton } from './PWAInstallButton';
import {
  FileText,
  LogOut,
  Shield,
  Building2,
  Users,
  Settings,
  Plus,
  Menu,
  X,
  Clock,
  MessageCircle,
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onNewQuotation: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onSelectTab, onNewQuotation }) => {
  const { user, logout, sessionRemainingSeconds } = useAuth();
  const { companies } = useData();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const defaultComp = companies.find((c) => c.isDefault) || companies[0];

  const formatRemaining = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: FileText },
    { id: 'quotations', label: 'Surat Penawaran', icon: FileText },
    { id: 'customers', label: 'Pelanggan', icon: Users },
    { id: 'companies', label: 'Kop Surat', icon: Building2 },
    { id: 'settings', label: 'Pengaturan', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onSelectTab('dashboard')}
              className="flex items-center gap-2.5 text-left group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 flex items-center justify-center text-white font-black text-lg shadow-md shadow-blue-500/20 group-hover:scale-105 transition">
                SP
              </div>
              <div className="hidden xs:block">
                <span className="text-base font-extrabold text-slate-900 tracking-tight leading-none block">
                  Penawaran<span className="text-blue-600">Pro</span>
                </span>
                <span className="text-[10px] font-semibold text-slate-500 tracking-wider uppercase block mt-0.5 truncate max-w-[160px]">
                  {defaultComp ? defaultComp.name : 'PWA Surat Resmi'}
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Nav Items */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-extrabold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Created by jamhur - WA link */}
            <a
              href="https://wa.me/628179015181?text=Halo%20Jamhur,%20saya%20menghubungi%20mengenai%20aplikasi%20Surat%20Penawaran"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[11px] font-bold transition active:scale-95 cursor-pointer"
              title="Hubungi Pengembang Aplikasi"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>Created by jamhur</span>
            </a>

            {/* Quick Action: Buat Surat Penawaran */}
            <button
              onClick={onNewQuotation}
              className="hidden sm:flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 text-xs font-bold shadow-md shadow-blue-600/25 active:scale-95 transition cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Buat Penawaran</span>
            </button>

            {/* PWA Install Button */}
            <PWAInstallButton variant="header" />

            {/* Auto-logout Inactivity indicator */}
            {user && (
              <div
                className="hidden xl:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-[11px] font-medium border border-slate-200"
                title="Sisa waktu sesi aktif sebelum auto-logout"
              >
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{formatRemaining(sessionRemainingSeconds)}</span>
              </div>
            )}

            {/* User Profile / Logout */}
            {user ? (
              <div className="flex items-center gap-2">
                <div className="hidden md:flex flex-col text-right">
                  {user.isDemo ? (
                    <>
                      <span className="text-xs font-bold text-amber-700 leading-tight max-w-[130px] truncate">
                        Mode Demo
                      </span>
                      <span className="text-[10px] text-amber-600 font-semibold flex items-center justify-end gap-1">
                        Penyimpanan Lokal
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-xs font-bold text-slate-800 leading-tight max-w-[130px] truncate">
                        {user.email?.split('@')[0]}
                      </span>
                      <span className="text-[10px] text-emerald-600 font-semibold flex items-center justify-end gap-1">
                        <Shield className="w-2.5 h-2.5" /> Terenkripsi
                      </span>
                    </>
                  )}
                </div>
                <button
                  onClick={logout}
                  className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                  title="Logout & Hapus Sesi Lokal"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : null}

            {/* Mobile Hamburger toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-2 shadow-xl animate-in slide-in-from-top-2">
          {defaultComp && (
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 mb-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-900 truncate">{defaultComp.name}</p>
                <p className="text-[10px] text-slate-500">Kop Surat Utama</p>
              </div>
            </div>
          )}

          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onNewQuotation();
            }}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 text-white py-2.5 text-xs font-bold shadow-md shadow-blue-600/25 active:scale-95 transition"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Buat Surat Penawaran Baru</span>
          </button>

          <div className="grid grid-cols-2 gap-2 pt-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            <a
              href="https://wa.me/628179015181?text=Halo%20Jamhur,%20saya%20menghubungi%20mengenai%20aplikasi%20Surat%20Penawaran"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 p-2 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              <span>Created by jamhur (WA: 628179015181)</span>
            </a>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
              <span className="flex items-center gap-1 font-medium">
                <Clock className="w-3.5 h-3.5 text-blue-600" /> Auto Logout: {formatRemaining(sessionRemainingSeconds)}
              </span>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="flex items-center gap-1 text-rose-600 font-bold hover:underline"
              >
                <LogOut className="w-3.5 h-3.5" /> Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
