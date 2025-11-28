import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../config/supabase';
import { FaBell } from 'react-icons/fa';

export default function NotificationBell() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showPanel, setShowPanel] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchNotifications();

      const channel = supabase
        .channel('notifications')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            setNotifications((prev) => [payload.new, ...prev]);
            setUnreadCount((prev) => prev + 1);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const fetchNotifications = async () => {
    if (!user) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);

    if (!error && data) {
      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.read).length);
    }
    setLoading(false);
  };

  const markAsRead = async (notificationId) => {
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);

    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const markAllAsRead = async () => {
    if (!user) return;

    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', user.id)
      .eq('read', false);

    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const deleteNotification = async (notificationId) => {
    await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);

    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
  };

  if (!user) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="relative p-2 text-white hover:text-[#ffbade] transition"
      >
        <FaBell className="text-2xl" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {showPanel && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowPanel(false)}
          />
          <div className="absolute right-0 mt-2 w-96 max-h-[500px] bg-[#1a1a2e] rounded-lg shadow-lg z-50 border border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-700 flex justify-between items-center">
              <h3 className="text-white font-bold text-lg">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-blue-500 text-sm hover:text-blue-400"
                >
                  Mark all read
                </button>
              )}
            </div>

            <div className="overflow-y-auto max-h-[400px]">
              {loading ? (
                <div className="p-4 text-center text-gray-400">Loading...</div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                  No notifications yet
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-4 border-b border-gray-700 hover:bg-[#16213e] transition ${
                      !notif.read ? 'bg-blue-900 bg-opacity-20' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1">
                        <h4 className="text-white font-semibold text-sm">
                          {notif.title}
                        </h4>
                        <p className="text-gray-300 text-sm mt-1">
                          {notif.message}
                        </p>
                        <p className="text-gray-500 text-xs mt-2">
                          {new Date(notif.created_at).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {!notif.read && (
                          <button
                            onClick={() => markAsRead(notif.id)}
                            className="text-blue-500 text-xs hover:text-blue-400"
                          >
                            Read
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notif.id)}
                          className="text-red-500 text-xs hover:text-red-400"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
