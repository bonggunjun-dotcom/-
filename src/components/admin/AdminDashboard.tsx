import React, { useState } from 'react';
import { 
  Car, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  Wrench, 
  FileSpreadsheet, 
  ShieldCheck, 
  ArrowRightLeft, 
  Search, 
  Plus, 
  Phone, 
  Calendar,
  Image as ImageIcon,
  Key,
  Gauge,
  Receipt
} from 'lucide-react';
import { Vehicle, Reservation, TripRecord, FleetAlert } from '../../types/fleet';
import { NTSReportViewer } from './NTSReportViewer';

interface AdminDashboardProps {
  vehicles: Vehicle[];
  reservations: Reservation[];
  tripRecords: TripRecord[];
  alerts: FleetAlert[];
  onApproveReservation: (id: string, adminNotes?: string) => void;
  onRejectReservation: (id: string, reason: string) => void;
  onReassignVehicle: (reservationId: string, newVehicleId: string) => void;
  onToggleMaintenance: (vehicleId: string) => void;
  onAddNewVehicle: (newVehicle: Omit<Vehicle, 'id'>) => void;
  onViewRecordDetail: (reservation: Reservation) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  vehicles,
  reservations,
  tripRecords,
  alerts,
  onApproveReservation,
  onRejectReservation,
  onReassignVehicle,
  onToggleMaintenance,
  onAddNewVehicle,
  onViewRecordDetail,
}) => {
  const [activeTab, setActiveTab] = useState<'approvals' | 'vehicles' | 'nts_reports' | 'photo_audit'>('approvals');
  const [rejectModalOpen, setRejectModalOpen] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [reassignModalOpen, setReassignModalOpen] = useState<Reservation | null>(null);
  const [reassignTargetVehicleId, setReassignTargetVehicleId] = useState<string>('');
  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false);

  // New vehicle form state
  const [newPlate, setNewPlate] = useState('');
  const [newModel, setNewModel] = useState('');
  const [newCategory, setNewCategory] = useState<Vehicle['category']>('SUV');
  const [newSeats, setNewSeats] = useState(5);
  const [newFuel, setNewFuel] = useState<Vehicle['fuelType']>('HYBRID');
  const [newOdo, setNewOdo] = useState(15000);
  const [newParking, setNewParking] = useState('본사 지하 2층 B-12');
  const [newKeyBox, setNewKeyBox] = useState('7번 보관함 (비번: 7711#)');

  // KPI Calculations
  const totalVehicles = vehicles.length;
  const inUseVehicles = vehicles.filter((v) => v.status === 'IN_USE').length;
  const maintenanceVehicles = vehicles.filter((v) => v.status === 'MAINTENANCE').length;
  const availableVehicles = vehicles.filter((v) => v.status === 'AVAILABLE').length;
  const utilizationRate = totalVehicles > 0 ? Math.round(((inUseVehicles) / totalVehicles) * 100) : 0;
  const pendingRequests = reservations.filter((r) => r.status === 'REQUESTED');
  const inUseTrips = reservations.filter((r) => r.status === 'IN_USE');

  const handleCreateVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlate || !newModel) return;

    onAddNewVehicle({
      plateNumber: newPlate,
      modelName: newModel,
      category: newCategory,
      seatingCapacity: Number(newSeats),
      fuelType: newFuel,
      currentOdometer: Number(newOdo),
      status: 'AVAILABLE',
      insuranceExpiryDate: '2027-10-01',
      nextInspectionDate: '2027-08-15',
      parkingLocation: newParking,
      smartKeyBoxNumber: newKeyBox,
      imageUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80',
      efficiency: '12.5 km/L',
    });

    setShowAddVehicleModal(false);
    setNewPlate('');
    setNewModel('');
  };

  const getDDay = (targetDateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(targetDateStr);
    target.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>보유 법인차량</span>
            <Car className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1 font-mono">
            {totalVehicles} <span className="text-xs font-normal text-slate-500">대</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            가용 {availableVehicles}대 &bull; 점검 {maintenanceVehicles}대
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>실시간 가동률</span>
            <Gauge className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-indigo-700 mt-1 font-mono">
            {utilizationRate}%
          </div>
          <div className="text-[11px] text-indigo-600 font-medium mt-1">
            {inUseVehicles}대 주행 운행 중
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>승인 대기 건</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-600 mt-1 font-mono">
            {pendingRequests.length} <span className="text-xs font-normal text-slate-500">건</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {pendingRequests.length > 0 ? '즉시 검토 필요' : '처리 완료'}
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>정기검사 임박</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-rose-600 mt-1 font-mono">
            1 <span className="text-xs font-normal text-rose-700 font-sans">D-8</span>
          </div>
          <div className="text-[11px] text-rose-600 mt-1 truncate">
            아반떼 (90마 9012)
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>국세청 법정서식</span>
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-1 font-mono">
            100%
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">
            손금 전액 인정 적격
          </div>
        </div>
      </div>

      {/* Admin Nav Tabs */}
      <div className="border-b border-slate-200 bg-white rounded-2xl p-1.5 shadow-xs flex flex-wrap gap-1">
        <button
          onClick={() => setActiveTab('approvals')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'approvals'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>배차 승인 & 실시간 운행 관제</span>
          {pendingRequests.length > 0 && (
            <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] flex items-center justify-center font-bold">
              {pendingRequests.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('vehicles')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'vehicles'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Car className="w-4 h-4" />
          <span>법인차량 관리 및 정비/점검</span>
        </button>

        <button
          onClick={() => setActiveTab('nts_reports')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'nts_reports'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>국세청 업무용승용차 운행기록부 (별지 제29호의2서식)</span>
        </button>

        <button
          onClick={() => setActiveTab('photo_audit')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'photo_audit'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>계기판·외관 검수 사진 아카이브</span>
        </button>
      </div>

      {/* Tab 1: Approvals & Live Monitoring */}
      {activeTab === 'approvals' && (
        <div className="space-y-6">
          {/* Pending Approval Section */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
                  임직원 배차 승인 요청 ({pendingRequests.length}건)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  신청 내용 확인 후 1-클릭 승인, 반려 사유 입력 또는 타 차량으로 수동 재배정이 가능합니다.
                </p>
              </div>
            </div>

            {pendingRequests.length === 0 ? (
              <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-xl">
                <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 mb-1" />
                <p className="text-xs font-medium text-slate-600">대기 중인 승인 요청이 없습니다.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingRequests.map((req) => {
                  const vehicle = vehicles.find((v) => v.id === req.vehicleId);

                  return (
                    <div
                      key={req.id}
                      className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-extrabold text-slate-900">{req.userName}</span>
                          <span className="text-xs text-slate-500">({req.userDepartment})</span>
                          <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                            {vehicle?.modelName} ({vehicle?.plateNumber})
                          </span>
                          <span className="text-[11px] font-semibold text-slate-600 bg-slate-200 px-2 py-0.5 rounded">
                            {req.purposeType === 'COMMUTE' ? '출퇴근' : '일반업무'}
                          </span>
                        </div>

                        <div className="text-xs text-slate-600 flex flex-wrap items-center gap-3">
                          <span className="flex items-center gap-1 text-slate-700 font-medium">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {new Date(req.startTime).toLocaleString()} ~ {new Date(req.endTime).toLocaleTimeString()}
                          </span>
                          <span>&bull;</span>
                          <span className="font-semibold text-slate-800">행선지: {req.destination}</span>
                          <span>&bull;</span>
                          <span>동승: {req.passengers}</span>
                        </div>

                        <p className="text-xs text-slate-600 leading-relaxed bg-white p-2.5 rounded-lg border border-slate-200">
                          <strong>업무 목적:</strong> {req.purposeDetail}
                        </p>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                        <button
                          onClick={() => {
                            setReassignModalOpen(req);
                            setReassignTargetVehicleId(req.vehicleId);
                          }}
                          className="px-3 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1"
                        >
                          <ArrowRightLeft className="w-3.5 h-3.5 text-slate-500" />
                          <span>차량 재배정</span>
                        </button>
                        <button
                          onClick={() => {
                            setRejectModalOpen(req.id);
                            setRejectReason('해당 시간 본사 임원 의전 우선 배차');
                          }}
                          className="px-3 py-2 bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-lg transition-colors"
                        >
                          반려
                        </button>
                        <button
                          onClick={() => onApproveReservation(req.id)}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>승인 확정</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Active Trips Monitor */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
            <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse"></span>
              실시간 도로 운행 관제 ({inUseTrips.length}대)
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              출발 계기판 및 외관 사진 검수 완료 후 현재 주행 중인 차량 현황
            </p>

            {inUseTrips.length === 0 ? (
              <div className="text-center py-6 text-slate-400 bg-slate-50 rounded-xl text-xs">
                현재 도로를 운행 중인 차량이 없습니다.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {inUseTrips.map((res) => {
                  const vehicle = vehicles.find((v) => v.id === res.vehicleId);
                  const trip = tripRecords.find((t) => t.reservationId === res.id);

                  return (
                    <div key={res.id} className="p-4 rounded-xl border border-blue-200 bg-blue-50/30 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-bold text-sm text-slate-900">{vehicle?.modelName}</span>
                          <span className="ml-2 font-mono text-xs font-bold text-blue-700">{vehicle?.plateNumber}</span>
                        </div>
                        <span className="px-2 py-0.5 text-[10px] font-extrabold bg-blue-600 text-white rounded">
                          운행 중
                        </span>
                      </div>

                      <div className="text-xs text-slate-600">
                        <div><strong>운전자:</strong> {res.userName} ({res.userDepartment}) &bull; {res.userPhone}</div>
                        <div><strong>행선지:</strong> {res.destination}</div>
                        <div><strong>출발 계기판:</strong> {trip?.startOdometer.toLocaleString() || vehicle?.currentOdometer.toLocaleString()} km</div>
                        <div><strong>반납 예정:</strong> {new Date(res.endTime).toLocaleTimeString()}</div>
                      </div>

                      <div className="pt-2 flex justify-end">
                        <button
                          onClick={() => onViewRecordDetail(res)}
                          className="text-xs font-bold text-blue-600 hover:text-blue-800"
                        >
                          출발 사진 및 검수 확인 &rarr;
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Vehicle Management & Maintenance */}
      {activeTab === 'vehicles' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">법인차량 마스터 등록 및 정비 관리</h3>
              <p className="text-xs text-slate-500">차량별 누적거리, 정기검사 D-Day, 보험 만료일 및 임시 점검 전환</p>
            </div>
            <button
              onClick={() => setShowAddVehicleModal(true)}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>법인차량 신규 등록</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {vehicles.map((v) => {
              const isMaint = v.status === 'MAINTENANCE';
              const isInUse = v.status === 'IN_USE';
              const dDayInspect = getDDay(v.nextInspectionDate);
              const isInspectDueSoon = dDayInspect <= 30;

              return (
                <div
                  key={v.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between hover:shadow-md transition-all"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                          {v.category} &bull; {v.fuelType}
                        </span>
                        <h4 className="text-sm font-extrabold text-slate-900">{v.modelName}</h4>
                        <div className="text-xs font-mono font-bold text-blue-700 mt-0.5">{v.plateNumber}</div>
                      </div>
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                          isMaint
                            ? 'bg-rose-100 text-rose-700'
                            : isInUse
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {isMaint ? '점검 중' : isInUse ? '운행 중' : '배차 가능'}
                      </span>
                    </div>

                    {/* Meta stats */}
                    <div className="mt-4 space-y-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                      <div className="flex justify-between">
                        <span>현재 누적거리:</span>
                        <strong className="font-mono text-slate-900">{v.currentOdometer.toLocaleString()} km</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>주차 위치:</span>
                        <span className="font-medium text-slate-800">{v.parkingLocation}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>키 보관함:</span>
                        <span className="font-medium text-indigo-700">{v.smartKeyBoxNumber}</span>
                      </div>
                      <div className="flex justify-between items-center pt-1 border-t border-slate-200">
                        <span>정기검사일:</span>
                        <span className={`font-semibold ${isInspectDueSoon ? 'text-rose-600 font-bold' : 'text-slate-700'}`}>
                          {v.nextInspectionDate} {isInspectDueSoon && `(D-${dDayInspect})`}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>보험 만료일:</span>
                        <span className="text-slate-700">{v.insuranceExpiryDate}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => onToggleMaintenance(v.id)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1 ${
                        isMaint
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-slate-100 text-slate-700 hover:bg-rose-50 hover:text-rose-700'
                      }`}
                    >
                      <Wrench className="w-3.5 h-3.5" />
                      <span>{isMaint ? '정비 완료 (가용 전환)' : '점검 상태로 전환'}</span>
                    </button>
                    <span className="text-[11px] text-slate-400">{v.efficiency}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Official NTS Logbook Viewer */}
      {activeTab === 'nts_reports' && (
        <NTSReportViewer
          vehicles={vehicles}
          reservations={reservations}
          tripRecords={tripRecords}
        />
      )}

      {/* Tab 4: Photo & Inspection Archive */}
      {activeTab === 'photo_audit' && (
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">운행 전후 검수 사진 및 분쟁 방지 아카이브</h3>
            <p className="text-xs text-slate-500">
              출발 당시 계기판 수치 및 사진과 반납 당시 계기판/외관 사진을 비교하여 오기입 및 파손 책임 소재를 명확히 판별합니다.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tripRecords
              .filter((t) => t.endOdometer !== undefined)
              .map((t) => {
                const res = reservations.find((r) => r.id === t.reservationId);
                const veh = vehicles.find((v) => v.id === t.vehicleId);
                const distance = t.businessDistance || (t.endOdometer! - t.startOdometer);

                return (
                  <div key={t.id} className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <div>
                        <span className="font-extrabold text-sm text-slate-900">{veh?.modelName}</span>
                        <span className="ml-2 font-mono text-xs font-bold text-blue-700">{veh?.plateNumber}</span>
                      </div>
                      <span className="text-xs text-slate-500">
                        {t.checkedOutAt.split('T')[0]} &bull; {res?.userName}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                        <span className="text-[10px] text-slate-400 block">출발 계기판</span>
                        <strong className="text-sm font-mono text-slate-800">{t.startOdometer.toLocaleString()} km</strong>
                        {t.startOdometerPhoto && (
                          <img src={t.startOdometerPhoto} alt="출발" className="w-full h-24 object-cover rounded mt-1.5" />
                        )}
                      </div>
                      <div className="bg-emerald-50/50 p-2.5 rounded-lg border border-emerald-200">
                        <span className="text-[10px] text-emerald-700 block">도착 계기판 (+{distance} km)</span>
                        <strong className="text-sm font-mono text-emerald-900">{t.endOdometer?.toLocaleString()} km</strong>
                        {t.endOdometerPhoto && (
                          <img src={t.endOdometerPhoto} alt="도착" className="w-full h-24 object-cover rounded mt-1.5" />
                        )}
                      </div>
                    </div>

                    {t.hasDefectReported && (
                      <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800">
                        <strong>⚠️ 파손 보고 접수:</strong> {t.defectNotes}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs text-slate-500">
                        {res?.purposeDetail}
                      </span>
                      {res && (
                        <button
                          onClick={() => onViewRecordDetail(res)}
                          className="text-xs font-bold text-blue-600 hover:text-blue-800 shrink-0"
                        >
                          상세보기 &rarr;
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Reject Reservation Modal */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-6 space-y-4">
            <h4 className="font-bold text-slate-900 text-sm">배차 신청 반려 사유 입력</h4>
            <p className="text-xs text-slate-500">신청 임직원에게 반려 사유가 즉시 알림으로 전달됩니다.</p>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="예: VIP 행사로 인한 긴급 의전 배차 일정과 중복되어 반려합니다."
              className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setRejectModalOpen(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                취소
              </button>
              <button
                onClick={() => {
                  onRejectReservation(rejectModalOpen, rejectReason);
                  setRejectModalOpen(null);
                }}
                className="px-4 py-1.5 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-lg"
              >
                반려 처리
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reassign Vehicle Modal */}
      {reassignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-6 space-y-4">
            <h4 className="font-bold text-slate-900 text-sm">차량 수동 재배정 (관리자 권한)</h4>
            <p className="text-xs text-slate-500">
              {reassignModalOpen.userName}님의 신청 건을 다른 가용 차량으로 변경합니다.
            </p>
            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1 block">변경할 차량 선택</label>
              <select
                value={reassignTargetVehicleId}
                onChange={(e) => setReassignTargetVehicleId(e.target.value)}
                className="w-full text-xs font-semibold p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
              >
                {vehicles
                  .filter((v) => v.status !== 'MAINTENANCE')
                  .map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.modelName} ({v.plateNumber}) - {v.seatingCapacity}인승
                    </option>
                  ))}
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setReassignModalOpen(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                취소
              </button>
              <button
                onClick={() => {
                  onReassignVehicle(reassignModalOpen.id, reassignTargetVehicleId);
                  setReassignModalOpen(null);
                }}
                className="px-4 py-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              >
                재배정 및 승인
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Vehicle Modal */}
      {showAddVehicleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6 space-y-4">
            <h4 className="font-bold text-slate-900 text-base">법인차량 신규 등록</h4>
            <form onSubmit={handleCreateVehicle} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">차량등록번호 *</label>
                  <input
                    type="text"
                    placeholder="예: 88하 1234"
                    value={newPlate}
                    onChange={(e) => setNewPlate(e.target.value)}
                    required
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">차종 및 트림 *</label>
                  <input
                    type="text"
                    placeholder="예: 쏘렌토 하이브리드"
                    value={newModel}
                    onChange={(e) => setNewModel(e.target.value)}
                    required
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">차급</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded-lg"
                  >
                    <option value="SEDAN">세단 (SEDAN)</option>
                    <option value="SUV">SUV</option>
                    <option value="VAN">밴 (VAN)</option>
                    <option value="EV">전기차 (EV)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">연료</label>
                  <select
                    value={newFuel}
                    onChange={(e) => setNewFuel(e.target.value as any)}
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded-lg"
                  >
                    <option value="HYBRID">하이브리드</option>
                    <option value="GASOLINE">가솔린</option>
                    <option value="DIESEL">디젤</option>
                    <option value="ELECTRIC">전기</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">초기 주행거리</label>
                  <input
                    type="number"
                    value={newOdo}
                    onChange={(e) => setNewOdo(Number(e.target.value))}
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">주차 위치</label>
                  <input
                    type="text"
                    value={newParking}
                    onChange={(e) => setNewParking(e.target.value)}
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">키 보관함 번호</label>
                  <input
                    type="text"
                    value={newKeyBox}
                    onChange={(e) => setNewKeyBox(e.target.value)}
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddVehicleModal(false)}
                  className="px-3 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-xs"
                >
                  등록 완료
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
