import React, { useMemo, useRef, useEffect, useState } from 'react';
import ReactQuill, { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Code2, Eye } from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  ref?: React.Ref<any>;
}

// Variáveis globais para comunicação entre insertTable e o componente
let globalOnChange: ((html: string) => void) | null = null;
let globalSetShowCodeEditor: ((show: boolean) => void) | null = null;
let globalSetHtmlContent: ((html: string) => void) | null = null;
let globalCurrentHtml: string = '';

// Custom handler para inserir tabela
const insertTable = (quill: any) => {
  const rows = prompt('Número de linhas:', '3');
  const cols = prompt('Número de colunas:', '3');
  
  if (!rows || !cols) return;
  
  const rowCount = parseInt(rows) || 3;
  const colCount = parseInt(cols) || 3;
  
  // Criar HTML da tabela com estilos inline para garantir renderização
  let tableHTML = '<table style="border-collapse: collapse; width: 100%; margin: 1rem 0; border: 1px solid #ddd;"><tbody>';
  
  for (let i = 0; i < rowCount; i++) {
    tableHTML += '<tr>';
    for (let j = 0; j < colCount; j++) {
      tableHTML += '<td style="border: 1px solid #ddd; padding: 8px; min-width: 50px;">&nbsp;</td>';
    }
    tableHTML += '</tr>';
  }
  
  tableHTML += '</tbody></table>';
  
  // Obter o HTML atual (do editor ou do modo HTML)
  const currentHTML = quill ? quill.root.innerHTML : globalCurrentHtml;
  
  // Inserir a tabela no HTML atual
  const newHTML = currentHTML + tableHTML;
  
  // Como o Quill não suporta tabelas, vamos mudar para o modo HTML e inserir lá
  if (globalSetShowCodeEditor && globalSetHtmlContent) {
    globalSetHtmlContent(newHTML);
    globalSetShowCodeEditor(true);
    // Chamar onChange com o novo HTML
    if (globalOnChange) {
      setTimeout(() => {
        globalOnChange(newHTML);
      }, 100);
    }
  } else if (quill) {
    // Fallback: tentar inserir diretamente (pode não funcionar)
    const editorElement = quill.root;
    editorElement.innerHTML = newHTML;
    if (globalOnChange) {
      setTimeout(() => {
        globalOnChange(newHTML);
      }, 100);
    }
  }
};

export const RichTextEditor = React.forwardRef<any, RichTextEditorProps>(({
  value,
  onChange,
  placeholder = 'Digite o conteúdo...',
  className = '',
}, ref) => {
  const quillRef = useRef<ReactQuill>(null);
  const onChangeRef = useRef(onChange);
  
  // Atualizar a ref do onChange sempre que mudar
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);
  
  // Expor o quillRef através do ref externo
  React.useImperativeHandle(ref, () => quillRef.current);
  const [showCodeEditor, setShowCodeEditor] = useState(false);
  const [htmlContent, setHtmlContent] = useState(value);
  const latestContentRef = useRef<string>(value);

  // Atualizar variáveis globais
  useEffect(() => {
    globalOnChange = onChangeRef.current;
    globalSetShowCodeEditor = setShowCodeEditor;
    globalSetHtmlContent = setHtmlContent;
    globalCurrentHtml = htmlContent;
  }, [onChange, setShowCodeEditor, setHtmlContent, htmlContent]);

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
            
            // Sempre usar o HTML direto do editor para preservar tabelas
            if (quillRef.current) {
              const quill = quillRef.current.getEditor();
              const editorHTML = quill.root.innerHTML;
              
              // Se o HTML do editor contém tabelas, sempre usar o HTML direto
              if (editorHTML.includes('<table')) {
                onChange(editorHTML);
                return;
              }
            }
            
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
          color: #111827;
          background-color: #ffffff;
        }
        .rich-text-editor .ql-editor p,
        .rich-text-editor .ql-editor div,
        .rich-text-editor .ql-editor span,
        .rich-text-editor .ql-editor h1,
        .rich-text-editor .ql-editor h2,
        .rich-text-editor .ql-editor h3,
        .rich-text-editor .ql-editor h4,
        .rich-text-editor .ql-editor h5,
        .rich-text-editor .ql-editor h6,
        .rich-text-editor .ql-editor li,
        .rich-text-editor .ql-editor ul,
        .rich-text-editor .ql-editor ol {
          color: #111827;
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
          display: table !important;
          border: 1px solid #ddd;
        }
        .rich-text-editor .ql-editor table tbody {
          display: table-row-group !important;
        }
        .rich-text-editor .ql-editor table tr {
          display: table-row !important;
        }
        .rich-text-editor .ql-editor table td,
        .rich-text-editor .ql-editor table th {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
          display: table-cell !important;
          min-width: 50px;
        }
        .rich-text-editor .ql-editor table th {
          background-color: #f3f4f6;
          font-weight: 600;
        }
        .rich-text-editor .ql-editor p {
          margin: 0.5rem 0;
        }
      `}</style>
    </div>
  );
});



