import React, { useState } from 'react';
import { 
  Car, 
  Clock, 
  MapPin, 
  Users, 
  CheckCircle2, 
  AlertCircle, 
  Key, 
  ArrowRight, 
  Plus, 
  Receipt, 
  FileText,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { Reservation, Vehicle, TripRecord, UserProfile } from '../../types/fleet';

interface MyReservationsViewProps {
  reservations: Reservation[];
  vehicles: Vehicle[];
  tripRecords: TripRecord[];
  currentUser: UserProfile;
  onOpenBookingModal: () => void;
  onStartDeparture: (reservation: Reservation) => void;
  onStartReturn: (reservation: Reservation) => void;
  onExtend: (reservationId: string) => void;
  onCancelReservation: (reservationId: string) => void;
  onViewRecordDetail: (reservation: Reservation) => void;
}

export const MyReservationsView: React.FC<MyReservationsViewProps> = ({
  reservations,
  vehicles,
  tripRecords,
  currentUser,
  onOpenBookingModal,
  onStartDeparture,
  onStartReturn,
  onExtend,
  onCancelReservation,
  onViewRecordDetail,
}) => {
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'COMPLETED'>('ALL');

  const myReservations = reservations
    .filter((r) => r.userId === currentUser.id)
    .filter((r) => {
      if (filter === 'ACTIVE') return r.status === 'REQUESTED' || r.status === 'APPROVED' || r.status === 'IN_USE';
      if (filter === 'COMPLETED') return r.status === 'COMPLETED';
      return true;
    })
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

  const getStatusBadge = (status: Reservation['status']) => {
    switch (status) {
      case 'REQUESTED':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-amber-50 text-amber-700 border border-amber-200">승인 대기</span>;
      case 'APPROVED':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200">배차 확정 (출발대기)</span>;
      case 'IN_USE':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-blue-600 text-white shadow-xs animate-pulse">현재 운행 중</span>;
      case 'COMPLETED':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">반납 완료</span>;
      case 'CANCELED':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-100 text-slate-500">예약 취소</span>;
      default:
        return null;
    }
  };

  const formatDateTime = (iso: string) => {
    try {
      const d = new Date(iso);
      return `${d.getMonth() + 1}월 ${d.getDate()}일 (${['일', '월', '화', '수', '목', '금', '토'][d.getDay()]}) ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    } catch {
      return iso;
    }
  };

  return (
    <div className="space-y-4">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">내 배차 예약 및 운행 내역</h2>
          <p className="text-xs text-slate-500">출발 시 계기판 검수, 운행 연장 및 도착 후 국세청 자동 기록 반영</p>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          {/* Filter Pills */}
          <div className="flex bg-slate-200/80 p-0.5 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filter === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              전체
            </button>
            <button
              onClick={() => setFilter('ACTIVE')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filter === 'ACTIVE' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              진행 중
            </button>
            <button
              onClick={() => setFilter('COMPLETED')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filter === 'COMPLETED' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              완료 내역
            </button>
          </div>

          <button
            onClick={onOpenBookingModal}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>신규 배차 신청</span>
          </button>
        </div>
      </div>

      {/* Reservation Cards List */}
      {myReservations.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Car className="w-12 h-12 mx-auto text-slate-300 mb-3" />
          <h3 className="font-bold text-slate-800 text-sm">해당하는 배차 내역이 없습니다</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            업무 출장, 고객사 방문 또는 승인된 출퇴근을 위한 법인차량을 즉시 신청해 보세요.
          </p>
          <button
            onClick={onOpenBookingModal}
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-xs"
          >
            지금 차량 신청하기
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {myReservations.map((res) => {
            const vehicle = vehicles.find((v) => v.id === res.vehicleId);
            const trip = tripRecords.find((t) => t.reservationId === res.id);

            return (
              <div
                key={res.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between hover:border-slate-300 transition-all"
              >
                <div>
                  {/* Top Bar */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-slate-900">
                          {vehicle?.modelName || '법인차량'}
                        </span>
                        <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          {vehicle?.plateNumber}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5">
                        <span className="font-medium text-slate-700">
                          {res.purposeType === 'COMMUTE' ? '출·퇴근용' : '일반 업무용'}
                        </span>
                        &bull;
                        <span>동승: {res.passengers}</span>
                      </div>
                    </div>
                    {getStatusBadge(res.status)}
                  </div>

                  {/* Schedule Box */}
                  <div className="mt-3.5 bg-slate-50 rounded-xl p-3 border border-slate-200/80 space-y-1.5 text-xs">
                    <div className="flex items-center gap-2 text-slate-700">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-semibold">{formatDateTime(res.startTime)}</span>
                      <span className="text-slate-400">~</span>
                      <span className="font-semibold">{formatDateTime(res.endTime)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-medium truncate">{res.destination}</span>
                    </div>
                  </div>

                  {/* Purpose Detail */}
                  <p className="mt-2.5 text-xs text-slate-600 leading-relaxed line-clamp-2">
                    {res.purposeDetail}
                  </p>

                  {/* Key Box info when Approved or In Use */}
                  {(res.status === 'APPROVED' || res.status === 'IN_USE') && vehicle && (
                    <div className="mt-3 p-2.5 bg-indigo-50/70 rounded-lg border border-indigo-100 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-indigo-950 font-medium">
                        <Key className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        <span>{vehicle.smartKeyBoxNumber}</span>
                      </div>
                      <span className="text-[11px] text-indigo-700">{vehicle.parkingLocation.split(' ')[2] || '지하 2층'}</span>
                    </div>
                  )}

                  {/* Distance summary if completed */}
                  {res.status === 'COMPLETED' && trip && (
                    <div className="mt-3 p-2.5 bg-emerald-50 rounded-lg border border-emerald-100 flex items-center justify-between text-xs">
                      <span className="text-emerald-800 font-medium">
                        운행거리: <strong className="font-mono">{trip.businessDistance || (trip.endOdometer! - trip.startOdometer)} km</strong>
                      </span>
                      {trip.fuelCost ? (
                        <span className="text-emerald-700 text-[11px] font-medium">
                          주유비: {trip.fuelCost.toLocaleString()}원
                        </span>
                      ) : (
                        <span className="text-emerald-700 text-[11px]">국세청 자동반영 완료</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Bottom Action Buttons by Status */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  {res.status === 'REQUESTED' && (
                    <>
                      <span className="text-[11px] text-slate-400">총무팀 승인 대기 중</span>
                      <button
                        onClick={() => onCancelReservation(res.id)}
                        className="px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        신청 취소
                      </button>
                    </>
                  )}

                  {res.status === 'APPROVED' && (
                    <>
                      <button
                        onClick={() => onCancelReservation(res.id)}
                        className="px-3 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        일정 취소
                      </button>
                      <button
                        onClick={() => onStartDeparture(res)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
                      >
                        <Car className="w-3.5 h-3.5" />
                        <span>운행 시작 체크인 (키 수령)</span>
                      </button>
                    </>
                  )}

                  {res.status === 'IN_USE' && (
                    <>
                      <button
                        onClick={() => onExtend(res.id)}
                        className="px-3 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg transition-colors"
                        title="다음 예약 및 버퍼 확인 후 30분 연장"
                      >
                        ⏱️ 30분 연장
                      </button>
                      <button
                        onClick={() => onStartReturn(res)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>반납 검수 (계기판/외관)</span>
                      </button>
                    </>
                  )}

                  {res.status === 'COMPLETED' && (
                    <>
                      <span className="text-[11px] text-slate-500">운행기록부 생성 완료</span>
                      <button
                        onClick={() => onViewRecordDetail(res)}
                        className="px-3 py-1.5 text-xs font-bold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>기록 및 사진 상세</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
