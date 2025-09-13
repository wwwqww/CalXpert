interface FileViewerProps {
  appointmentId?: string;
  patientId?: string;
  className?: string;
}

export function FileViewer({ appointmentId, patientId, className = "" }: FileViewerProps) {
  return (
    <div className={`p-4 text-center text-gray-500 ${className}`}>
      File upload feature coming soon...
    </div>
  );
}
