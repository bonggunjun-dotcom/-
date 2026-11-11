export type VehicleStatus = 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE' | 'RETURNING';

export type ReservationStatus = 
  | 'REQUESTED'    // 1. 예약 대기 (임직원 신청)
  | 'APPROVED'     // 2. 승인/확정 (관리자 승인 / 자동 승인)
  | 'IN_USE'       // 3. 운행 시작 (출발 계기판 + 외관 사진 등록 후 키 수령)
  | 'RETURNING'    // 4. 반납 대기/검수 (도착 계기판 + 외관 + 영수증 등록)
  | 'COMPLETED'    // 5. 반납 완료 (거리 검증 통과 및 운행기록부 반영)
  | 'CANCELED'     // 6. 취소
  | 'MAINTENANCE'; // 점검 중

export type TripPurposeType = 'GENERAL_BUSINESS' | 'COMMUTE';

export type VehicleFuelType = 'GASOLINE' | 'DIESEL' | 'HYBRID' | 'ELECTRIC';

export interface Vehicle {
  id: string;
  plateNumber: string;        // 예: 12가 3456
  modelName: string;          // 예: 더 뉴 카니발 9인승
  category: 'SEDAN' | 'SUV' | 'VAN' | 'EV';
  seatingCapacity: number;
  fuelType: VehicleFuelType;
  currentOdometer: number;    // 현재 누적 주행거리 (km)
  status: VehicleStatus;
  insuranceExpiryDate: string;// YYYY-MM-DD
  nextInspectionDate: string; // YYYY-MM-DD
  parkingLocation: string;    // 예: 본사 지하 2층 A-14
  smartKeyBoxNumber: string;  // 예: 3번 키박스 (비번: 8821)
  imageUrl: string;
  efficiency: string;         // 예: 11.2 km/L 또는 5.2 km/kWh
}

export interface InspectionPhoto {
  angle: 'odometer' | 'front' | 'rear' | 'left' | 'right' | 'receipt' | 'defect';
  url: string;
  timestamp: string;
  notes?: string;
}

export interface Reservation {
  id: string;
  vehicleId: string;
  userId: string;
  userName: string;
  userDepartment: string;
  userPhone: string;
  status: ReservationStatus;
  purposeType: TripPurposeType;
  purposeDetail: string;      // 업무 목적 (예: 삼성전자 화성캠퍼스 협력사 미팅)
  destination: string;        // 행선지 (예: 경기도 화성시)
  passengers: string;         // 동승자 (예: 이선임, 박책임)
  startTime: string;          // ISO String
  endTime: string;            // ISO String
  estimatedDistanceKm?: number;
  adminNotes?: string;
  rejectionReason?: string;
  createdAt: string;
}

export interface TripRecord {
  id: string;
  reservationId: string;
  vehicleId: string;
  
  // 출발 검수 (IN_USE 진입 시)
  startOdometer: number;
  startOdometerPhoto: string;
  startExteriorPhotos: InspectionPhoto[];
  checkedOutAt: string;       // 실제 출발 시간 (ISO)
  
  // 도착 검수 (RETURNING -> COMPLETED 진입 시)
  endOdometer?: number;
  endOdometerPhoto?: string;
  endExteriorPhotos?: InspectionPhoto[];
  checkedInAt?: string;       // 실제 반납 시간 (ISO)
  
  businessDistance?: number;  // endOdometer - startOdometer
  
  // 주유 및 정산 내역
  fuelCost?: number;
  tollFee?: number;
  receiptPhoto?: string;
  returnNotes?: string;
  
  // 파손/이상 보고
  hasDefectReported?: boolean;
  defectNotes?: string;
}

export interface FleetAlert {
  id: string;
  type: 'INSPECTION_DUE' | 'INSURANCE_DUE' | 'RETURN_30MIN_ALERT' | 'RETURN_OVERDUE' | 'ODOMETER_CHECK';
  vehicleId: string;
  reservationId?: string;
  title: string;
  message: string;
  date: string;
  severity: 'warning' | 'danger' | 'info';
  isResolved: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  department: string;
  email: string;
  phone: string;
  role: 'EMPLOYEE' | 'ADMIN';
}
