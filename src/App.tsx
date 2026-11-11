import React, { useState, useEffect } from 'react';
import { 
  Car, 
  Calendar as CalendarIcon, 
  ListFilter, 
  Plus, 
  Clock, 
  MapPin, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Info,
  ChevronRight,
  Sparkles,
  Phone
} from 'lucide-react';
import { 
  Vehicle, 
  Reservation, 
  TripRecord, 
  FleetAlert, 
  UserProfile 
} from './types/fleet';
import { MOCK_USERS } from './data/mockData';
import { 
  loadStoredData, 
  saveStoredData, 
  resetToInitialMockData, 
  checkReservationOverlap 
} from './utils/storage';
import { Header } from './components/common/Header';
import { AlertBanner } from './components/common/AlertBanner';
import { AlertsModal } from './components/common/AlertsModal';
import { TripDetailModal } from './components/common/TripDetailModal';
import { BookingModal } from './components/employee/BookingModal';
import { DepartureCheckinModal } from './components/employee/DepartureCheckinModal';
import { ReturnCheckinModal } from './components/employee/ReturnCheckinModal';
import { TimelineCalendar } from './components/employee/TimelineCalendar';
import { MyReservationsView } from './components/employee/MyReservationsView';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { MobileAccessModal } from './components/common/MobileAccessModal';

export default function App() {
  // Core state loaded from localStorage or mockData
  const [data, setData] = useState(() => loadStoredData());
  const { vehicles, reservations, tripRecords, alerts } = data;

  // Role: EMPLOYEE vs ADMIN
  const [currentRole, setCurrentRole] = useState<'EMPLOYEE' | 'ADMIN'>('EMPLOYEE');

  // Employee subview: 'timeline' vs 'my_bookings'
  const [employeeSubView, setEmployeeSubView] = useState<'my_bookings' | 'timeline'>('my_bookings');

  // Modals
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [preselectedVehicleId, setPreselectedVehicleId] = useState<string | undefined>(undefined);
  const [departureReservation, setDepartureReservation] = useState<Reservation | null>(null);
  const [returnReservation, setReturnReservation] = useState<Reservation | null>(null);
  const [selectedRecordDetail, setSelectedRecordDetail] = useState<{ reservation: Reservation; vehicle: Vehicle; trip?: TripRecord } | null>(null);
  const [alertsModalOpen, setAlertsModalOpen] = useState(false);
  const [mobileAccessModalOpen, setMobileAccessModalOpen] = useState(false);

  // Success toast/notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Current logged in user (switch between Employee and Admin profile)
  const currentUser: UserProfile = currentRole === 'ADMIN' ? MOCK_USERS[3] : MOCK_USERS[0];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Sync to localStorage on changes
  useEffect(() => {
    saveStoredData({ vehicles, reservations, tripRecords, alerts });
  }, [vehicles, reservations, tripRecords, alerts]);

  // Find active IN_USE reservation for the current user or fleet to power the 30-min alert banner
  const activeInUseReservation = reservations.find(
    (r) => r.status === 'IN_USE' && (currentRole === 'ADMIN' || r.userId === currentUser.id)
  );
  const activeInUseVehicle = activeInUseReservation
    ? vehicles.find((v) => v.id === activeInUseReservation.vehicleId)
    : undefined;

  // Calculate minutes remaining
  let minutesRemaining: number | undefined = undefined;
  if (activeInUseReservation) {
    const end = new Date(activeInUseReservation.endTime).getTime();
    const now = Date.now();
    minutesRemaining = Math.round((end - now) / (60 * 1000));
  }

  // --- Handlers ---
  const handleRoleToggle = () => {
    setCurrentRole((prev) => (prev === 'EMPLOYEE' ? 'ADMIN' : 'EMPLOYEE'));
  };

  const handleResetData = () => {
    if (confirm('모든 데이터를 초기 시연용 데이터(카니발 운행중, 국세청 과거기록 4건 등)로 복원하시겠습니까?')) {
      const reset = resetToInitialMockData();
      setData(reset);
      showToast('초기 데모 데이터셋으로 성공적으로 복원되었습니다.');
    }
  };

  const handleOpenBooking = (vehicleId?: string) => {
    setPreselectedVehicleId(vehicleId);
    setBookingModalOpen(true);
  };

  // 1. Submit New Reservation
  const handleConfirmBooking = (newResData: Omit<Reservation, 'id' | 'createdAt'>) => {
    const newReservation: Reservation = {
      ...newResData,
      id: `res-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    setData((prev) => ({
      ...prev,
      reservations: [newReservation, ...prev.reservations],
    }));

    showToast('배차 신청이 접수되었습니다. (총무팀 승인 대기)');
    setBookingModalOpen(false);
  };

  // 2. Admin Approve Reservation
  const handleApproveReservation = (id: string, adminNotes?: string) => {
    setData((prev) => ({
      ...prev,
      reservations: prev.reservations.map((r) =>
        r.id === id ? { ...r, status: 'APPROVED', adminNotes: adminNotes || '관리자 승인 완료' } : r
      ),
    }));
    showToast('예약이 승인 확정되었습니다. 운행 시작 체크인이 가능합니다.');
  };

  // 3. Admin Reject Reservation
  const handleRejectReservation = (id: string, reason: string) => {
    setData((prev) => ({
      ...prev,
      reservations: prev.reservations.map((r) =>
        r.id === id ? { ...r, status: 'CANCELED', rejectionReason: reason } : r
      ),
    }));
    showToast('배차 신청이 반려되었습니다.');
  };

  // 4. Admin Reassign Vehicle
  const handleReassignVehicle = (reservationId: string, newVehicleId: string) => {
    setData((prev) => ({
      ...prev,
      reservations: prev.reservations.map((r) =>
        r.id === reservationId ? { ...r, vehicleId: newVehicleId, status: 'APPROVED', adminNotes: '관리자 타 차량 재배정 승인' } : r
      ),
    }));
    showToast('차량이 재배정되고 승인 처리되었습니다.');
  };

  // 5. Start Trip (Check-in Departure) -> status becomes IN_USE
  const handleConfirmDeparture = (departureData: {
    startOdometer: number;
    startOdometerPhoto: string;
    startExteriorPhotos: any[];
  }) => {
    if (!departureReservation) return;

    const newTripRecord: TripRecord = {
      id: `trip-${Date.now()}`,
      reservationId: departureReservation.id,
      vehicleId: departureReservation.vehicleId,
      startOdometer: departureData.startOdometer,
      startOdometerPhoto: departureData.startOdometerPhoto,
      startExteriorPhotos: departureData.startExteriorPhotos,
      checkedOutAt: new Date().toISOString(),
    };

    setData((prev) => ({
      ...prev,
      reservations: prev.reservations.map((r) =>
        r.id === departureReservation.id ? { ...r, status: 'IN_USE' } : r
      ),
      vehicles: prev.vehicles.map((v) =>
        v.id === departureReservation.vehicleId
          ? { ...v, status: 'IN_USE', currentOdometer: departureData.startOdometer }
          : v
      ),
      tripRecords: [newTripRecord, ...prev.tripRecords],
    }));

    showToast('출발 검수 완료! 스마트키를 수령하고 안전운행하세요.');
    setDepartureReservation(null);
  };

  // 6. Complete Trip (Check-in Return) -> status becomes COMPLETED, verifies odometer
  const handleConfirmReturn = (returnData: {
    endOdometer: number;
    endOdometerPhoto: string;
    endExteriorPhotos: any[];
    fuelCost: number;
    tollFee: number;
    receiptPhoto?: string;
    returnNotes: string;
    hasDefectReported: boolean;
    defectNotes?: string;
  }) => {
    if (!returnReservation) return;

    const existingTrip = tripRecords.find((t) => t.reservationId === returnReservation.id);
    const startOdo = existingTrip?.startOdometer || vehicles.find(v => v.id === returnReservation.vehicleId)?.currentOdometer || returnData.endOdometer;
    const distance = returnData.endOdometer - startOdo;

    // Edge case check
    if (distance < 0) {
      alert('도착 계기판 수치는 출발 수치 이상이어야 합니다.');
      return;
    }

    const updatedTripRecord: TripRecord = existingTrip
      ? {
          ...existingTrip,
          endOdometer: returnData.endOdometer,
          endOdometerPhoto: returnData.endOdometerPhoto,
          endExteriorPhotos: returnData.endExteriorPhotos,
          checkedInAt: new Date().toISOString(),
          businessDistance: distance,
          fuelCost: returnData.fuelCost,
          tollFee: returnData.tollFee,
          receiptPhoto: returnData.receiptPhoto,
          returnNotes: returnData.returnNotes,
          hasDefectReported: returnData.hasDefectReported,
          defectNotes: returnData.defectNotes,
        }
      : {
          id: `trip-${Date.now()}`,
          reservationId: returnReservation.id,
          vehicleId: returnReservation.vehicleId,
          startOdometer: startOdo,
          startOdometerPhoto: returnData.endOdometerPhoto,
          startExteriorPhotos: [],
          checkedOutAt: returnReservation.startTime,
          endOdometer: returnData.endOdometer,
          endOdometerPhoto: returnData.endOdometerPhoto,
          endExteriorPhotos: returnData.endExteriorPhotos,
          checkedInAt: new Date().toISOString(),
          businessDistance: distance,
          fuelCost: returnData.fuelCost,
          tollFee: returnData.tollFee,
          receiptPhoto: returnData.receiptPhoto,
          returnNotes: returnData.returnNotes,
          hasDefectReported: returnData.hasDefectReported,
          defectNotes: returnData.defectNotes,
        };

    setData((prev) => ({
      ...prev,
      reservations: prev.reservations.map((r) =>
        r.id === returnReservation.id ? { ...r, status: 'COMPLETED' } : r
      ),
      vehicles: prev.vehicles.map((v) =>
        v.id === returnReservation.vehicleId
          ? { ...v, status: 'AVAILABLE', currentOdometer: returnData.endOdometer }
          : v
      ),
      tripRecords: [
        updatedTripRecord,
        ...prev.tripRecords.filter((t) => t.reservationId !== returnReservation.id),
      ],
      // resolve 30min return alert
      alerts: prev.alerts.map((a) =>
        a.reservationId === returnReservation.id ? { ...a, isResolved: true } : a
      ),
    }));

    showToast(`반납 완료! 주행거리 (+${distance} km) 및 국세청 운행기록부에 즉시 자동 반영되었습니다.`);
    setReturnReservation(null);
  };

  // 7. Extend Reservation (30 minutes) with buffer conflict check
  const handleExtendReservation = (reservationId: string) => {
    const targetRes = reservations.find((r) => r.id === reservationId);
    if (!targetRes) return;

    const currentEnd = new Date(targetRes.endTime).getTime();
    const newEnd = new Date(currentEnd + 30 * 60 * 1000).toISOString();

    // Check conflict with 30-min buffer against other reservations
    const overlapResult = checkReservationOverlap(
      targetRes.vehicleId,
      targetRes.startTime,
      newEnd,
      reservations,
      targetRes.id,
      30
    );

    if (overlapResult.hasConflict) {
      alert(`[연장 불가] ${overlapResult.message}\n다음 예약자의 30분 정비/세차 버퍼 확보를 위해 즉시 반납 절차를 진행해 주세요.`);
      return;
    }

    setData((prev) => ({
      ...prev,
      reservations: prev.reservations.map((r) =>
        r.id === reservationId ? { ...r, endTime: newEnd } : r
      ),
    }));

    showToast('운행 시간이 30분 연장되었습니다.');
  };

  // 8. Cancel Reservation
  const handleCancelReservation = (reservationId: string) => {
    if (confirm('해당 배차 예약을 취소하시겠습니까?')) {
      setData((prev) => ({
        ...prev,
        reservations: prev.reservations.map((r) =>
          r.id === reservationId ? { ...r, status: 'CANCELED' } : r
        ),
      }));
      showToast('예약이 취소되었습니다.');
    }
  };

  // 9. Toggle Vehicle Maintenance Mode
  const handleToggleMaintenance = (vehicleId: string) => {
    setData((prev) => ({
      ...prev,
      vehicles: prev.vehicles.map((v) =>
        v.id === vehicleId
          ? { ...v, status: v.status === 'MAINTENANCE' ? 'AVAILABLE' : 'MAINTENANCE' }
          : v
      ),
    }));
    showToast('차량 점검 상태가 변경되었습니다.');
  };

  // 10. Add New Vehicle
  const handleAddNewVehicle = (newVehicleData: Omit<Vehicle, 'id'>) => {
    const newVehicle: Vehicle = {
      ...newVehicleData,
      id: `veh-${Date.now()}`,
    };
    setData((prev) => ({
      ...prev,
      vehicles: [...prev.vehicles, newVehicle],
    }));
    showToast('신규 법인차량이 등록되었습니다.');
  };

  // 11. View Record Detail Modal
  const handleViewRecordDetail = (res: Reservation) => {
    const veh = vehicles.find((v) => v.id === res.vehicleId) || vehicles[0];
    const trip = tripRecords.find((t) => t.reservationId === res.id);
    setSelectedRecordDetail({ reservation: res, vehicle: veh, trip });
  };

  // 12. Resolve Alert
  const handleResolveAlert = (id: string) => {
    setData((prev) => ({
      ...prev,
      alerts: prev.alerts.map((a) => (a.id === id ? { ...a, isResolved: true } : a)),
    }));
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans">
      {/* Top Notification Toast */}
      {toastMessage && (
        <div className="fixed top-16 right-4 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-xs font-semibold animate-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Global Header */}
      <Header
        currentRole={currentRole}
        onRoleToggle={handleRoleToggle}
        currentUser={currentUser}
        alerts={alerts}
        onResetData={handleResetData}
        onOpenAlerts={() => setAlertsModalOpen(true)}
        onOpenMobileModal={() => setMobileAccessModalOpen(true)}
      />

      {/* 30-Minute Return Alert Banner */}
      <AlertBanner
        activeReservation={activeInUseReservation}
        vehicle={activeInUseVehicle}
        minutesRemaining={minutesRemaining}
        onExtend={handleExtendReservation}
        onStartReturn={(res) => setReturnReservation(res)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {currentRole === 'EMPLOYEE' ? (
          <div className="space-y-5">
            {/* Employee Sub Navigation */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200 shadow-xs">
                <button
                  onClick={() => setEmployeeSubView('my_bookings')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    employeeSubView === 'my_bookings'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <ListFilter className="w-3.5 h-3.5" />
                  <span>내 배차 & 운행 체크인</span>
                </button>
                <button
                  onClick={() => setEmployeeSubView('timeline')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    employeeSubView === 'timeline'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <CalendarIcon className="w-3.5 h-3.5" />
                  <span>실시간 차량 타임라인 (버퍼 30분)</span>
                </button>
              </div>

              <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>법인세법 시행규칙 [별지 제29호의2서식] 자동 연계</span>
              </div>
            </div>

            {/* Sub View 1: My Bookings & Check-in List */}
            {employeeSubView === 'my_bookings' && (
              <MyReservationsView
                reservations={reservations}
                vehicles={vehicles}
                tripRecords={tripRecords}
                currentUser={currentUser}
                onOpenBookingModal={() => handleOpenBooking()}
                onStartDeparture={(res) => setDepartureReservation(res)}
                onStartReturn={(res) => setReturnReservation(res)}
                onExtend={handleExtendReservation}
                onCancelReservation={handleCancelReservation}
                onViewRecordDetail={handleViewRecordDetail}
              />
            )}

            {/* Sub View 2: Timeline Gantt View */}
            {employeeSubView === 'timeline' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">법인차량 실시간 타임라인</h3>
                    <p className="text-xs text-slate-500">
                      반납 후 30분 정비/세차 버퍼가 빗금으로 표시되며 충돌 시 자동 방어됩니다.
                    </p>
                  </div>
                  <button
                    onClick={() => handleOpenBooking()}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>배차 신청</span>
                  </button>
                </div>

                <TimelineCalendar
                  vehicles={vehicles}
                  reservations={reservations}
                  onSelectSlot={(vehId) => handleOpenBooking(vehId)}
                  onSelectReservation={handleViewRecordDetail}
                />
              </div>
            )}
          </div>
        ) : (
          /* Admin Dashboard Mode */
          <AdminDashboard
            vehicles={vehicles}
            reservations={reservations}
            tripRecords={tripRecords}
            alerts={alerts}
            onApproveReservation={handleApproveReservation}
            onRejectReservation={handleRejectReservation}
            onReassignVehicle={handleReassignVehicle}
            onToggleMaintenance={handleToggleMaintenance}
            onAddNewVehicle={handleAddNewVehicle}
            onViewRecordDetail={handleViewRecordDetail}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 px-4 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-700">FleetFlow</span>
            <span>&bull;</span>
            <span>사내 법인차량 스마트 배차·운행관리 솔루션</span>
          </div>
          <div>
            국세청 고시 [별지 제29호의2서식] 표준 규격 준수 &bull; 전봉건 책임연구원
          </div>
        </div>
      </footer>

      {/* Modals */}
      {/* 1. Booking Modal */}
      {bookingModalOpen && (
        <BookingModal
          isOpen={bookingModalOpen}
          onClose={() => setBookingModalOpen(false)}
          vehicles={vehicles}
          reservations={reservations}
          currentUser={currentUser}
          initialVehicleId={preselectedVehicleId}
          onConfirmBooking={handleConfirmBooking}
        />
      )}

      {/* 2. Departure Check-in Modal */}
      {departureReservation && (
        <DepartureCheckinModal
          isOpen={!!departureReservation}
          onClose={() => setDepartureReservation(null)}
          reservation={departureReservation}
          vehicle={vehicles.find((v) => v.id === departureReservation.vehicleId) || vehicles[0]}
          onConfirmDeparture={handleConfirmDeparture}
        />
      )}

      {/* 3. Return Check-in Modal */}
      {returnReservation && (
        <ReturnCheckinModal
          isOpen={!!returnReservation}
          onClose={() => setReturnReservation(null)}
          reservation={returnReservation}
          vehicle={vehicles.find((v) => v.id === returnReservation.vehicleId) || vehicles[0]}
          tripRecord={tripRecords.find((t) => t.reservationId === returnReservation.id)}
          onConfirmReturn={handleConfirmReturn}
        />
      )}

      {/* 4. Trip Detail & Photo Verification Modal */}
      {selectedRecordDetail && (
        <TripDetailModal
          isOpen={!!selectedRecordDetail}
          onClose={() => setSelectedRecordDetail(null)}
          reservation={selectedRecordDetail.reservation}
          vehicle={selectedRecordDetail.vehicle}
          tripRecord={selectedRecordDetail.trip}
        />
      )}

      {/* 5. Alerts Center Modal */}
      {alertsModalOpen && (
        <AlertsModal
          isOpen={alertsModalOpen}
          onClose={() => setAlertsModalOpen(false)}
          alerts={alerts}
          vehicles={vehicles}
          onResolveAlert={handleResolveAlert}
        />
      )}

      {/* 6. Mobile Access & PWA Install Modal */}
      {mobileAccessModalOpen && (
        <MobileAccessModal
          isOpen={mobileAccessModalOpen}
          onClose={() => setMobileAccessModalOpen(false)}
        />
      )}
    </div>
  );
}
