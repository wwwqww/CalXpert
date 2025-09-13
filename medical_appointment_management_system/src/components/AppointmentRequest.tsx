import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

interface AppointmentRequestProps {
  patient: any;
}

export function AppointmentRequest({ patient }: AppointmentRequestProps) {
  const createAppointment = useMutation(api.appointments.createAppointment);
  
  // Get doctor profile by doctorId
  const doctorProfile = useQuery(api.doctors.getDoctorById, { doctorId: patient.doctorId });

  const [formData, setFormData] = useState({
    appointmentDate: "",
    appointmentTime: "",
    type: "consultation",
    notes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const appointmentId = await createAppointment({
        patientId: patient._id,
        ...formData,
        requestedBy: "patient",
      });

      toast.success("Appointment request submitted successfully!");
      setFormData({
        appointmentDate: "",
        appointmentTime: "",
        type: "consultation",
        notes: "",
      });
    } catch (error) {
      toast.error("Failed to submit appointment request");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (doctorProfile === undefined) {
    return (
      <div className="p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Request Appointment</h2>

      {doctorProfile && (
        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-900">Dr. {doctorProfile.name}</h3>
          <p className="text-blue-700">{doctorProfile.specialization}</p>
          {doctorProfile.workingHours && (
            <p className="text-sm text-blue-600 mt-1">
              Working Hours: {doctorProfile.workingHours.start} - {doctorProfile.workingHours.end}
            </p>
          )}
          {doctorProfile.workingDays && (
            <p className="text-sm text-blue-600">
              Working Days: {doctorProfile.workingDays.join(", ")}
            </p>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferred Date *
            </label>
            <input
              type="date"
              value={formData.appointmentDate}
              onChange={(e) => setFormData(prev => ({ ...prev, appointmentDate: e.target.value }))}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferred Time *
            </label>
            <input
              type="time"
              value={formData.appointmentTime}
              onChange={(e) => setFormData(prev => ({ ...prev, appointmentTime: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Appointment Type
          </label>
          <select
            value={formData.type}
            onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="consultation">Consultation</option>
            <option value="follow-up">Follow-up</option>
            <option value="check-up">Check-up</option>
            <option value="emergency">Emergency</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reason for Visit / Symptoms
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            rows={4}
            placeholder="Please describe your symptoms or reason for the appointment..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Please Note</h3>
              <p className="text-sm text-yellow-700 mt-1">
                This is a request for an appointment. Dr. {doctorProfile?.name} will review your request and confirm the appointment time. You will receive a notification once it's approved.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
          >
            {isSubmitting ? "Submitting..." : "Submit Request"}
          </button>
        </div>
      </form>
    </div>
  );
}
