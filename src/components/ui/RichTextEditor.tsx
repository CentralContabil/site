import React, { useMemo, useRef, useEffect, useState } from 'react';
import ReactQuill, { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Code2, Eye } from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

// Custom handler para inserir tabela
const insertTable = (quill: any) => {
  const rows = prompt('Número de linhas:', '3');
  const cols = prompt('Número de colunas:', '3');
  
  if (!rows || !cols) return;
  
  const rowCount = parseInt(rows) || 3;
  const colCount = parseInt(cols) || 3;
  
  let tableHTML = '<table style="border-collapse: collapse; width: 100%; margin: 1rem 0;"><tbody>';
  
  for (let i = 0; i < rowCount; i++) {
    tableHTML += '<tr>';
    for (let j = 0; j < colCount; j++) {
      tableHTML += '<td style="border: 1px solid #ddd; padding: 8px;">&nbsp;</td>';
    }
    tableHTML += '</tr>';
  }
  
  tableHTML += '</tbody></table>';
  
  const range = quill.getSelection(true);
  quill.clipboard.dangerouslyPasteHTML(range.index, tableHTML);
  quill.setSelection(range.index + tableHTML.length);
};

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Digite o conteúdo...',
  className = '',
}) => {
  const quillRef = useRef<ReactQuill>(null);
  const [showCodeEditor, setShowCodeEditor] = useState(false);
  const [htmlContent, setHtmlContent] = useState(value);
  const latestContentRef = useRef<string>(value);

  useEffect(() => {
    if (quillRef.current) {
      const quill = quillRef.current.getEditor();
      const toolbar = quill.getModule('toolbar');
      
      // Adicionar handler customizado de tabela
      toolbar.addHandler('table', () => {
        insertTable(quill);
      });
      
      // Adicionar ícone SVG customizado para o botão de tabela
      const tableButton = toolbar.container.querySelector('.ql-table');
      if (tableButton) {
        tableButton.innerHTML = `
          <svg viewBox="0 0 18 18" style="width: 18px; height: 18px;">
            <rect class="ql-stroke" height="12" width="12" x="3" y="3" stroke="currentColor" fill="none"></rect>
            <line class="ql-stroke" x1="9" x2="9" y1="3" y2="15" stroke="currentColor"></line>
            <line class="ql-stroke" x1="3" x2="15" y1="9" y2="9" stroke="currentColor"></line>
          </svg>
        `;
      }
    }
  }, []);

  // Sincronizar HTML quando o valor mudar externamente
  useEffect(() => {
    if (!showCodeEditor) {
      setHtmlContent(value);
    } else {
      // Se estiver no modo código e o valor externo mudar, atualizar o htmlContent
      setHtmlContent(value);
    }
  }, [value]);

  // Sincronizar quando alternar para o modo código
  useEffect(() => {
    if (!showCodeEditor && quillRef.current) {
      // Quando sair do modo código, garantir que o valor está sincronizado
      const quill = quillRef.current.getEditor();
      const currentHtml = quill.root.innerHTML;
      if (currentHtml !== value) {
        // Se houver diferença, atualizar o htmlContent
        setHtmlContent(currentHtml);
      }
    }
  }, [showCodeEditor, value]);

  const handleToggleCodeEditor = () => {
    if (showCodeEditor) {
      // Sair do modo código: atualizar o editor com o HTML e chamar onChange
      const contentToUse = htmlContent || latestContentRef.current || value;
      onChange(contentToUse);
      latestContentRef.current = contentToUse;
    } else {
      // Entrar no modo código: obter HTML atual do editor
      if (quillRef.current) {
        const quill = quillRef.current.getEditor();
        const currentHtml = quill.root.innerHTML;
        setHtmlContent(currentHtml);
        latestContentRef.current = currentHtml;
      } else {
        setHtmlContent(value);
        latestContentRef.current = value;
      }
    }
    setShowCodeEditor(!showCodeEditor);
  };

  const handleCodeChange = (newHtml: string) => {
    setHtmlContent(newHtml);
    latestContentRef.current = newHtml;
    // Log para debug
    console.log('Code editor onChange - HTML length:', newHtml.length);
    console.log('Code editor onChange - Contains table:', newHtml.includes('<table'));
    // Chamar onChange imediatamente quando o código HTML mudar
    // Isso garante que o estado do componente pai seja atualizado
    onChange(newHtml);
  };

  // Atualizar ref quando value mudar externamente
  useEffect(() => {
    latestContentRef.current = value;
  }, [value]);

  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, 3, 4, 5, 6, false] }],
          [{ font: [] }],
          [{ size: [] }],
          ['bold', 'italic', 'underline', 'strike', 'blockquote'],
          [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
          [{ color: [] }, { background: [] }],
          [{ align: [] }],
          ['link', 'image', 'table'],
          ['clean'],
        ],
        handlers: {
          table: function() {
            if (quillRef.current) {
              const quill = quillRef.current.getEditor();
              insertTable(quill);
            }
          }
        }
      },
      clipboard: {
        matchVisual: false,
        // Permitir que HTML seja preservado exatamente como está
        keepSelection: true,
      },
    }),
    []
  );

  const formats = [
    'header',
    'font',
    'size',
    'bold',
    'italic',
    'underline',
    'strike',
    'blockquote',
    'list',
    'bullet',
    'indent',
    'color',
    'background',
    'align',
    'link',
    'image',
    'table',
    'table-row',
    'table-cell',
  ];

  return (
    <div className={`rich-text-editor ${className}`}>
      {/* Botão para alternar entre modo visual e código */}
      <div className="mb-2 flex justify-end">
        <button
          type="button"
          onClick={handleToggleCodeEditor}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:text-[#3bb664] transition-colors"
          title={showCodeEditor ? 'Voltar para modo visual' : 'Editar código HTML'}
        >
          {showCodeEditor ? (
            <>
              <Eye className="w-4 h-4" />
              Modo Visual
            </>
          ) : (
            <>
              <Code2 className="w-4 h-4" />
              Editar HTML
            </>
          )}
        </button>
      </div>

      {showCodeEditor ? (
        <div className="border border-gray-300 rounded-lg overflow-hidden">
          <textarea
            value={htmlContent}
            onChange={(e) => handleCodeChange(e.target.value)}
            className="w-full min-h-[300px] p-4 font-mono text-sm bg-gray-50 text-gray-900 border-0 focus:outline-none focus:ring-2 focus:ring-[#3bb664] resize-y"
            placeholder="Cole ou edite o código HTML aqui..."
            style={{
              fontFamily: 'monospace',
              lineHeight: '1.5',
            }}
          />
        </div>
      ) : (
        <ReactQuill
          ref={quillRef}
          theme="snow"
          value={value}
          onChange={(content) => {
            // Log para debug
            console.log('ReactQuill onChange - Content length:', content.length);
            onChange(content);
          }}
          modules={modules}
          formats={formats}
          placeholder={placeholder}
          style={{
            backgroundColor: 'white',
          }}
        />
      )}
      <style>{`
        .rich-text-editor .ql-container {
          min-height: 300px;
          font-size: 16px;
        }
        .rich-text-editor .ql-editor {
          min-height: 300px;
        }
        .rich-text-editor .ql-editor.ql-blank::before {
          color: #9ca3af;
          font-style: normal;
        }
        .rich-text-editor .ql-toolbar {
          border-top-left-radius: 0.5rem;
          border-top-right-radius: 0.5rem;
          border: 1px solid #d1d5db;
          border-bottom: none;
        }
        .rich-text-editor .ql-container {
          border-bottom-left-radius: 0.5rem;
          border-bottom-right-radius: 0.5rem;
          border: 1px solid #d1d5db;
          border-top: none;
        }
        .rich-text-editor .ql-toolbar .ql-stroke {
          stroke: #374151;
        }
        .rich-text-editor .ql-toolbar .ql-fill {
          fill: #374151;
        }
        .rich-text-editor .ql-toolbar button:hover,
        .rich-text-editor .ql-toolbar button:focus,
        .rich-text-editor .ql-toolbar button.ql-active {
          color: #3bb664;
        }
        .rich-text-editor .ql-toolbar button:hover .ql-stroke,
        .rich-text-editor .ql-toolbar button:focus .ql-stroke,
        .rich-text-editor .ql-toolbar button.ql-active .ql-stroke {
          stroke: #3bb664;
        }
        .rich-text-editor .ql-toolbar button:hover .ql-fill,
        .rich-text-editor .ql-toolbar button:focus .ql-fill,
        .rich-text-editor .ql-toolbar button.ql-active .ql-fill {
          fill: #3bb664;
        }
        .rich-text-editor .ql-editor table {
          border-collapse: collapse;
          width: 100%;
          margin: 1rem 0;
        }
        .rich-text-editor .ql-editor table td,
        .rich-text-editor .ql-editor table th {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
        }
        .rich-text-editor .ql-editor table th {
          background-color: #f3f4f6;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
};



