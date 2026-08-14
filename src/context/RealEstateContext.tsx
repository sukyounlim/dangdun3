import React, { createContext, useContext, useState, useEffect } from 'react';
import { CustomerConsultation, Property, TabType, MatchEvaluation } from '../types';
import { INITIAL_CUSTOMERS, INITIAL_PROPERTIES } from '../data/initialData';
import { evaluateCustomerPropertyMatch } from '../utils/matchingEngine';

interface RealEstateContextType {
  customers: CustomerConsultation[];
  properties: Property[];
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  // Customer CRUD
  addCustomer: (customer: Omit<CustomerConsultation, 'id' | 'createdAt' | 'updatedAt'>) => CustomerConsultation;
  updateCustomer: (id: string, updates: Partial<CustomerConsultation>) => void;
  deleteCustomer: (id: string) => void;
  // Property CRUD
  addProperty: (property: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>) => Property;
  updateProperty: (id: string, updates: Partial<Property>) => void;
  deleteProperty: (id: string) => void;
  // Comparison State
  selectedCustomerId: string | null;
  setSelectedCustomerId: (id: string | null) => void;
  selectedPropertyId: string | null;
  setSelectedPropertyId: (id: string | null) => void;
  startComparisonWithCustomer: (customerId: string) => void;
  startComparisonWithProperty: (propertyId: string) => void;
  // Data management
  resetToSampleData: () => void;
  exportDataJson: () => void;
  importDataJson: (jsonString: string) => boolean;
  // Toast notifications
  toastMessage: string | null;
  showToast: (msg: string) => void;
  // Computed helpers
  getMatchesForCustomer: (customerId: string) => MatchEvaluation[];
  getMatchesForProperty: (propertyId: string) => MatchEvaluation[];
}

const RealEstateContext = createContext<RealEstateContextType | undefined>(undefined);

const CUSTOMERS_KEY = 'real_estate_crm_customers_v1';
const PROPERTIES_KEY = 'real_estate_crm_properties_v1';

export const RealEstateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [customers, setCustomers] = useState<CustomerConsultation[]>(() => {
    try {
      const saved = localStorage.getItem(CUSTOMERS_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load customers from storage', e);
    }
    return INITIAL_CUSTOMERS;
  });

  const [properties, setProperties] = useState<Property[]>(() => {
    try {
      const saved = localStorage.getItem(PROPERTIES_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load properties from storage', e);
    }
    return INITIAL_PROPERTIES;
  });

  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(INITIAL_CUSTOMERS[0]?.id || null);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(INITIAL_PROPERTIES[0]?.id || null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Auto-persist
  useEffect(() => {
    try {
      localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(customers));
    } catch (e) {
      console.error('Failed to persist customers', e);
    }
  }, [customers]);

  useEffect(() => {
    try {
      localStorage.setItem(PROPERTIES_KEY, JSON.stringify(properties));
    } catch (e) {
      console.error('Failed to persist properties', e);
    }
  }, [properties]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3000);
  };

  // Customer handlers
  const addCustomer = (data: Omit<CustomerConsultation, 'id' | 'createdAt' | 'updatedAt'>): CustomerConsultation => {
    const newCustomer: CustomerConsultation = {
      ...data,
      id: `cust-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setCustomers((prev) => [newCustomer, ...prev]);
    showToast(`'${newCustomer.name}' 고객 상담이 등록되었습니다.`);
    return newCustomer;
  };

  const updateCustomer = (id: string, updates: Partial<CustomerConsultation>) => {
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, ...updates, updatedAt: new Date().toISOString() }
          : c
      )
    );
    showToast('고객 상담 정보가 수정되었습니다.');
  };

  const deleteCustomer = (id: string) => {
    const target = customers.find((c) => c.id === id);
    setCustomers((prev) => prev.filter((c) => c.id !== id));
    if (selectedCustomerId === id) {
      const remaining = customers.filter((c) => c.id !== id);
      setSelectedCustomerId(remaining[0]?.id || null);
    }
    showToast(`'${target?.name || '고객'}' 상담 정보가 삭제되었습니다.`);
  };

  // Property handlers
  const addProperty = (data: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>): Property => {
    const newProperty: Property = {
      ...data,
      id: `prop-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setProperties((prev) => [newProperty, ...prev]);
    showToast(`'${newProperty.name}' 매물이 성공적으로 등록되었습니다.`);
    return newProperty;
  };

  const updateProperty = (id: string, updates: Partial<Property>) => {
    setProperties((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, ...updates, updatedAt: new Date().toISOString() }
          : p
      )
    );
    showToast('매물 정보가 수정되었습니다.');
  };

  const deleteProperty = (id: string) => {
    const target = properties.find((p) => p.id === id);
    setProperties((prev) => prev.filter((p) => p.id !== id));
    if (selectedPropertyId === id) {
      const remaining = properties.filter((p) => p.id !== id);
      setSelectedPropertyId(remaining[0]?.id || null);
    }
    showToast(`'${target?.name || '매물'}' 정보가 삭제되었습니다.`);
  };

  // Comparison triggers
  const startComparisonWithCustomer = (customerId: string) => {
    setSelectedCustomerId(customerId);
    setActiveTab('comparison');
  };

  const startComparisonWithProperty = (propertyId: string) => {
    setSelectedPropertyId(propertyId);
    setActiveTab('comparison');
  };

  // Reset data
  const resetToSampleData = () => {
    setCustomers(INITIAL_CUSTOMERS);
    setProperties(INITIAL_PROPERTIES);
    setSelectedCustomerId(INITIAL_CUSTOMERS[0].id);
    setSelectedPropertyId(INITIAL_PROPERTIES[0].id);
    localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(INITIAL_CUSTOMERS));
    localStorage.setItem(PROPERTIES_KEY, JSON.stringify(INITIAL_PROPERTIES));
    showToast('기본 실무 샘플 데이터로 복원되었습니다.');
  };

  // Export / Import
  const exportDataJson = () => {
    const data = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      customers,
      properties,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `부동산_고객_매물_데이터_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('데이터 백업 파일(JSON)이 다운로드되었습니다.');
  };

  const importDataJson = (jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      if (Array.isArray(parsed.customers) && Array.isArray(parsed.properties)) {
        setCustomers(parsed.customers);
        setProperties(parsed.properties);
        showToast('백업 파일로부터 데이터 복원이 완료되었습니다.');
        return true;
      }
      showToast('유효하지 않은 데이터 형식입니다.');
      return false;
    } catch {
      showToast('JSON 파일을 파싱하는 데 실패했습니다.');
      return false;
    }
  };

  // Matching helpers
  const getMatchesForCustomer = (customerId: string): MatchEvaluation[] => {
    const cust = customers.find((c) => c.id === customerId);
    if (!cust) return [];
    return properties
      .map((prop) => evaluateCustomerPropertyMatch(cust, prop))
      .sort((a, b) => b.score - a.score);
  };

  const getMatchesForProperty = (propertyId: string): MatchEvaluation[] => {
    const prop = properties.find((p) => p.id === propertyId);
    if (!prop) return [];
    return customers
      .map((cust) => evaluateCustomerPropertyMatch(cust, prop))
      .sort((a, b) => b.score - a.score);
  };

  return (
    <RealEstateContext.Provider
      value={{
        customers,
        properties,
        activeTab,
        setActiveTab,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        addProperty,
        updateProperty,
        deleteProperty,
        selectedCustomerId,
        setSelectedCustomerId,
        selectedPropertyId,
        setSelectedPropertyId,
        startComparisonWithCustomer,
        startComparisonWithProperty,
        resetToSampleData,
        exportDataJson,
        importDataJson,
        toastMessage,
        showToast,
        getMatchesForCustomer,
        getMatchesForProperty,
      }}
    >
      {children}
    </RealEstateContext.Provider>
  );
};

export const useRealEstate = () => {
  const context = useContext(RealEstateContext);
  if (!context) {
    throw new Error('useRealEstate must be used within a RealEstateProvider');
  }
  return context;
};
