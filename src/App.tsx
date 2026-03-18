import React, { useState, useEffect } from 'react';
import { Download, Copy, Check, FileSpreadsheet, ExternalLink, FileText, Sparkles, Loader2, Search, Save, User } from 'lucide-react';
import { TableRow } from './data';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { GoogleGenAI, Type, ThinkingLevel } from "@google/genai";

interface ModelProfile {
  id: number;
  name: string;
  description: string;
  concept: string;
}

const DEFAULT_MODELS: ModelProfile[] = [
  { 
    id: 1,
    name: "Ari Espinoza", 
    description: "Es una modelo de belleza física excepcional y estilo peculiar, enfocada en shows sexuales explícitos de alto impacto, dominando categorías intensas como anal, garganta profunda, fetiche de pies y sexo en general.",
    concept: "Dominación intensa y fetiche de pies"
  },
  { 
    id: 2,
    name: "Jeimi Escobar", 
    description: "Es una atractiva modelo madura (MILF) de gran elegancia, especializada en fetiches de humillación (Cornudo/Cuckold) combinados con la adoración sofisticada de sus pies, medias y tacones.",
    concept: "Humillación sofisticada (Cuckold) y adoración de pies"
  },
  { 
    id: 3,
    name: "Liliana Delgado", 
    description: "Es una modelo Teen BBW de rostro muy bello, con una oferta versátil que combina shows enfocados en sus senos y blowjobs, junto con una fuerte línea de fetiches de dominación y sumisión (Kinky, Sissy, Cornudo y Pies).",
    concept: "Versatilidad BBW: Senos, Blowjobs y Dominación Kinky"
  },
  { 
    id: 4,
    name: "Natalia Novoa", 
    description: "Es una mujer que irradia sofisticación y glamour, destacando con una estética sumamente elegante y de alta gama para nichos de exclusividad y adoración VIP (Medias, Tacones y Diosa).",
    concept: "Elegancia de alta gama: Diosa en medias y tacones"
  },
  {
    id: 5,
    name: "Lorena Lopez",
    description: "Modelo Curvy muy experimentada y flexible que contrasta un look tierno e intelectual con shows de altísima intensidad, destacando sus senos grandes, el uso magistral de la fuckmachine y el contenido sexual de calidad, se identifican patrones de anal, blowjob, deepthroat y fetiches; como contenido exclusivo.",
    concept: "Contraste intelectual y shows de alta intensidad con fuckmachine"
  },
  {
    id: 6,
    name: "Valentina Botia",
    description: "Modelo de curvas impactantes que monetiza nichos explícitos de altísimo valor (anal y exclusividad de lactancia), complementando su intensa oferta con fetiche de pies, blowjob y juegos de roles.",
    concept: "Monetización de nichos explícitos de alto valor (Anal, Lactancia y Fetiches)"
  }
];

const INITIAL_DATA: TableRow[] = [
  { categoria: "Tema de Sala", opcion: "Opción 1", ingles: "Elegant teen & perfect feet worship ✨", espanol: "Teen elegante y adoración de pies perfectos ✨" },
  { categoria: "Tema de Sala", opcion: "Opción 2", ingles: "VIP Foot Lounge: Soft soles & glamour 🥂", espanol: "Salón VIP de Pies: Plantas suaves y glamour 🥂" },
  { categoria: "Objetivos", opcion: "100 tk", ingles: "Show my perfect pedicure", espanol: "Mostrar mi pedicura perfecta" },
  { categoria: "Objetivos", opcion: "300 tk", ingles: "Sweet smile & wiggle my toes", espanol: "Sonrisa dulce y mover mis deditos" },
  { categoria: "Objetivos", opcion: "500 tk", ingles: "Apply lotion to my soft soles", espanol: "Aplicar loción en mis plantas suaves" },
  { categoria: "Objetivos", opcion: "800 tk", ingles: "Elegant foot arch pose (Ballet)", espanol: "Pose elegante marcando el arco del pie (Ballet)" },
  { categoria: "Objetivos", opcion: "1000 tk", ingles: "Foot massage with warm oil", espanol: "Masaje de pies con aceite tibio" },
  { categoria: "Feed (Muro)", opcion: "Opción 1", ingles: "Gentlemen who appreciate perfect feet, your VIP lounge is waiting. Come worship my soft soles today. ✨🦶", espanol: "Caballeros que aprecian los pies perfectos, su salón VIP los espera. Vengan a adorar mis plantas suaves hoy. ✨🦶" },
  { categoria: "Feed (Muro)", opcion: "Opción 2", ingles: "Fresh pedicure and feeling glamorous. Who wants to be at my feet today? 🥂", espanol: "Pedicura fresca y sintiéndome glamurosa. ¿Quién quiere estar a mis pies hoy? 🥂" },
  { categoria: "Masivo (En Línea)", opcion: "Opción 1", ingles: "The VIP Foot Lounge is OPEN. Come admire my perfect toes and soft soles. ✨", espanol: "El salón VIP de Pies está ABIERTO. Ven a admirar mis dedos perfectos y plantas suaves. ✨" },
  { categoria: "Masivo (En Línea)", opcion: "Opción 2", ingles: "Calling all gentlemen with fine taste. My feet are ready for your worship. 🥂", espanol: "Llamando a todos los caballeros de buen gusto. Mis pies están listos para su adoración. 🥂" },
  { categoria: "Bot: Welcome", opcion: "Opción 1", ingles: "Welcome to the VIP Lounge! Sit back and admire my perfect feet. Tip to make my toes curl! ✨", espanol: "¡Bienvenido al Salón VIP! Ponte cómodo y admira mis pies perfectos. ¡Envía tips para encoger mis deditos! ✨" },
  { categoria: "Bot: Welcome", opcion: "Opción 2", ingles: "Hello handsome. Do you appreciate elegant foot worship? You are in the right place. 🥂", espanol: "Hola guapo. ¿Aprecias la adoración elegante de pies? Estás en el lugar correcto. 🥂" },
  { categoria: "Bot: Anuncios", opcion: "Opción 1", ingles: "Gentlemen, don't forget to follow and tip 50tk to spin the wheel for a close-up of my soles! 🎡", espanol: "¡Caballeros, no olviden seguirme y enviar 50tk para girar la ruleta por un primer plano de mis plantas! 🎡" },
  { categoria: "Bot: Anuncios", opcion: "Opción 2", ingles: "New content on my feed! Check it out and leave some love. 💋", espanol: "¡Nuevo contenido en mi muro! Échale un vistazo y deja algo de amor. 💋" },
];

const PROFILES = ["18 a 25", "25 - 35", "35 o más"];
const CATEGORIES = [
  "Natural", "Loly", "Glamour", "Fitness", "Brat", "BBW", 
  "Gothic", "Curvy", "Otaku", "Mistress", "HardCore",
  "Goddess", "Cosplay"
];

export default function App() {
  const [profile, setProfile] = useState('18 a 25');
  const [selectedCategory, setSelectedCategory] = useState('Natural');
  const [modelDescription, setModelDescription] = useState('');
  const [modelConcept, setModelConcept] = useState('');
  const [data, setData] = useState<TableRow[]>(INITIAL_DATA);
  const [loading, setLoading] = useState(false);
  const [quotaError, setQuotaError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [individualCopied, setIndividualCopied] = useState<string | null>(null);
  
  const [models, setModels] = useState<ModelProfile[]>([]);
  const [selectedModelId, setSelectedModelId] = useState<number | null>(null);
  const [savingModel, setSavingModel] = useState(false);
  const [isAddingModel, setIsAddingModel] = useState(false);
  const [newModelName, setNewModelName] = useState('');

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = () => {
    try {
      const savedModels = localStorage.getItem('webcam_models');
      let modelsData: ModelProfile[] = [];
      
      if (savedModels) {
        modelsData = JSON.parse(savedModels);
      } else {
        modelsData = DEFAULT_MODELS;
        localStorage.setItem('webcam_models', JSON.stringify(DEFAULT_MODELS));
      }
      
      setModels(modelsData);
      if (modelsData.length > 0) {
        const firstModel = modelsData[0];
        setSelectedModelId(firstModel.id);
        setModelDescription(firstModel.description);
        setModelConcept(firstModel.concept || '');
      }
    } catch (error) {
      console.error("Error fetching models:", error);
      setModels(DEFAULT_MODELS);
    }
  };

  const handleModelChange = (id: number) => {
    setSelectedModelId(id);
    const model = models.find(m => m.id === id);
    if (model) {
      setModelDescription(model.description);
      setModelConcept(model.concept || '');
    }
  };

  const saveModelDescription = () => {
    if (!selectedModelId) return;
    
    setSavingModel(true);
    try {
      const updatedModels = models.map(m => 
        m.id === selectedModelId 
          ? { ...m, description: modelDescription, concept: modelConcept } 
          : m
      );
      
      setModels(updatedModels);
      localStorage.setItem('webcam_models', JSON.stringify(updatedModels));
      
      // Small delay to show saving state
      setTimeout(() => setSavingModel(false), 500);
    } catch (error) {
      console.error("Error saving model:", error);
      setSavingModel(false);
    }
  };

  const addNewModel = () => {
    if (!newModelName.trim()) return;
    
    setSavingModel(true);
    try {
      const newModel: ModelProfile = {
        id: Date.now(),
        name: newModelName,
        description: '',
        concept: ''
      };
      
      const updatedModels = [...models, newModel];
      setModels(updatedModels);
      localStorage.setItem('webcam_models', JSON.stringify(updatedModels));
      
      setSelectedModelId(newModel.id);
      setModelDescription('');
      setModelConcept('');
      setIsAddingModel(false);
      setNewModelName('');
    } catch (error) {
      console.error("Error adding new model:", error);
    } finally {
      setSavingModel(false);
    }
  };

  const copyField = (text: string, id: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setIndividualCopied(id);
      setTimeout(() => setIndividualCopied(null), 2000);
    });
  };

  const generateContent = async () => {
    setLoading(true);
    setQuotaError(false);

    try {
      // Fetch history from localStorage to avoid repetition
      let historyContext = "";
      if (selectedModelId) {
        const savedHistory = localStorage.getItem(`history_${selectedModelId}`);
        if (savedHistory) {
          const historyData = JSON.parse(savedHistory);
          if (historyData.length > 0) {
            // Limit to last 3 entries to save tokens
            const recentHistory = historyData.slice(-3);
            historyContext = `CONTENIDO PREVIO GENERADO (NO REPETIR ESTAS FRASES O IDEAS): ${JSON.stringify(recentHistory)}`;
          }
        }
      }

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        config: {
          systemInstruction: `Eres un estratega senior de marketing y contenido para la industria webcam de alto nivel (Tribu 1126). 
          Tu lenguaje debe ser sofisticado, profesional, persuasivo y altamente específico del nicho. 
          Evita frases genéricas; utiliza psicología de ventas y terminología técnica real de la industria.
          Generas organigramas bilingües (Inglés/Español) con una calidad literaria y comercial impecable.
          CRÍTICO: Nunca repitas contenido generado anteriormente para este modelo.`,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                categoria: { type: Type.STRING },
                opcion: { type: Type.STRING },
                ingles: { type: Type.STRING },
                espanol: { type: Type.STRING },
              },
              required: ["categoria", "opcion", "ingles", "espanol"],
            },
          },
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        },
        contents: `Genera un organigrama estratégico diario de alto impacto para:
        - Modelo: ${models.find(m => m.id === selectedModelId)?.name || "General"}
        - Edad/Perfil: ${profile}
        - Estilo/Categoría: ${selectedCategory}
        - Descripción de la Modelo: ${modelDescription || "General"}
        - Concepto/Enfoque del Día: ${modelConcept || "General"}

        ${historyContext}

        Estructura obligatoria:
        1. Tema de Sala (2 opciones de alta conversión)
        2. Objetivos de Recaudación (5 niveles: 100, 500, 1000, 2000, 5000 tk). REQUISITO CRÍTICO: Frases cortas, directas y poderosas (MÁXIMO 40 CARACTERES), con alto impacto psicológico y lenguaje de ventas premium.
        3. Feed/Muro (2 posts estratégicos)
        4. Mensaje Masivo (2 líneas de venta agresivas y elegantes)
        5. Enfoque de Contenido (2 párrafos detallados sobre cómo ejecutar el concepto del día basado en la descripción de la modelo)
        6. Saludos Personalizados (2 opciones bilingües que rompan el hielo según el concepto)
        7. Invitaciones a Privado (2 llamados a la acción bilingües altamente persuasivos)
        8. Consejos Estratégicos (2 recomendaciones tácticas en español sobre actitud, iluminación o interacción para este enfoque específico)
        9. Bots de Bienvenida (2 mensajes de retención)
        10. Bot de Anuncio (2 llamados a la acción)

        Asegura que el tono sea coherente con un servicio premium y exclusivo. Para los 'Consejos Estratégicos', puedes dejar el campo de inglés vacío o poner una nota técnica.`,
      });

      const generatedData = JSON.parse(response.text);
      setData(generatedData);

      // Save to history in localStorage
      if (selectedModelId) {
        const savedHistory = localStorage.getItem(`history_${selectedModelId}`);
        let historyData = savedHistory ? JSON.parse(savedHistory) : [];
        historyData.push(generatedData);
        // Keep only last 10 entries in history
        if (historyData.length > 10) historyData.shift();
        localStorage.setItem(`history_${selectedModelId}`, JSON.stringify(historyData));
      }
    } catch (error: any) {
      console.error("Error generating content:", error);
      
      const errorStr = JSON.stringify(error);
      if (errorStr.includes("RESOURCE_EXHAUSTED") || errorStr.includes("429")) {
        setQuotaError(true);
      } else {
        alert("Hubo un error al generar el contenido. Por favor intenta de nuevo.");
      }
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Plan Diario');

    const headerRow = worksheet.addRow(['Categoría', 'Opción / Valor', 'Inglés', 'Español']);
    headerRow.eachCell((cell) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF141414' } };
      cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    });

    data.forEach(item => {
      const row = worksheet.addRow([item.categoria, item.opcion, item.ingles, item.espanol]);
      row.getCell(1).font = { bold: true };
      row.getCell(3).font = { italic: true };
      row.eachCell((cell) => {
        cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        cell.alignment = { vertical: 'middle', wrapText: true };
      });
    });

    worksheet.columns = [{ width: 20 }, { width: 20 }, { width: 50 }, { width: 50 }];

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `plan_${profile}_${selectedCategory}.xlsx`);
  };

  const exportToCSV = () => {
    const headers = ['Categoría', 'Opción / Valor', 'Inglés', 'Español'];
    const csvContent = [
      headers.join(','),
      ...data.map(row => [`"${row.categoria}"`, `"${row.opcion}"`, `"${row.ingles}"`, `"${row.espanol}"`].join(','))
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `plan_${profile}_${selectedCategory}.csv`);
  };

  const copyToClipboard = () => {
    const headers = ['Categoría', 'Opción / Valor', 'Inglés', 'Español'];
    const tsvContent = [
      headers.join('\t'),
      ...data.map(row => [row.categoria, row.opcion, row.ingles, row.espanol].join('\t'))
    ].join('\n');

    navigator.clipboard.writeText(tsvContent).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#f5f5f5] font-sans p-4 md:p-10 selection:bg-red-600 selection:text-white antialiased">
      <div className="max-w-7xl mx-auto">
        {/* Quota Error Banner */}
        {quotaError && (
          <div className="mb-8 p-6 bg-red-900/20 border border-red-500/30 rounded-2xl flex items-start gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="p-3 bg-red-500/20 rounded-xl text-red-500">
              <Sparkles size={24} />
            </div>
            <div className="flex-1">
              <h3 className="text-red-500 font-serif italic text-xl mb-1">Límite de IA Alcanzado</h3>
              <p className="text-red-500/70 text-sm leading-relaxed">
                Has excedido el límite de uso diario de la inteligencia artificial (Quota Exceeded). 
                Esto sucede debido a las restricciones de la versión gratuita de Gemini. 
                <br />
                <span className="font-bold">Solución:</span> Espera unos minutos e intenta de nuevo, o revisa tu plan en Google AI Studio.
              </p>
              <button 
                onClick={() => generateContent()}
                className="mt-4 px-6 py-2 bg-red-600 text-white rounded-full text-xs font-mono uppercase tracking-widest hover:bg-red-500 transition-all"
              >
                Reintentar Ahora
              </button>
            </div>
          </div>
        )}

        {/* Header Section */}
        <header className="mb-12 border-b border-red-900/20 pb-10 relative">
          <div className="absolute -top-20 -left-20 w-96 h-96 bg-red-600/5 blur-[150px] rounded-full pointer-events-none"></div>
          <div className="relative z-10 text-center lg:text-left">
            <h1 className="text-6xl md:text-8xl font-serif font-black tracking-tighter mb-4 text-white leading-none">
              Generador de <span className="text-red-600 italic font-medium">Contenido</span>
              <span className="block text-3xl md:text-4xl mt-2 font-sans font-light tracking-[0.1em] text-gray-400 uppercase">
                y Líneas de Venta
              </span>
            </h1>
            <div className="flex flex-col lg:flex-row items-center gap-4 mt-6">
              <div className="h-px w-12 bg-red-600 hidden lg:block"></div>
              <p className="text-xs md:text-sm uppercase tracking-[0.5em] text-red-500 font-mono font-medium">
                Organigrama Diario Webcam Pro • Tribu 1126
              </p>
            </div>
          </div>
        </header>

        {/* Configuration Panel */}
        <section className="mb-16 bg-[#111111] p-10 rounded-2xl border border-red-600/10 shadow-[0_0_80px_rgba(0,0,0,0.8)] relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity duration-700">
            <Sparkles size={200} className="text-red-600" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 relative z-10">
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <label className="text-[10px] uppercase font-mono tracking-[0.3em] text-red-600 font-bold">01. Modelo</label>
                <button 
                  onClick={() => setIsAddingModel(!isAddingModel)}
                  className="text-[10px] text-gray-500 hover:text-red-600 transition-colors uppercase font-mono"
                >
                  {isAddingModel ? 'Cancelar' : '+ Nueva'}
                </button>
              </div>
              
              {isAddingModel ? (
                <div className="flex gap-2">
                  <input 
                    type="text"
                    value={newModelName}
                    onChange={(e) => setNewModelName(e.target.value)}
                    placeholder="Nombre..."
                    className="flex-1 bg-[#0a0a0a] border border-red-600/30 p-4 font-sans text-sm focus:outline-none focus:border-red-600 text-white rounded-lg"
                  />
                  <button 
                    onClick={addNewModel}
                    disabled={savingModel}
                    className="p-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all disabled:opacity-50"
                  >
                    <Check size={16} />
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <select 
                    value={selectedModelId || ''}
                    onChange={(e) => handleModelChange(Number(e.target.value))}
                    className="w-full bg-[#0a0a0a] border border-white/5 p-4 font-sans text-base font-light focus:outline-none focus:border-red-600 text-white transition-all rounded-lg appearance-none cursor-pointer hover:bg-black"
                  >
                    {models.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-30">
                    <User size={14} />
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-4">
              <label className="text-[10px] uppercase font-mono tracking-[0.3em] text-red-600 font-bold">02. Edad</label>
              <div className="relative">
                <select 
                  value={profile}
                  onChange={(e) => setProfile(e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-white/5 p-4 font-sans text-base font-light focus:outline-none focus:border-red-600 text-white transition-all rounded-lg appearance-none cursor-pointer hover:bg-black"
                >
                  {PROFILES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-30">
                  <Search size={14} />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <label className="text-[10px] uppercase font-mono tracking-[0.3em] text-red-600 font-bold">03. Estilo / Categoría</label>
              <div className="relative">
                <select 
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-white/5 p-4 font-sans text-base font-light focus:outline-none focus:border-red-600 text-white transition-all rounded-lg appearance-none cursor-pointer hover:bg-black"
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-30">
                  <Search size={14} />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 md:col-span-2 lg:col-span-2">
              <label className="text-[10px] uppercase font-mono tracking-[0.3em] text-red-600 font-bold">04. Perfil / Descripción</label>
              <div className="relative">
                <textarea 
                  value={modelDescription}
                  onChange={(e) => setModelDescription(e.target.value)}
                  placeholder="Rasgos, personalidad, fetiches específicos..."
                  rows={5}
                  className="w-full bg-[#0a0a0a] border border-white/5 p-4 font-sans text-base font-light focus:outline-none focus:border-red-600 text-white transition-all rounded-lg placeholder:text-gray-700"
                />
              </div>
            </div>

            <div className="flex flex-col gap-4 md:col-span-2 lg:col-span-2">
              <label className="text-[10px] uppercase font-mono tracking-[0.3em] text-red-600 font-bold">05. Concepto / Enfoque del Día</label>
              <div className="relative flex gap-2">
                <div className="relative flex-1">
                  <textarea 
                    value={modelConcept}
                    onChange={(e) => setModelConcept(e.target.value)}
                    placeholder="Ej: Spa de pies, sesión de ballet, dominación suave..."
                    rows={5}
                    className="w-full bg-[#0a0a0a] border border-white/5 p-4 pr-16 font-sans text-base font-light focus:outline-none focus:border-red-600 text-white transition-all rounded-lg placeholder:text-gray-700"
                  />
                  <button 
                    onClick={saveModelDescription}
                    disabled={savingModel}
                    className="absolute right-4 top-4 p-2 text-gray-500 hover:text-red-600 transition-all"
                    title="Guardar Perfil y Concepto"
                  >
                    {savingModel ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                  </button>
                </div>
                <button 
                  onClick={generateContent}
                  disabled={loading}
                  className="px-6 bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-all flex items-center justify-center rounded-lg shadow-xl shadow-red-900/20 active:scale-95 group/btn"
                >
                  {loading ? <Loader2 className="animate-spin" size={24} /> : <Sparkles className="group-hover/btn:rotate-12 transition-transform" size={24} />}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Actions Bar */}
        <div className="mb-10 flex flex-wrap items-center gap-6">
          <button 
            onClick={copyToClipboard}
            className="flex items-center gap-3 px-8 py-4 bg-red-600 text-white rounded-full hover:bg-red-700 transition-all text-xs font-sans font-bold uppercase tracking-[0.2em] shadow-2xl shadow-red-900/40"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? 'Copiado con éxito' : 'Copiar Estrategia Completa'}
          </button>
          
          <div className="flex gap-3">
            <button 
              onClick={exportToExcel}
              className="p-4 bg-emerald-900/10 text-emerald-500 border border-emerald-900/20 rounded-full hover:bg-emerald-900/20 transition-all"
              title="Exportar a Excel"
            >
              <FileSpreadsheet size={20} />
            </button>
            <button 
              onClick={exportToCSV}
              className="p-4 bg-white/5 text-gray-400 border border-white/5 rounded-full hover:text-white hover:bg-white/10 transition-all"
              title="Exportar a CSV"
            >
              <FileText size={20} />
            </button>
          </div>
        </div>

        {/* Table Container */}
        <div className="overflow-x-auto border border-white/5 bg-[#0d0d0d] shadow-[0_40px_100px_rgba(0,0,0,0.8)] relative rounded-2xl overflow-hidden">
          {loading && (
            <div className="absolute inset-0 bg-black/90 backdrop-blur-xl z-20 flex flex-col items-center justify-center gap-8">
              <div className="relative">
                <div className="w-24 h-24 border-2 border-red-900/20 border-t-red-600 rounded-full animate-spin"></div>
                <Sparkles className="absolute inset-0 m-auto text-red-600 animate-pulse" size={32} />
              </div>
              <div className="text-center">
                <p className="font-serif italic text-3xl text-white tracking-widest mb-2">Refinando Contenido</p>
                <p className="font-mono text-[10px] uppercase tracking-[0.5em] text-red-500 opacity-60">Procesando con Inteligencia Artificial</p>
              </div>
            </div>
          )}
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-black text-red-600 border-b border-white/5">
                <th className="p-6 font-serif italic text-xs uppercase tracking-[0.3em] font-medium border-r border-white/5">Categoría</th>
                <th className="p-6 font-serif italic text-xs uppercase tracking-[0.3em] font-medium border-r border-white/5">Opción</th>
                <th className="p-6 font-serif italic text-xs uppercase tracking-[0.3em] font-medium border-r border-white/5">Inglés</th>
                <th className="p-6 font-serif italic text-xs uppercase tracking-[0.3em] font-medium">Español</th>
              </tr>
            </thead>
            <tbody className="font-sans text-sm">
              {data.map((row, index) => (
                <tr 
                  key={index} 
                  className="border-b border-white/5 hover:bg-red-600/[0.02] transition-colors group"
                >
                  <td className="p-6 border-r border-white/5 font-mono text-[11px] uppercase tracking-widest text-red-500/40 group-hover:text-red-500 transition-colors">
                    {row.categoria}
                  </td>
                  <td className="p-6 border-r border-white/5 text-gray-400 group-hover:text-gray-200 transition-colors font-light">
                    <div className="flex items-center justify-between gap-4">
                      <span>{row.opcion}</span>
                      <button 
                        onClick={() => copyField(row.opcion, `op-${index}`)}
                        className="opacity-0 group-hover:opacity-100 p-2 bg-red-600/5 text-red-500 hover:bg-red-600 hover:text-white transition-all rounded-lg"
                      >
                        {individualCopied === `op-${index}` ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                    </div>
                  </td>
                  <td className="p-6 border-r border-white/5 italic text-gray-500 group-hover:text-gray-300 transition-colors font-light leading-relaxed">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex flex-col gap-1">
                        <span>{row.ingles}</span>
                        {row.categoria.toLowerCase().includes('objetivos') && row.ingles.length > 40 && (
                          <span className="text-[9px] text-red-500 font-mono uppercase tracking-tighter">Excede 40 caracteres</span>
                        )}
                      </div>
                      <button 
                        onClick={() => copyField(row.ingles, `en-${index}`)}
                        className="opacity-0 group-hover:opacity-100 p-2 bg-red-600/5 text-red-500 hover:bg-red-600 hover:text-white transition-all rounded-lg"
                      >
                        {individualCopied === `en-${index}` ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                    </div>
                  </td>
                  <td className="p-6 text-gray-500 group-hover:text-gray-300 transition-colors font-light leading-relaxed">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex flex-col gap-1">
                        <span>{row.espanol}</span>
                        {row.categoria.toLowerCase().includes('objetivos') && row.espanol.length > 40 && (
                          <span className="text-[9px] text-red-500 font-mono uppercase tracking-tighter">Excede 40 caracteres</span>
                        )}
                      </div>
                      <button 
                        onClick={() => copyField(row.espanol, `es-${index}`)}
                        className="opacity-0 group-hover:opacity-100 p-2 bg-red-600/5 text-red-500 hover:bg-red-600 hover:text-white transition-all rounded-lg"
                      >
                        {individualCopied === `es-${index}` ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <footer className="mt-20 pb-12 border-t border-white/5 pt-10 flex flex-col md:flex-row justify-between items-center gap-6 opacity-30 text-[9px] font-mono uppercase tracking-[0.5em]">
          <div className="flex flex-col items-center md:items-start gap-2">
            <span>© 2026 Generador de Contenido Pro</span>
            <span className="text-red-500 font-bold">Tribu 1126 Exclusive Edition</span>
          </div>
          <div className="flex gap-10">
            <span className="flex items-center gap-2">
              <Sparkles size={12} className="text-red-600" />
              AI Strategy Engine
            </span>
            <span className="text-white">Sophisticated UI v2.0</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
