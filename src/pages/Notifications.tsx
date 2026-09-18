import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/appStore';
import { Bell, CheckCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Notifications() {
  const { notifications, markNotificationAsRead } = useAppStore();
  const navigate = useNavigate();

  return (
    <div className="p-6 md:p-10 w-full h-full flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[1.375rem] font-semibold font-['Poppins'] text-[#0D212C]">Notifications</h1>
          <p className="text-gray-500 text-[0.875rem] mt-0.5">Stay updated with your latest reports and activities.</p>
        </div>
        <div className="text-[0.8125rem] font-medium bg-[#36c0c9]/10 text-[#0E7C86] px-3.5 py-1.5 rounded-full">
          {notifications.filter(n => !n.read).length} Unread
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="overflow-y-auto flex-1 custom-scrollbar py-2">
          {notifications.length === 0 ? (
            <div className="h-64 bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col items-center justify-center text-gray-400 p-10">
              <Bell className="w-12 h-12 mb-3 opacity-20" />
              <p className="text-[1rem] font-medium text-gray-500">No notifications yet</p>
              <p className="text-[0.8125rem] mt-1.5">When your reports are generated, they will appear here.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {notifications.map((notif, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  key={notif.id}
                  onClick={() => {
                    markNotificationAsRead(notif.id);
                    if (notif.threadId) {
                      navigate(`/report/${notif.threadId}`);
                    }
                  }}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex gap-3.5 ${
                    notif.read 
                      ? 'bg-white border-gray-100 hover:border-gray-200 hover:shadow-sm' 
                      : 'bg-[#36c0c9]/5 border-[#36c0c9]/20 shadow-sm hover:shadow-md'
                  }`}
                >
                  <div className={`w-2 h-2 mt-2 rounded-full shrink-0 ${notif.read ? 'bg-gray-300' : 'bg-[#36c0c9] shadow-[0_0_8px_rgba(54,192,201,0.5)]'}`} />
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <h4 className="text-[0.9375rem] font-semibold text-gray-900 mb-0.5">{notif.title}</h4>
                      <span className="text-[0.75rem] font-medium text-gray-400 flex items-center gap-1.5 shrink-0 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">
                        <Clock className="w-3 h-3" />
                        {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-[0.8125rem] text-gray-600 leading-relaxed mt-0.5">{notif.message}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
