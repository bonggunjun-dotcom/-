import React, { useState, useEffect } from 'react';
import { 
  X, 
  Car, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldCheck,
  Fuel,
  Sparkles
} from 'lucide-react';
import { Vehicle, Reservation, TripPurposeType, UserProfile } from '../../types/fleet';
import { checkReservationOverlap } from '../../utils/storage';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicles: Vehicle[];
  reservations: Reservation[];
  currentUser: UserProfile;
  initialVehicleId?: string;
  onConfirmBooking: (newReservation: Omit<Reservation, 'id' | 'createdAt'>) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  vehicles,
  reservations,
  currentUser,
  initialVehicleId,
  onConfirmBooking,
}) => {
  if (!isOpen) return null;

  // Initial time setup: round to next hour
  const now = new Date();
  const defaultStart = new Date(now.getTime() + 60 * 60 * 1000);
  defaultStart.setMinutes(0, 0, 0);
  const defaultEnd = new Date(defaultStart.getTime() + 3 * 60 * 60 * 1000);

  // Format to YYYY-MM-DDTHH:mm for datetime-local
  const toLocalIso = (d: Date) => {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(
    initialVehicleId || vehicles.find(v => v.status !== 'MAINTENANCE')?.id || vehicles[0]?.id || ''
  );
  const [startTime, setStartTime] = useState<string>(toLocalIso(defaultStart));
  const [endTime, setEndTime] = useState<string>(toLocalIso(defaultEnd));
  const [purposeType, setPurposeType] = useState<TripPurposeType>('GENERAL_BUSINESS');
  const [purposeDetail, setPurposeDetail] = useState('');
  const [destination, setDestination] = useState('');
  const [passengers, setPassengers] = useState('');
  const [estimatedDistanceKm, setEstimatedDistanceKm] = useState<number>(60);
  const [validationError, setValidationError] = useState<string | null>(null);

  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId);

  // Live validation on changes
  useEffect(() => {
    if (!selectedVehicleId || !startTime || !endTime) return;

    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();

    if (end <= start) {
      setValidationError('반납 일시는 출발 일시보다 이후여야 합니다.');
      return;
    }

    if (selectedVehicle?.status === 'MAINTENANCE') {
      setValidationError('현재 해당 차량은 정기 점검 또는 수리 중으로 배차가 불가합니다.');
      return;
    }

    // 30분 정비/세차 버퍼 및 예약 충돌 검증
    const overlapResult = checkReservationOverlap(
      selectedVehicleId,
      new Date(startTime).toISOString(),
      new Date(endTime).toISOString(),
      reservations,
      undefined,
      30
    );

    if (overlapResult.hasConflict) {
      setValidationError(overlapResult.message || '예약 시간이 다른 예약 또는 30분 정비 버퍼와 겹칩니다.');
    } else {
      setValidationError(null);
    }
  }, [selectedVehicleId, startTime, endTime, reservations, selectedVehicle]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validationError) return;
    if (!purposeDetail.trim()) {
      alert('업무 목적을 상세히 입력해 주세요 (국세청 제출 필수).');
      return;
    }
    if (!destination.trim()) {
      alert('행선지를 입력해 주세요.');
      return;
    }

    onConfirmBooking({
      vehicleId: selectedVehicleId,
      userId: currentUser.id,
      userName: currentUser.name,
      userDepartment: currentUser.department,
      userPhone: currentUser.phone,
      status: 'REQUESTED',
      purposeType,
      purposeDetail,
      destination,
      passengers: passengers.trim() || '단독 운행',
      startTime: new Date(startTime).toISOString(),
      endTime: new Date(endTime).toISOString(),
      estimatedDistanceKm,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-900 to-indigo-900 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/10 text-white">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">법인차량 배차 신청</h3>
              <p className="text-xs text-blue-200">정비 버퍼 30분 자동 연산 & 국세청 운행기록부 연계</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Vehicle Select Card */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              1. 배차 희망 차량 선택
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {vehicles.map((v) => {
                const isSelected = v.id === selectedVehicleId;
                const isMaint = v.status === 'MAINTENANCE';
                return (
                  <button
                    key={v.id}
                    type="button"
                    disabled={isMaint}
                    onClick={() => setSelectedVehicleId(v.id)}
                    className={`text-left p-3 rounded-xl border transition-all relative ${
                      isMaint
                        ? 'opacity-40 bg-slate-100 border-slate-200 cursor-not-allowed'
                        : isSelected
                        ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-500/20 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-xs font-bold text-slate-900">{v.modelName}</div>
                        <div className="text-[11px] font-semibold text-blue-700 font-mono mt-0.5">
                          {v.plateNumber}
                        </div>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-slate-100 text-slate-600">
                        {v.seatingCapacity}인승
                      </span>
                    </div>
                    <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
                      <span>누적 {v.currentOdometer.toLocaleString()} km</span>
                      <span className="text-slate-400">{v.parkingLocation.split(' ')[2] || '지하2층'}</span>
                    </div>
                    {isSelected && (
                      <div className="absolute top-2 right-2">
                        <CheckCircle2 className="w-4 h-4 text-blue-600" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Schedule Input with Buffer Notice */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                2. 운행 일정 설정 (30분 버퍼 적용)
              </label>
              <span className="text-[11px] text-indigo-700 font-medium bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                반납 후 30분 정비시간 자동 확보
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  운행 시작 (출발 예정)
                </label>
                <input
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                  className="w-full text-xs font-medium px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-800"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  운행 종료 (반납 예정)
                </label>
                <input
                  type="datetime-local"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                  className="w-full text-xs font-medium px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-800"
                />
              </div>
            </div>

            {/* Conflict Warning Alert */}
            {validationError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <strong className="font-bold">배차 불가 안내: </strong>
                  {validationError}
                </div>
              </div>
            )}
          </div>

          {/* Purpose and NTS Type */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              3. 국세청 법정 운행 구분 및 업무 목적
            </label>

            {/* Purpose Type Selector */}
            <div className="grid grid-cols-2 gap-3">
              <label
                className={`p-3 rounded-xl border cursor-pointer flex items-start gap-2.5 transition-all ${
                  purposeType === 'GENERAL_BUSINESS'
                    ? 'border-blue-600 bg-blue-50/50 text-blue-900 font-semibold'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="purposeType"
                  value="GENERAL_BUSINESS"
                  checked={purposeType === 'GENERAL_BUSINESS'}
                  onChange={() => setPurposeType('GENERAL_BUSINESS')}
                  className="mt-0.5 text-blue-600"
                />
                <div>
                  <div className="text-xs font-bold">일반 업무용 (외근/출장/의전)</div>
                  <div className="text-[11px] text-slate-500 font-normal mt-0.5">
                    고객사 미팅, 현장 지원, 세미나, 물품 배송
                  </div>
                </div>
              </label>

              <label
                className={`p-3 rounded-xl border cursor-pointer flex items-start gap-2.5 transition-all ${
                  purposeType === 'COMMUTE'
                    ? 'border-blue-600 bg-blue-50/50 text-blue-900 font-semibold'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="purposeType"
                  value="COMMUTE"
                  checked={purposeType === 'COMMUTE'}
                  onChange={() => setPurposeType('COMMUTE')}
                  className="mt-0.5 text-blue-600"
                />
                <div>
                  <div className="text-xs font-bold">출·퇴근용 (회사 규정 승인)</div>
                  <div className="text-[11px] text-slate-500 font-normal mt-0.5">
                    야간 긴급 점검 후 귀가, 새벽 출근 등
                  </div>
                </div>
              </label>
            </div>

            {/* Destination & Purpose Detail */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  행선지 (도착지 명칭 및 주소) *
                </label>
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="예: 경기도 화성시 삼성전자 화성캠퍼스"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    required
                    className="w-full text-xs font-medium pl-8 pr-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  동승자 명단
                </label>
                <div className="relative">
                  <Users className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="예: 김수현 부장, 이지민 선임 (미기재시 단독)"
                    value={passengers}
                    onChange={(e) => setPassengers(e.target.value)}
                    className="w-full text-xs font-medium pl-8 pr-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-800"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                상세 업무 목적 (국세청 비고란에 공식 기재됩니다) *
              </label>
              <textarea
                rows={2}
                placeholder="예: 2026 하반기 인프라 고도화 프로젝트 관련 고객사 보안 점검 및 랙 마운트 작업"
                value={purposeDetail}
                onChange={(e) => setPurposeDetail(e.target.value)}
                required
                className="w-full text-xs font-medium px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-800 resize-none"
              />
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            신청인: <strong className="text-slate-800">{currentUser.name}</strong> ({currentUser.department})
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
            >
              취소
            </button>
            <button
              onClick={handleSubmit}
              disabled={!!validationError}
              className={`px-5 py-2 text-xs font-bold rounded-lg shadow-sm transition-all flex items-center gap-1.5 text-white ${
                validationError
                  ? 'bg-slate-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>배차 신청 완료</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
