interface PatientAppointmentsProps {
  appointments: any[];
}

export function PatientAppointments({ appointments }: PatientAppointmentsProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled": return "bg-blue-100 text-blue-800";
      case "completed": return "bg-green-100 text-green-800";
      case "cancelled": return "bg-red-100 text-red-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const sortedAppointments = appointments.sort((a, b) => {
    const dateA = new Date(`${a.appointmentDate} ${a.appointmentTime}`);
    const dateB = new Date(`${b.appointmentDate} ${b.appointmentTime}`);
    return dateB.getTime() - dateA.getTime();
  });

  const upcomingAppointments = sortedAppointments.filter(apt => {
    const appointmentDate = new Date(`${apt.appointmentDate} ${apt.appointmentTime}`);
    return appointmentDate >= new Date() && apt.status !== "cancelled";
  });

  const pastAppointments = sortedAppointments.filter(apt => {
    const appointmentDate = new Date(`${apt.appointmentDate} ${apt.appointmentTime}`);
    return appointmentDate < new Date() || apt.status === "completed" || apt.status === "cancelled";
  });

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">My Appointments</h2>

      {/* Upcoming Appointments */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Appointments</h3>
        {upcomingAppointments.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-6 text-center text-gray-500">
            No upcoming appointments scheduled.
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingAppointments.map((appointment) => (
              <div key={appointment._id} className="bg-white border rounded-lg p-4 shadow-sm">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="font-medium text-gray-900">
                        Dr. {appointment.doctor?.name}
                      </h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                        {appointment.status}
                      </span>
                    </div>
                    <div className="grid md:grid-cols-2 gap-2 text-sm text-gray-600">
                      <p>📅 {new Date(appointment.appointmentDate).toLocaleDateString()}</p>
                      <p>🕐 {appointment.appointmentTime}</p>
                      <p>🏥 {appointment.type}</p>
                      <p>📍 {appointment.doctor?.specialization}</p>
                    </div>
                    {appointment.notes && (
                      <div className="mt-2">
                        <p className="text-sm font-medium text-gray-700">Notes:</p>
                        <p className="text-sm text-gray-600">{appointment.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Past Appointments */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Past Appointments</h3>
        {pastAppointments.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-6 text-center text-gray-500">
            No past appointments found.
          </div>
        ) : (
          <div className="space-y-3">
            {pastAppointments.map((appointment) => (
              <div key={appointment._id} className="bg-gray-50 border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="font-medium text-gray-700">
                        Dr. {appointment.doctor?.name}
                      </h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                        {appointment.status}
                      </span>
                    </div>
                    <div className="grid md:grid-cols-2 gap-2 text-sm text-gray-600">
                      <p>📅 {new Date(appointment.appointmentDate).toLocaleDateString()}</p>
                      <p>🕐 {appointment.appointmentTime}</p>
                      <p>🏥 {appointment.type}</p>
                      <p>📍 {appointment.doctor?.specialization}</p>
                    </div>
                    {appointment.diagnosis && (
                      <div className="mt-2">
                        <p className="text-sm font-medium text-gray-700">Diagnosis:</p>
                        <p className="text-sm text-gray-600">{appointment.diagnosis}</p>
                      </div>
                    )}
                    {appointment.prescription && (
                      <div className="mt-2">
                        <p className="text-sm font-medium text-gray-700">Prescription:</p>
                        <p className="text-sm text-gray-600">{appointment.prescription}</p>
                      </div>
                    )}
                    {appointment.notes && (
                      <div className="mt-2">
                        <p className="text-sm font-medium text-gray-700">Notes:</p>
                        <p className="text-sm text-gray-600">{appointment.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
