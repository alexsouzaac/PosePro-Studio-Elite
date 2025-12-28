
import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Camera, 
  Upload, 
  Loader2, 
  Download, 
  RefreshCw,
  XCircle,
  Zap,
  Sparkles,
  CheckCircle2,
  Fingerprint,
  ShieldAlert,
  Aperture,
  Target,
  Shield,
  Focus
} from 'lucide-react';
import { POSE_PROMPTS } from './constants';
import { PosePrompt, Category } from './types';
import { generateStudioPortrait } from './geminiService';

const CATEGORIES: Category[] = [
  'All', 'Executive', 'Fashion', 'Casual', 'Action', 'Duo'
];

export default function App() {
  const [selectedCategory, setSelectedCategory] = useState<Category>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPose, setSelectedPose] = useState<PosePrompt | null>(null);
  const [uploadedImage1, setUploadedImage1] = useState<string | null>(null);
  const [uploadedImage2, setUploadedImage2] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationResult, setGenerationResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filteredPoses = useMemo(() => {
    return POSE_PROMPTS.filter(p => {
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           p.poseTechnical.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, slot: 1 | 2) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (slot === 1) setUploadedImage1(reader.result as string);
        else setUploadedImage2(reader.result as string);
        setGenerationResult(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!uploadedImage1 || !selectedPose) return;
    if (selectedPose.isDuo && !uploadedImage2) {
      setError("Esta pose requer duas fotos para composição de dupla.");
      return;
    }

    setIsGenerating(true);
    setError(null);
    try {
      const result = await generateStudioPortrait(uploadedImage1, uploadedImage2, selectedPose.prompt);
      setGenerationResult(result);
    } catch (err: any) {
      setError(err.message || 'Erro no processamento da pose.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen pb-20 bg-[#020202] text-zinc-100 selection:bg-orange-500/30">
      <header className="sticky top-0 z-50 glass-card px-8 py-5 border-b border-white/5">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-orange-600 to-red-700 p-3 rounded-2xl shadow-lg shadow-orange-900/20">
              <Camera className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tighter uppercase italic">
                PosePro <span className="text-orange-500">Elite</span>
              </h1>
              <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-[0.3em]">Studio Library V2.0 • Anatomy & Pose Transfer</p>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-4 flex-1 max-w-xl mx-12">
            <div className="relative w-full">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
              <input 
                type="text"
                placeholder="Busque por 'Sentado', 'Braços cruzados', 'Mão no queixo'..."
                className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl py-3.5 pl-12 pr-6 focus:outline-none focus:ring-2 focus:ring-orange-500/30 transition-all text-xs placeholder:text-zinc-700 font-medium"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
             <div className="hidden sm:flex px-4 py-2 bg-orange-500/10 border border-orange-500/20 rounded-full items-center gap-2">
                <Target className="w-3.5 h-3.5 text-orange-500" />
                <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Pose Mapping Ativo</span>
             </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* BIBLIOTECA DE POSES */}
          <div className="lg:col-span-8 space-y-8">
            <div className="flex items-center gap-2 overflow-x-auto pb-4 no-scrollbar">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${
                    selectedCategory === cat 
                    ? 'bg-orange-600 border-orange-500 text-white shadow-lg shadow-orange-900/40' 
                    : 'bg-zinc-900/40 text-zinc-500 border-white/5 hover:border-white/10 hover:text-zinc-300'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredPoses.map((pose) => (
                <button
                  key={pose.id}
                  onClick={() => {setSelectedPose(pose); setGenerationResult(null); setError(null);}}
                  className={`group relative flex flex-col rounded-[2.5rem] overflow-hidden border-2 transition-all duration-500 bg-zinc-900/40 ${
                    selectedPose?.id === pose.id ? 'border-orange-500 scale-[0.98] ring-8 ring-orange-500/10' : 'border-transparent hover:border-white/10'
                  }`}
                >
                  <div className="aspect-[4/5] overflow-hidden relative">
                    <img src={pose.thumbnail} alt={pose.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#020202] via-transparent to-transparent opacity-60" />
                    
                    <div className="absolute top-4 left-4">
                      <div className="px-3 py-1 bg-black/80 backdrop-blur-md text-white text-[8px] font-black uppercase tracking-widest rounded-full border border-white/10 flex items-center gap-1.5">
                        <Focus className="w-2.5 h-2.5 text-orange-500" /> ANATOMY GUIDE
                      </div>
                    </div>
                  </div>

                  <div className="p-6 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-orange-500/10 text-orange-500 border border-orange-500/20 text-[7px] font-black uppercase tracking-[0.2em] rounded">{pose.category}</span>
                    </div>
                    <h3 className="text-white text-sm font-black uppercase tracking-tight leading-none">{pose.title}</h3>
                    <p className="text-[10px] text-zinc-500 font-medium leading-relaxed italic border-l border-orange-500/30 pl-3">
                      "{pose.poseTechnical}"
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* PAINEL DE CONTROLE */}
          <div className="lg:col-span-4 lg:sticky lg:top-32 h-fit">
            <div className="glass-card rounded-[2.5rem] p-8 lg:p-10 space-y-8 border border-white/10 shadow-3xl max-h-[calc(100vh-160px)] overflow-y-auto no-scrollbar">
              <div className="space-y-3 text-center">
                <div className="flex items-center justify-center gap-2 text-orange-500">
                   <Fingerprint className="w-4 h-4 animate-pulse" />
                   <span className="text-[10px] font-black uppercase tracking-[0.4em]">Biometric Pose Transfer</span>
                </div>
                <h2 className="text-4xl font-black italic tracking-tighter uppercase leading-none">Studio <span className="text-orange-500">Master</span></h2>
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em] leading-relaxed">Preservando sua face em poses profissionais.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="text-[8px] font-black text-center text-zinc-600 uppercase tracking-widest">Sua Foto</div>
                  {!uploadedImage1 ? (
                    <label className="flex flex-col items-center justify-center aspect-square border-2 border-dashed border-zinc-800 rounded-3xl hover:border-orange-500/50 cursor-pointer bg-zinc-900/30 hover:bg-orange-500/5 transition-all group overflow-hidden">
                      <Upload className="w-5 h-5 text-zinc-700 mb-2 group-hover:text-orange-500 transition-colors" />
                      <span className="text-[7px] font-bold text-zinc-600 uppercase text-center px-4 italic tracking-tighter leading-tight">Escolher Foto</span>
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 1)} />
                    </label>
                  ) : (
                    <div className="relative rounded-3xl overflow-hidden aspect-square border-2 border-orange-500 group shadow-lg shadow-orange-500/20">
                      <img src={uploadedImage1} className="w-full h-full object-cover" />
                      <button onClick={() => setUploadedImage1(null)} className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all"><XCircle className="w-8 h-8 text-white" /></button>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="text-[8px] font-black text-center text-zinc-600 uppercase tracking-widest">Duo Subject</div>
                  {!uploadedImage2 ? (
                    <label className={`flex flex-col items-center justify-center aspect-square border-2 border-dashed border-zinc-800 rounded-3xl cursor-pointer bg-zinc-900/30 transition-all ${selectedPose?.isDuo ? 'border-orange-500/40 bg-orange-500/5 animate-pulse shadow-lg shadow-orange-500/5' : 'hover:border-zinc-700'}`}>
                      <Upload className="w-5 h-5 text-zinc-700 mb-2" />
                      <span className="text-[7px] font-bold text-zinc-600 uppercase text-center px-4 italic tracking-tighter leading-tight">{selectedPose?.isDuo ? 'Obrigatório' : 'Opcional'}</span>
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 2)} />
                    </label>
                  ) : (
                    <div className="relative rounded-3xl overflow-hidden aspect-square border-2 border-white/10 group">
                      <img src={uploadedImage2} className="w-full h-full object-cover" />
                      <button onClick={() => setUploadedImage2(null)} className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all"><XCircle className="w-8 h-8 text-white" /></button>
                    </div>
                  )}
                </div>
              </div>

              {selectedPose ? (
                <div className="bg-zinc-900/80 p-6 rounded-3xl border border-white/5 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest italic flex items-center gap-2">
                       <Aperture className="w-3 h-3" /> Pose Selecionada
                    </span>
                  </div>
                  <div className="flex gap-4 items-start">
                    <div className="w-20 h-24 rounded-2xl overflow-hidden border border-white/10 shrink-0 shadow-xl relative">
                      <img src={selectedPose.thumbnail} className="w-full h-full object-cover" />
                    </div>
                    <div className="space-y-1.5 pt-1">
                      <div className="text-[11px] font-black text-white uppercase tracking-tight">{selectedPose.title}</div>
                      <p className="text-[8px] text-zinc-500 font-bold uppercase leading-tight italic">
                        A IA irá mapear seu rosto nesta anatomia específica.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                 <div className="py-10 text-center border border-dashed border-zinc-800 rounded-3xl bg-zinc-900/10">
                    <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest px-8">Selecione uma pose guia na biblioteca</p>
                 </div>
              )}

              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-500 text-[9px] font-bold uppercase tracking-wider">
                  <ShieldAlert className="w-5 h-5 shrink-0" />
                  {error}
                </div>
              )}

              <div className="space-y-4 pt-4">
                <button
                  disabled={!uploadedImage1 || !selectedPose || (selectedPose.isDuo && !uploadedImage2) || isGenerating}
                  onClick={handleGenerate}
                  className={`w-full py-7 rounded-2xl font-black uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 text-[12px] shadow-2xl ${
                    !uploadedImage1 || !selectedPose || (selectedPose.isDuo && !uploadedImage2)
                    ? 'bg-zinc-900 text-zinc-700 cursor-not-allowed border border-white/5'
                    : 'bg-white text-black hover:bg-orange-600 hover:text-white hover:scale-[1.02] active:scale-95'
                  }`}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      REMAPEANDO ANATOMIA...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      GERAR STUDIO MASTER
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {generationResult && (
        <div className="fixed inset-0 z-[100] bg-black/98 flex items-center justify-center p-6 lg:p-12 backdrop-blur-3xl animate-in fade-in zoom-in duration-500">
           <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-24 items-center">
            <div className="aspect-square rounded-[4rem] overflow-hidden border-8 border-white/5 shadow-4xl bg-zinc-900 relative mx-auto lg:mx-0 w-full max-w-2xl">
              <img src={generationResult} className="w-full h-full object-cover" />
              <div className="absolute top-8 left-8 flex flex-col gap-3">
                 <span className="px-5 py-2 bg-orange-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-xl">STUDIO MASTER 8K</span>
                 <div className="px-4 py-1.5 bg-black/60 backdrop-blur-md text-white/80 text-[8px] font-black uppercase tracking-[0.2em] rounded-full border border-white/10 w-fit">ANATOMY TRANSFERRED</div>
              </div>
            </div>

            <div className="flex flex-col justify-center space-y-12">
              <div className="space-y-8">
                <div className="inline-flex items-center gap-3 px-6 py-2.5 bg-green-500/10 text-green-400 text-[11px] font-black uppercase tracking-[0.4em] rounded-full border border-green-500/20">
                  <CheckCircle2 className="w-4 h-4" />
                  POSE CONCLUÍDA
                </div>
                <h3 className="text-7xl lg:text-9xl font-black uppercase italic tracking-tighter text-white leading-[0.85] -ml-2">Result <span className="text-orange-500">Elite</span></h3>
                <p className="text-zinc-400 text-lg lg:text-2xl font-medium leading-relaxed max-w-xl italic border-l-4 border-orange-500 pl-8">
                  "Sua identidade foi perfeitamente integrada à pose '{selectedPose?.title}'. A anatomia do corpo e a iluminação volumétrica seguem o padrão Master 8K."
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-6">
                <button 
                  onClick={() => { const link = document.createElement('a'); link.href = generationResult; link.download = 'posepro-master.png'; link.click(); }} 
                  className="flex-1 py-8 bg-white text-black font-black uppercase tracking-[0.3em] rounded-[2.5rem] flex items-center justify-center gap-4 hover:bg-orange-600 hover:text-white transition-all text-lg shadow-2xl"
                >
                  <Download className="w-6 h-6" /> BAIXAR MASTER
                </button>
                <button 
                  onClick={() => setGenerationResult(null)} 
                  className="px-10 py-8 bg-zinc-900 text-white rounded-[2.5rem] border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all"
                >
                  <RefreshCw className="w-8 h-8" />
                </button>
              </div>
            </div>
          </div>
          <button onClick={() => setGenerationResult(null)} className="absolute top-10 right-10 text-white/20 hover:text-white transition-all scale-150"><XCircle className="w-10 h-10" /></button>
        </div>
      )}
    </div>
  );
}
