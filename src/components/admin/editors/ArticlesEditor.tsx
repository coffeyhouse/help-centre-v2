import JSONEditor from './JSONEditor';

interface ArticlesEditorProps {
  data: any;
  onChange: (data: any) => void;
}

export default function ArticlesEditor({ data, onChange }: ArticlesEditorProps) {
  // For MVP, use JSON editor. Can be enhanced with form-based UI later
  return (
    <div>
      <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-900">
          <strong>Articles Editor:</strong> This file contains nested article structures by product
          and topic. Use JSON view for complex editing, or switch to form view for a
          structured approach.
        </p>
      </div>
      <JSONEditor data={data} onChange={onChange} />
    </div>
  );
}
