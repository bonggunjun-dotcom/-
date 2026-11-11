import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { 
  X, 
  Smartphone, 
  Share2, 
  PlusSquare, 
  Download, 
  Copy, 
  Check, 
  ExternalLink,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { usePWAInstall } from '../../utils/usePWAInstall';

interface MobileAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileAccessModal: React.FC<MobileAccessModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [copied, setCopied] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'qr' | 'ios' | 'android'>('qr');

  // Dedicated Public Shared URL (ais-pre) for mobile access without 403 Google Auth restriction
  const SHARED_PUBLIC_URL = 'https://ais-pre-pkkrkjtsshrx6eihdjtlel-508381260574.asia-east1.run.app';
  const DEV_PRIVATE_URL = 'https://ais-dev-pkkrkjtsshrx6eihdjtlel-508381260574.asia-east1.run.app';

  const [selectedUrlType, setSelectedUrlType] = useState<'shared' | 'dev'>('shared');
  const targetUrl = selectedUrlType === 'shared' ? SHARED_PUBLIC_URL : DEV_PRIVATE_URL;

  useEffect(() => {
    if (isOpen) {
      QRCode.toDataURL(targetUrl, {
        width: 240,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      })
        .then((url) => setQrCodeDataUrl(url))
        .catch((err) => console.error('Failed to generate QR code', err));
    }
  }, [isOpen, targetUrl]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(targetUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4.5 bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-xs text-white shadow-inner">
              <Smartphone className="w-5 h-5 text-blue-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base tracking-tight">스마트폰에서 앱 실행하기</h3>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-white/20 rounded-md">PWA 지원</span>
              </div>
              <p className="text-xs text-blue-100 mt-0.5">
                앱스토어 설치 없이 홈 화면에 1초 만에 앱 아이콘 추가
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('qr')}
            className={`flex items-center gap-1.5 pb-2.5 px-3 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'qr'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>QR코드로 바로 열기</span>
          </button>
          <button
            onClick={() => setActiveTab('ios')}
            className={`flex items-center gap-1.5 pb-2.5 px-3 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'ios'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>아이폰 (iOS Safari)</span>
          </button>
          <button
            onClick={() => setActiveTab('android')}
            className={`flex items-center gap-1.5 pb-2.5 px-3 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'android'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>갤럭시 / 안드로이드</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {activeTab === 'qr' && (
            <div className="space-y-4 text-center">
              {/* 403 Solution Notice */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 text-left flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs text-emerald-950 leading-relaxed">
                  <strong className="font-bold text-emerald-900 block mb-0.5">
                    403 접근 오류 방지 (외부 공개용 Shared URL 적용됨)
                  </strong>
                  모바일에서 구글 로그인 권한 제한(403 Forbidden) 없이 즉시 접속 가능한 <strong>외부 공개용 링크(Shared URL)</strong>의 QR 코드입니다.
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl inline-block mx-auto shadow-inner">
                {qrCodeDataUrl ? (
                  <img
                    src={qrCodeDataUrl}
                    alt="모바일 접속 QR 코드"
                    className="w-48 h-48 mx-auto rounded-xl shadow-xs"
                  />
                ) : (
                  <div className="w-48 h-48 bg-slate-200 animate-pulse rounded-xl" />
                )}
                <div className="mt-3 flex items-center justify-center gap-1.5 text-xs font-bold text-slate-800">
                  <Smartphone className="w-4 h-4 text-blue-600" />
                  <span>스마트폰 기본 카메라로 비추면 바로 실행됩니다</span>
                </div>
              </div>

              {/* Direct Link Copy Card with URL selection */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-left space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-700">
                    모바일 직접 접속 주소 (Shared Public URL):
                  </span>
                  <div className="flex items-center gap-1 text-[10px]">
                    <button
                      type="button"
                      onClick={() => setSelectedUrlType('shared')}
                      className={`px-2 py-0.5 rounded font-bold transition-all ${
                        selectedUrlType === 'shared' ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      공개용 (추천)
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedUrlType('dev')}
                      className={`px-2 py-0.5 rounded font-bold transition-all ${
                        selectedUrlType === 'dev' ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      개발자용 (Dev)
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={targetUrl}
                    className="flex-1 bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 font-mono select-all focus:outline-hidden"
                  />
                  <button
                    onClick={handleCopy}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shrink-0 flex items-center gap-1 transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? '복사됨' : '복사'}</span>
                  </button>
                </div>
              </div>

              {/* Direct Install prompt button if available */}
              {isInstallable && (
                <div className="pt-2">
                  <button
                    onClick={install}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>이 브라우저/기기에 FleetFlow 앱 즉시 설치</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'ios' && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl flex items-start gap-3">
                <div className="p-2 bg-blue-100 rounded-xl text-blue-700 shrink-0">
                  <Share2 className="w-5 h-5" />
                </div>
                <div className="text-xs text-blue-900 leading-relaxed">
                  <strong className="font-bold block text-sm mb-1">아이폰 Safari 홈 화면 추가 방법</strong>
                  별도의 App Store 승인 대기 없이 Safari 브라우저에서 바로 네이티브 전체화면 앱으로 등록됩니다.
                </div>
              </div>

              <ol className="space-y-3 text-xs text-slate-700">
                <li className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] font-bold flex items-center justify-center shrink-0">1</span>
                  <div>
                    아이폰 <strong>Safari</strong> 브라우저로 접속합니다. (카톡/인앱 브라우저는 우측 하단 &lsquo;Safari로 열기&rsquo; 선택)
                  </div>
                </li>
                <li className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] font-bold flex items-center justify-center shrink-0">2</span>
                  <div>
                    하단 메뉴 바 중앙의 <strong>공유 아이콘 (<Share2 className="inline w-3.5 h-3.5 text-blue-600" />)</strong>을 탭합니다.
                  </div>
                </li>
                <li className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] font-bold flex items-center justify-center shrink-0">3</span>
                  <div>
                    메뉴를 아래로 스크롤하여 <strong>&lsquo;홈 화면에 추가&rsquo; (<PlusSquare className="inline w-3.5 h-3.5 text-blue-600" />)</strong>를 탭하고 우측 상단 <strong>&lsquo;추가&rsquo;</strong>를 누릅니다.
                  </div>
                </li>
                <li className="flex items-start gap-3 p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 font-medium">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    아이폰 홈 화면에 <strong>FleetFlow 아이콘</strong>이 생성되며, 브라우저 주소창 없이 실제 앱처럼 실행됩니다!
                  </div>
                </li>
              </ol>
            </div>
          )}

          {activeTab === 'android' && (
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex items-start gap-3">
                <div className="p-2 bg-emerald-100 rounded-xl text-emerald-700 shrink-0">
                  <Download className="w-5 h-5" />
                </div>
                <div className="text-xs text-emerald-950 leading-relaxed">
                  <strong className="font-bold block text-sm mb-1 text-emerald-900">삼성 갤럭시 / 안드로이드 Chrome 방법</strong>
                  Chrome 브라우저에서 원클릭으로 정식 PWA 앱으로 홈 화면 및 앱스 목록에 설치됩니다.
                </div>
              </div>

              <ol className="space-y-3 text-xs text-slate-700">
                <li className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[11px] font-bold flex items-center justify-center shrink-0">1</span>
                  <div>
                    모바일 <strong>Chrome(크롬)</strong> 또는 <strong>삼성 인터넷</strong>으로 사이트에 접속합니다.
                  </div>
                </li>
                <li className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[11px] font-bold flex items-center justify-center shrink-0">2</span>
                  <div>
                    브라우저 하단에 뜨는 <strong>&lsquo;FleetFlow 홈 화면에 추가&rsquo;</strong> 배너 또는 상단 점 3개 메뉴 &rarr; <strong>&lsquo;앱 설치&rsquo;</strong>를 탭합니다.
                  </div>
                </li>
                <li className="flex items-start gap-3 p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 font-medium">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    바탕화면 및 앱 서랍에 등록되어 스마트폰 카메라, 푸시 알림, 로컬 오프라인 캐싱이 완벽 연동됩니다.
                  </div>
                </li>
              </ol>
            </div>
          )}

          {/* Core Mobile Benefits Banner */}
          <div className="p-3 bg-slate-100 rounded-xl text-[11px] text-slate-600 flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              모바일 카메라 연동 계기판/외관 검수 최적화
            </span>
            <span className="text-slate-400 font-mono">PWA Standalone</span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={handleCopy}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>접속 링크 복사하기</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
