import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useConfig } from '../context/ConfigContext';
import { fetchHistory, fetchHistoryItem, deleteHistoryItem, downloadExportCsv, buildMediaUrl } from '../lib/api';
import { HistoryItem, Detection } from '../types';
import { SourceBadge, ClassBadge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { SpeciesModal } from '../components/ui/SpeciesModal';
import { evaluatePestRisk } from '../lib/pestTranslations';
import {
  History,
  FileSpreadsheet,
  Trash2,
  Eye,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Loader2,
  FileQuestion,
  Search,
  Copy,
  Check,
  Download,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';

export const HistoryPage: React.FC = () => {
  const { config, addToast, getPestName } = useConfig();
  const [searchParams, setSearchParams] = useSearchParams();

  const [items, setItems] = useState<HistoryItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [sourceFilter, setSourceFilter] = useState<'all' | 'image' | 'video' | 'stream'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [page, setPage] = useState<number>(0);
  const pageSize = 20;

  // Detail Modal State
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);

  // Delete Confirm State
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // Species prevention modal
  const [selectedPestName, setSelectedPestName] = useState<string | null>(null);

  // Load history list
  const loadHistory = useCallback(async () => {
    setLoading(true);
    try {
      const src = sourceFilter === 'all' ? undefined : sourceFilter;
      const res = await fetchHistory(pageSize, page * pageSize, src);
      setItems(res.items || []);
      setTotal(res.total || 0);
    } catch (err: any) {
      addToast('error', 'Lỗi tải lịch sử', err.message);
    } finally {
      setLoading(false);
    }
  }, [sourceFilter, page, addToast]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // Open item from query parameter (?id=xxx)
  useEffect(() => {
    const idParam = searchParams.get('id');
    if (idParam) {
      fetchHistoryItem(idParam)
        .then((item) => {
          setSelectedItem(item);
        })
        .catch(() => {
          addToast('warning', 'Không tìm thấy', `Không tìm thấy bản ghi ID ${idParam}`);
        });
    }
  }, [searchParams, addToast]);

  const handleOpenDetail = async (item: HistoryItem) => {
    try {
      const full = await fetchHistoryItem(item.id);
      setSelectedItem(full);
      setSearchParams({ id: item.id });
    } catch {
      setSelectedItem(item);
    }
  };

  const handleCloseDetail = () => {
    setSelectedItem(null);
    searchParams.delete('id');
    setSearchParams(searchParams);
  };

  const handleCopyId = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    addToast('info', 'Đã sao chép ID', id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    setIsDeleting(true);
    try {
      await deleteHistoryItem(deleteTargetId);
      addToast('success', 'Đã xóa bản ghi', `Bản ghi ${deleteTargetId} đã được xóa thành công.`);
      setDeleteTargetId(null);
      if (selectedItem?.id === deleteTargetId) {
        handleCloseDetail();
      }
      loadHistory();
    } catch (err: any) {
      addToast('error', 'Lỗi xóa bản ghi', err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExportCsv = async () => {
    setIsExporting(true);
    try {
      await downloadExportCsv();
      addToast('success', 'Xuất CSV thành công', 'File báo cáo đã được tải xuống máy.');
    } catch (err: any) {
      addToast('error', 'Lỗi xuất CSV', err.message);
    } finally {
      setIsExporting(false);
    }
  };

  // Client-side quick filter on current loaded page
  const filteredItems = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return items;

    return items.filter((item) => {
      const filenameMatch = item.filename?.toLowerCase().includes(q);
      const idMatch = item.id.toLowerCase().includes(q);
      const pestMatch = item.counts
        ? Object.keys(item.counts).some(
            (k) => k.toLowerCase().includes(q) || getPestName(k).toLowerCase().includes(q)
          )
        : false;
      return filenameMatch || idMatch || pestMatch;
    });
  }, [items, searchQuery, getPestName]);

  const totalPages = Math.ceil(total / pageSize);

  // Risk assessment for the currently selected item
  const selectedItemRisk = useMemo(() => {
    if (!selectedItem?.counts) return null;
    return evaluatePestRisk(selectedItem.counts);
  }, [selectedItem]);

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Heading & Top Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2.5">
            <History className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            Lịch sử phân tích sâu bệnh
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Tổng hợp dữ liệu tất cả các phiên quét ảnh, video và stream webcam ({total} bản ghi)
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={() => loadHistory()}
            disabled={loading}
            aria-label="Làm mới lịch sử"
            className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl transition-colors"
            title="Làm mới dữ liệu"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleExportCsv}
            disabled={isExporting}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-semibold shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50"
          >
            {isExporting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <FileSpreadsheet className="w-4 h-4" />
            )}
            <span>Xuất file CSV</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Source tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-200/70 dark:bg-slate-800/70 rounded-xl border border-slate-200 dark:border-slate-700/60 max-w-fit">
          {(['all', 'image', 'video', 'stream'] as const).map((filter) => {
            const labels = {
              all: 'Tất cả nguồn',
              image: 'Hình ảnh',
              video: 'Video',
              stream: 'Webcam',
            };
            return (
              <button
                key={filter}
                onClick={() => {
                  setSourceFilter(filter);
                  setPage(0);
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  sourceFilter === filter
                    ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {labels[filter]}
              </button>
            );
          })}
        </div>

        {/* Quick Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Lọc theo tên file, loài..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-4">Thời gian</th>
                <th className="py-3.5 px-4">Nguồn</th>
                <th className="py-3.5 px-4">Tên file / Mẫu</th>
                <th className="py-3.5 px-4 text-center">Tổng số</th>
                <th className="py-3.5 px-4">Chi tiết các loài phát hiện</th>
                <th className="py-3.5 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-4 px-4">
                      <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded w-24"></div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded-full w-16"></div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded w-32"></div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded mx-auto w-8"></div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded-full w-48"></div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-16 ml-auto"></div>
                    </td>
                  </tr>
                ))
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <FileQuestion className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
                    <p className="text-sm font-semibold">Chưa có bản ghi lịch sử nào phù hợp</p>
                    <p className="text-xs mt-1">
                      Hãy thực hiện nhận diện ảnh, video hoặc mở camera để lưu kết quả.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer"
                    onClick={() => handleOpenDetail(item)}
                  >
                    <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {new Date(item.ts).toLocaleString('vi-VN')}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <SourceBadge source={item.source} />
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-800 dark:text-slate-200 max-w-[200px] truncate">
                      {item.filename || `Record ${item.id}`}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-900 dark:text-slate-100">
                      {item.total}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1.5 max-w-md">
                        {item.counts && Object.entries(item.counts).length > 0 ? (
                          Object.entries(item.counts).map(([name, count]) => (
                            <ClassBadge
                              key={name}
                              clsId={name}
                              name={getPestName(name)}
                              count={count}
                              onClick={() => setSelectedPestName(name)}
                            />
                          ))
                        ) : (
                          <span className="text-slate-400 italic">Không phát hiện</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div
                        className="inline-flex items-center gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => handleOpenDetail(item)}
                          aria-label="Xem chi tiết bản ghi"
                          className="p-1.5 text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTargetId(item.id)}
                          aria-label="Xóa bản ghi"
                          className="p-1.5 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          title="Xóa bản ghi"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span>
              Trang {page + 1} / {totalPages} (Tổng số {total} mục)
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                aria-label="Trang trước"
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                aria-label="Trang tiếp theo"
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <Modal
        isOpen={Boolean(selectedItem)}
        onClose={handleCloseDetail}
        maxWidth="3xl"
        title={
          selectedItem && (
            <div className="flex items-center gap-2">
              <SourceBadge source={selectedItem.source} />
              <span className="font-semibold">{selectedItem.filename}</span>
            </div>
          )
        }
      >
        {selectedItem && (
          <div className="space-y-6">
            {/* Risk Assessment Banner if counts exist */}
            {selectedItemRisk && (
              <div
                className={`p-3.5 rounded-xl border flex items-start gap-3 ${selectedItemRisk.bg}`}
              >
                <div
                  className={`p-1.5 rounded-lg text-white shrink-0 ${
                    selectedItemRisk.level === 'critical'
                      ? 'bg-rose-600'
                      : selectedItemRisk.level === 'warning'
                      ? 'bg-amber-600'
                      : selectedItemRisk.level === 'low'
                      ? 'bg-blue-600'
                      : 'bg-emerald-600'
                  }`}
                >
                  {selectedItemRisk.level === 'critical' || selectedItemRisk.level === 'warning' ? (
                    <ShieldAlert className="w-4 h-4" />
                  ) : (
                    <ShieldCheck className="w-4 h-4" />
                  )}
                </div>
                <div className="text-xs">
                  <span className="font-bold uppercase tracking-wider">
                    {selectedItemRisk.title}
                  </span>
                  <p className="mt-0.5 opacity-90">{selectedItemRisk.message}</p>
                </div>
              </div>
            )}

            {/* Annotated Image if present */}
            {selectedItem.has_image && (
              <div className="relative rounded-xl overflow-hidden bg-slate-950 flex items-center justify-center border border-slate-200 dark:border-slate-800">
                <img
                  src={buildMediaUrl(`/history/${selectedItem.id}/image`, config)}
                  alt="Ảnh đã vẽ bounding box"
                  className="max-h-96 w-auto object-contain"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
            )}

            {/* Meta info tags */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                <p className="text-slate-400">Thời gian tạo</p>
                <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                  {new Date(selectedItem.ts).toLocaleString('vi-VN')}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                <p className="text-slate-400">Tổng đối tượng</p>
                <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                  {selectedItem.total} côn trùng
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                <p className="text-slate-400">Mã bản ghi</p>
                <button
                  onClick={() => handleCopyId(selectedItem.id)}
                  className="font-mono text-emerald-600 dark:text-emerald-400 mt-0.5 flex items-center gap-1 hover:underline truncate"
                >
                  <span className="truncate">{selectedItem.id}</span>
                  {copiedId === selectedItem.id ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>

              {selectedItem.meta?.device !== undefined && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                  <p className="text-slate-400">Thiết bị suy luận</p>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 font-mono truncate">
                    {String(selectedItem.meta.device)}
                  </p>
                </div>
              )}
            </div>

            {/* Detections List */}
            {selectedItem.detections && selectedItem.detections.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Danh sách bounding boxes phát hiện:
                </h4>
                <div className="max-h-56 overflow-y-auto space-y-1.5 text-xs pr-1">
                  {selectedItem.detections.map((d: Detection, idx: number) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedPestName(d.cls)}
                      className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          #{idx + 1} {getPestName(d.cls_id ?? d.cls)}
                        </span>
                        <span className="font-mono text-[10px] text-slate-400">
                          [{d.box.map((n: number) => Math.round(n)).join(', ')}]
                        </span>
                      </div>
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {(d.conf * 100).toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer actions */}
            <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setDeleteTargetId(selectedItem.id)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Xóa bản ghi này</span>
              </button>

              <button
                onClick={handleCloseDetail}
                className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Dialog */}
      <Modal
        isOpen={Boolean(deleteTargetId)}
        onClose={() => setDeleteTargetId(null)}
        maxWidth="sm"
        title="Xác nhận xóa bản ghi"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-600 dark:text-slate-300">
            Bạn có chắc chắn muốn xóa bản ghi lịch sử này? Hành động này sẽ xóa dữ liệu và ảnh kết quả lưu trên backend và không thể hoàn tác.
          </p>
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              onClick={() => setDeleteTargetId(null)}
              className="px-3.5 py-2 font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50"
            >
              {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
              <span>Xóa vĩnh viễn</span>
            </button>
          </div>
        </div>
      </Modal>

      {/* Species prevention info modal */}
      <SpeciesModal
        pestName={selectedPestName}
        onClose={() => setSelectedPestName(null)}
      />
    </div>
  );
};

