import JSONEditor from './JSONEditor';

interface ReleaseNotesEditorProps {
  data: any;
  onChange: (data: any) => void;
}

export default function ReleaseNotesEditor({ data, onChange }: ReleaseNotesEditorProps) {
  return (
    <div>
      <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-900">
          <strong>Release Notes Editor:</strong> Manage product release notes and version history.
        </p>
      </div>
      <JSONEditor data={data} onChange={onChange} />
    </div>
  );
}
