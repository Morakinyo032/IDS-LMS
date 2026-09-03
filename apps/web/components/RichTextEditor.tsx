'use client';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  return (
    <div className="rich-editor border rounded-lg overflow-hidden" style={{ direction: 'ltr', textAlign: 'left' }}>
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 p-2 bg-gray-100 dark:bg-gray-700 border-b" style={{ direction: 'ltr' }}>
        <button type="button" onClick={() => document.execCommand('bold')} className="px-2 py-1 hover:bg-white dark:hover:bg-gray-600 rounded text-sm font-bold">B</button>
        <button type="button" onClick={() => document.execCommand('italic')} className="px-2 py-1 hover:bg-white dark:hover:bg-gray-600 rounded text-sm italic">I</button>
        <button type="button" onClick={() => document.execCommand('underline')} className="px-2 py-1 hover:bg-white dark:hover:bg-gray-600 rounded text-sm underline">U</button>
        <span className="w-px bg-gray-300 mx-1" />
        <button type="button" onClick={() => document.execCommand('insertUnorderedList')} className="px-2 py-1 hover:bg-white dark:hover:bg-gray-600 rounded text-sm">• List</button>
        <button type="button" onClick={() => document.execCommand('insertOrderedList')} className="px-2 py-1 hover:bg-white dark:hover:bg-gray-600 rounded text-sm">1. List</button>
        <span className="w-px bg-gray-300 mx-1" />
        <button type="button" onClick={() => { const url = prompt('Enter URL:'); if (url) document.execCommand('createLink', false, url); }} className="px-2 py-1 hover:bg-white dark:hover:bg-gray-600 rounded text-sm text-blue-600">🔗 Link</button>
      </div>

      {/* Editor */}
      <div
        contentEditable
        suppressContentEditableWarning
        className="min-h-[200px] p-4 bg-white dark:bg-gray-800 focus:outline-none"
        style={{ direction: 'ltr', textAlign: 'left' }}
        dangerouslySetInnerHTML={{ __html: value }}
        onInput={(e) => onChange(e.currentTarget.innerHTML)}
        onBlur={(e) => onChange(e.currentTarget.innerHTML)}
        data-placeholder={placeholder || 'Write your content here...'}
      />

      <style jsx>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
        }
        [contenteditable]:focus {
          outline: none;
        }
      `}</style>
    </div>
  );
}