import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import { DoctorDashboard } from "./components/DoctorDashboard";
import { PatientLogin } from "./components/PatientLogin";
import { PatientDashboard } from "./components/PatientDashboard";
import { useState } from "react";

export default function App() {
  const [userType, setUserType] = useState<"doctor" | "patient" | null>(null);
  const [patientId, setPatientId] = useState<string>("");

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm h-16 flex justify-between items-center border-b shadow-sm px-4">
        <h2 className="text-xl font-semibold text-blue-600">MedConnect</h2>
        <div className="flex items-center gap-4">
          <Authenticated>
            <SignOutButton />
          </Authenticated>
        </div>
      </header>
      <main className="flex-1 p-4">
        <Content 
          userType={userType} 
          setUserType={setUserType}
          patientId={patientId}
          setPatientId={setPatientId}
        />
      </main>
      <Toaster />
    </div>
  );
}

function Content({ 
  userType, 
  setUserType, 
  patientId, 
  setPatientId 
}: {
  userType: "doctor" | "patient" | null;
  setUserType: (type: "doctor" | "patient" | null) => void;
  patientId: string;
  setPatientId: (id: string) => void;
}) {
  const loggedInUser = useQuery(api.auth.loggedInUser);

  if (loggedInUser === undefined) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If user is authenticated as doctor
  if (loggedInUser && userType === "doctor") {
    return <DoctorDashboard />;
  }

  // If user is accessing as patient
  if (userType === "patient" && patientId) {
    return <PatientDashboard patientId={patientId} onLogout={() => {
      setUserType(null);
      setPatientId("");
    }} />;
  }

  // Show login/selection screen
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Medical Appointment System
        </h1>
        <p className="text-xl text-gray-600">
          Connect doctors and patients seamlessly
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Doctor Login */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Doctor Portal</h2>
            <p className="text-gray-600">Manage your patients and appointments</p>
          </div>

          <Authenticated>
            <button
              onClick={() => setUserType("doctor")}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Access Doctor Dashboard
            </button>
          </Authenticated>

          <Unauthenticated>
            <div className="space-y-4">
              <p className="text-sm text-gray-600 text-center">Sign in to access your doctor account</p>
              <SignInForm />
            </div>
          </Unauthenticated>
        </div>

        {/* Patient Login */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Patient Portal</h2>
            <p className="text-gray-600">View your appointments and medical records</p>
          </div>

          <PatientLogin 
            onLogin={(id) => {
              setPatientId(id);
              setUserType("patient");
            }}
          />
        </div>
      </div>
    </div>
  );
}
