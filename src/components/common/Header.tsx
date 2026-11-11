import React from 'react';
import { 
  Car, 
  ShieldCheck, 
  Smartphone, 
  RotateCcw, 
  Bell, 
  Building2, 
  User, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';
import { FleetAlert, UserProfile } from '../../types/fleet';

interface HeaderProps {
  currentRole: 'EMPLOYEE' | 'ADMIN';
  onRoleToggle: () => void;
  currentUser: UserProfile;
  alerts: FleetAlert[];
  onResetData: () => void;
  onOpenAlerts: () => void;
  onOpenMobileModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onRoleToggle,
  currentUser,
  alerts,
  onResetData,
  onOpenAlerts,
  onOpenMobileModal,
}) => {
  const unresolvedAlerts = alerts.filter((a) => !a.isResolved);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 lg:px-8 py-3 shadow-xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Car className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-900 tracking-tight text-lg">FleetFlow</span>
              <span className="hidden sm:inline-block px-2 py-0.5 text-[11px] font-semibold bg-blue-50 text-blue-700 rounded-md border border-blue-200">
                국세청 법정서식 연동
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden md:block">
              사내 법인차량 스마트 배차·외관 검수·운행기록 통합 솔루션
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Role Switcher Pill */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => currentRole !== 'EMPLOYEE' && onRoleToggle()}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentRole === 'EMPLOYEE'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>임직원 모바일</span>
            </button>
            <button
              onClick={() => currentRole !== 'ADMIN' && onRoleToggle()}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentRole === 'ADMIN'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>총무팀 관리자</span>
            </button>
          </div>

          {/* Mobile Phone / PWA Install Button */}
          <button
            onClick={onOpenMobileModal}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs hover:shadow-md transition-all active:scale-95"
            title="스마트폰 연결 및 앱 설치 (QR코드 / 홈화면 추가)"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">스마트폰 연결</span>
            <span className="sm:hidden">앱설치</span>
          </button>

          {/* Alert Notification Button */}
          <button
            onClick={onOpenAlerts}
            className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title="알림 센터"
          >
            <Bell className="w-5 h-5" />
            {unresolvedAlerts.length > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                {unresolvedAlerts.length}
              </span>
            )}
          </button>

          {/* Reset Mock Data */}
          <button
            onClick={onResetData}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
            title="초기 샘플 데이터 복원"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">데이터 초기화</span>
          </button>

          {/* Current User Badge */}
          <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs">
              {currentUser.name.slice(0, 1)}
            </div>
            <div className="text-left text-xs">
              <div className="font-semibold text-slate-900 flex items-center gap-1">
                {currentUser.name}
                <span className="text-[10px] text-slate-500 font-normal">
                  ({currentUser.department})
                </span>
              </div>
              <div className="text-[10px] text-slate-400">
                {currentRole === 'ADMIN' ? 'Fleet Administrator' : '법인차량 이용자'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
