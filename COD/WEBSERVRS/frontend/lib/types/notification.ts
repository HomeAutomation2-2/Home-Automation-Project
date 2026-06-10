export type NotificationItem = {
  id: number;
  type: "child_late_return" | "temperature_critical";
  severity: "warning" | "critical";
  title: string;
  message: string;
  relatedUserId: number | null;
  relatedRoomId: number | null;
  isRead: boolean;
  createdAt: string;
};

export type NotificationsResponse = {
  notifications: NotificationItem[];
  unreadCount: number;
};
