import React, { useState } from 'react';
import { 
  X, 
  Camera, 
  Key, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Gauge, 
  Image as ImageIcon,
  Sparkles
} from 'lucide-react';
import { Vehicle, Reservation, InspectionPhoto } from '../../types/fleet';

interface DepartureCheckinModalProps {
  isOpen: boolean;
  onClose: () => void;
  reservation: Reservation;
  vehicle: Vehicle;
  onConfirmDeparture: (data: {
    startOdometer: number;
    startOdometerPhoto: string;
    startExteriorPhotos: InspectionPhoto[];
  }) => void;
}

export const DepartureCheckinModal: React.FC<DepartureCheckinModalProps> = ({
  isOpen,
  onClose,
  reservation,
  vehicle,
  onConfirmDeparture,
}) => {
  if (!isOpen) return null;

  const [startOdometer, setStartOdometer] = useState<number>(vehicle.currentOdometer);
  const [odometerPhoto, setOdometerPhoto] = useState<string>(
    'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=600&q=80'
  );
  const [exteriorPhotos, setExteriorPhotos] = useState<InspectionPhoto[]>([
    { angle: 'front', url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=400&q=80', timestamp: new Date().toISOString() },
    { angle: 'rear', url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=400&q=80', timestamp: new Date().toISOString() },
    { angle: 'left', url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=400&q=80', timestamp: new Date().toISOString() },
    { angle: 'right', url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=400&q=80', timestamp: new Date().toISOString() },
  ]);
  const [hasConfirmedKey, setHasConfirmedKey] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, angle: InspectionPhoto['angle']) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      if (angle === 'odometer') {
        setOdometerPhoto(result);
      } else {
        setExteriorPhotos((prev) => {
          const filtered = prev.filter((p) => p.angle !== angle);
          return [...filtered, { angle, url: result, timestamp: new Date().toISOString() }];
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleQuickFillSample = () => {
    setStartOdometer(vehicle.currentOdometer);
    setOdometerPhoto('https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=600&q=80');
    setHasConfirmedKey(true);
    setErrorMsg(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (startOdometer < vehicle.currentOdometer) {
      setErrorMsg(`출발 계기판 수치는 이전 최종 누적거리(${vehicle.currentOdometer.toLocaleString()} km) 이상이어야 합니다.`);
      return;
    }
    if (!odometerPhoto) {
      setErrorMsg('출발 전 계기판 촬영 사진은 필수 증빙입니다.');
      return;
    }
    if (!hasConfirmedKey) {
      setErrorMsg('스마트키 수령 확인 체크박스를 선택해 주세요.');
      return;
    }

    onConfirmDeparture({
      startOdometer,
      startOdometerPhoto: odometerPhoto,
      startExteriorPhotos: exteriorPhotos,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-700 to-indigo-800 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/10 text-white">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">운행 시작 전 체크인 (출발 검수)</h3>
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

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Key Box Location Banner */}
          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-start gap-3">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg">
              <Key className="w-4 h-4" />
            </div>
            <div className="text-xs leading-relaxed text-emerald-950 flex-1">
              <div className="font-bold text-sm text-emerald-900 mb-0.5">스마트키 수령 위치 안내</div>
              <div><strong>보관 위치:</strong> {vehicle.parkingLocation}</div>
              <div><strong>키 보관함:</strong> <span className="text-emerald-700 font-extrabold">{vehicle.smartKeyBoxNumber}</span></div>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Odometer Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5 text-blue-600" />
                1. 출발 계기판 누적거리 확인 (km) *
              </label>
              <button
                type="button"
                onClick={handleQuickFillSample}
                className="text-[11px] text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" />
                데모 자동 완성
              </button>
            </div>

            <div className="relative">
              <input
                type="number"
                value={startOdometer}
                onChange={(e) => setStartOdometer(Number(e.target.value))}
                min={vehicle.currentOdometer}
                required
                className="w-full text-base font-bold font-mono px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-900"
              />
              <span className="absolute right-4 top-3 text-xs font-bold text-slate-400">km</span>
            </div>
            <p className="text-[11px] text-slate-500">
              * 차량에 탑승 후 시동을 켜고 실제 계기판에 표시된 총 주행거리를 기재하세요. (이전 기록: {vehicle.currentOdometer.toLocaleString()} km)
            </p>
          </div>

          {/* Odometer Photo Capture */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              2. 출발 계기판 사진 등록 (필수 증빙) *
            </label>
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-3 bg-slate-50 flex items-center gap-4">
              {odometerPhoto ? (
                <div className="relative w-28 h-20 rounded-lg overflow-hidden shrink-0 border border-slate-200">
                  <img src={odometerPhoto} alt="계기판 사진" className="w-full h-full object-cover" />
                  <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[9px] px-1 rounded">등록됨</span>
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
                  <span>카메라 촬영 / 사진 선택</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, 'odometer')}
                  />
                </label>
                <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
                  모바일 브라우저에서 카메라가 실행되며 계기판 수치가 선명하게 나오도록 촬영해 주세요.
                </p>
              </div>
            </div>
          </div>

          {/* 4-angle Exterior Photos */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              3. 차량 외관 4방향 점검 (스크래치/파손 분쟁 방지)
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['front', 'rear', 'left', 'right'] as const).map((angle) => {
                const photo = exteriorPhotos.find((p) => p.angle === angle);
                const labels: Record<string, string> = {
                  front: '전면',
                  rear: '후면',
                  left: '좌측면',
                  right: '우측면',
                };
                return (
                  <label
                    key={angle}
                    className="relative border border-slate-200 rounded-xl p-2 bg-slate-50 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 transition-colors h-24"
                  >
                    {photo ? (
                      <img src={photo.url} alt={labels[angle]} className="w-full h-14 object-cover rounded-md mb-1" />
                    ) : (
                      <ImageIcon className="w-5 h-5 text-slate-400 mb-1" />
                    )}
                    <span className="text-[10px] font-bold text-slate-700">{labels[angle]}</span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, angle)}
                    />
                  </label>
                );
              })}
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5">
              * 출발 전 기존 흠집이나 파손 부위가 있다면 사진을 촬영해 기록해 두시면 반납 시 책임 소재 분쟁이 예방됩니다.
            </p>
          </div>

          {/* Key Confirm Checkbox */}
          <div className="pt-2 border-t border-slate-100">
            <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={hasConfirmedKey}
                onChange={(e) => setHasConfirmedKey(e.target.checked)}
                className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="text-xs text-slate-700 leading-relaxed font-medium">
                보관함에서 스마트키를 수령하였으며, 차량의 상태 및 계기판 주행거리를 확인하고 안전 운전을 준수하겠습니다.
              </span>
            </label>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            className="px-5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>검수 완료 및 운행 시작 (IN_USE)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
