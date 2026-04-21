import React, { useState, useEffect } from 'react';
import { Loader2, ChevronRight } from 'lucide-react';
import MarkdownRenderer from './MarkdownRenderer';

const StyleGuidePanel = () => {
  const [files, setFiles] = useState([]);
  const [colors, setColors] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showColors, setShowColors] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch file list
        const filesRes = await fetch('http://localhost:8000/style-guide/files');
        const filesData = await filesRes.json();
        setFiles(filesData.files);

        // Fetch colors
        const colorsRes = await fetch('http://localhost:8000/style-guide/colors');
        const colorsData = await colorsRes.json();
        setColors(colorsData.colors);

        // Select first file by default
        if (filesData.files.length > 0) {
          setSelectedFile(filesData.files[0].filename);
        }
      } catch (err) {
        console.error("Failed to fetch style guide data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchFileContent = async () => {
      if (!selectedFile) return;
      
      try {
        const res = await fetch(`http://localhost:8000/style-guide/file/${selectedFile}`);
        const data = await res.json();
        setFileContent(data.content);
      } catch (err) {
        console.error("Failed to fetch file content:", err);
      }
    };

    fetchFileContent();
  }, [selectedFile]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="animate-spin text-indigo-500" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* File Navigation */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h3 className="text-sm font-medium text-slate-400 mb-4 uppercase tracking-wider">Style Guide Documents</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {files.map((file) => (
            <button
              key={file.filename}
              onClick={() => setSelectedFile(file.filename)}
              className={`p-3 rounded-lg text-left text-sm transition-all ${
                selectedFile === file.filename
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <div className="font-medium truncate">{file.name.replace(/^\d+_/, '')}</div>
            </button>
          ))}
        </div>
      </div>

      {/* File Content */}
      {fileContent && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <MarkdownRenderer content={fileContent} />
        </div>
      )}

      {/* Color Palette Toggle */}
      <button
        onClick={() => setShowColors(!showColors)}
        className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-all text-left"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Color Palette</h3>
          <ChevronRight className={`transition-transform ${showColors ? 'rotate-90' : ''}`} />
        </div>
      </button>

      {/* Color Palette Table */}
      {showColors && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-slate-700">
                  <th className="px-4 py-3 text-left font-semibold text-indigo-300">Color</th>
                  <th className="px-4 py-3 text-left font-semibold text-indigo-300">Name</th>
                  <th className="px-4 py-3 text-left font-semibold text-indigo-300">Role</th>
                  <th className="px-4 py-3 text-left font-semibold text-indigo-300">Hex</th>
                  <th className="px-4 py-3 text-left font-semibold text-indigo-300">Usage</th>
                </tr>
              </thead>
              <tbody>
                {colors.map((color, idx) => (
                  <tr key={idx} className={`border-b border-slate-700 ${idx % 2 === 0 ? 'bg-slate-900' : 'bg-slate-850'}`}>
                    {/* Color Swatch Cell */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="border-2 border-slate-400 rounded p-0.5 bg-white">
                          <div
                            className="w-12 h-12 rounded"
                            style={{ backgroundColor: color.Hex }}
                            title={color.Hex}
                          />
                        </div>
                      </div>
                    </td>
                    {/* Name Cell */}
                    <td className="px-4 py-3 font-medium text-slate-100">
                      {color['Color Name']}
                    </td>
                    {/* Role Cell */}
                    <td className="px-4 py-3 text-slate-400 text-sm">
                      {color.Role}
                    </td>
                    {/* Hex Cell */}
                    <td className="px-4 py-3 font-mono text-slate-300 text-sm">
                      {color.Hex}
                    </td>
                    {/* Usage Cell */}
                    <td className="px-4 py-3 text-slate-400 text-sm">
                      {color.Usage}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default StyleGuidePanel;
