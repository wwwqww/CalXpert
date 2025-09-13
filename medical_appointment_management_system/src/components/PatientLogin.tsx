import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

interface PatientLoginProps {
  onLogin: (patientId: string) => void;
}

export function PatientLogin({ onLogin }: PatientLoginProps) {
  const [patientId, setPatientId] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId.trim()) {
      toast.error("Please enter your Patient ID");
      return;
    }

    setIsLoading(true);
    
    // We'll verify the patient ID exists by trying to fetch patient data
    try {
      // This will be handled in the parent component
      onLogin(patientId.trim().toUpperCase());
    } catch (error) {
      toast.error("Invalid Patient ID");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      <div>
        <label htmlFor="patientId" className="block text-sm font-medium text-gray-700 mb-2">
          Patient ID
        </label>
        <input
          type="text"
          id="patientId"
          value={patientId}
          onChange={(e) => setPatientId(e.target.value)}
          placeholder="Enter your Patient ID (e.g., P1234567890ABC)"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
          disabled={isLoading}
        />
        <p className="text-xs text-gray-500 mt-1">
          Your Patient ID was provided by your doctor
        </p>
      </div>

      <button
        type="submit"
        disabled={isLoading || !patientId.trim()}
        className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
      >
        {isLoading ? "Verifying..." : "Access Patient Portal"}
      </button>
    </form>
  );
}
