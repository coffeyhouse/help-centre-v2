import JSONEditor from './JSONEditor';

interface RegionsEditorProps {
  data: any;
  onChange: (data: any) => void;
}

export default function RegionsEditor({ data, onChange }: RegionsEditorProps) {
  return (
    <div>
      <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-900">
          <strong>Regions Editor:</strong> Manage country and region configurations.
        </p>
      </div>
      <JSONEditor data={data} onChange={onChange} />
    </div>
  );
}
