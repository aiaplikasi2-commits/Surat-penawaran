import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { OfflineIndicator } from './components/OfflineIndicator';
import { RulesNoticeBanner } from './components/RulesNoticeBanner';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { QuotationsPage } from './pages/QuotationsPage';
import { QuotationEditorPage } from './pages/QuotationEditorPage';
import { QuotationPreviewModal } from './pages/QuotationPreviewModal';
import { CompaniesPage } from './pages/CompaniesPage';
import { CustomersPage } from './pages/CustomersPage';
import { SettingsPage } from './pages/SettingsPage';
import { Quotation } from './types';

function MainApp() {
  const { user, loading } = useAuth();

  // Navigation State
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingQuotation, setEditingQuotation] = useState<Quotation | null>(null);
  const [previewQuotation, setPreviewQuotation] = useState<Quotation | null>(null);

  // Splash Loading Screen
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white p-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-2xl font-black shadow-xl shadow-blue-500/30 animate-pulse mb-4">
          SP
        </div>
        <h2 className="text-lg font-black tracking-tight">Surat Penawaran Pro</h2>
        <p className="text-xs text-slate-400 mt-1">Menyiapkan cloud database & keamanan dokumen...</p>
      </div>
    );
  }

  // Unauthenticated Flow
  if (!user) {
    return <AuthPage />;
  }

  // Handlers
  const handleNewQuotation = () => {
    setEditingQuotation(null);
    setIsEditorOpen(true);
  };

  const handleEditQuotation = (q: Quotation) => {
    setEditingQuotation(q);
    setIsEditorOpen(true);
    setPreviewQuotation(null);
  };

  const handleSavedQuotation = (q: Quotation) => {
    setIsEditorOpen(false);
    setEditingQuotation(null);
    setCurrentTab('quotations');
    // Open preview immediately so user can review & send PDF
    setPreviewQuotation(q);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col antialiased selection:bg-blue-600 selection:text-white">
      {/* Offline Status Indicator */}
      <OfflineIndicator />

      {/* Main Top Header */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setIsEditorOpen(false);
          setCurrentTab(tab);
        }}
        onNewQuotation={handleNewQuotation}
      />

      {/* Database Permission Notice if rules not yet deployed in user's project */}
      <RulesNoticeBanner />

      {/* Page Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        {isEditorOpen ? (
          <QuotationEditorPage
            initialQuotation={editingQuotation}
            onBack={() => setIsEditorOpen(false)}
            onSaved={handleSavedQuotation}
            onPreview={(q) => setPreviewQuotation(q)}
            onNavigateToCompanies={() => {
              setIsEditorOpen(false);
              setCurrentTab('companies');
            }}
          />
        ) : (
          <>
            {currentTab === 'dashboard' && (
              <DashboardPage
                onNewQuotation={handleNewQuotation}
                onViewQuotation={(q) => setPreviewQuotation(q)}
                onEditQuotation={handleEditQuotation}
                onNavigateTab={(tab) => setCurrentTab(tab)}
              />
            )}
            {currentTab === 'quotations' && (
              <QuotationsPage
                onNewQuotation={handleNewQuotation}
                onEditQuotation={handleEditQuotation}
                onViewQuotation={(q) => setPreviewQuotation(q)}
              />
            )}
            {currentTab === 'customers' && <CustomersPage />}
            {currentTab === 'companies' && <CompaniesPage />}
            {currentTab === 'settings' && <SettingsPage />}
          </>
        )}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      {!isEditorOpen && (
        <BottomNav
          currentTab={currentTab}
          onSelectTab={(tab) => setCurrentTab(tab)}
          onNewQuotation={handleNewQuotation}
        />
      )}

      {/* Interactive Quotation PDF Preview & Action Modal */}
      {previewQuotation && (
        <QuotationPreviewModal
          quotation={previewQuotation}
          onClose={() => setPreviewQuotation(null)}
          onEdit={(q) => {
            setPreviewQuotation(null);
            handleEditQuotation(q);
          }}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <MainApp />
      </DataProvider>
    </AuthProvider>
  );
}
