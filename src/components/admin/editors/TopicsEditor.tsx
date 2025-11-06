import JSONEditor from './JSONEditor';

interface TopicsEditorProps {
  data: any;
  onChange: (data: any) => void;
}

export default function TopicsEditor({ data, onChange }: TopicsEditorProps) {
  return (
    <div>
      <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-900">
          <strong>Topics Editor:</strong> Manage support hub topics for each product.
        </p>
      </div>
      <JSONEditor data={data} onChange={onChange} />
    </div>
  );
}
