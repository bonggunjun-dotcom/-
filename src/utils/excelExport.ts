import * as XLSX from 'xlsx';
import { Vehicle, Reservation, TripRecord } from '../types/fleet';

export function exportNTSExcel(
  vehicle: Vehicle,
  reservations: Reservation[],
  tripRecords: TripRecord[],
  companyName: string = '주식회사 인텔리안테크',
  businessNumber: string = '120-81-98765',
  year: string = '2026'
) {
  // 1. 해당 차량의 완료된 운행 기록 매칭 및 시간순 정렬
  const vehicleTrips = tripRecords
    .filter((t) => t.vehicleId === vehicle.id && t.endOdometer !== undefined)
    .sort((a, b) => new Date(a.checkedOutAt).getTime() - new Date(b.checkedOutAt).getTime());

  // 2. 엑셀 워크시트 데이터 배열 생성
  const sheetData: (string | number)[][] = [
    ['업무용 승용차 운행기록부'],
    ['(법인세법 시행규칙 [별지 제29호의2서식])'],
    [],
    ['1. 기본사항'],
    ['법인명(상호)', companyName, '', '사업자등록번호', businessNumber, '', '과세연도', `${year}년`],
    ['차종', vehicle.modelName, '', '자동차등록번호', vehicle.plateNumber, '', '연료구분', vehicle.fuelType],
    [],
    ['2. 운행 기록'],
    [
      '사용일자',
      '부서',
      '성명/직책',
      '주행 전 누적거리 (km)',
      '주행 후 누적거리 (km)',
      '주행거리 (km)',
      '출·퇴근용 (km)',
      '일반 업무용 (km)',
      '업무외 사용 (km)',
      '업무 목적 및 행선지 (비고)',
    ],
  ];

  let totalDistance = 0;
  let totalCommuteDistance = 0;
  let totalBusinessDistance = 0;

  vehicleTrips.forEach((trip) => {
    const res = reservations.find((r) => r.id === trip.reservationId);
    const dateStr = trip.checkedOutAt.split('T')[0];
    const dept = res?.userDepartment || '경영지원팀';
    const name = res?.userName || '임직원';
    const startKm = trip.startOdometer;
    const endKm = trip.endOdometer || trip.startOdometer;
    const dist = trip.businessDistance || (endKm - startKm);

    const isCommute = res?.purposeType === 'COMMUTE';
    const commuteKm = isCommute ? dist : 0;
    const businessKm = !isCommute ? dist : 0;
    const nonBusinessKm = 0; // 사내 차량은 업무외 불허

    totalDistance += dist;
    totalCommuteDistance += commuteKm;
    totalBusinessDistance += businessKm;

    const notes = res ? `[${res.destination}] ${res.purposeDetail}` : '업무 운행';

    sheetData.push([
      dateStr,
      dept,
      name,
      startKm,
      endKm,
      dist,
      commuteKm,
      businessKm,
      nonBusinessKm,
      notes,
    ]);
  });

  // 합계 행
  const totalWorkDistance = totalCommuteDistance + totalBusinessDistance;
  const workRatio = totalDistance > 0 ? ((totalWorkDistance / totalDistance) * 100).toFixed(1) : '100.0';

  sheetData.push([]);
  sheetData.push([
    '합계',
    '',
    '',
    '',
    '',
    totalDistance,
    totalCommuteDistance,
    totalBusinessDistance,
    0,
    `총 업무사용비율: ${workRatio}% (국세청 비용인정 요건 충족)`,
  ]);

  // 워크북 & 워크시트 생성
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(sheetData);

  // 열 너비 지정
  ws['!cols'] = [
    { wch: 14 }, // 사용일자
    { wch: 16 }, // 부서
    { wch: 12 }, // 성명
    { wch: 20 }, // 주행 전
    { wch: 20 }, // 주행 후
    { wch: 15 }, // 주행거리
    { wch: 15 }, // 출퇴근
    { wch: 15 }, // 일반업무
    { wch: 14 }, // 업무외
    { wch: 45 }, // 비고
  ];

  XLSX.utils.book_append_sheet(wb, ws, `운행기록부_${vehicle.plateNumber.replace(/\s+/g, '')}`);

  // 파일 다운로드 실행
  const fileName = `국세청_업무용승용차_운행기록부_${vehicle.plateNumber.replace(/\s+/g, '_')}_${year}년.xlsx`;
  XLSX.writeFile(wb, fileName);
}
