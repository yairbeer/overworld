import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, Music, Send, Loader2, Sparkles } from 'lucide-react';

const App = () => {
  const [activeTab, setActiveTab] = useState('images');
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

useEffect(() => {
  const switchModel = async () => {
    try {
      await fetch(`http://localhost:8000/switch-context/${activeTab}`, { method: 'POST' });
      console.log(`Backend swapped to ${activeTab}`);
    } catch (err) {
      console.error("Failed to switch model context");
    }
  };

  switchModel();
  setResult(null); 
}, [activeTab]);

useEffect(() => {
  // Send a heartbeat every 5 seconds
  const interval = setInterval(() => {
    fetch('http://localhost:8000/heartbeat', { method: 'POST' })
      .catch(() => console.log("Backend offline"));
  }, 5000);

  return () => clearInterval(interval); // Clean up on component unmount
}, []);

const handleGenerate = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        prompt: prompt,
        type: activeTab
      });
      
      const response = await fetch(`http://localhost:8000/generate?${params}`, { 
        method: 'POST'
      });
      
      if (!response.ok) throw new Error('Generation failed');
      
      const data = await response.json();
      setResult(data.path);
    } catch (err) {
      console.error("Generation error:", err);
      alert(`Failed to generate ${activeTab}. Check console.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-8">
      {/* Header */}
      <header className="max-w-4xl mx-auto mb-12 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <Sparkles size={24} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">overworld <span className="text-indigo-400 text-sm font-mono">v0.1</span></h1>
        </div>
        <div className="text-slate-400 text-sm">RTX 4060 Optimized</div>
      </header>

      <main className="max-w-4xl mx-auto">
        {/* Tab Navigation */}
        <div className="flex gap-2 mb-8 bg-slate-900 p-1 rounded-xl w-fit">
          <button 
            onClick={() => setActiveTab('images')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg transition-all ${activeTab === 'images' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
          >
            <ImageIcon size={18} />
            <span>Assets</span>
          </button>
          <button 
            onClick={() => setActiveTab('music')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg transition-all ${activeTab === 'music' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
          >
            <Music size={18} />
            <span>Audio</span>
          </button>
        </div>

        {/* Generator Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-400 mb-2">
              {activeTab === 'images' ? 'Visual Prompt (Hex codes supported)' : 'Audio Prompt (Mood, Genre, BPM)'}
            </label>
            <textarea 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all h-32 resize-none"
              placeholder={activeTab === 'images' ? "e.g. 16-bit sprite, cybernetic knight, #00ffcc..." : "e.g. atmospheric dungeon synth, 80bpm, eerie..."}
            />
          </div>

          <button 
            onClick={handleGenerate}
            disabled={loading || !prompt}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-2 transition-all"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Send size={18} />}
            {loading ? 'Processing on GPU...' : 'Generate Artifact'}
          </button>
        </div>

        {/* Result Area */}
        <div className="mt-8">
          {result && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h3 className="text-sm font-medium text-slate-400 mb-4 uppercase tracking-wider">Generated Output</h3>
              {activeTab === 'images' ? (
                <img src={result} alt="Generated" className="w-full max-w-md mx-auto rounded-lg border border-slate-700 shadow-lg" />
              ) : (
                <div className="bg-slate-950 p-8 rounded-xl border border-slate-800 flex flex-col items-center gap-4">
                  <div className="w-full h-12 bg-indigo-900/20 rounded-full flex items-center px-4 overflow-hidden">
                    <div className="h-1 bg-indigo-500 w-full animate-pulse rounded-full" />
                  </div>
                  <p className="text-sm text-slate-500 font-mono">bgm_output_v1.wav</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;