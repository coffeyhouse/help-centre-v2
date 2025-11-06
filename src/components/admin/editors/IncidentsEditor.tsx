import JSONEditor from './JSONEditor';

interface IncidentsEditorProps {
  data: any;
  onChange: (data: any) => void;
}

export default function IncidentsEditor({ data, onChange }: IncidentsEditorProps) {
  return (
    <div>
      <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-900">
          <strong>Incidents/Banners Editor:</strong> Manage incident banners and notifications.
        </p>
      </div>
      <JSONEditor data={data} onChange={onChange} />
    </div>
  );
}
