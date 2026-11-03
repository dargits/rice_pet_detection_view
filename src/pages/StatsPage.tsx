import React, { useState, useEffect } from 'react';
import { useConfig } from '../context/ConfigContext';
import { fetchStats } from '../lib/api';
import { StatsResponse } from '../types';
import { getClassColor, SOURCE_COLORS, SOURCE_LABELS } from '../lib/colors';
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
} from 'lucide-react';

export const StatsPage: React.FC = () => {
  const { addToast } = useConfig();
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

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

  const classCounts: [string, number][] = stats?.by_class
    ? Object.entries(stats.by_class).map(([k, v]) => [k, Number(v)])
    : [];

  const totalDetections: number = classCounts.reduce((acc, curr) => acc + curr[1], 0);

  const mostFrequentPest = classCounts.length > 0
    ? [...classCounts].sort((a, b) => b[1] - a[1])[0]
    : null;

  // Prepare chart data for by_class
  const classChartData = classCounts
    .map(([name, count]) => ({
      name,
      count,
      fill: getClassColor(name).stroke,
    }))
    .sort((a, b) => b.count - a.count);

  // Prepare chart data for by_source
  const sourceChartData = stats?.by_source
    ? Object.entries(stats.by_source).map(([src, count]) => ({
        name: SOURCE_LABELS[src] || src,
        count: Number(count),
        color: SOURCE_COLORS[src] || '#64748b',
      }))
    : [];

  // Prepare chart data for by_day
  const dayChartData = stats?.by_day
    ? Object.entries(stats.by_day)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([day, classes]) => {
          const classObj = classes as Record<string, number>;
          const totalInDay = Object.values(classObj).reduce((sum, c) => sum + Number(c), 0);
          return {
            day: day.replace(/^\d{4}-/, ''), // MM-DD
            fullDate: day,
            total: totalInDay,
            ...classObj,
          };
        })
    : [];

  const allSpeciesInDays = Array.from(
    new Set(
      Object.values(stats?.by_day || {}).flatMap((dayObj) =>
        Object.keys(dayObj as Record<string, number>)
      )
    )
  );

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
            {mostFrequentPest ? mostFrequentPest[0] : 'Chưa có'}
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
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    borderRadius: '0.75rem',
                    border: 'none',
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
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    borderRadius: '0.75rem',
                    border: 'none',
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

        {/* Area / Trend Chart: By Day (Col 12) */}
        <div className="lg:col-span-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-500" />
              Biến động mật độ sâu hại theo thời gian (theo ngày)
            </h3>
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
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    borderRadius: '0.75rem',
                    border: 'none',
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
                      name={species}
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
