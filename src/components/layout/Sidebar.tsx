import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useConfig } from '../../context/ConfigContext';
import {
  ScanLine,
  History,
  BarChart3,
  Bug,
  Settings,
  Sun,
  Moon,
  Laptop,
  Menu,
  X,
  Sparkles,
  Sprout,
  Languages,
  Tv,
  ChevronRight,
  Radio,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const {
    status,
    deviceInfo,
    config,
    openSettings,
    theme,
    setTheme,
    isProjectorMode,
    toggleProjectorMode,
    pestLanguage,
    setPestLanguage,
  } = useConfig();

  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    {
      to: '/',
      label: 'Nhận diện',
      desc: 'Ảnh, Video, Camera',
      icon: ScanLine,
    },
    {
      to: '/history',
      label: 'Lịch sử',
      desc: 'Nhật ký chẩn đoán',
      icon: History,
    },
    {
      to: '/stats',
      label: 'Thống kê',
      desc: 'Hiệu năng mô hình & IPM',
      icon: BarChart3,
    },
    {
      to: '/pests',
      label: 'Cẩm nang loài',
      desc: '10 loài sâu bệnh hại',
      icon: Bug,
    },
  ];

  const cyclePestLanguage = () => {
    if (pestLanguage === 'vi') setPestLanguage('en');
    else if (pestLanguage === 'en') setPestLanguage('both');
    else setPestLanguage('vi');
  };

  const cycleTheme = () => {
    if (theme === 'system') setTheme('light');
    else if (theme === 'light') setTheme('dark');
    else setTheme('system');
  };

  const themeIcon = {
    light: <Sun className="w-4 h-4 text-amber-500" />,
    dark: <Moon className="w-4 h-4 text-indigo-400" />,
    system: <Laptop className="w-4 h-4 text-slate-500" />,
  }[theme];

  const sidebarContent = (
    <div className="flex flex-col h-full justify-between p-4 sm:p-5 select-none">
      {/* Brand Header */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <NavLink
            to="/"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-600/20 group-hover:scale-105 transition-transform">
              <Sprout className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-slate-100">
                  RicePest <span className="text-emerald-600 dark:text-emerald-400">AI</span>
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400 rounded-md border border-emerald-500/20 font-bold">
                  v11s
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Chẩn đoán dịch hại cây lúa
              </p>
            </div>
          </NavLink>

          {/* Close button on mobile */}
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="md:hidden p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs (Vertical) */}
        <nav className="space-y-1.5">
          <div className="px-2 pb-1 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Menu chức năng
          </div>
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center justify-between px-3.5 py-3 rounded-2xl text-sm font-semibold transition-all group ${
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-500/30 shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:text-emerald-600 dark:group-hover:text-emerald-400'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-bold leading-tight">{item.label}</div>
                    <div className="text-[11px] font-normal text-slate-400 dark:text-slate-500">
                      {item.desc}
                    </div>
                  </div>
                </div>
                {isActive && (
                  <span className="w-1.5 h-6 rounded-full bg-emerald-600 dark:bg-emerald-400" />
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Footer & Control Panel */}
      <div className="space-y-3 pt-4 border-t border-slate-200/80 dark:border-slate-800/80">
        {/* Backend Status Card */}
        <button
          type="button"
          onClick={openSettings}
          className={`w-full p-3 rounded-2xl border text-left transition-all hover:scale-[1.01] active:scale-[0.99] ${
            status === 'online'
              ? 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-500/30 text-emerald-900 dark:text-emerald-200'
              : status === 'checking'
              ? 'bg-amber-50/70 dark:bg-amber-950/20 border-amber-500/30 text-amber-900 dark:text-amber-200'
              : 'bg-rose-50/70 dark:bg-rose-950/20 border-rose-500/30 text-rose-900 dark:text-rose-200'
          }`}
          title="Bấm để cấu hình kết nối Backend hoặc dò tìm Server"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                {status === 'online' && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                )}
                <span
                  className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                    status === 'online'
                      ? 'bg-emerald-500'
                      : status === 'checking'
                      ? 'bg-amber-500'
                      : 'bg-rose-500'
                  }`}
                />
              </span>
              <span className="text-xs font-bold">
                {status === 'online'
                  ? 'Backend Online'
                  : status === 'checking'
                  ? 'Đang kiểm tra...'
                  : 'Backend Offline'}
              </span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 opacity-50" />
          </div>
          <div className="text-[11px] opacity-75 mt-1 font-mono truncate">
            {config.mockMode
              ? 'Chế độ Demo Mock'
              : status === 'online'
              ? `${deviceInfo || 'CPU'} • Cloud Sync`
              : 'Bấm để cấu hình link'}
          </div>
        </button>

        {/* Demo Mode Badge */}
        {config.mockMode && (
          <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs">
            <span className="flex items-center gap-1.5 font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Chế độ Demo
            </span>
            <button
              onClick={openSettings}
              className="text-[11px] underline font-bold hover:text-amber-800"
            >
              Đổi
            </button>
          </div>
        )}

        {/* Quick Utilities Toolbar */}
        <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
          {/* Projector Mode Toggle */}
          <button
            type="button"
            onClick={toggleProjectorMode}
            className={`p-2 rounded-lg flex flex-col items-center justify-center transition-colors ${
              isProjectorMode
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
            title={isProjectorMode ? 'Tắt Chế độ Máy chiếu' : 'Bật Chế độ Máy chiếu (Siêu sáng & Chữ to)'}
          >
            <Tv className="w-4 h-4" />
          </button>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={cycleTheme}
            className="p-2 rounded-lg flex flex-col items-center justify-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
            title={`Giao diện: ${theme === 'light' ? 'Sáng' : theme === 'dark' ? 'Tối' : 'Hệ thống'}`}
          >
            {themeIcon}
          </button>

          {/* Language Toggle */}
          <button
            type="button"
            onClick={cyclePestLanguage}
            className="p-2 rounded-lg flex flex-col items-center justify-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors font-bold text-xs"
            title={`Ngôn ngữ loài: ${pestLanguage.toUpperCase()}`}
          >
            <Languages className="w-4 h-4" />
          </button>

          {/* Settings Modal Toggle */}
          <button
            type="button"
            onClick={openSettings}
            className="p-2 rounded-lg flex flex-col items-center justify-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
            title="Cài đặt kết nối & thông số"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Top Header (< md) */}
      <header className="md:hidden sticky top-0 z-30 w-full h-14 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between px-4">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="p-2 -ml-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Mở menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <NavLink to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white">
              <Sprout className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-slate-100">
              RicePest <span className="text-emerald-600 dark:text-emerald-400">AI</span>
            </span>
          </NavLink>
        </div>

        <div className="flex items-center gap-2">
          {/* Status Dot */}
          <button
            type="button"
            onClick={openSettings}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                status === 'online'
                  ? 'bg-emerald-500'
                  : status === 'checking'
                  ? 'bg-amber-500'
                  : 'bg-rose-500'
              }`}
            />
            <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300">
              {status === 'online' ? 'Online' : 'Offline'}
            </span>
          </button>
        </div>
      </header>

      {/* Mobile Overlay Drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          {/* Drawer Content */}
          <div className="relative w-72 max-w-[85vw] h-full bg-white dark:bg-slate-900 shadow-2xl z-10">
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Desktop Vertical Sidebar (md & up) */}
      <aside className="hidden md:flex flex-col w-64 lg:w-72 shrink-0 h-screen sticky top-0 border-r border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 z-30 transition-colors">
        {sidebarContent}
      </aside>
    </>
  );
};
