import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { AppointmentRequest } from "./AppointmentRequest";
import { PatientAppointments } from "./PatientAppointments";
import { PatientNotifications } from "./PatientNotifications";

interface PatientDashboardProps {
  patientId: string;
  onLogout: () => void;
}

export function PatientDashboard({ patientId, onLogout }: PatientDashboardProps) {
  const [activeTab, setActiveTab] = useState<"appointments" | "request" | "notifications">("appointments");
  
  const patient = useQuery(api.patients.getPatientByPatientId, { patientId });
  const appointments = useQuery(api.appointments.getAppointmentsByPatient, { patientId });
  const notifications = useQuery(api.notifications.getNotificationsForPatient, { patientId });

  const unreadCount = notifications?.filter(n => !n.isRead).length || 0;

  const tabs = [
    { id: "appointments", label: "My Appointments", icon: "📅" },
    { id: "request", label: "Request Appointment", icon: "➕" },
    { id: "notifications", label: `Notifications ${unreadCount > 0 ? `(${unreadCount})` : ""}`, icon: "🔔" },
  ];

  if (patient === undefined || appointments === undefined) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Patient Not Found</h2>
          <p className="text-gray-600 mb-4">
            The Patient ID you entered is not valid. Please check with your doctor for the correct ID.
          </p>
          <button
            onClick={onLogout}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome, {patient.name}
          </h1>
          <p className="text-gray-600">Patient ID: {patient.patientId}</p>
        </div>
        <button
          onClick={onLogout}
          className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
        >
          Logout
        </button>
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
                  ? "border-green-500 text-green-600"
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
        {activeTab === "appointments" && (
          <PatientAppointments appointments={appointments} />
        )}
        {activeTab === "request" && (
          <AppointmentRequest patient={patient} />
        )}
        {activeTab === "notifications" && (
          <PatientNotifications notifications={notifications || []} />
        )}
      </div>
    </div>
  );
}
