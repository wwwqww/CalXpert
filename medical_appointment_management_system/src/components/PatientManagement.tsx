import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

export function PatientManagement() {
  const patients = useQuery(api.patients.getPatientsByDoctor);
  const createPatient = useMutation(api.patients.createPatient);
  const updatePatient = useMutation(api.patients.updatePatient);
  const deletePatient = useMutation(api.patients.deletePatient);

  const [showForm, setShowForm] = useState(false);
  const [editingPatient, setEditingPatient] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    dateOfBirth: "",
    address: "",
    medicalNotes: "",
  });

  const resetForm = () => {
    setFormData({
      name: "",
      phone: "",
      email: "",
      dateOfBirth: "",
      address: "",
      medicalNotes: "",
    });
    setEditingPatient(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingPatient) {
        await updatePatient({
          patientId: editingPatient._id,
          ...formData,
        });
        toast.success("Patient updated successfully!");
      } else {
        await createPatient(formData);
        toast.success("Patient created successfully!");
      }
      resetForm();
    } catch (error) {
      toast.error("Failed to save patient");
    }
  };

  const handleEdit = (patient: any) => {
    setFormData({
      name: patient.name,
      phone: patient.phone,
      email: patient.email || "",
      dateOfBirth: patient.dateOfBirth || "",
      address: patient.address || "",
      medicalNotes: patient.medicalNotes || "",
    });
    setEditingPatient(patient);
    setShowForm(true);
  };

  const handleDelete = async (patientId: any) => {
    if (confirm("Are you sure you want to delete this patient? This will also delete all their appointments.")) {
      try {
        await deletePatient({ patientId });
        toast.success("Patient deleted successfully!");
      } catch (error) {
        toast.error("Failed to delete patient");
      }
    }
  };

  if (patients === undefined) {
    return (
      <div className="p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Patient Management</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Add New Patient
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">
              {editingPatient ? "Edit Patient" : "Add New Patient"}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Medical Notes
                </label>
                <textarea
                  value={formData.medicalNotes}
                  onChange={(e) => setFormData(prev => ({ ...prev, medicalNotes: e.target.value }))}
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
                  {editingPatient ? "Update Patient" : "Create Patient"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {patients.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No patients found. Add your first patient to get started.
          </div>
        ) : (
          patients.map((patient) => (
            <div key={patient._id} className="bg-gray-50 rounded-lg p-4 border">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-gray-900">{patient.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">ID: {patient.patientId}</p>
                  <div className="grid md:grid-cols-2 gap-2 text-sm text-gray-600">
                    <p>📞 {patient.phone}</p>
                    {patient.email && <p>✉️ {patient.email}</p>}
                    {patient.dateOfBirth && <p>🎂 {patient.dateOfBirth}</p>}
                    {patient.address && <p>🏠 {patient.address}</p>}
                  </div>
                  {patient.medicalNotes && (
                    <div className="mt-2">
                      <p className="text-sm font-medium text-gray-700">Medical Notes:</p>
                      <p className="text-sm text-gray-600">{patient.medicalNotes}</p>
                    </div>
                  )}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(patient)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(patient._id)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
