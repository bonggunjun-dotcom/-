import React, { useState } from 'react';
import { 
  X, 
  Camera, 
  CheckCircle2, 
  AlertTriangle, 
  Receipt, 
  Fuel, 
  Gauge, 
  ShieldAlert, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Vehicle, Reservation, TripRecord, InspectionPhoto } from '../../types/fleet';

interface ReturnCheckinModalProps {
  isOpen: boolean;
  onClose: () => void;
  reservation: Reservation;
  vehicle: Vehicle;
  tripRecord?: TripRecord;
  onConfirmReturn: (data: {
    endOdometer: number;
    endOdometerPhoto: string;
    endExteriorPhotos: InspectionPhoto[];
    fuelCost: number;
    tollFee: number;
    receiptPhoto?: string;
    returnNotes: string;
    hasDefectReported: boolean;
    defectNotes?: string;
  }) => void;
}

export const ReturnCheckinModal: React.FC<ReturnCheckinModalProps> = ({
  isOpen,
  onClose,
  reservation,
  vehicle,
  tripRecord,
  onConfirmReturn,
}) => {
  if (!isOpen) return null;

  const startOdometer = tripRecord?.startOdometer || vehicle.currentOdometer;
  const estimatedReturnOdo = startOdometer + (reservation.estimatedDistanceKm || 50);

  const [endOdometer, setEndOdometer] = useState<number>(estimatedReturnOdo);
  const [endOdometerPhoto, setEndOdometerPhoto] = useState<string>(
    'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=600&q=80'
  );
  const [endExteriorPhotos, setEndExteriorPhotos] = useState<InspectionPhoto[]>([]);
  const [fuelCost, setFuelCost] = useState<number>(0);
  const [tollFee, setTollFee] = useState<number>(0);
  const [receiptPhoto, setReceiptPhoto] = useState<string>('');
  const [returnNotes, setReturnNotes] = useState('이상 없이 안전하게 반납 주차 완료했습니다.');
  const [hasDefectReported, setHasDefectReported] = useState(false);
  const [defectNotes, setDefectNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const distanceTraveled = endOdometer - startOdometer;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'odometer' | 'receipt' | 'defect') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      if (type === 'odometer') {
        setEndOdometerPhoto(result);
      } else if (type === 'receipt') {
        setReceiptPhoto(result);
      } else if (type === 'defect') {
        setEndExteriorPhotos((prev) => [
          ...prev,
          { angle: 'defect', url: result, timestamp: new Date().toISOString() },
        ]);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleQuickDemoFill = () => {
    setEndOdometer(startOdometer + 65);
    setEndOdometerPhoto('https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=600&q=80');
    setFuelCost(45000);
    setTollFee(6800);
    setReceiptPhoto('https://images.unsplash.com/photo-1554415707-9e49017aed81?auto=format&fit=crop&w=500&q=80');
    setErrorMsg(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Odometer validation edge case:
    if (endOdometer < startOdometer) {
      setErrorMsg(
        `[입력 오류] 반납 계기판 수치(${endOdometer.toLocaleString()} km)는 출발 수치(${startOdometer.toLocaleString()} km) 이상이어야 합니다. 주행거리는 음수가 될 수 없습니다.`
      );
      return;
    }

    // 2. Photo validation
    if (!endOdometerPhoto) {
      setErrorMsg('도착 계기판 사진 등록은 국세청 및 사내 검수 규정상 필수입니다.');
      return;
    }

    if (hasDefectReported && !defectNotes.trim()) {
      setErrorMsg('파손 또는 차량 이상 내용을 상세히 기재해 주세요.');
      return;
    }

    onConfirmReturn({
      endOdometer,
      endOdometerPhoto,
      endExteriorPhotos,
      fuelCost,
      tollFee,
      receiptPhoto: receiptPhoto || undefined,
      returnNotes,
      hasDefectReported,
      defectNotes: hasDefectReported ? defectNotes : undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/10 text-white">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-bold text-base">차량 반납 검수 및 운행기록 등록</h3>
              <p className="text-xs text-blue-200">
                {vehicle.modelName} &bull; {vehicle.plateNumber}
              </p>
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
          {/* Quick Demo Fill button */}
          <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <span className="text-xs text-slate-600 font-medium">
              출발 당시 주행거리: <strong className="text-slate-900 font-mono">{startOdometer.toLocaleString()} km</strong>
            </span>
            <button
              type="button"
              onClick={handleQuickDemoFill}
              className="text-xs text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5" />
              데모 값 빠른 채우기
            </button>
          </div>

          {/* Error Callout */}
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-300 text-rose-900 rounded-xl text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed font-medium">{errorMsg}</div>
            </div>
          )}

          {/* Odometer Input & Auto Calculation */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
              1. 도착 계기판 총 주행거리 (km) *
            </label>
            <div className="relative">
              <input
                type="number"
                value={endOdometer}
                onChange={(e) => {
                  setEndOdometer(Number(e.target.value));
                  if (errorMsg) setErrorMsg(null);
                }}
                min={startOdometer}
                required
                className={`w-full text-base font-bold font-mono px-4 py-2.5 bg-white border rounded-xl focus:outline-hidden focus:ring-2 ${
                  distanceTraveled < 0
                    ? 'border-rose-400 bg-rose-50/50 text-rose-700 focus:ring-rose-400'
                    : 'border-slate-300 text-slate-900 focus:ring-blue-500'
                }`}
              />
              <span className="absolute right-4 top-3 text-xs font-bold text-slate-400">km</span>
            </div>

            {/* Calculated Distance Pill */}
            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-slate-500">
                출발: {startOdometer.toLocaleString()} km &rarr; 도착: {endOdometer.toLocaleString()} km
              </span>
              <span
                className={`px-2.5 py-1 rounded-md font-bold font-mono ${
                  distanceTraveled < 0
                    ? 'bg-rose-100 text-rose-700'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {distanceTraveled < 0
                  ? `주행거리 역전 오류 (${distanceTraveled} km)`
                  : `총 운행 거리: +${distanceTraveled.toLocaleString()} km`}
              </span>
            </div>
          </div>

          {/* End Odometer Photo (Required) */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              2. 도착 계기판 인증 사진 촬영 (국세청 증빙 필수) *
            </label>
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-3 bg-slate-50 flex items-center gap-4">
              {endOdometerPhoto ? (
                <div className="relative w-28 h-20 rounded-lg overflow-hidden shrink-0 border border-slate-200">
                  <img src={endOdometerPhoto} alt="도착 계기판" className="w-full h-full object-cover" />
                  <span className="absolute bottom-1 right-1 bg-emerald-700 text-white text-[9px] px-1 rounded">등록완료</span>
                </div>
              ) : (
                <div className="w-28 h-20 rounded-lg bg-slate-200 flex flex-col items-center justify-center text-slate-400 shrink-0">
                  <Camera className="w-6 h-6 mb-1" />
                  <span className="text-[10px]">사진 없음</span>
                </div>
              )}

              <div className="flex-1">
                <label className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg cursor-pointer shadow-xs transition-colors">
                  <Camera className="w-4 h-4 text-blue-600" />
                  <span>도착 계기판 촬영/업로드</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, 'odometer')}
                  />
                </label>
                <p className="text-[11px] text-slate-500 mt-1">
                  모바일 후면 카메라로 계기판 숫자가 또렷하게 보이도록 찍어주세요.
                </p>
              </div>
            </div>
          </div>

          {/* Expenses: Fuel & Toll with receipt */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Receipt className="w-3.5 h-3.5 text-blue-600" />
                3. 운행 중 지출 경비 정산 (선택)
              </label>
              <span className="text-[11px] text-slate-500">법인카드 / 개인 결제 실비</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  주유비 / 충전비 (원)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={fuelCost}
                    onChange={(e) => setFuelCost(Number(e.target.value))}
                    step="1000"
                    placeholder="0"
                    className="w-full text-xs font-bold font-mono px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-800"
                  />
                  <span className="absolute right-3 top-2 text-xs text-slate-400">원</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  하이패스 / 통행료 (원)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={tollFee}
                    onChange={(e) => setTollFee(Number(e.target.value))}
                    step="100"
                    placeholder="0"
                    className="w-full text-xs font-bold font-mono px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-800"
                  />
                  <span className="absolute right-3 top-2 text-xs text-slate-400">원</span>
                </div>
              </div>
            </div>

            {/* Receipt upload */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                영수증 사진 첨부
              </label>
              <div className="flex items-center gap-3">
                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-medium rounded-lg cursor-pointer transition-colors">
                  <Receipt className="w-3.5 h-3.5 text-slate-600" />
                  <span>영수증 촬영/선택</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, 'receipt')}
                  />
                </label>
                {receiptPhoto && (
                  <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> 영수증 등록됨
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Vehicle Defect & Notes */}
          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={hasDefectReported}
                  onChange={(e) => setHasDefectReported(e.target.checked)}
                  className="rounded text-rose-600 focus:ring-rose-500"
                />
                <span className="text-xs font-bold text-slate-800">
                  운행 중 파손, 흠집 또는 정비 필요 이상이 발생했나요?
                </span>
              </div>
              <ShieldAlert className={`w-4 h-4 ${hasDefectReported ? 'text-rose-600' : 'text-slate-400'}`} />
            </label>

            {hasDefectReported && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-2">
                <label className="block text-xs font-bold text-rose-900">
                  이상 및 파손 상세 내용 *
                </label>
                <textarea
                  rows={2}
                  value={defectNotes}
                  onChange={(e) => setDefectNotes(e.target.value)}
                  placeholder="예: 후진 주차 중 보도블록에 리어 범퍼 하단 미세 스크래치 발생"
                  className="w-full text-xs p-2 bg-white border border-rose-300 rounded-lg text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                />
                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-rose-300 hover:bg-rose-100 text-rose-800 text-xs font-semibold rounded-lg cursor-pointer">
                  <Camera className="w-3.5 h-3.5" />
                  <span>파손 부위 사진 추가</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, 'defect')}
                  />
                </label>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                반납 메모 / 주차 위치
              </label>
              <input
                type="text"
                value={returnNotes}
                onChange={(e) => setReturnNotes(e.target.value)}
                placeholder="예: 본사 지하 2층 A-14 정상 주차 완료, 키 보관함에 반납함"
                className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800"
              />
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            반납 후 <span className="font-bold text-slate-700">30분 정비 시간</span>이 자동 부여됩니다.
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
              disabled={distanceTraveled < 0}
              className={`px-5 py-2 text-xs font-bold rounded-lg shadow-xs transition-colors flex items-center gap-1.5 text-white ${
                distanceTraveled < 0
                  ? 'bg-slate-400 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>반납 확정 및 운행기록부 반영</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
