import React from 'react';

const MarkdownRenderer = ({ content }) => {
  // Parse markdown into sections
  const parseMarkdown = (md) => {
    const sections = [];
    const lines = md.split('\n');
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];

      // Check for table
      if (line.includes('|') && i + 1 < lines.length && lines[i + 1].includes('-')) {
        const headerCells = line.split('|').map(c => c.trim()).filter(c => c);
        i += 2; // Skip header and separator

        const rows = [];
        while (i < lines.length && lines[i].includes('|')) {
          const cells = lines[i].split('|').map(c => c.trim()).filter(c => c);
          if (cells.length > 0) rows.push(cells);
          i++;
        }

        sections.push({
          type: 'table',
          headers: headerCells,
          rows: rows
        });
      }
      // Check for headers
      else if (line.startsWith('### ')) {
        sections.push({ type: 'h3', content: line.slice(4) });
        i++;
      } else if (line.startsWith('## ')) {
        sections.push({ type: 'h2', content: line.slice(3) });
        i++;
      } else if (line.startsWith('# ')) {
        sections.push({ type: 'h1', content: line.slice(2) });
        i++;
      }
      // Check for lists
      else if (line.startsWith('- ')) {
        const listItems = [];
        while (i < lines.length && lines[i].startsWith('- ')) {
          listItems.push(lines[i].slice(2));
          i++;
        }
        sections.push({ type: 'list', items: listItems });
      }
      // Check for code blocks
      else if (line.includes('```')) {
        let code = '';
        i++;
        while (i < lines.length && !lines[i].includes('```')) {
          code += lines[i] + '\n';
          i++;
        }
        sections.push({ type: 'code', content: code });
        i++;
      }
      // Regular paragraphs
      else if (line.trim()) {
        sections.push({ type: 'p', content: line });
        i++;
      } else {
        i++;
      }
    }

    return sections;
  };

  const renderInline = (text) => {
    return (
      <span>
        {text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`|\[.*?\]\(.*?\))/g).map((part, idx) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={idx} className="font-bold text-slate-50">{part.slice(2, -2)}</strong>;
          } else if (part.startsWith('*') && part.endsWith('*')) {
            return <em key={idx} className="italic text-slate-200">{part.slice(1, -1)}</em>;
          } else if (part.startsWith('`') && part.endsWith('`')) {
            return (
              <code key={idx} className="bg-slate-950 px-2 py-1 rounded font-mono text-green-400 text-sm border border-slate-700">
                {part.slice(1, -1)}
              </code>
            );
          } else if (part.startsWith('[') && part.includes('](')) {
            const match = part.match(/\[(.*?)\]\((.*?)\)/);
            if (match) {
              return (
                <a
                  key={idx}
                  href={match[2]}
                  className="text-indigo-400 hover:text-indigo-300 underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {match[1]}
                </a>
              );
            }
            return part;
          }
          return part;
        })}
      </span>
    );
  };

  const sections = parseMarkdown(content);

  return (
    <div className="space-y-4">
      {sections.map((section, idx) => {
        switch (section.type) {
          case 'h1':
            return (
              <h1 key={idx} className="text-2xl font-bold text-indigo-100 mt-8 mb-4">
                {renderInline(section.content)}
              </h1>
            );
          case 'h2':
            return (
              <h2 key={idx} className="text-xl font-bold text-indigo-200 mt-6 mb-3">
                {renderInline(section.content)}
              </h2>
            );
          case 'h3':
            return (
              <h3 key={idx} className="text-lg font-bold text-indigo-300 mt-4 mb-2">
                {renderInline(section.content)}
              </h3>
            );
          case 'p':
            return (
              <p key={idx} className="my-3 text-slate-300 leading-relaxed">
                {renderInline(section.content)}
              </p>
            );
          case 'list':
            return (
              <ul key={idx} className="list-disc ml-6 space-y-1 my-3">
                {section.items.map((item, itemIdx) => (
                  <li key={itemIdx} className="text-slate-200">
                    {renderInline(item)}
                  </li>
                ))}
              </ul>
            );
          case 'code':
            return (
              <pre key={idx} className="bg-slate-950 p-4 rounded-lg overflow-x-auto text-sm font-mono text-green-400 my-4 border border-slate-700">
                <code>{section.content}</code>
              </pre>
            );
          case 'table':
            return (
              <div key={idx} className="overflow-x-auto my-4">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-800">
                      {section.headers.map((header, hIdx) => (
                        <th
                          key={hIdx}
                          className="border border-slate-700 px-4 py-2 text-left font-semibold text-indigo-300"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {section.rows.map((row, rIdx) => (
                      <tr key={rIdx} className={rIdx % 2 === 0 ? 'bg-slate-900' : 'bg-slate-850'}>
                        {row.map((cell, cIdx) => (
                          <td
                            key={cIdx}
                            className="border border-slate-700 px-4 py-2 text-slate-200"
                          >
                            {renderInline(cell)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          default:
            return null;
        }
      })}
    </div>
  );
};

export default MarkdownRenderer;
