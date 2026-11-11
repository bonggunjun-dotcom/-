import React from 'react';
import { AlertTriangle, Clock, ArrowRight, ShieldAlert, Check } from 'lucide-react';
import { Reservation, Vehicle } from '../../types/fleet';

interface AlertBannerProps {
  activeReservation?: Reservation;
  vehicle?: Vehicle;
  minutesRemaining?: number;
  onExtend: (reservationId: string) => void;
  onStartReturn: (reservation: Reservation) => void;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({
  activeReservation,
  vehicle,
  minutesRemaining,
  onExtend,
  onStartReturn,
}) => {
  if (!activeReservation || !vehicle || minutesRemaining === undefined) {
    return null;
  }

  // Only show if in use and less than 45 minutes remaining, or overdue
  if (minutesRemaining > 45) return null;

  const isOverdue = minutesRemaining < 0;

  return (
    <div className={`border-b ${isOverdue ? 'bg-rose-50 border-rose-200 text-rose-900' : 'bg-amber-50 border-amber-200 text-amber-900'} px-4 py-3 shadow-xs`}>
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl shrink-0 ${isOverdue ? 'bg-rose-200 text-rose-700' : 'bg-amber-200 text-amber-700'}`}>
            <Clock className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm">
                {isOverdue ? '⚠️ 반납 예정 시간이 초과되었습니다!' : '⏱️ 반납 예정 시간이 임박했습니다!'}
              </span>
              <span className={`px-2 py-0.5 rounded text-xs font-semibold ${isOverdue ? 'bg-rose-600 text-white' : 'bg-amber-600 text-white'}`}>
                {isOverdue ? `${Math.abs(minutesRemaining)}분 지연 운행 중` : `반납까지 ${minutesRemaining}분 남음`}
              </span>
            </div>
            <p className="text-xs mt-0.5 text-slate-700">
              현재 이용 중: <strong className="font-semibold">{vehicle.modelName} ({vehicle.plateNumber})</strong> &bull; 다음 예약자의 정비 버퍼(30분) 확보를 위해 반납 준비 또는 연장을 신청해 주세요.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          <button
            onClick={() => onExtend(activeReservation.id)}
            className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
          >
            <span>⚡ 30분 연장 신청</span>
          </button>
          <button
            onClick={() => onStartReturn(activeReservation)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1 text-white ${
              isOverdue ? 'bg-rose-600 hover:bg-rose-700' : 'bg-amber-600 hover:bg-amber-700'
            }`}
          >
            <span>도착 계기판 검수 및 반납</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
