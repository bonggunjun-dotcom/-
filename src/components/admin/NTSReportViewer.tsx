import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Printer, 
  Car, 
  Calendar, 
  ShieldCheck, 
  Info, 
  Download,
  Filter
} from 'lucide-react';
import { Vehicle, Reservation, TripRecord } from '../../types/fleet';
import { exportNTSExcel } from '../../utils/excelExport';

interface NTSReportViewerProps {
  vehicles: Vehicle[];
  reservations: Reservation[];
  tripRecords: TripRecord[];
}

export const NTSReportViewer: React.FC<NTSReportViewerProps> = ({
  vehicles,
  reservations,
  tripRecords,
}) => {
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(vehicles[0]?.id || '');
  const [selectedYear, setSelectedYear] = useState<string>('2026');

  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId) || vehicles[0];

  // Filter completed trips for this vehicle
  const completedTrips = tripRecords
    .filter((t) => t.vehicleId === selectedVehicle?.id && t.endOdometer !== undefined)
    .sort((a, b) => new Date(a.checkedOutAt).getTime() - new Date(b.checkedOutAt).getTime());

  // Aggregate stats
  let totalDistance = 0;
  let totalCommute = 0;
  let totalBusiness = 0;

  completedTrips.forEach((t) => {
    const res = reservations.find((r) => r.id === t.reservationId);
    const startKm = t.startOdometer;
    const endKm = t.endOdometer || startKm;
    const dist = t.businessDistance || (endKm - startKm);

    totalDistance += dist;
    if (res?.purposeType === 'COMMUTE') {
      totalCommute += dist;
    } else {
      totalBusiness += dist;
    }
  });

  const totalWorkDistance = totalCommute + totalBusiness;
  const workRatio = totalDistance > 0 ? ((totalWorkDistance / totalDistance) * 100).toFixed(1) : '100.0';

  const handleExcelDownload = () => {
    if (!selectedVehicle) return;
    exportNTSExcel(selectedVehicle, reservations, tripRecords, '주식회사 인텔리안테크', '120-81-98765', selectedYear);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Filter & Export Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Car className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-bold text-slate-700">대상 차량:</span>
            <select
              value={selectedVehicleId}
              onChange={(e) => setSelectedVehicleId(e.target.value)}
              className="text-xs font-semibold px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.plateNumber} ({v.modelName})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-bold text-slate-700">과세연도:</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="text-xs font-semibold px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
            >
              <option value="2026">2026 사업연도</option>
              <option value="2025">2025 사업연도</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          <button
            onClick={handlePrint}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>서식 인쇄 (A4 가로)</span>
          </button>
          <button
            onClick={handleExcelDownload}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
          >
            <Download className="w-4 h-4" />
            <span>국세청 공식 엑셀(.xlsx) 다운로드</span>
          </button>
        </div>
      </div>

      {/* Tax Compliance KPI Card */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-xs text-slate-500 font-medium">당해 과세연도 총 주행거리</span>
          <div className="text-xl font-extrabold font-mono text-slate-900 mt-1">
            {totalDistance.toLocaleString()} <span className="text-xs font-normal">km</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-xs text-slate-500 font-medium">일반 업무용 사용거리</span>
          <div className="text-xl font-extrabold font-mono text-blue-700 mt-1">
            {totalBusiness.toLocaleString()} <span className="text-xs font-normal">km</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-xs text-slate-500 font-medium">출·퇴근용 사용거리</span>
          <div className="text-xl font-extrabold font-mono text-indigo-700 mt-1">
            {totalCommute.toLocaleString()} <span className="text-xs font-normal">km</span>
          </div>
        </div>

        <div className="bg-emerald-50/70 p-4 rounded-xl border border-emerald-200">
          <span className="text-xs text-emerald-800 font-bold flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            업무사용비율 (손금 인정율)
          </span>
          <div className="text-xl font-extrabold font-mono text-emerald-800 mt-1">
            {workRatio}% <span className="text-xs font-normal text-emerald-700">(100% 전액 인정)</span>
          </div>
        </div>
      </div>

      {/* Legal Printable Document: 국세청 법정 서식 [별지 제29호의2서식] */}
      <div
        id="printable-nts-form"
        className="bg-white rounded-2xl border border-slate-300 shadow-sm p-6 sm:p-8 overflow-x-auto text-slate-900"
      >
        {/* Legal Form Header */}
        <div className="text-center pb-4 border-b-2 border-slate-800">
          <div className="text-xs text-slate-500 font-serif mb-1">
            [법인세법 시행규칙 별지 제29호의2서식] &bull; 소득세법 시행규칙 [별지 제39호의2서식]
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-widest font-serif text-slate-950">
            업무용승용차 운행기록부
          </h2>
        </div>

        {/* Basic Company & Vehicle Information */}
        <div className="mt-4 mb-4 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs border border-slate-300 bg-slate-50/50 p-3 rounded-lg">
          <div>
            <span className="text-slate-500 block">법인명(상호):</span>
            <span className="font-bold text-slate-900">주식회사 인텔리안테크</span>
          </div>
          <div>
            <span className="text-slate-500 block">사업자등록번호:</span>
            <span className="font-bold font-mono text-slate-900">120-81-98765</span>
          </div>
          <div>
            <span className="text-slate-500 block">자동차등록번호:</span>
            <span className="font-bold font-mono text-blue-700">{selectedVehicle?.plateNumber}</span>
          </div>
          <div>
            <span className="text-slate-500 block">차종 / 연료구분:</span>
            <span className="font-bold text-slate-900">
              {selectedVehicle?.modelName} ({selectedVehicle?.fuelType})
            </span>
          </div>
        </div>

        {/* Official Table */}
        <table className="w-full border-collapse border border-slate-400 text-xs text-center font-sans">
          <thead>
            <tr className="bg-slate-100 font-bold border-b border-slate-400">
              <th rowSpan={2} className="border border-slate-300 p-2 w-20">사용일자</th>
              <th colSpan={2} className="border border-slate-300 p-1.5">사용자</th>
              <th colSpan={3} className="border border-slate-300 p-1.5">운행 내역</th>
              <th colSpan={2} className="border border-slate-300 p-1.5">업무용 사용거리</th>
              <th rowSpan={2} className="border border-slate-300 p-2 w-16">업무외 (km)</th>
              <th rowSpan={2} className="border border-slate-300 p-2">비고 (업무목적 및 행선지)</th>
            </tr>
            <tr className="bg-slate-50 font-semibold border-b border-slate-400">
              <th className="border border-slate-300 p-1.5 w-24">부서</th>
              <th className="border border-slate-300 p-1.5 w-20">성명</th>
              <th className="border border-slate-300 p-1.5 w-24">주행 전 (km)</th>
              <th className="border border-slate-300 p-1.5 w-24">주행 후 (km)</th>
              <th className="border border-slate-300 p-1.5 w-20">주행거리</th>
              <th className="border border-slate-300 p-1.5 w-20">출·퇴근용</th>
              <th className="border border-slate-300 p-1.5 w-20">일반업무용</th>
            </tr>
          </thead>
          <tbody>
            {completedTrips.length === 0 ? (
              <tr>
                <td colSpan={10} className="p-8 text-slate-400 text-center">
                  해당 차량의 승인 및 반납 완료된 법정 운행 기록이 아직 없습니다.
                </td>
              </tr>
            ) : (
              completedTrips.map((trip) => {
                const res = reservations.find((r) => r.id === trip.reservationId);
                const dateStr = trip.checkedOutAt.split('T')[0];
                const startKm = trip.startOdometer;
                const endKm = trip.endOdometer || startKm;
                const dist = trip.businessDistance || (endKm - startKm);
                const isCommute = res?.purposeType === 'COMMUTE';

                return (
                  <tr key={trip.id} className="hover:bg-slate-50/70 border-b border-slate-300 font-mono text-[11px]">
                    <td className="border border-slate-300 p-2 font-sans">{dateStr}</td>
                    <td className="border border-slate-300 p-2 font-sans">{res?.userDepartment || '경영지원팀'}</td>
                    <td className="border border-slate-300 p-2 font-sans font-bold">{res?.userName || '임직원'}</td>
                    <td className="border border-slate-300 p-2 text-right">{startKm.toLocaleString()}</td>
                    <td className="border border-slate-300 p-2 text-right">{endKm.toLocaleString()}</td>
                    <td className="border border-slate-300 p-2 text-right font-bold text-slate-900">
                      {dist.toLocaleString()}
                    </td>
                    <td className="border border-slate-300 p-2 text-right">
                      {isCommute ? dist.toLocaleString() : '-'}
                    </td>
                    <td className="border border-slate-300 p-2 text-right">
                      {!isCommute ? dist.toLocaleString() : '-'}
                    </td>
                    <td className="border border-slate-300 p-2 text-slate-400">0</td>
                    <td className="border border-slate-300 p-2 text-left font-sans text-xs">
                      {res ? (
                        <span>
                          <strong className="text-blue-700">[{res.destination}]</strong> {res.purposeDetail}
                        </span>
                      ) : (
                        '일반 업무 운행'
                      )}
                    </td>
                  </tr>
                );
              })
            )}

            {/* Total Row */}
            <tr className="bg-slate-100 font-bold border-t-2 border-slate-400 font-mono text-xs">
              <td colSpan={3} className="border border-slate-300 p-2 font-sans text-center">
                합계 (Total)
              </td>
              <td colSpan={2} className="border border-slate-300 p-2 text-center text-slate-500 font-sans">
                과세기간 누적
              </td>
              <td className="border border-slate-300 p-2 text-right text-slate-900 font-extrabold">
                {totalDistance.toLocaleString()}
              </td>
              <td className="border border-slate-300 p-2 text-right text-indigo-700">
                {totalCommute.toLocaleString()}
              </td>
              <td className="border border-slate-300 p-2 text-right text-blue-700">
                {totalBusiness.toLocaleString()}
              </td>
              <td className="border border-slate-300 p-2 text-slate-400">0</td>
              <td className="border border-slate-300 p-2 text-left font-sans text-[11px] text-emerald-800 font-bold">
                업무사용비율: {workRatio}% (법인세 손금 산입 대상)
              </td>
            </tr>
          </tbody>
        </table>

        {/* Legal Footer Notice */}
        <div className="mt-4 pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between text-[11px] text-slate-500 gap-2">
          <div>
            * 본 운행기록부는 국세청 고시 기준에 따라 출발/도착 계기판 사진 검수 증빙과 함께 실시간 생성되었습니다.
          </div>
          <div className="font-semibold text-slate-700">
            총무관리책임자 확인필 (인)
          </div>
        </div>
      </div>
    </div>
  );
};
