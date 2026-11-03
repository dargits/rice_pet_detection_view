import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useConfig } from '../../context/ConfigContext';
import { getWebSocketUrl } from '../../lib/api';
import { drawDetections } from '../../lib/canvas';
import { Detection } from '../../types';
import { ClassBadge } from '../ui/Badge';
import { SpeciesModal } from '../ui/SpeciesModal';
import {
  Camera,
  CameraOff,
  Video,
  Activity,
  Gauge,
  Wifi,
  WifiOff,
  RefreshCw,
  AlertTriangle,
  Info,
  CheckCircle2,
} from 'lucide-react';

interface DeviceItem {
  deviceId: string;
  label: string;
}

export const WebcamDetectTab: React.FC = () => {
  const { config, addToast } = useConfig();

  const [isStreaming, setIsStreaming] = useState(false);
  const [devices, setDevices] = useState<DeviceItem[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [wsStatus, setWsStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [fps, setFps] = useState<number>(0);
  const [latencyMs, setLatencyMs] = useState<number>(0);
  const [currentDetections, setCurrentDetections] = useState<Detection[]>([]);
  const [currentCounts, setCurrentCounts] = useState<Record<string, number>>({});
  const [sessionSpecies, setSessionSpecies] = useState<Set<string>>(new Set());
  const [errorText, setErrorText] = useState<string | null>(null);
  const [selectedPestForModal, setSelectedPestForModal] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hiddenCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const streamRef = useRef<MediaStream | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const isWaitingRef = useRef<boolean>(false);
  const frameTimerRef = useRef<any>(null);
  const sendTimestampRef = useRef<number>(0);
  const reconnectCountRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);
  const fpsTimerRef = useRef<any>(null);

  // Enumerate video devices
  useEffect(() => {
    async function getDevices() {
      if (!navigator.mediaDevices?.enumerateDevices) return;
      try {
        const devList = await navigator.mediaDevices.enumerateDevices();
        const videoDevs = devList
          .filter((d) => d.kind === 'videoinput')
          .map((d, idx) => ({
            deviceId: d.deviceId,
            label: d.label || `Camera ${idx + 1}`,
          }));
        setDevices(videoDevs);
        if (videoDevs.length > 0 && !selectedDeviceId) {
          // Default to the last device (usually back camera on smartphones) or first
          setSelectedDeviceId(videoDevs[videoDevs.length - 1].deviceId);
        }
      } catch (err) {
        console.error('Không thể liệt kê thiết bị camera:', err);
      }
    }
    getDevices();
  }, [selectedDeviceId]);

  // FPS counter ticker
  useEffect(() => {
    fpsTimerRef.current = setInterval(() => {
      setFps(frameCountRef.current);
      frameCountRef.current = 0;
    }, 1000);

    return () => clearInterval(fpsTimerRef.current);
  }, []);

  // Stop camera tracks and disconnect socket
  const cleanupStreamAndSocket = useCallback(() => {
    if (frameTimerRef.current) clearInterval(frameTimerRef.current);

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    isWaitingRef.current = false;
    setWsStatus('disconnected');
    setIsStreaming(false);

    // Clear canvas
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupStreamAndSocket();
    };
  }, [cleanupStreamAndSocket]);

  // Connect WebSocket
  const connectWebSocket = useCallback(() => {
    if (config.mockMode) {
      setWsStatus('connected');
      return;
    }

    const wsUrl = getWebSocketUrl(config);
    if (!wsUrl) {
      setErrorText('Chưa có URL Backend để kết nối WebSocket.');
      return;
    }

    setWsStatus('connecting');

    try {
      const socket = new WebSocket(wsUrl);
      socket.binaryType = 'blob';

      socket.onopen = () => {
        setWsStatus('connected');
        reconnectCountRef.current = 0;
        addToast('success', 'WebSocket kết nối thành công', 'Sẵn sàng truyền nhận khung hình thời gian thực.');
      };

      socket.onmessage = (event) => {
        isWaitingRef.current = false; // RELEASE BACKPRESSURE
        const roundTripTime = Math.round(performance.now() - sendTimestampRef.current);
        setLatencyMs(roundTripTime);
        frameCountRef.current += 1;

        try {
          const data = JSON.parse(event.data);
          const detections: Detection[] = data.detections || [];
          setCurrentDetections(detections);

          // Update current counts
          const counts: Record<string, number> = {};
          detections.forEach((d) => {
            counts[d.cls] = (counts[d.cls] || 0) + 1;
            setSessionSpecies((prev) => new Set([...prev, d.cls]));
          });
          setCurrentCounts(counts);

          // Redraw canvas
          if (canvasRef.current && videoRef.current) {
            drawDetections({
              canvas: canvasRef.current,
              image: videoRef.current,
              detections,
              originalWidth: data.width,
              originalHeight: data.height,
            });
          }
        } catch (e) {
          console.error('Lỗi phân tích cú pháp dữ liệu WS:', e);
        }
      };

      socket.onerror = (e) => {
        console.error('Lỗi WebSocket:', e);
      };

      socket.onclose = () => {
        setWsStatus('disconnected');
        isWaitingRef.current = false;

        // Auto reconnect up to 3 times if stream is still active
        if (isStreaming && reconnectCountRef.current < 3) {
          reconnectCountRef.current += 1;
          setTimeout(() => {
            if (isStreaming) connectWebSocket();
          }, 2000);
        }
      };

      wsRef.current = socket;
    } catch (err: any) {
      setWsStatus('disconnected');
      setErrorText(`Không thể tạo kết nối WebSocket: ${err.message}`);
    }
  }, [config, isStreaming, addToast]);

  // Frame capture loop with BACKPRESSURE
  const captureAndSendLoop = useCallback(() => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    if (video.readyState < 2) return; // not ready

    // BACKPRESSURE CHECK: If previous frame has not completed yet, skip this frame!
    if (isWaitingRef.current) {
      return;
    }

    if (!hiddenCanvasRef.current) {
      hiddenCanvasRef.current = document.createElement('canvas');
    }
    const offscreen = hiddenCanvasRef.current;

    // Resize longest edge to max 640px
    const maxEdge = 640;
    const vW = video.videoWidth || 640;
    const vH = video.videoHeight || 480;
    const scale = Math.min(1, maxEdge / Math.max(vW, vH));
    const targetW = Math.round(vW * scale);
    const targetH = Math.round(vH * scale);

    offscreen.width = targetW;
    offscreen.height = targetH;
    const ctx = offscreen.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, targetW, targetH);

    // Mock mode simulation
    if (config.mockMode) {
      isWaitingRef.current = true;
      sendTimestampRef.current = performance.now();

      setTimeout(() => {
        isWaitingRef.current = false;
        frameCountRef.current += 1;
        setLatencyMs(Math.floor(25 + Math.random() * 20));

        // Generate 1-2 random detections
        const mockDets: Detection[] = [
          {
            box: [
              Math.floor(targetW * 0.3),
              Math.floor(targetH * 0.3),
              Math.floor(targetW * 0.55),
              Math.floor(targetH * 0.6),
            ],
            cls: 'Rầy nâu',
            cls_id: 0,
            conf: 0.86,
          },
        ];
        setCurrentDetections(mockDets);
        setCurrentCounts({ 'Rầy nâu': 1 });
        setSessionSpecies((prev) => new Set([...prev, 'Rầy nâu']));

        if (canvasRef.current && videoRef.current) {
          drawDetections({
            canvas: canvasRef.current,
            image: videoRef.current,
            detections: mockDets,
            originalWidth: targetW,
            originalHeight: targetH,
          });
        }
      }, 120);

      return;
    }

    // Real WebSocket sending
    const socket = wsRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) return;

    isWaitingRef.current = true;
    sendTimestampRef.current = performance.now();

    offscreen.toBlob(
      (blob) => {
        if (!blob || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
          isWaitingRef.current = false;
          return;
        }
        wsRef.current.send(blob);
      },
      'image/jpeg',
      0.7
    );
  }, [config.mockMode]);

  // Start webcam
  const handleStartStream = async () => {
    setErrorText(null);
    setCurrentDetections([]);
    setCurrentCounts({});
    setSessionSpecies(new Set());

    // Security check: getUserMedia requires https or localhost
    if (
      location.protocol !== 'https:' &&
      location.hostname !== 'localhost' &&
      location.hostname !== '127.0.0.1'
    ) {
      setErrorText('Quyền truy cập Camera yêu cầu kết nối HTTPS hoặc môi trường Localhost.');
      return;
    }

    try {
      const constraints: MediaStreamConstraints = {
        audio: false,
        video: selectedDeviceId
          ? { deviceId: { exact: selectedDeviceId } }
          : { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setIsStreaming(true);
      connectWebSocket();

      // Send frame every ~250ms (4 FPS max limit to balance mobile bandwidth and latency)
      frameTimerRef.current = setInterval(captureAndSendLoop, 250);
    } catch (err: any) {
      console.error('Lỗi mở camera:', err);
      if (err.name === 'NotAllowedError') {
        setErrorText('Bạn đã từ chối quyền truy cập máy ảnh. Hãy cấp quyền trong cài đặt trình duyệt để tiếp tục.');
      } else if (err.name === 'NotFoundError') {
        setErrorText('Không tìm thấy thiết bị camera trên máy tính/điện thoại này.');
      } else {
        setErrorText(`Không thể mở máy ảnh: ${err.message || 'Lỗi không xác định'}`);
      }
    }
  };

  const handleStopStream = () => {
    cleanupStreamAndSocket();
  };

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Device selector */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Camera className="w-4 h-4 text-emerald-500 shrink-0" />
          <select
            value={selectedDeviceId}
            onChange={(e) => setSelectedDeviceId(e.target.value)}
            disabled={isStreaming}
            className="w-full sm:w-64 px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none disabled:opacity-50"
          >
            {devices.map((d) => (
              <option key={d.deviceId} value={d.deviceId}>
                {d.label}
              </option>
            ))}
          </select>
        </div>

        {/* Telemetry metrics */}
        <div className="flex items-center gap-3 sm:gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
            <Gauge className="w-3.5 h-3.5 text-emerald-500" />
            <span>{fps} FPS</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
            <Activity className="w-3.5 h-3.5 text-blue-500" />
            <span>{latencyMs} ms</span>
          </div>

          {/* WebSocket status pill */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold ${
              wsStatus === 'connected'
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                : wsStatus === 'connecting'
                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
            }`}
          >
            {wsStatus === 'connected' ? (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-500" />
                <span className="hidden sm:inline">WS Đã kết nối</span>
              </>
            ) : wsStatus === 'connecting' ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-500" />
                <span className="hidden sm:inline">Đang kết nối...</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden sm:inline">Chưa kết nối WS</span>
              </>
            )}
          </div>
        </div>

        {/* Action Toggle */}
        <div className="self-end sm:self-auto shrink-0">
          {!isStreaming ? (
            <button
              onClick={handleStartStream}
              className="inline-flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-semibold rounded-xl text-xs shadow-md shadow-emerald-600/20 transition-all"
            >
              <Video className="w-4 h-4" />
              <span>Bật Camera & Quét</span>
            </button>
          ) : (
            <button
              onClick={handleStopStream}
              className="inline-flex items-center gap-2 px-5 py-2 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-semibold rounded-xl text-xs shadow-md shadow-rose-600/20 transition-all"
            >
              <CameraOff className="w-4 h-4" />
              <span>Dừng quét</span>
            </button>
          )}
        </div>
      </div>

      {/* Error Banner */}
      {errorText && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/30 rounded-2xl border border-rose-200 dark:border-rose-800/40 text-rose-800 dark:text-rose-300 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{errorText}</span>
          </div>
          <button
            onClick={() => setErrorText(null)}
            className="px-2.5 py-1 bg-rose-200/50 dark:bg-rose-900/40 rounded-lg hover:bg-rose-200 font-semibold"
          >
            Đóng
          </button>
        </div>
      )}

      {/* Main View Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Stream & Canvas (Col 8) */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm flex flex-col items-center justify-center">
          <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-slate-950 shadow-inner flex items-center justify-center">
            <video
              ref={videoRef}
              playsInline
              muted
              autoPlay
              className={`w-full h-full object-contain ${!isStreaming ? 'hidden' : ''}`}
            />
            <canvas
              ref={canvasRef}
              className={`absolute inset-0 w-full h-full pointer-events-none ${!isStreaming ? 'hidden' : ''}`}
            />

            {!isStreaming && (
              <div className="text-center p-8 text-slate-400 space-y-3">
                <div className="w-16 h-16 rounded-full bg-slate-900 flex items-center justify-center mx-auto text-slate-600 border border-slate-800">
                  <Camera className="w-8 h-8" />
                </div>
                <p className="text-sm font-semibold text-slate-300">
                  Camera chưa hoạt động
                </p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Bấm nút "Bật Camera & Quét" ở trên để cấp quyền và truyền trực tiếp luồng hình ảnh tới mô hình YOLOv11.
                </p>
              </div>
            )}
          </div>

          <div className="w-full flex items-center justify-between pt-3 px-2 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 mt-3">
            <span className="flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  isStreaming ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                }`}
              />
              {isStreaming ? 'Đang nhận diện thời gian thực qua WebSocket' : 'Đang ở trạng thái chờ'}
            </span>
            <span className="font-mono text-[11px] text-slate-400">
              Cơ chế Backpressure tự động bỏ qua khung hình trễ
            </span>
          </div>
        </div>

        {/* Real-time counters (Col 4) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Current Frame Breakdown */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                Khung hình hiện tại
              </h4>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                {currentDetections.length} đối tượng
              </span>
            </div>

            {currentDetections.length > 0 ? (
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {Object.entries(currentCounts).map(([name, count]) => {
                    const det = currentDetections.find((d) => d.cls === name);
                    return (
                      <ClassBadge
                        key={name}
                        clsId={det?.cls_id ?? name}
                        name={name}
                        count={count}
                        onClick={() => setSelectedPestForModal(name)}
                      />
                    );
                  })}
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500">
                {isStreaming
                  ? 'Chưa phát hiện sâu bệnh trong góc nhìn này.'
                  : 'Hãy bật camera để quét cây lúa.'}
              </p>
            )}
          </div>

          {/* Session Cumulative Observed Species */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                Loài từng thấy trong phiên
              </h4>
              <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-400">
                {sessionSpecies.size} loài
              </span>
            </div>

            <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/60 dark:border-slate-700/60 text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-1.5">
              <Info className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
              <span>
                <strong>Quy tắc đếm:</strong> Mỗi khung hình phản ánh số lượng côn trùng ngay tại lúc đó (không cộng dồn mù quáng nhằm tránh đếm lặp 1 con qua nhiều frame). Thẻ này ghi nhận các loài đã từng xuất hiện ít nhất một lần.
              </span>
            </div>

            {sessionSpecies.size > 0 ? (
              <div className="flex flex-wrap gap-2 pt-1">
                {Array.from(sessionSpecies).map((name) => (
                  <ClassBadge
                    key={name}
                    clsId={name}
                    name={name}
                    onClick={() => setSelectedPestForModal(name)}
                  />
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">Chưa ghi nhận loài nào.</p>
            )}
          </div>
        </div>
      </div>

      {/* Prevention modal for clicked pest */}
      <SpeciesModal
        pestName={selectedPestForModal}
        onClose={() => setSelectedPestForModal(null)}
      />
    </div>
  );
};

