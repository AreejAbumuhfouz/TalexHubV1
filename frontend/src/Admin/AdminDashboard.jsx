import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';

import useAuthStore from '../store/authStore';
import useThemeStore from '../store/themeStore';
import useLangStore from '../i18n';
import LogoGold from '../assets/images/LogoGold.png';
import LogoIcon from '../assets/images/LogoIcon.png';

// Components
import { Icon } from './components/AdminIcons';
import { AdminStyles, Avatar, Spinner } from './components/AdminUI';
import { LoadingSpinner } from '../components/common';
import { C, TABS_CONFIG } from './components/AdminTokens';
import AdminErrorBoundary from './components/AdminErrorBoundary';

// Tabs
import OverviewTab from './tabs/OverviewTab';
import UsersTab from './tabs/UsersTab';
import CompaniesTab from './tabs/CompaniesTab';
import JobsTab from './tabs/JobsTab';
import CoursesTab from './tabs/CoursesTab';
import ChatRoomsTab from './tabs/ChatRoomsTab';
import WalletsTab from './tabs/WalletsTab';
import ModerationTab from './tabs/ModerationTab';
import NotificationsTab from './tabs/NotificationsTab';
import WaitlistTab from './tabs/WaitlistTab';
import AuditTab from './tabs/AuditLogTab';
import SettingsTab from './tabs/SettingsTab';
import ReportsTab from './tabs/ReportsTab';
import HeroPillsTab from './tabs/HeroPillsTab';
import ContactTab from './tabs/ContactTab';
import PaymentsTab from './tabs/PaymentsTab';
import PricingTab from './tabs/PricingTab';
import DeepSeekUsageTab from './tabs/DeepSeekUsageTab';
import PlansAdminTab from './tabs/PlansAdminTab';
import NewsletterTab from './tabs/NewsletterTab';
import BadWordsTab from './tabs/BadWordsTab';
import InterviewTab from './tabs/InterviewTab';
import CareerPath from './tabs/CareerPathTab';
import CVAdminTab from './tabs/CVAdminTab';

/* ════════════════════════════════════════════════════════════
   NAVIGATION CONFIGURATION
════════════════════════════════════════════════════════════ */
const NAV_GROUPS = [
  {
    key: 'main',
    label: { en: 'Main', ar: 'الرئيسية' },
    items: [
      { id: 'overview', label: { en: 'Overview', ar: 'نظرة عامة' }, icon: 'dashboard' },
      { id: 'reports', label: { en: 'Reports', ar: 'التقارير' }, icon: 'reports' },
    ],
  },
  {
    key: 'api',
    label: { en: 'API & Usage', ar: 'API والاستخدام' },
    items: [
      { id: 'deepseek-usage', label: { en: 'DeepSeek Usage', ar: 'استخدام DeepSeek' }, icon: 'database' },
      { id: 'plans-admin', label: { en: 'Plans & Pricing', ar: 'الخطط والأسعار' }, icon: 'sliders' },
    ],
  },
  {
    key: 'users',
    label: { en: 'Users & Talent', ar: 'المستخدمون' },
    items: [
      { id: 'users', label: { en: 'All Users', ar: 'المستخدمون' }, icon: 'users' },
      { id: 'notifications', label: { en: 'Notifications', ar: 'الإشعارات' }, icon: 'bell' },
      { id: 'waitlist', label: { en: 'Waitlist', ar: 'قائمة الانتظار' }, icon: 'waitlist' },
      { id: 'newsletter', label: { en: 'Newsletter', ar: 'النشرة البريدية' }, icon: 'newsletter' },
    ],
  },
  {
    key: 'companies',
    label: { en: 'Companies & Jobs', ar: 'الشركات والوظائف' },
    items: [
      { id: 'companies', label: { en: 'Companies', ar: 'الشركات' }, icon: 'companies' },
      { id: 'jobs', label: { en: 'Jobs', ar: 'الوظائف' }, icon: 'jobs' },
      { id: 'moderation', label: { en: 'Moderation', ar: 'الإشراف' }, icon: 'moderation' },
    ],
  },
  {
    key: 'revenue',
    label: { en: 'Revenue', ar: 'الإيرادات' },
    items: [
      { id: 'payments', label: { en: 'Payments', ar: 'المدفوعات' }, icon: 'payments' },
      { id: 'wallets', label: { en: 'Wallets', ar: 'المحافظ' }, icon: 'wallet' },
      { id: 'pricing', label: { en: 'Pricing', ar: 'التسعير' }, icon: 'payments' },
    ],
  },
  {
    key: 'content',
    label: { en: 'Content', ar: 'المحتوى' },
    items: [
      { id: 'courses', label: { en: 'Courses', ar: 'الدورات' }, icon: 'courses' },
      { id: 'chatrooms', label: { en: 'Chat Rooms', ar: 'غرف الدردشة' }, icon: 'chat' },
      { id: 'interview', label: { en: 'AI Interview', ar: 'مقابلة تجريبية بالذكاء الاصطناعي' }, icon: 'interview' },
      { id: 'career-path', label: { en: 'Career Path', ar: 'مسار مهني' }, icon: 'path' },
      { id: 'cv-management', label: { en: 'CV Management', ar: 'إدارة السيرة' }, icon: 'file' },
      { id: 'hero-pills', label: { en: 'Hero Pills', ar: 'شعارات الصفحة' }, icon: 'hero' },
    ],
  },
  {
    key: 'support',
    label: { en: 'Support', ar: 'الدعم' },
    items: [
      { id: 'contact', label: { en: 'Contact Messages', ar: 'رسائل التواصل' }, icon: 'contact' },
    ],
  },
  {
    key: 'system',
    label: { en: 'System', ar: 'النظام' },
    items: [
      { id: 'audit', label: { en: 'Audit Log', ar: 'سجل النشاطات' }, icon: 'audit' },
      { id: 'settings', label: { en: 'Settings', ar: 'الإعدادات' }, icon: 'settings' },
    ],
  },
  {
    key: 'moderation',
    label: { en: 'Moderation', ar: 'الإشراف' },
    items: [
      { id: 'bad-words', label: { en: 'Bad Words', ar: 'الكلمات الممنوعة' }, icon: 'ban' },
    ],
  },
];

/* ════════════════════════════════════════════════════════════
   ADMIN LOGIN COMPONENT
════════════════════════════════════════════════════════════ */
function AdminLogin({ onLogin, lang, theme, toggleTheme, toggleLang }) {
  const isAr = lang === 'ar';
  const { login, isLoading } = useAuthStore();
  const [showPass, setShowPass] = useState(false);

  const schema = z.object({
    email: z.string().email(isAr ? 'بريد غير صحيح' : 'Invalid email'),
    password: z.string().min(1, isAr ? 'مطلوب' : 'Required'),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async ({ email, password }) => {
    const response = await login(email, password, true);

    if (response.success) {
      const user = useAuthStore.getState().user;
      if (!['admin', 'support'].includes(user?.role)) {
        setError('email', {
          message: isAr ? 'غير مصرح لك' : 'Access denied — not an admin',
        });
        useAuthStore.getState().logout();
        return;
      }
      onLogin(user);
    } else {
      setError('password', {
        message: response.message || (isAr ? 'بيانات خاطئة' : 'Invalid credentials'),
      });
    }
  };

  return (
    <>
      <AdminStyles />
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        background: 'var(--bg-primary)',
        fontFamily: isAr ? 'var(--font-ar)' : 'var(--font-en)',
        direction: isAr ? 'rtl' : 'ltr',
      }}>
        {/* Top Bar */}
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: 52,
          background: 'var(--bg-primary)',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          padding: '0 20px',
          gap: 8,
          zIndex: 100,
        }}>
          <button
            onClick={toggleTheme}
            style={{ ...C.btn, ...C.btnGhost, padding: '6px 10px' }}
            aria-label="Toggle theme"
          >
            <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={14} />
          </button>
          <button
            onClick={toggleLang}
            style={{ ...C.btn, ...C.btnGhost, padding: '6px 12px', fontSize: 12, fontWeight: 600 }}
          >
            {lang === 'ar' ? 'EN' : 'ع'}
          </button>
        </div>

        {/* Login Card */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '52px 20px 20px',
        }}>
          <div style={{ width: '100%', maxWidth: 400 }}>
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <Link to="/" style={{ textDecoration: 'none', display: 'inline-block', marginBottom: 16 }}>
                <img
                  src={LogoGold}
                  alt="TalexHub"
                  style={{ height: 36, width: 'auto', objectFit: 'contain', display: 'block', margin: '0 auto' }}
                />
              </Link>
              <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                {isAr ? 'بوابة الإدارة' : 'Admin Portal'}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
                {isAr ? 'مركز التحكم الكامل' : 'Full Control Center'}
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Email Field */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: 11,
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  marginBottom: 5,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}>
                  {isAr ? 'البريد الإلكتروني' : 'Email'}
                </label>
                <div
                  style={{
                    background: 'var(--bg-secondary)',
                    border: `1.5px solid ${errors.email ? 'var(--danger)' : 'var(--border)'}`,
                    borderRadius: 10,
                    overflow: 'hidden',
                  }}
                >
                  <span style={{
                    display: 'block',
                    fontSize: 10.5,
                    fontWeight: 600,
                    color: 'var(--text-secondary)',
                    padding: '8px 14px 2px',
                  }}>
                    {isAr ? 'البريد الإلكتروني' : 'Email Address'}
                  </span>
                  <input
                    {...register('email')}
                    type="email"
                    dir="ltr"
                    placeholder="admin@TalexHub.com"
                    autoComplete="email"
                    style={{
                      display: 'block',
                      width: '100%',
                      padding: '2px 14px 9px',
                      background: 'transparent',
                      border: 'none',
                      outline: 'none',
                      fontSize: 13.5,
                      color: 'var(--text-primary)',
                      fontFamily: 'inherit',
                    }}
                  />
                </div>
                {errors.email && (
                  <p style={{ fontSize: 12, color: 'var(--danger)', marginTop: 4 }}>
                    ⚠ {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: 11,
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  marginBottom: 5,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}>
                  {isAr ? 'كلمة المرور' : 'Password'}
                </label>
                <div
                  style={{
                    background: 'var(--bg-secondary)',
                    border: `1.5px solid ${errors.password ? 'var(--danger)' : 'var(--border)'}`,
                    borderRadius: 10,
                    overflow: 'hidden',
                    position: 'relative',
                  }}
                >
                  <span style={{
                    display: 'block',
                    fontSize: 10.5,
                    fontWeight: 600,
                    color: 'var(--text-secondary)',
                    padding: '8px 14px 2px',
                  }}>
                    {isAr ? 'كلمة المرور' : 'Password'}
                  </span>
                  <input
                    {...register('password')}
                    type={showPass ? 'text' : 'password'}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    style={{
                      display: 'block',
                      width: '100%',
                      padding: '2px 44px 9px 14px',
                      background: 'transparent',
                      border: 'none',
                      outline: 'none',
                      fontSize: 13.5,
                      color: 'var(--text-primary)',
                      fontFamily: 'inherit',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(prev => !prev)}
                    aria-label={showPass ? 'Hide password' : 'Show password'}
                    style={{
                      position: 'absolute',
                      top: '50%',
                      right: 12,
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--text-secondary)',
                      padding: 0,
                      display: 'flex',
                    }}
                  >
                    {showPass ? <HiOutlineEye size={16} /> : <HiOutlineEyeOff size={16} />}
                  </button>
                </div>
                {errors.password && (
                  <p style={{ fontSize: 12, color: 'var(--danger)', marginTop: 4 }}>
                    ⚠ {errors.password.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                style={{
                  ...C.btn,
                  ...C.btnPrimary,
                  width: '100%',
                  justifyContent: 'center',
                  padding: '13px',
                  fontSize: 14,
                  marginTop: 4,
                  opacity: isLoading ? 0.7 : 1,
                }}
              >
                {isLoading ? (
                  <>
                    <Spinner size={14} />
                    {isAr ? 'جاري الدخول...' : 'Signing in...'}
                  </>
                ) : (
                  isAr ? 'دخول لوحة التحكم' : 'Sign In to Admin'
                )}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: 20 }}>
              <Link to="/" style={{ fontSize: 13, color: 'var(--text-secondary)', textDecoration: 'none' }}>
                ← {isAr ? 'العودة للموقع' : 'Back to site'}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ════════════════════════════════════════════════════════════
   SIDEBAR COMPONENT
════════════════════════════════════════════════════════════ */
function Sidebar({ collapsed, user, activeTab, setActiveTab, handleLogout, isAr, isRtl, lang, onMobileClose }) {
  const [openGroups, setOpenGroups] = useState(() =>
    NAV_GROUPS.reduce((acc, group) => ({ ...acc, [group.key]: true }), {})
  );

  const toggleGroup = useCallback((key) => {
    setOpenGroups(prev => ({ ...prev, [key]: !prev[key] }));
  }, []);

  useEffect(() => {
    const group = NAV_GROUPS.find(g => g.items.some(item => item.id === activeTab));
    if (group) {
      setOpenGroups(prev => ({ ...prev, [group.key]: true }));
    }
  }, [activeTab]);

  const handleTabClick = useCallback((tabId) => {
    setActiveTab(tabId);
    onMobileClose?.();
  }, [setActiveTab, onMobileClose]);

  return (
    <div style={{
      width: '100%',
      height: '100%',
      background: 'var(--bg-primary)',
      display: 'flex',
      flexDirection: 'column',
      overflowY: 'auto',
      overflowX: 'hidden',
    }}>
      {/* Logo */}
      <div style={{
        padding: collapsed ? '14px 0' : '14px 16px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'flex-start',
        gap: 10,
        minHeight: 58,
      }}>
        {collapsed ? (
          <img src={LogoIcon} alt="T" style={{ width: 32, height: 32, objectFit: 'contain', flexShrink: 0 }} />
        ) : (
          <img src={LogoGold} alt="TalexHub" style={{ height: 34, objectFit: 'contain', flexShrink: 0 }} />
        )}
      </div>

      {/* Navigation */}
      <nav style={{
        flex: 1,
        padding: '6px 6px 10px',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
        gap: 2,
      }}>
        {NAV_GROUPS.map(group => {
          const isGroupOpen = openGroups[group.key];
          const hasActive = group.items.some(item => item.id === activeTab);

          return (
            <div key={group.key}>
              {!collapsed && (
                <button
                  onClick={() => toggleGroup(group.key)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '7px 10px 4px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: hasActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                    fontSize: 10,
                    fontWeight: 700,
                    fontFamily: 'inherit',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    transition: 'color 0.15s',
                    marginTop: 8,
                  }}
                >
                  <span>{group.label[lang]}</span>
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 10 10"
                    fill="none"
                    style={{
                      transform: isGroupOpen ? 'rotate(0deg)' : 'rotate(-90deg)',
                      transition: 'transform 0.2s',
                      flexShrink: 0,
                    }}
                  >
                    <path d="M2 4l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              )}

              {(collapsed || isGroupOpen) && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 1, paddingTop: collapsed ? 0 : 2 }}>
                  {group.items.map(tab => {
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => handleTabClick(tab.id)}
                        title={collapsed ? tab.label[lang] : undefined}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 9,
                          padding: collapsed ? '9px' : '8px 10px 8px 14px',
                          justifyContent: collapsed ? 'center' : 'flex-start',
                          borderRadius: 9,
                          border: 'none',
                          cursor: 'pointer',
                          width: '100%',
                          background: isActive ? 'var(--bg-secondary)' : 'transparent',
                          color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                          fontWeight: isActive ? 600 : 400,
                          fontSize: 13,
                          fontFamily: 'inherit',
                          transition: 'all 0.12s',
                          borderLeft: !isRtl && isActive ? '2px solid var(--text-primary)' : !isRtl ? '2px solid transparent' : undefined,
                          borderRight: isRtl && isActive ? '2px solid var(--text-primary)' : isRtl ? '2px solid transparent' : undefined,
                          position: 'relative',
                        }}
                      >
                        <Icon name={tab.icon} size={15} color={isActive ? 'var(--text-primary)' : 'var(--text-secondary)'} />
                        {!collapsed && (
                          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: 13 }}>
                            {tab.label[lang]}
                          </span>
                        )}
                        {collapsed && isActive && (
                          <div style={{
                            position: 'absolute',
                            top: 6,
                            right: 6,
                            width: 5,
                            height: 5,
                            borderRadius: '50%',
                            background: 'var(--text-primary)',
                          }} />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {collapsed && (
                <div style={{ height: 1, background: 'var(--border)', margin: '4px 8px', opacity: 0.5 }} />
              )}
            </div>
          );
        })}
      </nav>

      {/* User & Logout */}
      <div style={{ padding: '8px 6px', borderTop: '1px solid var(--border)' }}>
        {!collapsed && (
          <div style={{
            padding: '8px 10px',
            marginBottom: 4,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: 'var(--bg-secondary)',
            borderRadius: 8,
          }}>
            <Avatar name={user.fullName} src={user.avatarUrl} size={28} />
            <div style={{ overflow: 'hidden', flex: 1 }}>
              <div style={{
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--text-primary)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}>
                {user.fullName}
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
                {user.role}
              </div>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: collapsed ? '9px' : '9px 12px',
            justifyContent: collapsed ? 'center' : 'flex-start',
            borderRadius: 8,
            border: 'none',
            cursor: 'pointer',
            background: 'transparent',
            color: 'var(--danger)',
            fontSize: 13,
            fontFamily: 'inherit',
            width: '100%',
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.06)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <Icon name="logout" size={15} color="var(--danger)" />
          {!collapsed && (isAr ? 'تسجيل الخروج' : 'Sign Out')}
        </button>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   MAIN ADMIN DASHBOARD
════════════════════════════════════════════════════════════ */
export default function AdminDashboard() {
  // ─── Stores ──────────────────────────────────────────────
  const { theme, toggleTheme } = useThemeStore();
  const { lang, toggleLang, dir } = useLangStore();
  const { logout: authLogout, user: storeUser, isLoading } = useAuthStore();

  // ─── Derived Values ─────────────────────────────────────
  const isAr = lang === 'ar';
  const isRtl = dir === 'rtl';

  // ─── State ──────────────────────────────────────────────
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // ─── Effects ─────────────────────────────────────────────
  useEffect(() => {
    if (storeUser && ['admin', 'support'].includes(storeUser.role)) {
      setUser(storeUser);
    }
  }, [storeUser]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) setMobileOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleNav = (event) => {
      if (event.detail?.tab) {
        setActiveTab(event.detail.tab);
      }
    };
    window.addEventListener('admin-nav', handleNav);
    return () => window.removeEventListener('admin-nav', handleNav);
  }, []);

  // ─── Callbacks ──────────────────────────────────────────
  const handleLogout = useCallback(async () => {
    await authLogout();
    setUser(null);
  }, [authLogout]);

  const handleBurger = useCallback(() => {
    if (window.innerWidth <= 768) {
      setMobileOpen(prev => !prev);
    } else {
      setCollapsed(prev => !prev);
    }
  }, []);

  const handleTabChange = useCallback((tabId) => {
    setActiveTab(tabId);
    setMobileOpen(false);
  }, []);

  const renderTab = useCallback(() => {
    const props = { lang };
    switch (activeTab) {
      case 'overview': return <OverviewTab {...props} />;
      case 'users': return <UsersTab {...props} />;
      case 'companies': return <CompaniesTab {...props} />;
      case 'jobs': return <JobsTab {...props} />;
      case 'courses': return <CoursesTab {...props} />;
      case 'chatrooms': return <ChatRoomsTab {...props} />;
      case 'wallets': return <WalletsTab {...props} />;
      case 'moderation': return <ModerationTab {...props} />;
      case 'notifications': return <NotificationsTab {...props} />;
      case 'waitlist': return <WaitlistTab {...props} />;
      case 'newsletter': return <NewsletterTab {...props} />;
      case 'audit': return <AuditTab {...props} />;
      case 'settings': return <SettingsTab {...props} />;
      case 'reports': return <ReportsTab {...props} />;
      case 'hero-pills': return <HeroPillsTab {...props} />;
      case 'contact': return <ContactTab {...props} />;
      case 'payments': return <PaymentsTab {...props} />;
      case 'pricing': return <PricingTab {...props} />;
      case 'deepseek-usage': return <DeepSeekUsageTab {...props} />;
      case 'plans-admin': return <PlansAdminTab {...props} />;
      case 'bad-words': return <BadWordsTab {...props} />;
      case 'interview': return <InterviewTab {...props} />;
      case 'career-path': return <CareerPath {...props} />;
      case 'cv-management': return <CVAdminTab {...props} />;
      default: return <OverviewTab {...props} />;
    }
  }, [activeTab, lang]);

  // ─── Early Returns ──────────────────────────────────────
  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!user) {
    return (
      <AdminLogin
        onLogin={setUser}
        lang={lang}
        theme={theme}
        toggleTheme={toggleTheme}
        toggleLang={toggleLang}
      />
    );
  }

  // ─── Render ─────────────────────────────────────────────
  const activeConfig = TABS_CONFIG.find(tab => tab.id === activeTab);
  const sidebarProps = {
    user,
    activeTab,
    setActiveTab: handleTabChange,
    handleLogout,
    isAr,
    isRtl,
    lang,
  };

  return (
    <>
      <AdminStyles />
      <style>
        {`
          .ad-sidebar-desktop { display: flex !important; }
          @media (max-width: 768px) {
            .ad-sidebar-desktop { display: none !important; }
          }
        `}
      </style>

      <div style={{
        display: 'flex',
        minHeight: '100vh',
        background: 'var(--bg-secondary)',
        fontFamily: isAr ? 'var(--font-ar)' : 'var(--font-en)',
        direction: isRtl ? 'rtl' : 'ltr',
      }}>
        {/* Desktop Sidebar */}
        <aside
          className="ad-sidebar-desktop"
          style={{
            width: collapsed ? 60 : 220,
            minHeight: '100vh',
            borderRight: isRtl ? 'none' : '1px solid var(--border)',
            borderLeft: isRtl ? '1px solid var(--border)' : 'none',
            flexShrink: 0,
            position: 'sticky',
            top: 0,
            height: '100vh',
            transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            zIndex: 40,
          }}
        >
          <Sidebar {...sidebarProps} collapsed={collapsed} />
        </aside>

        {/* Mobile Drawer */}
        {mobileOpen && (
          <>
            <div
              onClick={() => setMobileOpen(false)}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0, 0, 0, 0.45)',
                zIndex: 200,
                backdropFilter: 'blur(2px)',
              }}
            />
            <div style={{
              position: 'fixed',
              top: 0,
              bottom: 0,
              [isRtl ? 'right' : 'left']: 0,
              width: 240,
              zIndex: 201,
              boxShadow: '4px 0 32px rgba(0, 0, 0, 0.25)',
              animation: 'adSlideIn 0.22s ease',
            }}>
              <style>
                {`
                  @keyframes adSlideIn {
                    from { transform: translateX(${isRtl ? '100%' : '-100%'}); }
                    to { transform: translateX(0); }
                  }
                `}
              </style>
              <Sidebar
                {...sidebarProps}
                collapsed={false}
                onMobileClose={() => setMobileOpen(false)}
              />
            </div>
          </>
        )}

        {/* Main Content */}
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          {/* Header */}
          <header style={{
            height: 56,
            background: 'var(--bg-primary)',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 18px',
            gap: 12,
            position: 'sticky',
            top: 0,
            zIndex: 30,
            flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button
                onClick={handleBurger}
                style={{ ...C.btn, ...C.btnGhost, padding: '7px 9px' }}
                aria-label="Toggle sidebar"
              >
                <Icon name="menu" size={15} />
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {activeConfig && <Icon name={activeConfig.icon} size={15} color="var(--text-secondary)" />}
                <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                  {activeConfig?.label[lang] || ''}
                </h2>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button
                onClick={toggleTheme}
                style={{ ...C.btn, ...C.btnGhost, padding: '7px 9px' }}
                aria-label="Toggle theme"
              >
                <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={14} />
              </button>
              <button
                onClick={toggleLang}
                style={{ ...C.btn, ...C.btnGhost, padding: '7px 12px', fontSize: 12, fontWeight: 700 }}
              >
                {lang === 'ar' ? 'EN' : 'AR'}
              </button>
            </div>
          </header>

          {/* Page Content */}
          <div style={{
            flex: 1,
            padding: '22px 20px',
            maxWidth: 1400,
            width: '100%',
            margin: '0 auto',
            boxSizing: 'border-box',
          }}>
            <AdminErrorBoundary>
              {renderTab()}
            </AdminErrorBoundary>
          </div>
        </main>
      </div>
    </>
  );
}