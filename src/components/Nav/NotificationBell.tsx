"use client";
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { FaBell } from "react-icons/fa";
import { usePolapainAuth } from "@/context/polapainAuth";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

interface Notification {
  _id: string;
  message: string;
  link: string;
  isRead: boolean;
  createdAt: string;
}

const NotificationBell = () => {
  const { polapainAuth } = usePolapainAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    if (!polapainAuth?._id) return;
    try {
      const res = await axios.get(`/api/notifications?userId=${polapainAuth._id}`);
      setNotifications(res.data);
      setUnreadCount(res.data.filter((n: Notification) => !n.isRead).length);
    } catch (error) {
      console.error("Failed to fetch notifications");
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // Poll every minute
    return () => clearInterval(interval);
  }, [polapainAuth]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkRead = async (notificationId: string, link: string) => {
    try {
      await axios.put("/api/notifications", { notificationId });
      // Update local state
      setNotifications(prev => prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
      setIsOpen(false);
    } catch (error) {
       console.error(error);
    }
  };

  const markAllRead = async () => {
      try {
          await axios.put("/api/notifications", { markAllRead: true, userId: polapainAuth?._id });
          setNotifications(prev => prev.map(n => ({...n, isRead: true})));
          setUnreadCount(0);
      } catch (error) {
          console.error(error);
      }
  }

  if (!polapainAuth) return null;

  return (
    <div className="relative mr-4" ref={dropdownRef}>
      <button 
        className="btn btn-ghost btn-circle"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="indicator">
          <FaBell className="h-6 w-6" />
          {unreadCount > 0 && <span className="badge badge-sm badge-error indicator-item">{unreadCount}</span>}
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 z-[1] p-2 shadow-xl bg-base-100 rounded-box w-80 max-h-96 overflow-y-auto border border-base-200">
           <div className="flex justify-between items-center p-2 mb-2 border-b border-base-200">
               <h3 className="font-bold">Notifications</h3>
               {unreadCount > 0 && (
                   <button onClick={markAllRead} className="btn btn-xs btn-ghost text-primary">Mark all read</button>
               )}
           </div>
           
           {notifications.length === 0 ? (
               <div className="p-4 text-center opacity-50">No notifications</div>
           ) : (
               notifications.map(notif => (
                   <div 
                        key={notif._id} 
                        className={`p-3 mb-2 rounded-lg cursor-pointer hover:bg-base-200 transition-colors ${!notif.isRead ? 'bg-base-200/50 border-l-4 border-primary' : ''}`}
                   >
                        <Link 
                            href={notif.link || "#"} 
                            onClick={() => handleMarkRead(notif._id, notif.link)}
                            className="block"
                        >
                            <p className="text-sm font-medium">{notif.message}</p>
                            <p className="text-xs opacity-60 mt-1">{formatDistanceToNow(new Date(notif.createdAt))} ago</p>
                        </Link>
                   </div>
               ))
           )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
