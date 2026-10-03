import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { useAuth } from './AuthContext';
import {
  CompanyProfile,
  Customer,
  Quotation,
  QuotationTemplate,
  UserSettings,
} from '../types';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  };
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): FirestoreErrorInfo {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path,
  };
  if (errInfo.error.toLowerCase().includes('permission') || errInfo.error.toLowerCase().includes('insufficient')) {
    console.warn('Firestore Permission notice (waiting for Rules publish):', JSON.stringify(errInfo));
  } else {
    console.error('Firestore Error: ', JSON.stringify(errInfo));
  }
  return errInfo;
}

interface DataContextType {
  companies: CompanyProfile[];
  customers: Customer[];
  quotations: Quotation[];
  templates: QuotationTemplate[];
  settings: UserSettings | null;
  loading: boolean;
  rulesPermissionError: boolean;
  dismissRulesError: () => void;
  // Companies
  saveCompany: (company: Partial<CompanyProfile>) => Promise<string>;
  deleteCompany: (id: string) => Promise<void>;
  setDefaultCompany: (id: string) => Promise<void>;
  // Customers
  saveCustomer: (customer: Partial<Customer>) => Promise<string>;
  deleteCustomer: (id: string) => Promise<void>;
  // Quotations
  saveQuotation: (quotation: Partial<Quotation>) => Promise<string>;
  updateQuotationStatus: (id: string, status: Quotation['status']) => Promise<void>;
  deleteQuotation: (id: string) => Promise<void>;
  duplicateQuotation: (quotation: Quotation) => Promise<string>;
  // Templates
  saveTemplate: (tmpl: Partial<QuotationTemplate>) => Promise<string>;
  deleteTemplate: (id: string) => Promise<void>;
  // Settings
  updateSettings: (newSettings: Partial<UserSettings>) => Promise<void>;
  // Backup / Restore
  exportDataJson: () => string;
  importDataJson: (jsonStr: string) => Promise<{ count: number }>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [companies, setCompanies] = useState<CompanyProfile[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [templates, setTemplates] = useState<QuotationTemplate[]>([]);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [rulesPermissionError, setRulesPermissionError] = useState(false);

  // Real-time synchronization with Firestore (STRICT USER OWNERSHIP)
  useEffect(() => {
    if (!user) {
      setCompanies([]);
      setCustomers([]);
      setQuotations([]);
      setTemplates([]);
      setSettings(null);
      setLoading(false);
      setRulesPermissionError(false);
      return;
    }

    setLoading(true);
    const userId = user.uid;

    // Instant local cache load for zero-latency offline resilience
    try {
      const cComp = localStorage.getItem('sp_companies_' + userId);
      if (cComp) setCompanies(JSON.parse(cComp));
      const cCust = localStorage.getItem('sp_customers_' + userId);
      if (cCust) setCustomers(JSON.parse(cCust));
      const cQuot = localStorage.getItem('sp_quotations_' + userId);
      if (cQuot) setQuotations(JSON.parse(cQuot));
      const cTmpl = localStorage.getItem('sp_templates_' + userId);
      if (cTmpl) setTemplates(JSON.parse(cTmpl));
      const cSett = localStorage.getItem('sp_settings_' + userId);
      if (cSett) setSettings(JSON.parse(cSett));
    } catch {
      // ignore
    }

    // Demo Mode handling
    if (user.isDemo) {
      try {
        const storedComp = localStorage.getItem('sp_companies_' + userId);
        if (!storedComp || JSON.parse(storedComp).length === 0) {
          const starterCompany: CompanyProfile = {
            id: 'comp_demo_default',
            userId,
            name: 'PT KARYA TEKNIK MANDIRI',
            address: 'Jl. Merdeka Pratama No. 88, Kawasan Niaga Barat',
            city: 'Jakarta Selatan',
            postalCode: '12870',
            phone: '021-7890123',
            whatsapp: '08179015181',
            email: 'kontak@karyateknik.co.id',
            website: 'www.karyateknik.co.id',
            npwp: '01.234.567.8-012.000',
            directorName: 'Jamhur, S.T.',
            directorTitle: 'Direktur Utama',
            isDefault: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          setCompanies([starterCompany]);
          localStorage.setItem('sp_companies_' + userId, JSON.stringify([starterCompany]));
        }

        const storedSett = localStorage.getItem('sp_settings_' + userId);
        if (!storedSett) {
          const initSettings: UserSettings = {
            userId,
            numberFormat: '{Nomor}/SP/KTM/{BulanRomawi}/{Tahun}',
            currentSequence: 1,
            sessionTimeoutMinutes: 30,
          };
          setSettings(initSettings);
          localStorage.setItem('sp_settings_' + userId, JSON.stringify(initSettings));
        }
      } catch {
        // ignore
      }

      setLoading(false);
      return;
    }

    const onListenerError = (err: unknown, op: OperationType, path: string) => {
      const info = handleFirestoreError(err, op, path);
      if (info.error.toLowerCase().includes('permission') || info.error.toLowerCase().includes('insufficient')) {
        setRulesPermissionError(true);
      }
      setLoading(false);
    };

    // 1. Companies / Profil Kop Surat (Hanya milik user yang sedang login)
    const compQ = query(collection(db, 'companies'), where('userId', '==', userId));
    const unsubComp = onSnapshot(
      compQ,
      (snap) => {
        const list: CompanyProfile[] = [];
        snap.forEach((d) => list.push(d.data() as CompanyProfile));
        setCompanies(list);
        try { localStorage.setItem('sp_companies_' + userId, JSON.stringify(list)); } catch {}
      },
      (err) => onListenerError(err, OperationType.LIST, 'companies')
    );

    // 2. Customers / Pelanggan (Hanya milik user yang sedang login)
    const custQ = query(collection(db, 'customers'), where('userId', '==', userId));
    const unsubCust = onSnapshot(
      custQ,
      (snap) => {
        const list: Customer[] = [];
        snap.forEach((d) => list.push(d.data() as Customer));
        setCustomers(list);
        try { localStorage.setItem('sp_customers_' + userId, JSON.stringify(list)); } catch {}
      },
      (err) => onListenerError(err, OperationType.LIST, 'customers')
    );

    // 3. Quotations / Surat Penawaran (Hanya milik user yang sedang login)
    const quotQ = query(collection(db, 'quotations'), where('userId', '==', userId));
    const unsubQuot = onSnapshot(
      quotQ,
      (snap) => {
        const list: Quotation[] = [];
        snap.forEach((d) => list.push(d.data() as Quotation));
        list.sort((a, b) => new Date(b.createdAt || b.date).getTime() - new Date(a.createdAt || a.date).getTime());
        setQuotations(list);
        try { localStorage.setItem('sp_quotations_' + userId, JSON.stringify(list)); } catch {}
        setLoading(false);
      },
      (err) => onListenerError(err, OperationType.LIST, 'quotations')
    );

    // 4. Templates
    const tmplQ = query(collection(db, 'templates'), where('userId', '==', userId));
    const unsubTmpl = onSnapshot(
      tmplQ,
      (snap) => {
        const list: QuotationTemplate[] = [];
        snap.forEach((d) => list.push(d.data() as QuotationTemplate));
        setTemplates(list);
        try { localStorage.setItem('sp_templates_' + userId, JSON.stringify(list)); } catch {}
      },
      (err) => onListenerError(err, OperationType.LIST, 'templates')
    );

    // 5. Settings (Format penomoran surat user)
    const unsubSettings = onSnapshot(
      doc(db, 'settings', userId),
      (snap) => {
        if (snap.exists()) {
          const s = snap.data() as UserSettings;
          setSettings(s);
          try { localStorage.setItem('sp_settings_' + userId, JSON.stringify(s)); } catch {}
        } else {
          const initSettings: UserSettings = {
            userId,
            numberFormat: '{Nomor}/SP/{BulanRomawi}/{Tahun}',
            currentSequence: 1,
            sessionTimeoutMinutes: 30,
          };
          setSettings(initSettings);
        }
      },
      (err) => onListenerError(err, OperationType.GET, `settings/${userId}`)
    );

    return () => {
      unsubComp();
      unsubCust();
      unsubQuot();
      unsubTmpl();
      unsubSettings();
    };
  }, [user]);

  // Company Actions
  const saveCompany = async (companyData: Partial<CompanyProfile>): Promise<string> => {
    if (!user) throw new Error('Unauthenticated');
    const id = companyData.id || 'comp_' + Date.now();
    const isFirst = companies.length === 0;

    const data: CompanyProfile = {
      id,
      userId: user.uid,
      name: companyData.name || '',
      address: companyData.address || '',
      city: companyData.city || '',
      postalCode: companyData.postalCode || '',
      phone: companyData.phone || '',
      whatsapp: companyData.whatsapp || '',
      email: companyData.email || '',
      website: companyData.website || '',
      npwp: companyData.npwp || '',
      directorName: companyData.directorName || '',
      directorTitle: companyData.directorTitle || 'Direktur',
      logoUrl: companyData.logoUrl || '',
      signatureUrl: companyData.signatureUrl || '',
      stampUrl: companyData.stampUrl || '',
      backgroundUrl: companyData.backgroundUrl || '',
      isDefault: companyData.isDefault ?? isFirst,
      logoPosition: companyData.logoPosition || 'left',
      logoSize: companyData.logoSize ?? 26,
      companyNameSize: companyData.companyNameSize ?? 18,
      companyDetailsSize: companyData.companyDetailsSize ?? 9.5,
      headerAlignment: companyData.headerAlignment || 'center',
      letterheadDividerStyle: companyData.letterheadDividerStyle || 'double',
      logoOffsetX: companyData.logoOffsetX ?? 0,
      logoOffsetY: companyData.logoOffsetY ?? 0,
      logoScalePercent: companyData.logoScalePercent ?? 100,
      createdAt: companyData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Optimistic local update
    setCompanies((prev) => {
      const idx = prev.findIndex((c) => c.id === id);
      const next = idx >= 0 ? prev.map((c) => (c.id === id ? data : c)) : [data, ...prev];
      try { localStorage.setItem('sp_companies_' + user.uid, JSON.stringify(next)); } catch {}
      return next;
    });

    if (user.isDemo) return id;

    try {
      await setDoc(doc(db, 'companies', id), data);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `companies/${id}`);
    }
    return id;
  };

  const deleteCompany = async (id: string) => {
    setCompanies((prev) => {
      const next = prev.filter((c) => c.id !== id);
      try { localStorage.setItem('sp_companies_' + (user?.uid || ''), JSON.stringify(next)); } catch {}
      return next;
    });
    if (user?.isDemo) return;
    try {
      await deleteDoc(doc(db, 'companies', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `companies/${id}`);
    }
  };

  const setDefaultCompany = async (id: string) => {
    setCompanies((prev) => {
      const next = prev.map((c) => ({ ...c, isDefault: c.id === id }));
      try { localStorage.setItem('sp_companies_' + (user?.uid || ''), JSON.stringify(next)); } catch {}
      return next;
    });
    if (user?.isDemo) return;
    for (const comp of companies) {
      try {
        await updateDoc(doc(db, 'companies', comp.id), {
          isDefault: comp.id === id,
          updatedAt: new Date().toISOString(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `companies/${comp.id}`);
      }
    }
  };

  // Customer Actions
  const saveCustomer = async (custData: Partial<Customer>): Promise<string> => {
    if (!user) throw new Error('Unauthenticated');
    const id = custData.id || 'cust_' + Date.now();
    const data: Customer = {
      id,
      userId: user.uid,
      name: custData.name || '',
      companyName: custData.companyName || '',
      pic: custData.pic || '',
      address: custData.address || '',
      phone: custData.phone || '',
      whatsapp: custData.whatsapp || '',
      email: custData.email || '',
      notes: custData.notes || '',
      createdAt: custData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setCustomers((prev) => {
      const idx = prev.findIndex((c) => c.id === id);
      const next = idx >= 0 ? prev.map((c) => (c.id === id ? data : c)) : [data, ...prev];
      try { localStorage.setItem('sp_customers_' + user.uid, JSON.stringify(next)); } catch {}
      return next;
    });

    if (user.isDemo) return id;

    try {
      await setDoc(doc(db, 'customers', id), data);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `customers/${id}`);
    }
    return id;
  };

  const deleteCustomer = async (id: string) => {
    setCustomers((prev) => {
      const next = prev.filter((c) => c.id !== id);
      try { localStorage.setItem('sp_customers_' + (user?.uid || ''), JSON.stringify(next)); } catch {}
      return next;
    });
    if (user?.isDemo) return;
    try {
      await deleteDoc(doc(db, 'customers', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `customers/${id}`);
    }
  };

  // Quotation Actions
  const saveQuotation = async (qData: Partial<Quotation>): Promise<string> => {
    if (!user) throw new Error('Unauthenticated');
    const id = qData.id || 'quot_' + Date.now();
    const data: Quotation = {
      id,
      userId: user.uid,
      quotationNumber: qData.quotationNumber || 'SP-001',
      date: qData.date || new Date().toISOString().slice(0, 10),
      attachment: qData.attachment || '',
      hasAttachment: qData.hasAttachment ?? Boolean(qData.attachment && qData.attachment.trim()),
      toRecipient: qData.toRecipient || '',
      customerCompany: qData.customerCompany || '',
      customerPic: qData.customerPic || '',
      customerAddress: qData.customerAddress || '',
      customerPhone: qData.customerPhone || '',
      customerEmail: qData.customerEmail || '',
      subject: qData.subject || 'Surat Penawaran Harga',
      companyProfileId: qData.companyProfileId || '',
      companySnapshot: qData.companySnapshot || {},
      openingText: qData.openingText || '',
      closingText: qData.closingText || '',
      items: qData.items || [],
      subtotal: Number(qData.subtotal) || 0,
      discountType: qData.discountType || 'percent',
      discountValue: Number(qData.discountValue) || 0,
      discountAmount: Number(qData.discountAmount) || 0,
      ppnPercent: Number(qData.ppnPercent) || 0,
      ppnAmount: Number(qData.ppnAmount) || 0,
      hasTradeIn: qData.hasTradeIn ?? false,
      tradeInTitle: qData.tradeInTitle || '',
      tradeInAmount: Number(qData.tradeInAmount) || 0,
      tradeInDescription: qData.tradeInDescription || '',
      validityPeriod: qData.validityPeriod || '',
      paymentScheme: qData.paymentScheme || '',
      grandTotal: Number(qData.grandTotal) || 0,
      terbilang: qData.terbilang || '',
      additionalNotes: qData.additionalNotes || '',
      status: qData.status || 'draft',
      createdAt: qData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setQuotations((prev) => {
      const idx = prev.findIndex((q) => q.id === id);
      const next = idx >= 0 ? prev.map((q) => (q.id === id ? data : q)) : [data, ...prev];
      next.sort((a, b) => new Date(b.createdAt || b.date).getTime() - new Date(a.createdAt || a.date).getTime());
      try { localStorage.setItem('sp_quotations_' + user.uid, JSON.stringify(next)); } catch {}
      return next;
    });

    if (settings && (!qData.id || qData.id.startsWith('quot_'))) {
      const nextSeq = (settings.currentSequence || 1) + 1;
      setSettings((prev) => {
        if (!prev) return null;
        const updated = { ...prev, currentSequence: nextSeq };
        try { localStorage.setItem('sp_settings_' + user.uid, JSON.stringify(updated)); } catch {}
        return updated;
      });
    }

    if (user.isDemo) return id;

    try {
      await setDoc(doc(db, 'quotations', id), data);

      if (settings && (!qData.id || qData.id.startsWith('quot_'))) {
        await updateDoc(doc(db, 'settings', user.uid), {
          currentSequence: (settings.currentSequence || 1) + 1,
          updatedAt: new Date().toISOString(),
        });
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `quotations/${id}`);
    }
    return id;
  };

  const updateQuotationStatus = async (id: string, status: Quotation['status']) => {
    setQuotations((prev) => {
      const next = prev.map((q) => (q.id === id ? { ...q, status, updatedAt: new Date().toISOString() } : q));
      try { localStorage.setItem('sp_quotations_' + (user?.uid || ''), JSON.stringify(next)); } catch {}
      return next;
    });
    if (user?.isDemo) return;
    try {
      await updateDoc(doc(db, 'quotations', id), {
        status,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `quotations/${id}`);
    }
  };

  const deleteQuotation = async (id: string) => {
    setQuotations((prev) => {
      const next = prev.filter((c) => c.id !== id);
      try { localStorage.setItem('sp_quotations_' + (user?.uid || ''), JSON.stringify(next)); } catch {}
      return next;
    });
    if (user?.isDemo) return;
    try {
      await deleteDoc(doc(db, 'quotations', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `quotations/${id}`);
    }
  };

  const duplicateQuotation = async (original: Quotation): Promise<string> => {
    const newId = 'quot_' + Date.now();
    const duplicated: Quotation = {
      ...original,
      id: newId,
      quotationNumber: `${original.quotationNumber}-COPY`,
      date: new Date().toISOString().slice(0, 10),
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setQuotations((prev) => {
      const next = [duplicated, ...prev];
      try { localStorage.setItem('sp_quotations_' + (user?.uid || ''), JSON.stringify(next)); } catch {}
      return next;
    });
    if (user?.isDemo) return newId;
    try {
      await setDoc(doc(db, 'quotations', newId), duplicated);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `quotations/${newId}`);
    }
    return newId;
  };

  // Templates
  const saveTemplate = async (tmpl: Partial<QuotationTemplate>): Promise<string> => {
    if (!user) throw new Error('Unauthenticated');
    const id = tmpl.id || 'tmpl_' + Date.now();
    const data: QuotationTemplate = {
      id,
      userId: user.uid,
      title: tmpl.title || 'Template Baru',
      type: tmpl.type || 'opening',
      content: tmpl.content || '',
      createdAt: tmpl.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setTemplates((prev) => {
      const idx = prev.findIndex((t) => t.id === id);
      const next = idx >= 0 ? prev.map((t) => (t.id === id ? data : t)) : [data, ...prev];
      try { localStorage.setItem('sp_templates_' + user.uid, JSON.stringify(next)); } catch {}
      return next;
    });

    if (user.isDemo) return id;

    try {
      await setDoc(doc(db, 'templates', id), data);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `templates/${id}`);
    }
    return id;
  };

  const deleteTemplate = async (id: string) => {
    setTemplates((prev) => {
      const next = prev.filter((c) => c.id !== id);
      try { localStorage.setItem('sp_templates_' + (user?.uid || ''), JSON.stringify(next)); } catch {}
      return next;
    });
    if (user?.isDemo) return;
    try {
      await deleteDoc(doc(db, 'templates', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `templates/${id}`);
    }
  };

  // Settings
  const updateSettings = async (newSettings: Partial<UserSettings>) => {
    if (!user) return;
    setSettings((prev) => {
      const updated = prev ? { ...prev, ...newSettings } : ({ userId: user.uid, ...newSettings } as UserSettings);
      try { localStorage.setItem('sp_settings_' + user.uid, JSON.stringify(updated)); } catch {}
      return updated;
    });
    if (user.isDemo) return;
    try {
      await setDoc(
        doc(db, 'settings', user.uid),
        {
          userId: user.uid,
          ...newSettings,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `settings/${user.uid}`);
    }
  };

  // Backup & Restore
  const exportDataJson = (): string => {
    const payload = {
      exportedAt: new Date().toISOString(),
      app: 'SuratPenawaranPro',
      userId: user?.uid,
      companies,
      customers,
      quotations,
      templates,
      settings,
    };
    return JSON.stringify(payload, null, 2);
  };

  const importDataJson = async (jsonStr: string): Promise<{ count: number }> => {
    if (!user) throw new Error('Unauthenticated');
    const parsed = JSON.parse(jsonStr);
    let count = 0;

    if (Array.isArray(parsed.companies)) {
      for (const comp of parsed.companies) {
        await saveCompany({ ...comp, userId: user.uid });
        count++;
      }
    }
    if (Array.isArray(parsed.customers)) {
      for (const cust of parsed.customers) {
        await saveCustomer({ ...cust, userId: user.uid });
        count++;
      }
    }
    if (Array.isArray(parsed.quotations)) {
      for (const q of parsed.quotations) {
        await saveQuotation({ ...q, userId: user.uid });
        count++;
      }
    }
    return { count };
  };

  return (
    <DataContext.Provider
      value={{
        companies,
        customers,
        quotations,
        templates,
        settings,
        loading,
        rulesPermissionError,
        dismissRulesError: () => setRulesPermissionError(false),
        saveCompany,
        deleteCompany,
        setDefaultCompany,
        saveCustomer,
        deleteCustomer,
        saveQuotation,
        updateQuotationStatus,
        deleteQuotation,
        duplicateQuotation,
        saveTemplate,
        deleteTemplate,
        updateSettings,
        exportDataJson,
        importDataJson,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
