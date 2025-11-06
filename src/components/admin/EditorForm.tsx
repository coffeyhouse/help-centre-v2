import { useState } from 'react';
import ProductsEditor from './editors/ProductsEditor';
import ArticlesEditor from './editors/ArticlesEditor';
import TopicsEditor from './editors/TopicsEditor';
import IncidentsEditor from './editors/IncidentsEditor';
import PopupsEditor from './editors/PopupsEditor';
import ContactEditor from './editors/ContactEditor';
import ReleaseNotesEditor from './editors/ReleaseNotesEditor';
import RegionsEditor from './editors/RegionsEditor';
import JSONEditor from './editors/JSONEditor';

interface EditorFormProps {
  fileId: string;
  data: any;
  onChange: (data: any) => void;
}

export default function EditorForm({ fileId, data, onChange }: EditorFormProps) {
  const [viewMode, setViewMode] = useState<'form' | 'json'>('form');

  // Render appropriate editor based on file type
  const renderEditor = () => {
    if (viewMode === 'json') {
      return <JSONEditor data={data} onChange={onChange} />;
    }

    switch (fileId) {
      case 'regions':
        return <RegionsEditor data={data} onChange={onChange} />;
      case 'uk-ireland-products':
        return <ProductsEditor data={data} onChange={onChange} />;
      case 'uk-ireland-articles':
        return <ArticlesEditor data={data} onChange={onChange} />;
      case 'uk-ireland-topics':
        return <TopicsEditor data={data} onChange={onChange} />;
      case 'uk-ireland-incidents':
        return <IncidentsEditor data={data} onChange={onChange} />;
      case 'uk-ireland-popups':
        return <PopupsEditor data={data} onChange={onChange} />;
      case 'uk-ireland-contact':
        return <ContactEditor data={data} onChange={onChange} />;
      case 'uk-ireland-release-notes':
        return <ReleaseNotesEditor data={data} onChange={onChange} />;
      default:
        return <JSONEditor data={data} onChange={onChange} />;
    }
  };

  return (
    <div>
      {/* View Mode Toggle */}
      <div className="mb-4 flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setViewMode('form')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            viewMode === 'form'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Form View
        </button>
        <button
          onClick={() => setViewMode('json')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            viewMode === 'json'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          JSON View
        </button>
      </div>

      {/* Editor Content */}
      <div className="max-h-[calc(100vh-300px)] overflow-y-auto">
        {renderEditor()}
      </div>
    </div>
  );
}
