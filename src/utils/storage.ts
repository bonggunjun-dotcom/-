import { Vehicle, Reservation, TripRecord, FleetAlert } from '../types/fleet';
import { INITIAL_VEHICLES, INITIAL_RESERVATIONS, INITIAL_TRIP_RECORDS, INITIAL_ALERTS } from '../data/mockData';

const KEYS = {
  VEHICLES: 'fleetflow_vehicles_v1',
  RESERVATIONS: 'fleetflow_reservations_v1',
  TRIP_RECORDS: 'fleetflow_trips_v1',
  ALERTS: 'fleetflow_alerts_v1',
};

export function loadStoredData() {
  try {
    const rawVehicles = localStorage.getItem(KEYS.VEHICLES);
    const rawReservations = localStorage.getItem(KEYS.RESERVATIONS);
    const rawTrips = localStorage.getItem(KEYS.TRIP_RECORDS);
    const rawAlerts = localStorage.getItem(KEYS.ALERTS);

    const vehicles: Vehicle[] = rawVehicles ? JSON.parse(rawVehicles) : INITIAL_VEHICLES;
    const reservations: Reservation[] = rawReservations ? JSON.parse(rawReservations) : INITIAL_RESERVATIONS;
    const tripRecords: TripRecord[] = rawTrips ? JSON.parse(rawTrips) : INITIAL_TRIP_RECORDS;
    const alerts: FleetAlert[] = rawAlerts ? JSON.parse(rawAlerts) : INITIAL_ALERTS;

    return { vehicles, reservations, tripRecords, alerts };
  } catch (err) {
    console.error('Failed to load localStorage data, fallback to mock', err);
    return {
      vehicles: INITIAL_VEHICLES,
      reservations: INITIAL_RESERVATIONS,
      tripRecords: INITIAL_TRIP_RECORDS,
      alerts: INITIAL_ALERTS,
    };
  }
}

export function saveStoredData(data: {
  vehicles?: Vehicle[];
  reservations?: Reservation[];
  tripRecords?: TripRecord[];
  alerts?: FleetAlert[];
}) {
  try {
    if (data.vehicles) localStorage.setItem(KEYS.VEHICLES, JSON.stringify(data.vehicles));
    if (data.reservations) localStorage.setItem(KEYS.RESERVATIONS, JSON.stringify(data.reservations));
    if (data.tripRecords) localStorage.setItem(KEYS.TRIP_RECORDS, JSON.stringify(data.tripRecords));
    if (data.alerts) localStorage.setItem(KEYS.ALERTS, JSON.stringify(data.alerts));
  } catch (err) {
    console.error('Failed to save to localStorage', err);
  }
}

export function resetToInitialMockData() {
  localStorage.removeItem(KEYS.VEHICLES);
  localStorage.removeItem(KEYS.RESERVATIONS);
  localStorage.removeItem(KEYS.TRIP_RECORDS);
  localStorage.removeItem(KEYS.ALERTS);
  return {
    vehicles: INITIAL_VEHICLES,
    reservations: INITIAL_RESERVATIONS,
    tripRecords: INITIAL_TRIP_RECORDS,
    alerts: INITIAL_ALERTS,
  };
}

/**
 * 30분 정비/세차 버퍼를 포함한 예약 중복(Overlapping) 검증 로직
 * (PostgreSQL EXCLUDE USING gist (tstzrange with 30 min buffer) 와 100% 동일한 규칙)
 */
export function checkReservationOverlap(
  vehicleId: string,
  startTimeIso: string,
  endTimeIso: string,
  allReservations: Reservation[],
  excludeReservationId?: string,
  bufferMinutes = 30
): { hasConflict: boolean; conflictingReservation?: Reservation; message?: string } {
  const reqStart = new Date(startTimeIso).getTime();
  const reqEnd = new Date(endTimeIso).getTime();

  if (isNaN(reqStart) || isNaN(reqEnd) || reqEnd <= reqStart) {
    return { hasConflict: true, message: '반납 일시는 출발 일시 이후여야 합니다.' };
  }

  const bufferMs = bufferMinutes * 60 * 1000;

  for (const res of allReservations) {
    if (res.id === excludeReservationId) continue;
    if (res.vehicleId !== vehicleId) continue;
    if (res.status === 'CANCELED') continue;

    const resStart = new Date(res.startTime).getTime();
    const resEnd = new Date(res.endTime).getTime();

    // 양쪽 모두 30분 버퍼 적용: [resStart - buffer, resEnd + buffer]
    // 겹침 조건: Math.max(reqStart, resStart - bufferMs) < Math.min(reqEnd + bufferMs, resEnd + bufferMs)
    const effectiveResStart = resStart - bufferMs;
    const effectiveResEnd = resEnd + bufferMs;

    // Check if the proposed reservation overlaps with the existing reservation's buffered range
    if (reqStart < effectiveResEnd && reqEnd > effectiveResStart) {
      const isBufferOnly = (reqStart < resEnd + bufferMs && reqStart >= resEnd) || (reqEnd > resStart - bufferMs && reqEnd <= resStart);
      const conflictMsg = isBufferOnly
        ? `차량 정비 및 청소 버퍼 시간(30분)이 필요합니다. (기존 예약: ${res.userName}님 ${formatSimpleTime(res.startTime)} ~ ${formatSimpleTime(res.endTime)})`
        : `해당 시간에 이미 확정 또는 대기 중인 예약이 있습니다. (${res.userName}님, ${formatSimpleTime(res.startTime)} ~ ${formatSimpleTime(res.endTime)})`;

      return {
        hasConflict: true,
        conflictingReservation: res,
        message: conflictMsg,
      };
    }
  }

  return { hasConflict: false };
}

function formatSimpleTime(iso: string): string {
  try {
    const d = new Date(iso);
    return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  } catch {
    return iso;
  }
}
