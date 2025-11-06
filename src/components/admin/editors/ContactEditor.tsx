import JSONEditor from './JSONEditor';

interface ContactEditorProps {
  data: any;
  onChange: (data: any) => void;
}

export default function ContactEditor({ data, onChange }: ContactEditorProps) {
  return (
    <div>
      <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-900">
          <strong>Contact Methods Editor:</strong> Manage contact methods and support channels.
        </p>
      </div>
      <JSONEditor data={data} onChange={onChange} />
    </div>
  );
}
