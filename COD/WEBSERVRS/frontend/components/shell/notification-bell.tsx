"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FIGMA_SHELL } from "@/components/shell/figma-shell-assets";
import { getApiClient } from "@/lib/auth";
import type { NotificationItem } from "@/lib/types/notification";

const POLL_INTERVAL_MS = 30_000;

function formatRelativeTime(iso: string): string {
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return "acum";
  if (minutes < 60) return `acum ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `acum ${hours} h`;
  return date.toLocaleDateString("ro-RO", { day: "numeric", month: "short" });
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    try {
      const data = await getApiClient().getNotifications();
      setItems(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch {
      /* ignoră erori de rețea la polling */
    }
  }, []);

  useEffect(() => {
    void load();
    const timer = window.setInterval(() => void load(), POLL_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [load]);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node))
        setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  async function handleMarkRead(id: number) {
    setLoading(true);
    try {
      await getApiClient().markNotificationRead(id);
      await load();
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkAllRead() {
    setLoading(true);
    try {
      await getApiClient().markAllNotificationsRead();
      await load();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        className="relative z-10 flex size-[40px] shrink-0 cursor-pointer content-stretch items-center justify-center rounded-[12px] hover:bg-[rgba(37,99,235,0.08)]"
        aria-label="Notificări"
        title="Notificări"
        onClick={() => setOpen((prev) => !prev)}
      >
        <div className="pointer-events-none relative h-[20px] w-[17.5px] shrink-0">
          <img alt="" className="block h-full w-full max-w-none" src={FIGMA_SHELL.topBar.bell} />
        </div>
        {unreadCount > 0 && (
          <span className="absolute right-[6px] top-[6px] flex size-[16px] items-center justify-center rounded-full bg-[#b42318] text-[10px] font-semibold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-[min(360px,calc(100vw-32px))] rounded-lg border border-[#c3c6d7] bg-[#faf8ff] shadow-lg">
          <div className="flex items-center justify-between border-b border-[#c3c6d7] px-4 py-3">
            <p className="text-sm font-semibold text-[#191b23]">Notificări</p>
            {unreadCount > 0 && (
              <button
                type="button"
                disabled={loading}
                onClick={() => void handleMarkAllRead()}
                className="cursor-pointer text-xs font-semibold text-[#004ac6] hover:underline disabled:opacity-50"
              >
                Marchează toate citite
              </button>
            )}
          </div>
          <ul className="max-h-[320px] overflow-y-auto">
            {items.length === 0 ? (
              <li className="px-4 py-6 text-center text-sm text-[#555f6d]">
                Nicio notificare.
              </li>
            ) : (
              items.map((item) => (
                <li
                  key={item.id}
                  className={`border-b border-[#e8eaf0] px-4 py-3 last:border-b-0 ${
                    item.isRead ? "opacity-70" : "bg-[rgba(37,99,235,0.04)]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#191b23]">{item.title}</p>
                      <p className="mt-0.5 text-xs text-[#555f6d]">{item.message}</p>
                      <p className="mt-1 text-[11px] text-[#8a94a6]">
                        {formatRelativeTime(item.createdAt)}
                      </p>
                    </div>
                    {!item.isRead && (
                      <button
                        type="button"
                        disabled={loading}
                        onClick={() => void handleMarkRead(item.id)}
                        className="shrink-0 cursor-pointer text-[11px] font-semibold text-[#004ac6] hover:underline disabled:opacity-50"
                      >
                        Citit
                      </button>
                    )}
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
