
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Waves, Droplets, Sprout, FlaskConical, BrainCircuit, Calculator,
  Info, TrendingUp, GlassWater, Activity, Microscope, ShieldAlert,
  Dna, PieChart, MapPin, Sparkles, FileSpreadsheet, FileSearch,
  CheckCircle2, ChevronRight, Zap, Bot, MessageSquareText, Copy,
  LayoutDashboard, ArrowRightLeft, Scale, Settings2, AlertCircle,
  Eye, Lock, ArrowDownUp, FileDown, Printer, ShieldCheck, Percent,
  Atom, AlertTriangle, User, Mail, Building, LogOut, Shield,
  KeyRound, Save, CloudCheck, Headphones, Send, Loader2, Globe, ExternalLink,
  Users, ListFilter, ShieldCheck as ShieldCheckIcon
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { WaterParams, WaterLimits, Researcher } from './types';
import { calculateIndices, getFullAssessment, DEFAULT_WQI_WEIGHTS, DEFAULT_WQI_LIMITS } from './services/hydrologyCalculations';
import { getAIAnalysis } from './services/geminiService';

const initialParams: WaterParams = {
  ph: 7.2, tds: 450, ec: 780, ca: 45, mg: 18, na: 60, k: 5, cl: 85, so4: 40, hco3: 180, no3: 12,
  fe: 0.1, mn: 0.05, f: 0.8, b: 0.3, po4: 0.02, do: 8.5, temp: 25,
  caco3: 150, sio2: 12, tss: 5, cu: 0.01,
  pb: 0.005, cd: 0.001, cr: 0.02, zn: 0.5, tc: 0, alk: 120
};

const App: React.FC = () => {
  const [researcher, setResearcher] = useState<Researcher | null>(null);
  const [loginForm, setLoginForm] = useState({ name: '', email: '', institution: '' });
  const [params, setParams] = useState<WaterParams>(initialParams);
  const [limits, setLimits] = useState<WaterLimits>(DEFAULT_WQI_LIMITS);
  const [activeTab, setActiveTab] = useState<'lab' | 'results' | 'ai' | 'standards' | 'dev'>('lab');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [location, setLocation] = useState<{lat: number, lng: number} | undefined>();
  
  // Admin Features
  const [adminKey, setAdminKey] = useState('');
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [allResearchers, setAllResearchers] = useState<Researcher[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedResearcher = localStorage.getItem('kh_researcher');
    if (savedResearcher) setResearcher(JSON.parse(savedResearcher));
    
    const savedParams = localStorage.getItem('kh_params');
    if (savedParams) setParams(JSON.parse(savedParams));

    const registry = JSON.parse(localStorage.getItem('kh_researcher_registry') || '[]');
    setAllResearchers(registry);

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      });
    }
  }, []);

  const results = useMemo(() => calculateIndices(params, limits as Record<string, number>, DEFAULT_WQI_WEIGHTS), [params, limits]);
  const assessment = useMemo(() => getFullAssessment(params, results), [params, results]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser: Researcher = { ...loginForm, loginDate: new Date().toISOString() };
    setResearcher(newUser);
    localStorage.setItem('kh_researcher', JSON.stringify(newUser));

    // Update Global Registry (Simulated)
    const registry = JSON.parse(localStorage.getItem('kh_researcher_registry') || '[]');
    const alreadyExists = registry.some((r: Researcher) => r.email === newUser.email);
    if (!alreadyExists) {
      const updatedRegistry = [...registry, newUser];
      localStorage.setItem('kh_researcher_registry', JSON.stringify(updatedRegistry));
      setAllResearchers(updatedRegistry);
    }
  };

  const handleLogout = () => {
    setResearcher(null);
    localStorage.removeItem('kh_researcher');
  };

  const handleAdminVerify = () => {
    if (adminKey === 'Kamal2025') {
      setIsAdminUnlocked(true);
    } else {
      alert('الرمز السري غير صحيح!');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const bstr = event.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(ws) as any[];
      if (data.length > 0) {
        const firstRow = data[0];
        const newParams = { ...params };
        Object.keys(initialParams).forEach(key => {
          if (firstRow[key.toUpperCase()] !== undefined) newParams[key as keyof WaterParams] = parseFloat(firstRow[key.toUpperCase()]);
        });
        setParams(newParams);
      }
    };
    reader.readAsBinaryString(file);
  };

  const runAI = async () => {
    setIsAnalyzing(true);
    const res = await getAIAnalysis(params, results, location);
    setAiAnalysis(res);
    setIsAnalyzing(false);
  };

  if (!researcher) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 font-arabic">
        <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-3xl p-10 rounded-[4rem] border border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.6)]">
          <div className="flex flex-col items-center gap-4 mb-8">
            <div className="bg-sky-500/80 p-5 rounded-[2.5rem] shadow-2xl animate-pulse">
              <Droplets className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-4xl font-black text-white drop-shadow-lg text-center">Kamal <span className="text-sky-400">Hydro</span></h1>
            <p className="text-[10px] text-sky-200/40 font-black uppercase tracking-[0.3em] text-center">بوابة أبحاث جودة المياه</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-5">
            <input type="text" placeholder="اسم الباحث" required className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-xs font-bold text-white focus:ring-2 ring-sky-500 outline-none transition-all shadow-inner placeholder:text-white/20" value={loginForm.name} onChange={e=>setLoginForm({...loginForm, name: e.target.value})} />
            <input type="email" placeholder="البريد الإلكتروني" required className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-xs font-bold text-white focus:ring-2 ring-sky-500 outline-none transition-all shadow-inner placeholder:text-white/20" value={loginForm.email} onChange={e=>setLoginForm({...loginForm, email: e.target.value})} />
            <input type="text" placeholder="الجامعة أو المؤسسة" className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-xs font-bold text-white focus:ring-2 ring-sky-500 outline-none transition-all shadow-inner placeholder:text-white/20" value={loginForm.institution} onChange={e=>setLoginForm({...loginForm, institution: e.target.value})} />
            <button type="submit" className="w-full bg-gradient-to-r from-sky-600 to-sky-700 hover:from-sky-700 hover:to-sky-800 p-5 rounded-2xl text-sm font-black text-white shadow-2xl shadow-sky-600/20 transition-all flex items-center justify-center gap-3 mt-6">
              دخول البوابة <ChevronRight className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-arabic">
      <header className="bg-slate-900/60 backdrop-blur-2xl border-b border-white/5 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-sky-600 p-2.5 rounded-2xl shadow-lg shadow-sky-600/20"><Droplets className="w-5 h-5 text-white" /></div>
            <h1 className="text-2xl font-black text-white">Kamal <span className="text-sky-400">Hydrology</span></h1>
          </div>
          <nav className="hidden md:flex bg-white/5 p-1.5 rounded-2xl border border-white/10">
            {[
              { id: 'lab', label: 'المختبر', icon: Microscope },
              { id: 'results', label: 'النتائج', icon: PieChart },
              { id: 'ai', label: 'الذكاء الاصطناعي', icon: Bot },
              { id: 'standards', label: 'المعايير', icon: Settings2 },
              { id: 'dev', label: 'الإطلاق', icon: Globe },
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`px-5 py-2.5 rounded-xl text-[11px] font-black flex items-center gap-2 transition-all ${activeTab === tab.id ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/20' : 'text-slate-400 hover:text-sky-400'}`}>
                <tab.icon className="w-4 h-4" /> {tab.label}
              </button>
            ))}
          </nav>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-start text-right">
              <span className="text-[11px] font-black text-white">{researcher.name}</span>
              <span className="text-[9px] font-bold text-sky-400/70">{researcher.institution}</span>
            </div>
            <button onClick={handleLogout} className="p-3 bg-red-500/10 backdrop-blur text-red-400 hover:text-red-500 hover:bg-red-500/20 rounded-2xl transition-all"><LogOut className="w-5 h-5" /></button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-6 flex-1">
        {activeTab === 'lab' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div onClick={() => fileInputRef.current?.click()} className="bg-white/10 backdrop-blur-xl p-10 rounded-[3rem] border-2 border-dashed border-white/20 flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-sky-500 hover:bg-sky-500/10 transition-all group shadow-2xl">
                <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
                <div className="bg-sky-500/20 p-4 rounded-3xl group-hover:scale-110 transition-transform">
                  <FileSpreadsheet className="w-10 h-10 text-sky-400" />
                </div>
                <p className="text-xs font-black text-sky-100/60">استيراد بيانات Excel</p>
              </div>
              <div className="md:col-span-3 bg-white/10 backdrop-blur-xl p-10 rounded-[3.5rem] border border-white/10 shadow-2xl">
                <h3 className="text-lg font-black mb-8 flex items-center gap-3 text-sky-300 border-b border-white/5 pb-4"><FlaskConical className="w-6 h-6" /> التحليل الكيميائي للمياه</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-5">
                  {Object.keys(initialParams).map(key => (
                    <div key={key} className="bg-black/20 p-4 rounded-2xl border border-white/5 hover:border-sky-400 transition-all shadow-sm">
                      <label className="text-[10px] font-black text-sky-200/30 uppercase block mb-1.5">{key}</label>
                      <input type="number" className="w-full bg-transparent font-mono text-xs font-black text-white outline-none" value={(params as any)[key]} onChange={e=>setParams({...params, [key]: parseFloat(e.target.value) || 0})} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'results' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in zoom-in-95 duration-700">
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white/10 backdrop-blur-xl p-10 rounded-[3.5rem] border border-white/10 shadow-2xl">
                <h3 className="text-lg font-black mb-8 flex items-center gap-3 text-sky-300 border-b border-white/5 pb-4"><TrendingUp className="w-6 h-6" /> مؤشرات جودة المياه (Indices)</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                   {[
                     { label: 'WQI (جودة المياه)', val: results.wqi.toFixed(2), unit: '', desc: 'مؤشر جودة المياه العام' },
                     { label: 'SAR (الصوديوم)', val: results.sar.toFixed(2), unit: '', desc: 'خطر الصوديوم على التربة' },
                     { label: 'RSC (الكربونات)', val: results.rsc.toFixed(2), unit: 'meq/L', desc: 'الكربونات المتبقية' },
                     { label: 'TH (العسرة)', val: results.th.toFixed(1), unit: 'mg/L', desc: 'العسرة الكلية' },
                     { label: 'PI (النفاذية)', val: results.pi.toFixed(2), unit: '%', desc: 'مؤشر النفاذية' },
                     { label: 'KR (كيللي)', val: results.kr.toFixed(2), unit: '', desc: 'نسبة كيللي' }
                   ].map(item => (
                     <div key={item.label} className="bg-black/30 backdrop-blur p-7 rounded-[2.5rem] border border-white/5 hover:bg-sky-500/10 hover:-translate-y-1 transition-all">
                        <p className="text-[11px] font-black text-sky-200/40 mb-1">{item.label}</p>
                        <p className="text-3xl font-black text-white">{item.val} <span className="text-[10px] opacity-40 font-bold">{item.unit}</span></p>
                        <p className="text-[9px] font-bold text-sky-200/20 mt-3 leading-relaxed">{item.desc}</p>
                     </div>
                   ))}
                </div>
              </div>
            </div>

            <div className="bg-slate-900/90 backdrop-blur-3xl rounded-[3.5rem] p-10 text-white shadow-3xl h-fit border border-white/5">
              <h3 className="text-lg font-black flex items-center gap-3 text-sky-400 border-b border-white/5 pb-4"><Atom className="w-6 h-6" /> توازن الأيونات (Ion Balance)</h3>
              <div className="flex-1 flex flex-col items-center justify-center text-center py-6">
                 <div className={`w-40 h-40 rounded-full border-8 flex flex-col items-center justify-center mb-6 transition-all shadow-[0_0_50px_rgba(56,189,248,0.2)] ${Math.abs(results.ionBalanceError) < 5 ? 'border-emerald-500 shadow-emerald-500/20' : 'border-red-500 shadow-red-500/20'}`}>
                    <span className="text-4xl font-black">{results.ionBalanceError.toFixed(2)}%</span>
                    <span className="text-[10px] font-black uppercase mt-1">Error</span>
                 </div>
                 <p className="text-xs font-bold text-slate-400 px-4">نسبة الخطأ المقبولة عالمياً ±5% لضمان دقة البيانات المخبرية.</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'ai' && (
          <div className="max-w-5xl mx-auto space-y-8 animate-in slide-in-from-top-8 duration-700">
             <div className="bg-white/10 backdrop-blur-xl p-12 rounded-[4rem] border border-white/10 shadow-2xl">
                <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-6">
                   <div className="flex items-center gap-5">
                      <div className="bg-sky-600 p-4 rounded-[1.5rem] shadow-xl"><Sparkles className="w-8 h-8 text-white" /></div>
                      <div>
                        <h3 className="text-2xl font-black text-white">المحلل الذكي للباحثين</h3>
                        <p className="text-[11px] font-black text-sky-200/40 uppercase tracking-widest">Hydrology AI Lab</p>
                      </div>
                   </div>
                   <button onClick={runAI} disabled={isAnalyzing} className="bg-gradient-to-r from-sky-600 to-indigo-700 text-white px-10 py-4 rounded-[1.5rem] text-sm font-black hover:scale-105 active:scale-95 disabled:opacity-50 transition-all flex items-center gap-3 shadow-2xl shadow-sky-600/30">
                      {isAnalyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
                      بدء التحليل البحثي المعمق
                   </button>
                </div>

                {aiAnalysis ? (
                  <div className="prose prose-invert max-w-none text-[13px] font-bold leading-relaxed whitespace-pre-wrap bg-black/40 backdrop-blur p-10 rounded-[3rem] border border-white/5 shadow-inner">
                    {aiAnalysis}
                  </div>
                ) : (
                  <div className="h-80 flex flex-col items-center justify-center text-sky-200/20 gap-6 border-4 border-dashed border-white/5 rounded-[4rem] bg-black/20">
                     <Bot className="w-20 h-20" />
                     <p className="text-sm font-black">بانتظار بدء التحليل لتوليد تقرير علمي لرسائل الماجستير والدكتوراه</p>
                  </div>
                )}
             </div>
          </div>
        )}

        {activeTab === 'dev' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 animate-in zoom-in-95 duration-700">
             {/* Admin Stats Section */}
             <div className="bg-white/10 backdrop-blur-xl rounded-[4rem] p-12 border border-white/10 shadow-2xl flex flex-col">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-black text-sky-300 flex items-center gap-4"><Users className="w-8 h-8" /> إحصائيات الباحثين</h3>
                  {!isAdminUnlocked && (
                    <div className="flex gap-2">
                       <input 
                         type="password" 
                         placeholder="الرمز السري" 
                         className="bg-white/5 border border-white/10 p-2 rounded-xl text-[10px] text-white outline-none w-24" 
                         value={adminKey}
                         onChange={e=>setAdminKey(e.target.value)}
                       />
                       <button onClick={handleAdminVerify} className="bg-sky-600 p-2 rounded-xl hover:bg-sky-500 transition-all">
                         <KeyRound className="w-4 h-4 text-white" />
                       </button>
                    </div>
                  )}
                </div>

                {isAdminUnlocked ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                       <div className="bg-sky-500/10 p-6 rounded-[2rem] border border-sky-500/20 text-center">
                          <p className="text-[10px] font-black text-sky-200/40 uppercase mb-2">إجمالي المسجلين</p>
                          <p className="text-4xl font-black text-white">{allResearchers.length}</p>
                       </div>
                       <div className="bg-emerald-500/10 p-6 rounded-[2rem] border border-emerald-500/20 text-center">
                          <p className="text-[10px] font-black text-emerald-200/40 uppercase mb-2">نشط الآن</p>
                          <p className="text-4xl font-black text-white">1</p>
                       </div>
                    </div>
                    
                    <div className="bg-black/20 rounded-[2rem] p-6 border border-white/5 max-h-[300px] overflow-y-auto">
                       <p className="text-[10px] font-black text-sky-300 mb-4 border-b border-white/5 pb-2">قائمة الباحثين الأخيرة</p>
                       <div className="space-y-4">
                          {allResearchers.length > 0 ? allResearchers.map((r, idx) => (
                            <div key={idx} className="flex items-center justify-between border-b border-white/5 pb-2 last:border-0">
                               <div className="flex flex-col">
                                  <span className="text-[11px] font-black text-white">{r.name}</span>
                                  <span className="text-[9px] text-sky-200/40">{r.institution}</span>
                               </div>
                               <span className="text-[8px] text-slate-500">{new Date(r.loginDate).toLocaleDateString()}</span>
                            </div>
                          )) : (
                            <p className="text-[10px] text-center text-slate-500">لا يوجد باحثون مسجلون بعد.</p>
                          )}
                       </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-slate-500 gap-4">
                     <Lock className="w-12 h-12 opacity-20" />
                     <p className="text-xs font-bold text-center">أدخل الرمز السري للوصول إلى بيانات الباحثين المسجلين في المنصة.</p>
                  </div>
                )}
             </div>

             <div className="bg-gradient-to-br from-slate-900 to-sky-950 rounded-[4rem] p-12 text-white shadow-3xl flex flex-col justify-between border border-white/5">
                <div>
                   <h2 className="text-3xl font-black mb-6 text-sky-300">نظام الإطلاق</h2>
                   <p className="text-base font-bold opacity-80 leading-relaxed mb-10">هذه المنطقة مخصصة لمطور المنصة للتحقق من جاهزية النظام للإطلاق العالمي.</p>
                   <ul className="space-y-6">
                      <li className="flex items-center gap-4 text-sm font-bold bg-white/5 p-4 rounded-2xl border border-white/10"><ShieldCheckIcon className="w-6 h-6 text-emerald-400" /> تتبع الباحثين عبر السجل الرقمي.</li>
                      <li className="flex items-center gap-4 text-sm font-bold bg-white/5 p-4 rounded-2xl border border-white/10"><CheckCircle2 className="w-6 h-6 text-emerald-400" /> نظام الإحصائيات الفورية (Admin).</li>
                      <li className="flex items-center gap-4 text-sm font-bold bg-white/5 p-4 rounded-2xl border border-white/10"><CheckCircle2 className="w-6 h-6 text-emerald-400" /> واجهة برمجية (API) مؤمنة بالكامل.</li>
                   </ul>
                </div>
                <div className="mt-12 p-6 bg-black/40 rounded-[2rem] border border-white/5 text-center">
                   <p className="text-[11px] font-black mb-3 opacity-30 uppercase tracking-widest">مستوى الوصول الحالي:</p>
                   <span className="text-xs font-black text-sky-400 bg-sky-400/10 px-4 py-2 rounded-full border border-sky-400/20">Master Developer Account</span>
                </div>
             </div>
          </div>
        )}
      </main>

      <footer className="bg-slate-900/60 backdrop-blur-md border-t border-white/5 py-6 px-6 text-center text-[11px] font-black text-sky-200/20 uppercase tracking-[0.4em]">
        <div className="flex flex-col md:flex-row items-center justify-center gap-2">
          <span>Kamal Hydrology Research Platform</span>
          <span className="hidden md:inline">|</span>
          <span>© {new Date().getFullYear()} - جودة المياه وصلاحيتها</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
