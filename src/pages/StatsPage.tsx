import React, { useState, useEffect, useMemo } from 'react';
import { useConfig } from '../context/ConfigContext';
import { fetchStats } from '../lib/api';
import { StatsResponse } from '../types';
import { getClassColor, SOURCE_COLORS, SOURCE_LABELS } from '../lib/colors';
import { findPestEntry } from '../lib/pestTranslations';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
  CartesianGrid,
} from 'recharts';
import {
  BarChart3,
  RefreshCw,
  Bug,
  Layers,
  Sparkles,
  TrendingUp,
  PieChart as PieChartIcon,
  Calendar,
  ShieldCheck,
  ShieldAlert,
  HeartPulse,
  Filter,
} from 'lucide-react';

export const StatsPage: React.FC = () => {
  const { addToast, getPestName } = useConfig();
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [timeFilter, setTimeFilter] = useState<'all' | '7d' | '30d'>('all');

  const loadStats = async () => {
    setLoading(true);
    try {
      const data = await fetchStats();
      setStats(data);
    } catch (err: any) {
      addToast('error', 'Lỗi tải thống kê', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  // Calculate metrics
  const totalRecords: number = stats?.records || 0;

  const classCounts: [string, number][] = useMemo(() => {
    return stats?.by_class
      ? Object.entries(stats.by_class).map(([k, v]) => [k, Number(v)])
      : [];
  }, [stats?.by_class]);

  const totalDetections: number = useMemo(() => {
    return classCounts.reduce((acc, curr) => acc + curr[1], 0);
  }, [classCounts]);

  const mostFrequentPest = useMemo(() => {
    return classCounts.length > 0
      ? [...classCounts].sort((a, b) => b[1] - a[1])[0]
      : null;
  }, [classCounts]);

  // Rice Field Health Index (0 - 100)
  // Higher pest density & critical pest presence reduces the health score
  const fieldHealthScore = useMemo(() => {
    if (totalRecords === 0) return 95;
    const avgPests = totalDetections / totalRecords;

    // Severity weighting
    let dangerPenalty = 0;
    classCounts.forEach(([name, count]) => {
      const entry = findPestEntry(name);
      if (entry?.severity === 'critical') dangerPenalty += count * 4;
      else if (entry?.severity === 'high') dangerPenalty += count * 2;
      else dangerPenalty += count * 0.8;
    });

    const scaledPenalty = Math.min(85, (dangerPenalty / totalRecords) * 12);
    return Math.max(15, Math.round(100 - scaledPenalty));
  }, [totalRecords, totalDetections, classCounts]);

  // Breakdown by severity
  const severityBreakdown = useMemo(() => {
    let critical = 0;
    let high = 0;
    let medium = 0;

    classCounts.forEach(([name, count]) => {
      const entry = findPestEntry(name);
      if (entry?.severity === 'critical') critical += count;
      else if (entry?.severity === 'high') high += count;
      else medium += count;
    });

    return { critical, high, medium };
  }, [classCounts]);

  // Prepare chart data for by_class
  const classChartData = useMemo(() => {
    return classCounts
      .map(([name, count]) => ({
        name: getPestName(name),
        rawName: name,
        count,
        fill: getClassColor(name).stroke,
      }))
      .sort((a, b) => b.count - a.count);
  }, [classCounts, getPestName]);

  // Prepare chart data for by_source
  const sourceChartData = useMemo(() => {
    return stats?.by_source
      ? Object.entries(stats.by_source).map(([src, count]) => ({
          name: SOURCE_LABELS[src] || src,
          count: Number(count),
          color: SOURCE_COLORS[src] || '#64748b',
        }))
      : [];
  }, [stats?.by_source]);

  // Prepare chart data for by_day with filter
  const dayChartData = useMemo(() => {
    if (!stats?.by_day) return [];

    let entries = Object.entries(stats.by_day).sort((a, b) => a[0].localeCompare(b[0]));
    if (timeFilter === '7d') {
      entries = entries.slice(-7);
    } else if (timeFilter === '30d') {
      entries = entries.slice(-30);
    }

    return entries.map(([day, classes]) => {
      const classObj = classes as Record<string, number>;
      const totalInDay = Object.values(classObj).reduce((sum, c) => sum + Number(c), 0);
      return {
        day: day.replace(/^\d{4}-/, ''), // MM-DD
        fullDate: day,
        total: totalInDay,
        ...classObj,
      };
    });
  }, [stats?.by_day, timeFilter]);

  const allSpeciesInDays = useMemo(() => {
    return Array.from(
      new Set(
        Object.values(stats?.by_day || {}).flatMap((dayObj) =>
          Object.keys(dayObj as Record<string, number>)
        )
      )
    );
  }, [stats?.by_day]);

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2.5">
            <BarChart3 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            Báo cáo & Thống kê Dịch hại
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Phân tích tần suất xuất hiện, xu hướng theo thời gian và cơ cấu nguồn thu thập
          </p>
        </div>

        <button
          onClick={loadStats}
          disabled={loading}
          aria-label="Làm mới thống kê"
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Làm mới số liệu</span>
        </button>
      </div>

      {/* VIP Health Index & Severity Breakdown Row */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Field Health Score Card (Col 6) */}
        <div className="md:col-span-6 p-5 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent dark:from-emerald-950/40 dark:via-slate-900 dark:to-slate-900 rounded-2xl border border-emerald-500/20 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-600 text-white">
                <HeartPulse className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  Chỉ số Sức khỏe Ruộng Lúa (Field Health Index)
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Ước tính tự động dựa trên tần suất rầy nâu, sâu đục thân và mật độ dịch hại
                </p>
              </div>
            </div>
            <span
              className={`text-2xl font-mono font-black ${
                fieldHealthScore >= 75
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : fieldHealthScore >= 50
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {fieldHealthScore}/100
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-3 overflow-hidden p-0.5 border border-slate-300/40 dark:border-slate-700">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  fieldHealthScore >= 75
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                    : fieldHealthScore >= 50
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                    : 'bg-gradient-to-r from-rose-600 to-red-400'
                }`}
                style={{ width: `${fieldHealthScore}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              <span>0 (Dịch hại nghiêm trọng)</span>
              <span>
                {fieldHealthScore >= 75
                  ? '🌱 Trạng thái an toàn'
                  : fieldHealthScore >= 50
                  ? '⚠️ Cần giám sát chặt chẽ'
                  : '🚨 Cảnh báo bùng phát dịch'}
              </span>
              <span>100 (Ruộng khỏe mạnh)</span>
            </div>
          </div>
        </div>

        {/* Severity Classification (Col 6) */}
        <div className="md:col-span-6 p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-500" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                Phân bổ theo Mức độ Nguy hại Dịch bệnh
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              {totalDetections} cá thể
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 bg-rose-50 dark:bg-rose-950/30 rounded-xl border border-rose-200/60 dark:border-rose-900/40">
              <span className="text-[10px] uppercase font-bold tracking-wider text-rose-700 dark:text-rose-400 block">
                Nguy cấp (Critical)
              </span>
              <span className="text-xl font-extrabold text-rose-900 dark:text-rose-200 font-mono block mt-1">
                {severityBreakdown.critical}
              </span>
              <span className="text-[10px] text-rose-600/80 dark:text-rose-400/80">
                Rầy nâu, Muỗi hành...
              </span>
            </div>

            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200/60 dark:border-amber-900/40">
              <span className="text-[10px] uppercase font-bold tracking-wider text-amber-700 dark:text-amber-400 block">
                Nguy cơ cao (High)
              </span>
              <span className="text-xl font-extrabold text-amber-900 dark:text-amber-200 font-mono block mt-1">
                {severityBreakdown.high}
              </span>
              <span className="text-[10px] text-amber-600/80 dark:text-amber-400/80">
                Sâu cuốn lá, Rầy trắng...
              </span>
            </div>

            <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-xl border border-blue-200/60 dark:border-blue-900/40">
              <span className="text-[10px] uppercase font-bold tracking-wider text-blue-700 dark:text-blue-400 block">
                Trung bình (Medium)
              </span>
              <span className="text-xl font-extrabold text-blue-900 dark:text-blue-200 font-mono block mt-1">
                {severityBreakdown.medium}
              </span>
              <span className="text-[10px] text-blue-600/80 dark:text-blue-400/80">
                Sâu đo, Rầy xanh...
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Tổng lượt phân tích</span>
            <Layers className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 font-mono">
            {totalRecords}
          </div>
          <p className="text-[11px] text-slate-400">Ảnh, Video và phiên trực tiếp</p>
        </div>

        {/* Card 2 */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Tổng đối tượng phát hiện</span>
            <Bug className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 font-mono">
            {totalDetections}
          </div>
          <p className="text-[11px] text-slate-400">Côn trùng gây hại được ghi nhận</p>
        </div>

        {/* Card 3 */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Loài phổ biến nhất</span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 truncate">
            {mostFrequentPest ? getPestName(mostFrequentPest[0]) : 'Chưa có'}
          </div>
          <p className="text-[11px] text-slate-400">
            {mostFrequentPest ? `${mostFrequentPest[1]} cá thể ghi nhận` : '—'}
          </p>
        </div>

        {/* Card 4 */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Mật độ phát hiện TB</span>
            <TrendingUp className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 font-mono">
            {totalRecords > 0 ? (totalDetections / totalRecords).toFixed(1) : '0'}
          </div>
          <p className="text-[11px] text-slate-400">Đối tượng / một lượt kiểm tra</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Bar Chart: By Class (Col 7) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Bug className="w-4 h-4 text-emerald-500" />
              Số lượng phát hiện theo từng loài côn trùng
            </h3>
            <span className="text-xs text-slate-400">{classChartData.length} loài</span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={classChartData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis
                  dataKey="name"
                  angle={-25}
                  textAnchor="end"
                  interval={0}
                  tick={{ fontSize: 11, fill: '#888888' }}
                />
                <YAxis tick={{ fontSize: 11, fill: '#888888' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    borderRadius: '0.75rem',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                  formatter={(val: any) => [`${val} con`, 'Số lượng']}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {classChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart: By Source (Col 5) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <PieChartIcon className="w-4 h-4 text-blue-500" />
              Cơ cấu nguồn dữ liệu khảo sát
            </h3>
          </div>

          <div className="h-72 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sourceChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="count"
                >
                  {sourceChartData.map((entry, index) => (
                    <Cell key={`source-cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    borderRadius: '0.75rem',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                  formatter={(val: any) => [`${val} lượt`, 'Tần suất']}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  wrapperStyle={{ fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Area / Trend Chart: By Day with Time Filter (Col 12) */}
        <div className="lg:col-span-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-500" />
              Biến động mật độ sâu hại theo thời gian (theo ngày)
            </h3>

            {/* Time filter */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              {[
                { id: '7d', label: '7 ngày qua' },
                { id: '30d', label: '30 ngày qua' },
                { id: 'all', label: 'Tất cả' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setTimeFilter(opt.id as any)}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-all ${
                    timeFilter === opt.id
                      ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dayChartData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="totalGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#888888' }} />
                <YAxis tick={{ fontSize: 11, fill: '#888888' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    borderRadius: '0.75rem',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                  labelFormatter={(_label, payload) => {
                    return payload?.[0]?.payload?.fullDate || _label;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="total"
                  name="Tổng số phát hiện"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#totalGradient)"
                />
                {allSpeciesInDays.slice(0, 3).map((species) => {
                  const color = getClassColor(species).stroke;
                  return (
                    <Area
                      key={species}
                      type="monotone"
                      dataKey={species}
                      name={getPestName(species)}
                      stroke={color}
                      strokeWidth={1.5}
                      fillOpacity={0.05}
                      fill={color}
                    />
                  );
                })}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

