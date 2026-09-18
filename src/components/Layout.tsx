import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAppStore } from '../store/appStore';
import { Home, FileText, LogOut, Search, PanelLeftClose, PanelRightClose, Menu, MessageSquare, Pin, MoreVertical, AlertTriangle, Plus, Trash2, X, CheckCircle, Bell, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { notificationService } from '../services/notificationService';

// Custom hook for clicking outside dropdowns
function useOnClickOutside(ref: React.RefObject<any>, handler: (event: MouseEvent | TouchEvent) => void) {
  React.useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handler(event);
    };
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
}

export default function Layout() {
  const { user, logout, threads, updateThread, deleteThread, loadThreads, searchQuery, setSearchQuery, notifications, markNotificationAsRead } = useAppStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [threadToDelete, setThreadToDelete] = useState<{id: string, title: string} | null>(null);
  const [threadToRename, setThreadToRename] = useState<{id: string, title: string} | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const menuRef = React.useRef<HTMLDivElement>(null);

  useOnClickOutside(menuRef, () => setActiveMenuId(null));
  
  // Clear search query on route change
  useEffect(() => {
    setSearchQuery('');
  }, [location.pathname, setSearchQuery]);

  const [toasts, setToasts] = useState<{id: string, message: string, type: string}[]>([]);

  useEffect(() => {
    const handleNotify = (e: Event) => {
      const customEvent = e as CustomEvent;
      const newToast = { id: Date.now().toString() + Math.random(), ...customEvent.detail };
      setToasts(prev => [...prev, newToast]);
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== newToast.id));
      }, 3000);
    };
    window.addEventListener('m42-notify', handleNotify);
    return () => window.removeEventListener('m42-notify', handleNotify);
  }, []);

  const filteredThreads = threads.filter(t => (t.title || 'Untitled Report').toLowerCase().includes(searchQuery.toLowerCase()));
  const pinnedThreads = filteredThreads.filter(t => t.isPinned);
  const recentThreads = filteredThreads.filter(t => !t.isPinned).slice(0, 10);

  const togglePin = async (e: React.MouseEvent, thread: any) => {
    e.preventDefault();
    e.stopPropagation();
    await updateThread({ ...thread, isPinned: !thread.isPinned });
    setActiveMenuId(null);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleDownload = (thread: any) => {
    const latestVersion = thread.versions[thread.versions.length - 1];
    const sections = latestVersion.content?.sections || latestVersion.content || [];
    
    // Minimal HTML structure containing only the text paragraphs
    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'><title>${thread.title || 'Report'}</title></head>
      <body>
        ${sections.map((s: any) => `
          <h2>${s.title}</h2>
          ${s.blocks ? s.blocks.map((b: any) => {
            if (b.type === 'text') return b.data.paragraphs.map((p: string) => `<p>${p}</p>`).join('');
            if (b.type === 'quote') return `<blockquote>${b.data.quote}</blockquote>`;
            return '';
          }).join('') : s.content}
        `).join('')}
      </body>
      </html>
    `;
    const blob = new Blob(['\ufeff', htmlContent], {
      type: 'application/msword'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${thread.title || 'Report'}_v${latestVersion.versionNumber}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    notificationService.notify("Chat downloaded", "success");
  };

  const navItems = [
    { id: 'new', label: 'New Report', path: '/new', icon: Plus },
    { id: 'reports', label: 'All Reports', path: '/reports', icon: FileText },
  ];

  // Determine title based on route
  const getPageTitle = () => {
    if (location.pathname === '/new/tech') return 'Generate New Report';
    if (location.pathname.includes('/new')) return 'New Report';
    if (location.pathname.includes('/reports')) return 'All Reports';
    if (location.pathname.includes('/report/')) return 'Report Preview';
    if (location.pathname.includes('/notifications')) return 'Notifications';
    return 'Dashboard';
  };

  return (
    <div className="flex h-screen bg-[#F6F7FB] text-[#0D212C] font-sans">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 bg-black/30 z-40 md:hidden"
          />
        )}
        
        {/* Logout Confirmation Modal */}
        {showLogoutConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden text-center flex flex-col items-center border border-gray-100 relative"
            >
              <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-gray-50 to-white -z-10" />
              <div className="p-8 flex flex-col items-center z-10 w-full">
                <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-4 border border-red-100 shadow-sm text-red-500">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <h3 className="text-[1.125rem] font-semibold text-[#0D212C] mb-2 font-['Poppins'] tracking-tight">Confirm Logout</h3>
                <p className="text-[0.8125rem] text-gray-500 mb-6 leading-relaxed px-4">Are you sure you want to log out of your account? You will need to sign in again to access your reports.</p>
                <div className="flex gap-3 w-full">
                  <button 
                    onClick={handleLogout}
                    className="flex-1 px-4 py-2 text-[0.8125rem] font-medium text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors shadow-sm"
                  >
                    Yes, log out
                  </button>
                  <button 
                    onClick={() => setShowLogoutConfirm(false)}
                    className="flex-1 px-4 py-2 text-[0.8125rem] font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ 
          width: collapsed ? 80 : 260,
          x: mobileOpen ? 0 : (window.innerWidth < 768 ? -260 : 0)
        }}
        transition={{ ease: "easeInOut", duration: 0.2 }}
        className="fixed md:relative z-50 h-full bg-[#0D212C] flex flex-col shadow-lg"
      >
        <div className="p-5 flex items-center justify-between h-20 shrink-0">
          {!collapsed && (
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3 overflow-hidden whitespace-nowrap">
                <img src="/logo.png" alt="M42 Logo" className="h-6 object-contain shrink-0" />
                <div className="flex flex-col">
                   <span className="font-medium text-[0.8125rem] text-white leading-tight font-['Poppins']">News & Trends</span>
                   <span className="font-medium text-[0.8125rem] text-white leading-tight font-['Poppins']">Agent</span>
                </div>
              </div>
              <button onClick={() => setCollapsed(true)} className="text-white/50 hover:text-white transition-colors">
                <PanelLeftClose className="w-5 h-5" />
              </button>
            </div>
          )}
          {collapsed && (
            <div 
              className="w-full flex flex-col items-center gap-4 group cursor-pointer" 
              onClick={() => setCollapsed(false)}
            >
              <div className="relative w-[24px] h-[24px] flex items-center justify-center">
                <img src="/logo.png" alt="M42 Logo" className="absolute inset-0 h-5 w-auto object-contain transition-opacity group-hover:opacity-0 mx-auto" />
                <PanelRightClose className="absolute inset-0 w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity mx-auto mt-0.5" />
              </div>
            </div>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto py-4 flex flex-col gap-2 px-4">
          {navItems.map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                  isActive
                    ? 'bg-[#153443] text-white font-normal'
                    : 'text-[#FFFFFF94] hover:bg-white/5'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-[#FFFFFF94]'}`} />
                  {!collapsed && <span className="text-[0.875rem]">{item.label}</span>}
                </>
              )}
            </NavLink>
          ))}

          {!collapsed && (
            <div className="mt-6 flex flex-col gap-6">
              {/* Pinned Chats */}
              {pinnedThreads.length > 0 && (
                <div>
                  <div className="px-4 text-[0.6875rem] font-semibold text-white uppercase tracking-wider mb-2">Pinned</div>
                  <div className="flex flex-col gap-0.5">
                    {pinnedThreads.map(thread => (
                      <div 
                        key={thread.id} 
                        onClick={() => navigate(`/report/${thread.id}`)}
                        className={`group flex items-center px-4 py-2 rounded-lg cursor-pointer transition-colors relative overflow-visible ${
                          location.pathname === `/report/${thread.id}` ? 'bg-[#153443]' : 'hover:bg-white/5'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 overflow-hidden w-full pr-0 group-hover:pr-6 transition-all duration-200">
                          <Pin className="w-3.5 h-3.5 text-white/40 shrink-0 fill-current" />
                          <span className={`text-[0.8125rem] truncate ${location.pathname === `/report/${thread.id}` ? 'text-white' : 'text-white/70'}`}>
                            {thread.title || 'Untitled Report'}
                          </span>
                        </div>
                        <div className={`absolute right-2 ${activeMenuId === thread.id ? 'opacity-100 z-50' : 'opacity-0 group-hover:opacity-100 z-10'} transition-opacity`} ref={activeMenuId === thread.id ? menuRef : null}>
                          <button 
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActiveMenuId(activeMenuId === thread.id ? null : thread.id); }}
                            className="text-white/40 hover:text-white transition-opacity p-1 bg-[#153443]/80 rounded-md"
                          >
                            <MoreVertical className="w-3.5 h-3.5" />
                          </button>
                          {activeMenuId === thread.id && (
                            <div className="absolute left-0 md:left-auto md:right-0 top-full mt-1 w-32 bg-[#153443] border border-white/10 rounded-md shadow-xl py-1 z-50">
                              <button onClick={(e) => { togglePin(e, thread); notificationService.notify("Chat unpinned", "success"); }} className="w-full text-left px-3 py-1.5 text-[0.75rem] text-white hover:bg-white/10 transition-colors">Unpin</button>
                                <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActiveMenuId(null); setThreadToRename({id: thread.id, title: thread.title}); setRenameValue(thread.title); }} className="w-full text-left px-3 py-1.5 text-[0.75rem] text-white hover:bg-white/10 transition-colors">Rename</button>
                                <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActiveMenuId(null); handleDownload(thread); }} className="w-full text-left px-3 py-1.5 text-[0.75rem] text-white hover:bg-white/10 transition-colors">Download</button>
                                <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActiveMenuId(null); setThreadToDelete({id: thread.id, title: thread.title}); }} className="w-full text-left px-3 py-1.5 text-[0.75rem] text-red-400 hover:bg-white/10 transition-colors">Delete</button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Chats */}
              {recentThreads.length > 0 && (
                <div>
                  <div className="px-4 text-[0.6875rem] font-semibold text-white uppercase tracking-wider mb-2">Recent ({recentThreads.length})</div>
                  <div className="flex flex-col gap-0.5">
                    {recentThreads.map(thread => (
                      <div 
                        key={thread.id} 
                        onClick={() => navigate(`/report/${thread.id}`)}
                        className={`group flex items-center px-4 py-2 rounded-lg cursor-pointer transition-colors relative overflow-visible ${
                          location.pathname === `/report/${thread.id}` ? 'bg-[#153443]' : 'hover:bg-white/5'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 overflow-hidden w-full pr-0 group-hover:pr-6 transition-all duration-200">
                          <MessageSquare className="w-3.5 h-3.5 text-white/40 shrink-0" />
                          <span className={`text-[0.8125rem] truncate ${location.pathname === `/report/${thread.id}` ? 'text-white' : 'text-white/70'}`}>
                            {thread.title || 'Untitled Report'}
                          </span>
                        </div>
                        <div className={`absolute right-2 ${activeMenuId === thread.id ? 'opacity-100 z-50' : 'opacity-0 group-hover:opacity-100 z-10'} transition-opacity`} ref={activeMenuId === thread.id ? menuRef : null}>
                          <button 
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActiveMenuId(activeMenuId === thread.id ? null : thread.id); }}
                            className="text-white/40 hover:text-white transition-opacity p-1 bg-[#153443]/80 rounded-md"
                          >
                            <MoreVertical className="w-3.5 h-3.5" />
                          </button>
                          {activeMenuId === thread.id && (
                            <div className="absolute left-0 md:left-auto md:right-0 top-full mt-1 w-32 bg-[#153443] border border-white/10 rounded-md shadow-xl py-1 z-50">
                              <button onClick={(e) => { togglePin(e, thread); notificationService.notify("Chat pinned", "success"); }} className="w-full text-left px-3 py-1.5 text-[0.75rem] text-white hover:bg-white/10 transition-colors">Pin</button>
                              <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActiveMenuId(null); setThreadToRename({id: thread.id, title: thread.title}); setRenameValue(thread.title); }} className="w-full text-left px-3 py-1.5 text-[0.75rem] text-white hover:bg-white/10 transition-colors">Rename</button>
                              <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActiveMenuId(null); handleDownload(thread); }} className="w-full text-left px-3 py-1.5 text-[0.75rem] text-white hover:bg-white/10 transition-colors">Download</button>
                              <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActiveMenuId(null); setThreadToDelete({id: thread.id, title: thread.title}); }} className="w-full text-left px-3 py-1.5 text-[0.75rem] text-red-400 hover:bg-white/10 transition-colors">Delete</button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </nav>

        {/* Profile Details at bottom with 20px padding */}
        <div className="pb-[20px] px-4 border-t border-white/10 pt-4 mt-auto">
          <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} gap-3 p-2 rounded-xl relative`}>
            <div className="w-8 h-8 rounded-full bg-[#36c0c9] text-[#0D212C] flex items-center justify-center font-semibold text-[0.8125rem] shrink-0">
              {user?.name.split(' ').map(n => n[0]).join('').substring(0, 2) || 'AJ'}
            </div>
            {!collapsed && (
              <div className="flex-1 flex justify-between items-center overflow-hidden">
                <div className="flex flex-col truncate pr-2">
                  <span className="text-[0.875rem] font-medium text-white truncate">{user?.name || 'Ashika Jain'}</span>
                  <span className="text-[0.75rem] text-[#FFFFFF94] truncate">{user?.role === 'strategy' ? 'Strategy User' : 'General User'}</span>
                </div>
                <button onClick={() => setShowLogoutConfirm(true)} className="text-[#FFFFFF94] hover:text-white transition-colors" title="Log out">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
            {collapsed && (
              <button onClick={() => setShowLogoutConfirm(true)} className="text-[#FFFFFF94] hover:text-white transition-colors absolute inset-0 flex items-center justify-center bg-[#0D212C] rounded-xl opacity-0 hover:opacity-100" title="Log out">
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#F6F7FB]">
        {/* Topbar */}
        <header className="h-16 flex items-center justify-between px-6 md:px-10 shrink-0 z-30 bg-white border-b border-gray-200">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-2 -ml-2 text-gray-500 hover:text-gray-900 rounded-md hover:bg-gray-100 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            {location.pathname.includes('/notifications') && (
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="p-1.5 -ml-1 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer flex items-center justify-center"
                title="Go back"
                aria-label="Go back"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <h1 className="text-[1.125rem] font-semibold font-['Poppins'] text-[#0D212C] hidden md:block">
              {getPageTitle()}
            </h1>
          </div>
          
          <div className="flex items-center gap-6">
            {!location.pathname.startsWith('/new') && location.pathname !== '/' && !location.pathname.includes('/notifications') && !location.pathname.includes('/reports') && (
              <div className="relative hidden md:block w-80">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search reports, topics, or keywords..." 
                  className="w-full bg-white border border-gray-200 rounded-lg pl-9 pr-4 py-2 text-[0.8125rem] focus:outline-none focus:border-[#36c0c9] transition-colors placeholder-gray-400 text-gray-700 shadow-sm" 
                />
              </div>
            )}

            <div className="relative">
              <button 
                onClick={() => navigate('/notifications')}
                className="p-2 text-gray-500 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors relative"
              >
                <Bell className="w-5 h-5" />
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
                )}
              </button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto bg-[#F6F7FB] relative">
          <div className="h-full">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Rename Modal */}
      {threadToRename && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0D212C]/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl border border-gray-100">
            <h3 className="text-[1.125rem] font-semibold font-['Poppins'] text-[#0D212C] mb-4">Rename Chat</h3>
            <input 
              type="text" 
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              className="w-full px-4 py-2 mb-6 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#36c0c9]/20 focus:border-[#36c0c9] text-[0.875rem]"
              placeholder="Enter new name"
              autoFocus
            />
            <div className="flex gap-3 w-full">
              <button 
                onClick={() => {
                  setThreadToRename(null);
                  setRenameValue('');
                }}
                className="flex-1 px-4 py-2 rounded-xl text-[0.875rem] font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  if (renameValue.trim()) {
                    const thread = threads.find(t => t.id === threadToRename.id);
                    if (thread) {
                      updateThread({ ...thread, title: renameValue.trim() });
                      notificationService.notify("Chat renamed", "success");
                    }
                  }
                  setThreadToRename(null);
                }}
                disabled={!renameValue.trim()}
                className="flex-1 px-4 py-2 rounded-xl text-[0.875rem] font-medium text-white bg-[#36c0c9] hover:bg-[#2ea3aa] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {threadToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0D212C]/40 backdrop-blur-sm">
           <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl text-center flex flex-col items-center border border-gray-100">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-4 border border-red-100 shadow-sm text-red-500">
               <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-[1.125rem] font-semibold text-[#0D212C] mb-2 font-['Poppins'] tracking-tight">Delete Chat</h3>
            <p className="text-gray-500 mb-6 text-[0.8125rem] leading-relaxed px-4">
              Are you sure you want to delete this chat? This cannot be undone.
            </p>
            <div className="flex gap-3 w-full">
              <button 
                onClick={() => {
                  deleteThread(threadToDelete.id);
                  setThreadToDelete(null);
                  notificationService.notify("Chat deleted", "success");
                  if (location.pathname === `/report/${threadToDelete.id}`) {
                    navigate('/');
                  }
                }}
                className="flex-1 px-4 py-2 text-[0.8125rem] font-medium text-white bg-red-500 hover:bg-red-600 transition-colors rounded-xl shadow-sm"
              >
                Delete
              </button>
              <button 
                onClick={() => setThreadToDelete(null)}
                className="flex-1 px-4 py-2 text-[0.8125rem] font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors rounded-xl"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toasts */}
      <div className="fixed top-6 right-4 z-[200] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white text-gray-800 px-4 py-3 rounded-lg shadow-xl border border-gray-100 flex items-center gap-3 text-[0.8125rem] font-medium min-w-[250px] pointer-events-auto"
            >
              {toast.type === 'success' && <CheckCircle className="w-4 h-4 text-emerald-400" />}
              {toast.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}