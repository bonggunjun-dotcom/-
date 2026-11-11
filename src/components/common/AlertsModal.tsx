import React from 'react';
import { X, Bell, AlertTriangle, ShieldAlert, CheckCircle, Info } from 'lucide-react';
import { FleetAlert, Vehicle } from '../../types/fleet';

interface AlertsModalProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: FleetAlert[];
  vehicles: Vehicle[];
  onResolveAlert: (id: string) => void;
}

export const AlertsModal: React.FC<AlertsModalProps> = ({
  isOpen,
  onClose,
  alerts,
  vehicles,
  onResolveAlert,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-100 text-blue-700">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">관제 알림 센터</h3>
              <p className="text-xs text-slate-500">정기검사, 보험 만료 및 배차 운행 이상 징후 알림</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-3 divide-y divide-slate-100">
          {alerts.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <CheckCircle className="w-10 h-10 mx-auto text-emerald-500 mb-2" />
              <p className="text-sm font-medium text-slate-600">현재 조치가 필요한 이상 알림이 없습니다.</p>
              <p className="text-xs text-slate-400 mt-1">모든 법인차량이 안전 기준을 준수하고 있습니다.</p>
            </div>
          ) : (
            alerts.map((alert) => {
              const vehicle = vehicles.find((v) => v.id === alert.vehicleId);
              return (
                <div
                  key={alert.id}
                  className={`pt-3 first:pt-0 flex items-start gap-3 p-3 rounded-xl transition-all ${
                    alert.isResolved
                      ? 'opacity-50 bg-slate-50'
                      : alert.severity === 'danger'
                      ? 'bg-rose-50/80 border border-rose-200'
                      : alert.severity === 'warning'
                      ? 'bg-amber-50/80 border border-amber-200'
                      : 'bg-blue-50/80 border border-blue-200'
                  }`}
                >
                  <div
                    className={`p-2 rounded-lg shrink-0 ${
                      alert.severity === 'danger'
                        ? 'bg-rose-200 text-rose-700'
                        : alert.severity === 'warning'
                        ? 'bg-amber-200 text-amber-700'
                        : 'bg-blue-200 text-blue-700'
                    }`}
                  >
                    {alert.severity === 'danger' ? (
                      <AlertTriangle className="w-4 h-4" />
                    ) : alert.severity === 'warning' ? (
                      <ShieldAlert className="w-4 h-4" />
                    ) : (
                      <Info className="w-4 h-4" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-sm font-bold text-slate-900 truncate">{alert.title}</h4>
                      {vehicle && (
                        <span className="text-[11px] font-semibold bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-700">
                          {vehicle.plateNumber}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{alert.message}</p>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200/60">
                      <span className="text-[10px] text-slate-400">
                        {new Date(alert.date).toLocaleDateString()}
                      </span>
                      {!alert.isResolved ? (
                        <button
                          onClick={() => onResolveAlert(alert.id)}
                          className="text-xs font-semibold text-blue-600 hover:text-blue-800"
                        >
                          확인 및 조치 완료
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400 font-medium">조치 완료됨</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
