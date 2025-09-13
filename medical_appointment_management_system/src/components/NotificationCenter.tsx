import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

export function NotificationCenter() {
  const notifications = useQuery(api.notifications.getNotificationsForDoctor);
  const markAsRead = useMutation(api.notifications.markNotificationAsRead);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsRead({ notificationId: notificationId as any });
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  if (notifications === undefined) {
    return (
      <div className="p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    );
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "appointment_request": return "📅";
      case "appointment_confirmed": return "✅";
      case "appointment_cancelled": return "❌";
      case "appointment_reminder": return "⏰";
      default: return "📢";
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Notifications</h2>

      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No notifications yet.
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification._id}
              className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                notification.isRead 
                  ? "bg-gray-50 border-gray-200" 
                  : "bg-blue-50 border-blue-200"
              }`}
              onClick={() => !notification.isRead && handleMarkAsRead(notification._id)}
            >
              <div className="flex items-start space-x-3">
                <span className="text-2xl">{getNotificationIcon(notification.type)}</span>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className={`font-medium ${notification.isRead ? "text-gray-700" : "text-gray-900"}`}>
                      {notification.title}
                    </h3>
                    <span className="text-xs text-gray-500">
                      {new Date(notification._creationTime).toLocaleDateString()}
                    </span>
                  </div>
                  <p className={`text-sm mt-1 ${notification.isRead ? "text-gray-600" : "text-gray-800"}`}>
                    {notification.message}
                  </p>
                  {!notification.isRead && (
                    <div className="mt-2">
                      <span className="inline-block w-2 h-2 bg-blue-600 rounded-full"></span>
                      <span className="text-xs text-blue-600 ml-2">New</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
