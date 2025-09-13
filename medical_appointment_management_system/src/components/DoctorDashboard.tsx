import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { DoctorProfile } from "./DoctorProfile";
import { PatientManagement } from "./PatientManagement";
import { AppointmentCalendar } from "./AppointmentCalendar";
import { NotificationCenter } from "./NotificationCenter";

export function DoctorDashboard() {
  const [activeTab, setActiveTab] = useState<"profile" | "patients" | "appointments" | "notifications">("appointments");
  const doctorProfile = useQuery(api.doctors.getDoctorProfile);
  const notifications = useQuery(api.notifications.getNotificationsForDoctor);

  const unreadCount = notifications?.filter(n => !n.isRead).length || 0;

  const tabs = [
    { id: "appointments", label: "Appointments", icon: "📅" },
    { id: "patients", label: "Patients", icon: "👥" },
    { id: "notifications", label: `Notifications ${unreadCount > 0 ? `(${unreadCount})` : ""}`, icon: "🔔" },
    { id: "profile", label: "Profile", icon: "⚙️" },
  ];

  if (doctorProfile === undefined) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!doctorProfile) {
    return <DoctorProfile />;
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome, Dr. {doctorProfile.name}
        </h1>
        <p className="text-gray-600">{doctorProfile.specialization}</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow">
        {activeTab === "profile" && <DoctorProfile />}
        {activeTab === "patients" && <PatientManagement />}
        {activeTab === "appointments" && <AppointmentCalendar />}
        {activeTab === "notifications" && <NotificationCenter />}
      </div>
    </div>
  );
}
