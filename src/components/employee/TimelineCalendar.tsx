import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Car, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Wrench,
  Fuel
} from 'lucide-react';
import { Vehicle, Reservation } from '../../types/fleet';

interface TimelineCalendarProps {
  vehicles: Vehicle[];
  reservations: Reservation[];
  onSelectSlot: (vehicleId: string, startIso: string) => void;
  onSelectReservation: (reservation: Reservation) => void;
}

export const TimelineCalendar: React.FC<TimelineCalendarProps> = ({
  vehicles,
  reservations,
  onSelectSlot,
  onSelectReservation,
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d);
  };

  const handleToday = () => {
    setSelectedDate(new Date());
  };

  // Hours: 08:00 to 22:00 (14 hours window)
  const startHour = 8;
  const endHour = 22;
  const totalHours = endHour - startHour;
  const hoursArray = Array.from({ length: totalHours + 1 }, (_, i) => startHour + i);

  // Check if reservation is on this day
  const isSameDay = (d1: Date, d2: Date) => {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  const formattedDate = `${selectedDate.getFullYear()}년 ${selectedDate.getMonth() + 1}월 ${selectedDate.getDate()}일 (${['일', '월', '화', '수', '목', '금', '토'][selectedDate.getDay()]})`;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Calendar Header */}
      <div className="px-5 py-3.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-xs">
            <button
              onClick={handlePrevDay}
              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
              title="이전 날짜"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleToday}
              className="px-2.5 py-1 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              오늘
            </button>
            <button
              onClick={handleNextDay}
              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
              title="다음 날짜"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-blue-600" />
            <span className="font-extrabold text-slate-900 text-sm">{formattedDate}</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-blue-600"></span>
            <span>운행 중 (IN_USE)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-indigo-500"></span>
            <span>승인 확정 (APPROVED)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-amber-500"></span>
            <span>승인 대기 (REQUESTED)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-slate-300 border border-slate-400 border-dashed"></span>
            <span className="font-semibold text-slate-700">30분 정비 버퍼 (자동부여)</span>
          </div>
        </div>
      </div>

      {/* Timeline Gantt Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-[850px] p-4">
          {/* Time axis header */}
          <div className="grid grid-cols-[200px_1fr] border-b border-slate-200 pb-2 text-xs font-semibold text-slate-400">
            <div className="pl-2">차량 정보</div>
            <div className="relative h-6 flex justify-between pr-4 font-mono text-[11px]">
              {hoursArray.map((hour) => (
                <div key={hour} className="text-center w-8 -ml-4">
                  {String(hour).padStart(2, '0')}:00
                </div>
              ))}
            </div>
          </div>

          {/* Vehicle rows */}
          <div className="divide-y divide-slate-100">
            {vehicles.map((v) => {
              const vehicleReservations = reservations.filter((r) => {
                if (r.vehicleId !== v.id || r.status === 'CANCELED') return false;
                const rStart = new Date(r.startTime);
                const rEnd = new Date(r.endTime);
                return isSameDay(rStart, selectedDate) || isSameDay(rEnd, selectedDate);
              });

              const isMaint = v.status === 'MAINTENANCE';

              return (
                <div key={v.id} className="grid grid-cols-[200px_1fr] py-3 items-center group">
                  {/* Left Column: Vehicle Meta */}
                  <div className="pr-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900 truncate">{v.modelName}</span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          isMaint
                            ? 'bg-rose-100 text-rose-700'
                            : v.status === 'IN_USE'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {isMaint ? '점검중' : v.status === 'IN_USE' ? '운행중' : '배차가능'}
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-blue-700 font-semibold mt-0.5">
                      {v.plateNumber}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                      {v.parkingLocation.split(' ')[2] || 'B2 주차'} &bull; {v.currentOdometer.toLocaleString()} km
                    </div>
                  </div>

                  {/* Right Column: 24h Timeline Bar */}
                  <div className="relative h-12 bg-slate-50/80 rounded-xl border border-slate-200/70 overflow-hidden">
                    {/* Hour Vertical Grid Lines */}
                    <div className="absolute inset-0 flex justify-between pointer-events-none">
                      {hoursArray.map((hour, idx) => (
                        <div
                          key={hour}
                          className={`h-full border-r ${idx === 0 ? 'border-transparent' : 'border-slate-200/60'}`}
                          style={{ width: `${100 / totalHours}%` }}
                        />
                      ))}
                    </div>

                    {/* If vehicle is under maintenance */}
                    {isMaint ? (
                      <div className="absolute inset-0 bg-rose-50/70 flex items-center justify-center text-xs font-semibold text-rose-600 gap-1.5">
                        <Wrench className="w-3.5 h-3.5" />
                        <span>정비 및 점검 중 (배차 일시 중지)</span>
                      </div>
                    ) : (
                      <>
                        {/* Reservation Blocks & Buffer Blocks */}
                        {vehicleReservations.map((res) => {
                          const rStart = new Date(res.startTime);
                          const rEnd = new Date(res.endTime);

                          // Calculate position in percentage
                          const startHourDec = rStart.getHours() + rStart.getMinutes() / 60;
                          const endHourDec = rEnd.getHours() + rEnd.getMinutes() / 60;

                          const leftPct = Math.max(0, ((startHourDec - startHour) / totalHours) * 100);
                          const widthPct = Math.max(1, ((endHourDec - startHourDec) / totalHours) * 100);

                          // 30 min buffer block position (right after reservation end)
                          const bufferStartDec = endHourDec;
                          const bufferLeftPct = Math.max(0, ((bufferStartDec - startHour) / totalHours) * 100);
                          const bufferWidthPct = (0.5 / totalHours) * 100; // 0.5 hour = 30 min

                          const isApproved = res.status === 'APPROVED';
                          const isInUse = res.status === 'IN_USE';
                          const isRequested = res.status === 'REQUESTED';

                          return (
                            <React.Fragment key={res.id}>
                              {/* Main Reservation Block */}
                              <div
                                onClick={() => onSelectReservation(res)}
                                style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                                className={`absolute top-1 bottom-1 rounded-lg px-2 flex flex-col justify-center cursor-pointer transition-transform hover:scale-[1.01] shadow-xs z-10 ${
                                  isInUse
                                    ? 'bg-blue-600 text-white'
                                    : isApproved
                                    ? 'bg-indigo-600 text-white'
                                    : isRequested
                                    ? 'bg-amber-500 text-white'
                                    : 'bg-slate-400 text-white'
                                }`}
                                title={`${res.userName} (${res.userDepartment}) - ${res.purposeDetail}`}
                              >
                                <div className="text-[10px] font-bold truncate">
                                  {res.userName} ({res.destination.split(' ')[0] || res.destination})
                                </div>
                                <div className="text-[9px] opacity-80 truncate">
                                  {rStart.getHours()}:{String(rStart.getMinutes()).padStart(2, '0')} ~ {rEnd.getHours()}:{String(rEnd.getMinutes()).padStart(2, '0')}
                                </div>
                              </div>

                              {/* 30-Minute Maintenance Buffer Block */}
                              <div
                                style={{ left: `${bufferLeftPct}%`, width: `${bufferWidthPct}%` }}
                                className="absolute top-1 bottom-1 rounded bg-slate-200/90 border border-dashed border-slate-400 flex items-center justify-center pointer-events-none z-0"
                                title="30분 정비/세차 버퍼 (다음 배차 방어 시간)"
                              >
                                <span className="text-[9px] font-extrabold text-slate-600">30m</span>
                              </div>
                            </React.Fragment>
                          );
                        })}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
