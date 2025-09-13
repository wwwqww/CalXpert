import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

export function AppointmentCalendar() {
  const appointments = useQuery(api.appointments.getAppointmentsByDoctor);
  const patients = useQuery(api.patients.getPatientsByDoctor);
  const createAppointment = useMutation(api.appointments.createAppointment);
  const updateAppointmentStatus = useMutation(api.appointments.updateAppointmentStatus);
  const deleteAppointment = useMutation(api.appointments.deleteAppointment);

  const [showForm, setShowForm] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [formData, setFormData] = useState({
    patientId: "",
    appointmentDate: "",
    appointmentTime: "",
    type: "consultation",
    notes: "",
  });

  const resetForm = () => {
    setFormData({
      patientId: "",
      appointmentDate: "",
      appointmentTime: "",
      type: "consultation",
      notes: "",
    });
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createAppointment({
        ...formData,
        patientId: formData.patientId as any,
        requestedBy: "doctor",
      });
      toast.success("Appointment created successfully!");
      resetForm();
    } catch (error) {
      toast.error("Failed to create appointment");
    }
  };

  const handleStatusUpdate = async (appointmentId: string, status: any, notes?: string, diagnosis?: string, prescription?: string) => {
    try {
      await updateAppointmentStatus({
        appointmentId: appointmentId as any,
        status,
        notes,
        diagnosis,
        prescription,
      });
      toast.success("Appointment updated successfully!");
      setSelectedAppointment(null);
    } catch (error) {
      toast.error("Failed to update appointment");
    }
  };

  const handleDelete = async (appointmentId: string) => {
    if (confirm("Are you sure you want to delete this appointment?")) {
      try {
        await deleteAppointment({ appointmentId: appointmentId as any });
        toast.success("Appointment deleted successfully!");
      } catch (error) {
        toast.error("Failed to delete appointment");
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled": return "bg-blue-100 text-blue-800";
      case "completed": return "bg-green-100 text-green-800";
      case "cancelled": return "bg-red-100 text-red-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (appointments === undefined || patients === undefined) {
    return (
      <div className="p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    );
  }

  // Group appointments by date
  const appointmentsByDate = appointments.reduce((acc: any, appointment) => {
    const date = appointment.appointmentDate;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(appointment);
    return acc;
  }, {});

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Appointment Calendar</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Schedule Appointment
        </button>
      </div>

      {/* New Appointment Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Schedule New Appointment</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Patient *
                </label>
                <select
                  value={formData.patientId}
                  onChange={(e) => setFormData(prev => ({ ...prev, patientId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select a patient</option>
                  {patients.map((patient) => (
                    <option key={patient._id} value={patient._id}>
                      {patient.name} ({patient.patientId})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  value={formData.appointmentDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, appointmentDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time *
                </label>
                <input
                  type="time"
                  value={formData.appointmentTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, appointmentTime: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="consultation">Consultation</option>
                  <option value="follow-up">Follow-up</option>
                  <option value="check-up">Check-up</option>
                  <option value="emergency">Emergency</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Schedule Appointment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Appointment Details Modal */}
      {selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Appointment Details</h3>
            
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">Patient</p>
                  <p className="text-gray-900">{selectedAppointment.patient?.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Date & Time</p>
                  <p className="text-gray-900">
                    {selectedAppointment.appointmentDate} at {selectedAppointment.appointmentTime}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Type</p>
                  <p className="text-gray-900 capitalize">{selectedAppointment.type}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Status</p>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedAppointment.status)}`}>
                    {selectedAppointment.status}
                  </span>
                </div>
              </div>

              {selectedAppointment.notes && (
                <div>
                  <p className="text-sm font-medium text-gray-700">Notes</p>
                  <p className="text-gray-900">{selectedAppointment.notes}</p>
                </div>
              )}

              {selectedAppointment.diagnosis && (
                <div>
                  <p className="text-sm font-medium text-gray-700">Diagnosis</p>
                  <p className="text-gray-900">{selectedAppointment.diagnosis}</p>
                </div>
              )}

              {selectedAppointment.prescription && (
                <div>
                  <p className="text-sm font-medium text-gray-700">Prescription</p>
                  <p className="text-gray-900">{selectedAppointment.prescription}</p>
                </div>
              )}

              <div className="flex justify-between items-center pt-4 border-t">
                <div className="flex space-x-2">
                  {selectedAppointment.status === "pending" && (
                    <>
                      <button
                        onClick={() => handleStatusUpdate(selectedAppointment._id, "scheduled")}
                        className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(selectedAppointment._id, "cancelled")}
                        className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {selectedAppointment.status === "scheduled" && (
                    <button
                      onClick={() => handleStatusUpdate(selectedAppointment._id, "completed")}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                    >
                      Mark Complete
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(selectedAppointment._id)}
                    className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                  >
                    Delete
                  </button>
                </div>
                <button
                  onClick={() => setSelectedAppointment(null)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Appointments List */}
      <div className="space-y-6">
        {Object.keys(appointmentsByDate).length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No appointments scheduled. Create your first appointment to get started.
          </div>
        ) : (
          Object.entries(appointmentsByDate)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([date, dayAppointments]: [string, any]) => (
              <div key={date} className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-lg text-gray-900 mb-3">
                  {new Date(date).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </h3>
                <div className="space-y-2">
                  {dayAppointments
                    .sort((a: any, b: any) => a.appointmentTime.localeCompare(b.appointmentTime))
                    .map((appointment: any) => (
                      <div
                        key={appointment._id}
                        className="bg-white rounded-lg p-3 border cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => setSelectedAppointment(appointment)}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium text-gray-900">
                              {appointment.appointmentTime} - {appointment.patient?.name}
                            </p>
                            <p className="text-sm text-gray-600 capitalize">
                              {appointment.type}
                            </p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                            {appointment.status}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
}
