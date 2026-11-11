import React from 'react';
import { 
  X, 
  Car, 
  Clock, 
  MapPin, 
  Gauge, 
  CheckCircle2, 
  Receipt, 
  AlertTriangle, 
  FileText,
  Calendar
} from 'lucide-react';
import { Reservation, Vehicle, TripRecord } from '../../types/fleet';

interface TripDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  reservation: Reservation;
  vehicle: Vehicle;
  tripRecord?: TripRecord;
}

export const TripDetailModal: React.FC<TripDetailModalProps> = ({
  isOpen,
  onClose,
  reservation,
  vehicle,
  tripRecord,
}) => {
  if (!isOpen) return null;

  const startOdo = tripRecord?.startOdometer || vehicle.currentOdometer;
  const endOdo = tripRecord?.endOdometer || startOdo;
  const distance = tripRecord?.businessDistance || (endOdo - startOdo);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/10 text-white">
              <FileText className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="font-bold text-base">운행 검수 상세 & 분쟁 방지 아카이브</h3>
              <p className="text-xs text-slate-400">
                {vehicle.modelName} ({vehicle.plateNumber}) &bull; {reservation.userName} ({reservation.userDepartment})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Odometer Comparison Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Gauge className="w-4 h-4 text-blue-600" />
              계기판 주행거리 검증 결과 (국세청 실시간 반영)
            </h4>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <span className="text-[11px] text-slate-500 font-medium block">출발 계기판</span>
                <span className="text-base font-extrabold font-mono text-slate-800">
                  {startOdo.toLocaleString()} km
                </span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <span className="text-[11px] text-slate-500 font-medium block">도착 계기판</span>
                <span className="text-base font-extrabold font-mono text-slate-800">
                  {endOdo.toLocaleString()} km
                </span>
              </div>
              <div className="bg-blue-50/70 p-3 rounded-xl border border-blue-200">
                <span className="text-[11px] text-blue-700 font-semibold block">총 업무 주행거리</span>
                <span className="text-base font-extrabold font-mono text-blue-700">
                  +{distance.toLocaleString()} km
                </span>
              </div>
            </div>
          </div>

          {/* Odometer Photos Comparison */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              계기판 실물 촬영 인증 (출발 전 vs 반납 후)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                <div className="px-3 py-1.5 bg-slate-100 text-[11px] font-bold text-slate-700 flex justify-between">
                  <span>출발 시 계기판</span>
                  <span>{startOdo.toLocaleString()} km</span>
                </div>
                {tripRecord?.startOdometerPhoto ? (
                  <img
                    src={tripRecord.startOdometerPhoto}
                    alt="출발 계기판"
                    className="w-full h-40 object-cover"
                  />
                ) : (
                  <div className="h-40 flex items-center justify-center text-xs text-slate-400">사진 없음</div>
                )}
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                <div className="px-3 py-1.5 bg-emerald-100 text-[11px] font-bold text-emerald-800 flex justify-between">
                  <span>도착 반납 계기판</span>
                  <span>{endOdo.toLocaleString()} km</span>
                </div>
                {tripRecord?.endOdometerPhoto ? (
                  <img
                    src={tripRecord.endOdometerPhoto}
                    alt="도착 계기판"
                    className="w-full h-40 object-cover"
                  />
                ) : (
                  <div className="h-40 flex items-center justify-center text-xs text-slate-400">사진 없음</div>
                )}
              </div>
            </div>
          </div>

          {/* Exterior Inspection Photos */}
          {tripRecord?.startExteriorPhotos && tripRecord.startExteriorPhotos.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                출발 전 외관 4방향 보관 기록
              </h4>
              <div className="grid grid-cols-4 gap-2">
                {tripRecord.startExteriorPhotos.map((p, i) => (
                  <div key={i} className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                    <img src={p.url} alt={p.angle} className="w-full h-16 object-cover" />
                    <div className="text-[10px] text-center font-bold text-slate-600 py-1 bg-slate-100">
                      {p.angle === 'front' ? '전면' : p.angle === 'rear' ? '후면' : p.angle === 'left' ? '좌측' : '우측'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Expenses & Defect Report */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Expense info */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1.5 text-xs">
              <div className="font-bold text-slate-800 flex items-center gap-1.5">
                <Receipt className="w-4 h-4 text-blue-600" />
                지출 경비 및 영수증 증빙
              </div>
              <div className="flex justify-between text-slate-600">
                <span>주유비:</span>
                <span className="font-bold text-slate-900">{(tripRecord?.fuelCost || 0).toLocaleString()}원</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>통행료(하이패스):</span>
                <span className="font-bold text-slate-900">{(tripRecord?.tollFee || 0).toLocaleString()}원</span>
              </div>
              {tripRecord?.receiptPhoto && (
                <div className="pt-2">
                  <span className="text-[10px] text-slate-400 block mb-1">첨부 영수증:</span>
                  <img src={tripRecord.receiptPhoto} alt="영수증" className="w-20 h-20 object-cover rounded-md border" />
                </div>
              )}
            </div>

            {/* Defect info */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1.5 text-xs">
              <div className="font-bold text-slate-800 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                외관 상태 및 파손 보고
              </div>
              {tripRecord?.hasDefectReported ? (
                <div className="p-2 bg-rose-50 border border-rose-200 rounded text-rose-800">
                  <span className="font-bold block mb-0.5">⚠️ 파손/이상 접수 건:</span>
                  <p className="text-[11px] leading-relaxed">{tripRecord.defectNotes}</p>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-emerald-700 font-medium pt-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>특이사항 없음 (정상 반납)</span>
                </div>
              )}
              {tripRecord?.returnNotes && (
                <div className="text-[11px] text-slate-500 pt-1">
                  <strong>반납 메모:</strong> {tripRecord.returnNotes}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
          >
            확인 및 닫기
          </button>
        </div>
      </div>
    </div>
  );
};
