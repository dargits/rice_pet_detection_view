import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
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
  Cpu,
  Sparkles,
  Wifi,
  WifiOff,
  Sprout,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { status, deviceInfo, config, openSettings, theme, setTheme } = useConfig();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { to: '/', label: 'Nhận diện', icon: ScanLine },
    { to: '/history', label: 'Lịch sử', icon: History },
    { to: '/stats', label: 'Thống kê', icon: BarChart3 },
    { to: '/pests', label: 'Loài gây hại', icon: Bug },
  ];

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

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <NavLink to="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <Sprout className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base tracking-tight text-slate-900 dark:text-slate-100">
                RicePest <span className="text-emerald-600 dark:text-emerald-400">AI</span>
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 rounded-md border border-emerald-500/20 font-bold">
                YOLOv11
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 hidden sm:block">
              Phát hiện sâu bệnh hại cây lúa
            </p>
          </div>
        </NavLink>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 dark:bg-slate-800/60 p-1 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/50 dark:hover:bg-slate-800'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2.5">
          {/* Mock Mode Pill */}
          {config.mockMode && (
            <button
              onClick={openSettings}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 transition-colors"
              title="Chế độ Demo đang bật. Bấm để cấu hình."
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Chế độ Demo</span>
            </button>
          )}

          {/* Backend Status Badge */}
          <button
            onClick={openSettings}
            aria-label="Cài đặt kết nối backend"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all cursor-pointer hover:opacity-90 active:scale-95"
            style={{
              backgroundColor:
                status === 'online'
                  ? 'rgba(16, 185, 129, 0.1)'
                  : status === 'checking'
                  ? 'rgba(245, 158, 11, 0.1)'
                  : 'rgba(239, 68, 68, 0.1)',
              borderColor:
                status === 'online'
                  ? 'rgba(16, 185, 129, 0.3)'
                  : status === 'checking'
                  ? 'rgba(245, 158, 11, 0.3)'
                  : 'rgba(239, 68, 68, 0.3)',
              color:
                status === 'online'
                  ? '#10b981'
                  : status === 'checking'
                  ? '#f59e0b'
                  : '#ef4444',
            }}
            title={
              status === 'online'
                ? `Backend Online (${deviceInfo || 'CPU'})`
                : 'Backend Offline. Bấm để sửa URL'
            }
          >
            {status === 'online' ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <Wifi className="w-3.5 h-3.5" />
                <span className="font-semibold">Online</span>
                {deviceInfo && (
                  <span className="hidden sm:inline-flex items-center gap-1 text-[10px] opacity-80 pl-1 border-l border-emerald-500/30 font-mono">
                    <Cpu className="w-2.5 h-2.5" />
                    {deviceInfo.length > 14 ? deviceInfo.slice(0, 14) + '…' : deviceInfo}
                  </span>
                )}
              </>
            ) : status === 'checking' ? (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span>Đang kiểm tra...</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5" />
                <span className="font-semibold">Offline</span>
              </>
            )}
          </button>

          {/* Theme switcher */}
          <button
            onClick={cycleTheme}
            aria-label="Đổi giao diện sáng/tối"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={`Giao diện: ${theme === 'system' ? 'Theo hệ thống' : theme === 'dark' ? 'Tối' : 'Sáng'}`}
          >
            {themeIcon}
          </button>

          {/* Settings button */}
          <button
            onClick={openSettings}
            aria-label="Cài đặt kết nối"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Cài đặt kết nối backend"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Mở menu điều hướng"
            className="md:hidden p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-2 pb-4 space-y-1 animate-in slide-in-from-top-3">
          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    isActive
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      )}
    </header>
  );
};

