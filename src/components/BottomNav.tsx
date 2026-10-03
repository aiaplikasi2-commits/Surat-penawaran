import React from 'react';
import { LayoutDashboard, FileText, Plus, Users, Settings } from 'lucide-react';

interface BottomNavProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onNewQuotation: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onSelectTab,
  onNewQuotation,
}) => {
  const tabs = [
    { id: 'dashboard', label: 'Beranda', icon: LayoutDashboard },
    { id: 'quotations', label: 'Surat', icon: FileText },
    // Center FAB placeholder
    { id: 'customers', label: 'Pelanggan', icon: Users },
    { id: 'settings', label: 'Pengaturan', icon: Settings },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around h-16 relative px-2">
        {/* Tab 1: Dashboard */}
        <button
          onClick={() => onSelectTab('dashboard')}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition cursor-pointer ${
            currentTab === 'dashboard' ? 'text-blue-600 font-bold' : 'text-slate-500 font-medium'
          }`}
        >
          <LayoutDashboard className={`w-5 h-5 ${currentTab === 'dashboard' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[10px] mt-1">Beranda</span>
        </button>

        {/* Tab 2: Quotations */}
        <button
          onClick={() => onSelectTab('quotations')}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition cursor-pointer ${
            currentTab === 'quotations' ? 'text-blue-600 font-bold' : 'text-slate-500 font-medium'
          }`}
        >
          <FileText className={`w-5 h-5 ${currentTab === 'quotations' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[10px] mt-1">Surat</span>
        </button>

        {/* Center Floating Action Button (FAB) for Quick Quotation Creation */}
        <div className="flex-1 flex justify-center -mt-6">
          <button
            onClick={onNewQuotation}
            className="w-13 h-13 rounded-full bg-gradient-to-tr from-blue-700 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/35 border-4 border-white active:scale-95 transition cursor-pointer"
            title="Buat Surat Penawaran Baru"
          >
            <Plus className="w-6 h-6 stroke-[3]" />
          </button>
        </div>

        {/* Tab 3: Customers */}
        <button
          onClick={() => onSelectTab('customers')}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition cursor-pointer ${
            currentTab === 'customers' ? 'text-blue-600 font-bold' : 'text-slate-500 font-medium'
          }`}
        >
          <Users className={`w-5 h-5 ${currentTab === 'customers' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[10px] mt-1">Pelanggan</span>
        </button>

        {/* Tab 4: Settings / More */}
        <button
          onClick={() => onSelectTab('settings')}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition cursor-pointer ${
            currentTab === 'settings' ? 'text-blue-600 font-bold' : 'text-slate-500 font-medium'
          }`}
        >
          <Settings className={`w-5 h-5 ${currentTab === 'settings' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[10px] mt-1">Pengaturan</span>
        </button>
      </div>
    </div>
  );
};
