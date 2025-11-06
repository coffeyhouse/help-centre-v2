import { useState, useEffect } from 'react';
import { ExclamationCircleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

interface JSONEditorProps {
  data: any;
  onChange: (data: any) => void;
}

export default function JSONEditor({ data, onChange }: JSONEditorProps) {
  const [jsonString, setJsonString] = useState('');
  const [error, setError] = useState('');
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    setJsonString(JSON.stringify(data, null, 2));
  }, [data]);

  const handleChange = (value: string) => {
    setJsonString(value);
    setError('');

    try {
      const parsed = JSON.parse(value);
      setIsValid(true);
      onChange(parsed);
    } catch (err: any) {
      setIsValid(false);
      setError(err.message);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Edit the JSON directly. Changes are validated in real-time.
        </p>
        {isValid ? (
          <div className="flex items-center gap-2 text-green-600 text-sm">
            <CheckCircleIcon className="h-5 w-5" />
            Valid JSON
          </div>
        ) : (
          <div className="flex items-center gap-2 text-red-600 text-sm">
            <ExclamationCircleIcon className="h-5 w-5" />
            Invalid JSON
          </div>
        )}
      </div>

      <textarea
        value={jsonString}
        onChange={(e) => handleChange(e.target.value)}
        className={`w-full h-[500px] px-4 py-3 font-mono text-sm border rounded-lg focus:ring-2 focus:outline-none ${
          isValid
            ? 'border-gray-300 focus:ring-blue-500 focus:border-transparent'
            : 'border-red-300 focus:ring-red-500 focus:border-transparent'
        }`}
        spellCheck={false}
      />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p className="font-semibold">Syntax Error:</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      )}
    </div>
  );
}
