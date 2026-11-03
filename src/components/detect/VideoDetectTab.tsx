import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useConfig } from '../../context/ConfigContext';
import { predictVideo, fetchJobStatus, buildMediaUrl } from '../../lib/api';
import { JobResponse } from '../../types';
import { ClassBadge } from '../ui/Badge';
import { SpeciesModal } from '../ui/SpeciesModal';
import {
  UploadCloud,
  Film,
  Play,
  Pause,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2,
  Clock,
  History,
  Info,
} from 'lucide-react';

export const VideoDetectTab: React.FC = () => {
  const { config, addToast } = useConfig();
  const navigate = useNavigate();

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobData, setJobData] = useState<JobResponse | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedPestForModal, setSelectedPestForModal] = useState<string | null>(null);

  const videoPlayerRef = useRef<HTMLVideoElement>(null);
  const pollTimerRef = useRef<any>(null);

  // File size check (warning if > 200MB)
  const isLargeFile = videoFile ? videoFile.size > 200 * 1024 * 1024 : false;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      addToast('warning', 'Định dạng không hỗ trợ', 'Vui lòng chọn file video định dạng MP4, MOV hoặc WebM.');
      return;
    }

    setVideoFile(file);
    setJobId(null);
    setJobData(null);
    setErrorMsg(null);
  };

  const handleStartAnalysis = async () => {
    if (!videoFile) return;

    setErrorMsg(null);
    setJobData({ status: 'processing', progress: 0.05 });
    setIsPolling(true);

    try {
      const res = await predictVideo(videoFile, config.defaultConf, config.videoSkip);
      setJobId(res.job_id);
    } catch (err: any) {
      setIsPolling(false);
      setErrorMsg(err.message || 'Lỗi khi tải video lên server');
      setJobData(null);
    }
  };

  // Polling loop
  useEffect(() => {
    if (!jobId || !isPolling) return;

    const poll = async () => {
      try {
        const statusRes = await fetchJobStatus(jobId);
        setJobData(statusRes);

        if (statusRes.status === 'done') {
          setIsPolling(false);
          addToast('success', 'Nhận diện video hoàn tất', 'Đã tạo video gắn nhãn và timeline phát hiện sâu bệnh.');
        } else if (statusRes.status === 'error') {
          setIsPolling(false);
          setErrorMsg(statusRes.error || 'Server thông báo lỗi trong quá trình xử lý video.');
        } else {
          // Schedule next poll
          pollTimerRef.current = setTimeout(poll, 1000);
        }
      } catch (err: any) {
        setIsPolling(false);
        setErrorMsg(err.message || 'Mất kết nối khi theo dõi tiến độ xử lý video.');
      }
    };

    poll();

    return () => {
      if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
    };
  }, [jobId, isPolling, addToast]);

  const handleCancelPoll = () => {
    if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
    setIsPolling(false);
    addToast('info', 'Đã hủy theo dõi', 'Bạn đã hủy theo dõi tiến trình nhận diện video.');
  };

  const seekToTime = (seconds: number) => {
    if (videoPlayerRef.current) {
      videoPlayerRef.current.currentTime = seconds;
      videoPlayerRef.current.play().catch(() => {});
    }
  };

  const formatSeconds = (sec: number): string => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    const ms = Math.floor((sec % 1) * 10);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms}`;
  };

  const resultVideoUrl = jobId ? buildMediaUrl(`/job/${jobId}/video`, config) : '';

  return (
    <div className="space-y-6">
      {/* Upload & Setup Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 shadow-inner">
              <Film className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-base">
                Nhận diện video khảo sát đồng ruộng
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Mô hình YOLOv11 sẽ phân tích từng khung hình (skip: {config.videoSkip}) và ghép video kết quả.
              </p>
            </div>
          </div>

          <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold transition-colors shrink-0">
            <UploadCloud className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Chọn file video</span>
            <input
              type="file"
              accept="video/mp4,video/quicktime,video/webm"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </div>

        {/* Selected file detail & warning */}
        {videoFile && (
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <Film className="w-4 h-4 text-slate-400" />
              <span className="font-semibold">{videoFile.name}</span>
              <span className="text-slate-400 font-mono">
                ({(videoFile.size / (1024 * 1024)).toFixed(2)} MB)
              </span>
            </div>

            {isLargeFile && (
              <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-lg border border-amber-500/20">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>Video &gt; 200MB có thể mất vài phút tải lên và xử lý.</span>
              </div>
            )}

            {!isPolling && jobData?.status !== 'done' && (
              <button
                onClick={handleStartAnalysis}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs shadow-md shadow-emerald-600/20 transition-all self-end sm:self-auto"
              >
                Bắt đầu phân tích
              </button>
            )}
          </div>
        )}
      </div>

      {/* Processing Progress Card */}
      {isPolling && jobData && (
        <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Loader2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 animate-spin" />
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  Đang phân tích video...
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Job ID: <code className="font-mono text-emerald-600 dark:text-emerald-400">{jobId}</code>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {Math.round((jobData.progress || 0) * 100)}%
              </span>
              <button
                onClick={handleCancelPoll}
                className="px-3 py-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors"
              >
                Hủy theo dõi
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden p-0.5 border border-slate-200 dark:border-slate-700">
            <div
              className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-300"
              style={{ width: `${Math.max(5, Math.min(100, Math.round((jobData.progress || 0) * 100)))}%` }}
            />
          </div>
        </div>
      )}

      {/* Error state */}
      {errorMsg && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/30 rounded-2xl border border-rose-200 dark:border-rose-800/40 text-rose-800 dark:text-rose-300 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button
            onClick={() => setErrorMsg(null)}
            className="px-2.5 py-1 bg-rose-200/50 dark:bg-rose-900/40 rounded-lg hover:bg-rose-200 font-semibold"
          >
            Đóng
          </button>
        </div>
      )}

      {/* Done State & Player */}
      {jobData?.status === 'done' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-in fade-in">
          {/* Video Player (Col 8) */}
          <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm space-y-4">
            <div className="relative rounded-xl overflow-hidden bg-slate-950 shadow-inner aspect-video flex items-center justify-center">
              <video
                ref={videoPlayerRef}
                src={resultVideoUrl}
                controls
                playsInline
                className="w-full h-full object-contain"
              >
                Trình duyệt của bạn không hỗ trợ phát thẻ video.
              </video>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  Video đã vẽ bounding box hoàn tất
                </span>
              </div>

              {jobData.history_id && (
                <button
                  onClick={() => navigate(`/history?id=${jobData.history_id}`)}
                  className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
                >
                  <History className="w-4 h-4" />
                  Xem trong Lịch sử phân tích
                </button>
              )}
            </div>
          </div>

          {/* Detections Timeline & Summary (Col 4) */}
          <div className="lg:col-span-4 space-y-4">
            {/* Species Counts */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3">
              <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-2">
                Tổng hợp loài phát hiện trong video
              </h4>

              {jobData.counts && Object.keys(jobData.counts).length > 0 ? (
                <div className="flex flex-wrap gap-2 pt-1">
                  {Object.entries(jobData.counts).map(([name, count]) => (
                    <ClassBadge
                      key={name}
                      clsId={name}
                      name={name}
                      count={count}
                      onClick={() => setSelectedPestForModal(name)}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500">Không ghi nhận sâu bệnh trên video này.</p>
              )}
            </div>

            {/* Interactive Timeline of Frames */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-emerald-500" />
                  Timeline các khung hình có phát hiện
                </h4>
                <span className="text-[10px] text-slate-400">
                  {jobData.frames?.length || 0} mốc
                </span>
              </div>

              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Nhấp vào bất kỳ dòng nào bên dưới để video nhảy ngay đến thời điểm tương ứng.
              </p>

              <div className="max-h-72 overflow-y-auto space-y-2 pr-1 text-xs">
                {jobData.frames && jobData.frames.length > 0 ? (
                  jobData.frames.map((f, idx) => (
                    <div
                      key={idx}
                      onClick={() => seekToTime(f.time)}
                      className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-50/60 dark:hover:bg-emerald-950/30 border border-slate-200/60 dark:border-slate-700/60 cursor-pointer transition-colors space-y-1.5 group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                          <Play className="w-3 h-3 fill-current group-hover:scale-110 transition-transform" />
                          {formatSeconds(f.time)}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          Frame #{f.frame}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {f.detections.map((d, dIdx) => (
                          <span
                            key={dIdx}
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-slate-200/60 dark:bg-slate-700/60 text-slate-700 dark:text-slate-300"
                          >
                            <span>{d.cls}</span>
                            <span className="font-mono opacity-70">
                              {(d.conf * 100).toFixed(0)}%
                            </span>
                          </span>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 text-center py-4">
                    Không có khung hình nào phát hiện sâu bệnh.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Prevention modal for clicked pest */}
      <SpeciesModal
        pestName={selectedPestForModal}
        onClose={() => setSelectedPestForModal(null)}
      />
    </div>
  );
};

