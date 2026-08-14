import React, { useState } from 'react';
import { RealEstateProvider, useRealEstate } from './context/RealEstateContext';
import { Header } from './components/common/Header';
import { DashboardView } from './components/dashboard/DashboardView';
import { ConsultationList } from './components/consultations/ConsultationList';
import { ConsultationModal } from './components/consultations/ConsultationModal';
import { ConsultationDetailModal } from './components/consultations/ConsultationDetailModal';
import { PropertyList } from './components/properties/PropertyList';
import { PropertyModal } from './components/properties/PropertyModal';
import { PropertyDetailModal } from './components/properties/PropertyDetailModal';
import { ComparisonView } from './components/comparison/ComparisonView';
import { UserGuideView } from './components/guide/UserGuideView';
import { AiConsultantDrawer } from './components/ai/AiConsultantDrawer';
import { CustomerConsultation, Property } from './types';
import { Sparkles, CheckCircle2 } from 'lucide-react';

const MainLayout: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    customers,
    properties,
    addCustomer,
    updateCustomer,
    addProperty,
    updateProperty,
    toastMessage,
  } = useRealEstate();

  // Modals state
  const [isNewCustomerModalOpen, setIsNewCustomerModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<CustomerConsultation | null>(null);
  const [viewingCustomer, setViewingCustomer] = useState<CustomerConsultation | null>(null);

  const [isNewPropertyModalOpen, setIsNewPropertyModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [viewingProperty, setViewingProperty] = useState<Property | null>(null);

  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#fdfbf7] text-[#4a4636] flex flex-col font-sans selection:bg-[#edf0e6] selection:text-[#363326]">
      {/* Top Header & Navigation */}
      <Header
        onOpenNewCustomerModal={() => {
          setEditingCustomer(null);
          setIsNewCustomerModalOpen(true);
        }}
        onOpenNewPropertyModal={() => {
          setEditingProperty(null);
          setIsNewPropertyModalOpen(true);
        }}
        onOpenAiDrawer={() => setIsAiDrawerOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            onOpenNewCustomerModal={() => {
              setEditingCustomer(null);
              setIsNewCustomerModalOpen(true);
            }}
            onOpenNewPropertyModal={() => {
              setEditingProperty(null);
              setIsNewPropertyModalOpen(true);
            }}
            onSelectCustomerDetail={(id) => {
              const cust = customers.find((c) => c.id === id);
              if (cust) setViewingCustomer(cust);
            }}
            onSelectPropertyDetail={(id) => {
              const prop = properties.find((p) => p.id === id);
              if (prop) setViewingProperty(prop);
            }}
          />
        )}

        {activeTab === 'consultations' && (
          <ConsultationList
            onOpenNewCustomerModal={() => {
              setEditingCustomer(null);
              setIsNewCustomerModalOpen(true);
            }}
            onEditCustomer={(cust) => {
              setEditingCustomer(cust);
              setIsNewCustomerModalOpen(true);
            }}
            onViewCustomerDetail={(cust) => {
              setViewingCustomer(cust);
            }}
          />
        )}

        {activeTab === 'properties' && (
          <PropertyList
            onOpenNewPropertyModal={() => {
              setEditingProperty(null);
              setIsNewPropertyModalOpen(true);
            }}
            onEditProperty={(prop) => {
              setEditingProperty(prop);
              setIsNewPropertyModalOpen(true);
            }}
            onViewPropertyDetail={(prop) => {
              setViewingProperty(prop);
            }}
          />
        )}

        {activeTab === 'comparison' && <ComparisonView />}

        {activeTab === 'guide' && <UserGuideView />}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#e8e4d9] bg-[#fcfaf6] py-4 px-6 text-center text-xs text-[#7c7764]">
        <div className="flex flex-col sm:flex-row items-center justify-between max-w-7xl mx-auto gap-2">
          <p className="font-medium">© 2026 부동산 고객 상담 및 매물 매칭 통합 관리 시스템 • Real Estate Consultation & Match Engine</p>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setActiveTab('guide')}
              className="font-semibold text-[#8c9474] hover:text-[#555d40] hover:underline cursor-pointer flex items-center space-x-1"
            >
              <span>시스템 사용 설명서 & PDF 다운로드</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Floating AI Assistant Trigger Button */}
      <button
        onClick={() => setIsAiDrawerOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-[#3d3929] hover:bg-[#2e2a1d] text-[#fdfbf7] px-4 py-3 rounded-full shadow-[0_4px_20px_rgba(74,70,54,0.15)] flex items-center space-x-2 border border-[#5d5641] transition-all hover:scale-105 cursor-pointer group"
      >
        <div className="w-6 h-6 rounded-full bg-[#8c9474]/30 text-[#e2e8d4] flex items-center justify-center">
          <Sparkles className="w-3.5 h-3.5" />
        </div>
        <span className="text-xs font-bold tracking-wide">AI 중개 비서</span>
      </button>

      {/* Customer Modal (Add & Edit) */}
      <ConsultationModal
        isOpen={isNewCustomerModalOpen}
        onClose={() => {
          setIsNewCustomerModalOpen(false);
          setEditingCustomer(null);
        }}
        onSave={(data) => {
          if (editingCustomer) {
            updateCustomer(editingCustomer.id, data);
          } else {
            addCustomer(data);
          }
        }}
        initialCustomer={editingCustomer}
      />

      {/* Customer Detail Modal */}
      <ConsultationDetailModal
        customer={viewingCustomer}
        isOpen={!!viewingCustomer}
        onClose={() => setViewingCustomer(null)}
        onEdit={(cust) => {
          setViewingCustomer(null);
          setEditingCustomer(cust);
          setIsNewCustomerModalOpen(true);
        }}
      />

      {/* Property Modal (Add & Edit) */}
      <PropertyModal
        isOpen={isNewPropertyModalOpen}
        onClose={() => {
          setIsNewPropertyModalOpen(false);
          setEditingProperty(null);
        }}
        onSave={(data) => {
          if (editingProperty) {
            updateProperty(editingProperty.id, data);
          } else {
            addProperty(data);
          }
        }}
        initialProperty={editingProperty}
      />

      {/* Property Detail Modal */}
      <PropertyDetailModal
        property={viewingProperty}
        isOpen={!!viewingProperty}
        onClose={() => setViewingProperty(null)}
        onEdit={(prop) => {
          setViewingProperty(null);
          setEditingProperty(prop);
          setIsNewPropertyModalOpen(true);
        }}
      />

      {/* AI Consultant Drawer */}
      <AiConsultantDrawer
        isOpen={isAiDrawerOpen}
        onClose={() => setIsAiDrawerOpen(false)}
      />

      {/* Toast Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 bg-[#363326] text-[#fdfbf7] px-4 py-2.5 rounded-xl shadow-[0_4px_20px_rgba(54,51,38,0.25)] text-xs font-semibold flex items-center space-x-2 border border-[#524d3a] animate-in fade-in slide-in-from-bottom-2 duration-150">
          <CheckCircle2 className="w-4 h-4 text-[#8c9474]" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <RealEstateProvider>
      <MainLayout />
    </RealEstateProvider>
  );
}
