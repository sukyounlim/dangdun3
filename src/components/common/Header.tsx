import React, { useRef, useState } from 'react';
import { useRealEstate } from '../../context/RealEstateContext';
import { TabType } from '../../types';
import {
  Building2,
  Users,
  Home,
  GitCompare,
  LayoutDashboard,
  Plus,
  Download,
  Upload,
  RotateCcw,
  Sparkles,
  Search,
  BookOpen,
} from 'lucide-react';

interface HeaderProps {
  onOpenNewCustomerModal: () => void;
  onOpenNewPropertyModal: () => void;
  onOpenAiDrawer: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenNewCustomerModal,
  onOpenNewPropertyModal,
  onOpenAiDrawer,
}) => {
  const {
    activeTab,
    setActiveTab,
    customers,
    properties,
    resetToSampleData,
    exportDataJson,
    importDataJson,
  } = useRealEstate();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (content) {
          importDataJson(content);
        }
      };
      reader.readAsText(file);
    }
  };

  const navTabs: { id: TabType; label: string; icon: React.ComponentType<{ className?: string }>; count?: number }[] = [
    { id: 'dashboard', label: '대시보드', icon: LayoutDashboard },
    { id: 'consultations', label: '고객 상담', icon: Users, count: customers.length },
    { id: 'properties', label: '매물 관리', icon: Home, count: properties.length },
    { id: 'comparison', label: '고객-매물 비교', icon: GitCompare },
    { id: 'guide', label: '사용 설명서', icon: BookOpen },
  ];

  return (
    <header className="bg-[#fcfaf6] border-b border-[#e8e4d9] sticky top-0 z-30 shadow-[0_1px_4px_rgba(74,70,54,0.04)]">
      {/* Top Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Agency Info */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#3d3929] flex items-center justify-center text-white shadow-xs">
              <Building2 className="w-5 h-5 text-[#8c9474]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#edf0e6] text-[#555d40] border border-[#d8decb]">
                  대표 업무 보조
                </span>
                <span className="text-xs text-[#7c7764] font-medium">부동산 공인중개사 CRM</span>
              </div>
              <h1 className="text-lg font-bold text-[#363326] tracking-tight font-serif">
                고객 상담 및 매물 관리 시스템
              </h1>
            </div>
          </div>

          {/* Action Buttons & Tools */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* AI Assistant Quick Button */}
            <button
              onClick={onOpenAiDrawer}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium bg-[#3d3929] hover:bg-[#2e2a1d] text-[#fdfbf7] border border-[#5d5641] shadow-xs transition-all cursor-pointer"
              title="AI 중개 비서 열기"
            >
              <Sparkles className="w-4 h-4 text-[#8c9474]" />
              <span className="hidden sm:inline">AI 중개 비서</span>
              <span className="sm:hidden">AI</span>
            </button>

            {/* Quick Add Customer */}
            <button
              onClick={onOpenNewCustomerModal}
              className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium bg-[#f7f4ed] hover:bg-[#eee8db] text-[#4a4636] border border-[#ded9cb] transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#7c7764]" />
              <span className="hidden sm:inline">고객 상담 등록</span>
              <span className="sm:hidden">+고객</span>
            </button>

            {/* Quick Add Property */}
            <button
              onClick={onOpenNewPropertyModal}
              className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium bg-[#737c5d] hover:bg-[#626a4c] text-white shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4 text-white" />
              <span className="hidden sm:inline">신규 매물 등록</span>
              <span className="sm:hidden">+매물</span>
            </button>

            {/* Data settings dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowSettingsMenu(!showSettingsMenu)}
                className="p-2 rounded-lg text-[#7c7764] hover:text-[#363326] hover:bg-[#f0ece1] border border-[#e8e4d9] transition-colors cursor-pointer"
                title="데이터 관리 및 백업"
              >
                <Download className="w-4 h-4" />
              </button>

              {showSettingsMenu && (
                <div className="absolute right-0 mt-2 w-52 bg-[#ffffff] rounded-xl shadow-lg border border-[#e8e4d9] py-1.5 z-50 text-sm">
                  <div className="px-3 py-1 text-xs font-semibold text-[#9c9682] uppercase tracking-wider">
                    데이터 관리
                  </div>
                  <button
                    onClick={() => {
                      exportDataJson();
                      setShowSettingsMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 text-[#4a4636] hover:bg-[#f7f4ed] flex items-center space-x-2"
                  >
                    <Download className="w-4 h-4 text-[#7c7764]" />
                    <span>데이터 백업 (JSON)</span>
                  </button>
                  <button
                    onClick={() => {
                      fileInputRef.current?.click();
                      setShowSettingsMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 text-[#4a4636] hover:bg-[#f7f4ed] flex items-center space-x-2"
                  >
                    <Upload className="w-4 h-4 text-[#7c7764]" />
                    <span>백업 파일 복원</span>
                  </button>
                  <div className="my-1 border-t border-[#f0ece1]" />
                  <button
                    onClick={() => {
                      if (confirm('샘플 데이터로 초기화하시겠습니까? 현재 입력된 데이터가 초기 데이터로 재설정됩니다.')) {
                        resetToSampleData();
                      }
                      setShowSettingsMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 text-[#945634] hover:bg-[#faefe8] flex items-center space-x-2"
                  >
                    <RotateCcw className="w-4 h-4 text-[#c98a68]" />
                    <span>실무 샘플 데이터 복원</span>
                  </button>
                </div>
              )}
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              className="hidden"
            />
          </div>
        </div>
      </div>

      {/* Navigation Tabs - Strict Korean specification: 대시보드 / 고객 상담 / 매물 관리 / 고객-매물 비교 */}
      <div className="bg-[#f7f4ed] border-t border-[#e8e4d9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-2 sm:space-x-4 overflow-x-auto py-2">
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-[#3d3929] text-[#fdfbf7] shadow-xs'
                      : 'text-[#7c7764] hover:text-[#363326] hover:bg-[#ede7da]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#8c9474]' : 'text-[#8a8470]'}`} />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                        isActive
                          ? 'bg-[#55503e] text-[#edf0e6]'
                          : 'bg-[#ded9cb] text-[#4a4636]'
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};
