import React, { useState, useEffect } from 'react';
import { Download, Copy, Check, FileSpreadsheet, ExternalLink, FileText, Sparkles, Loader2, Search, Save, User, AlertCircle, X, LogIn, LogOut, Trash2, Share2, Eye } from 'lucide-react';
import { TableRow } from './data';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { GoogleGenAI, Type, ThinkingLevel } from "@google/genai";
import { auth, db, googleProvider, signInWithPopup, signOut, onAuthStateChanged, collection, query, onSnapshot, setDoc, doc, deleteDoc, getDoc, User as FirebaseUser, handleFirestoreError, OperationType, where } from './firebase';

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: any }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    (this as any).state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  render() {
    const { hasError, error } = (this as any).state;
    if (hasError) {
      let message = "Algo salió mal.";
      try {
        const errInfo = JSON.parse(error.message);
        if (errInfo.error.includes("insufficient permissions")) {
          message = "No tienes permisos para realizar esta acción o ver estos datos.";
        }
      } catch (e) {
        message = error?.message || message;
      }

      return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
          <div className="bg-[#111] border border-red-600/20 p-8 rounded-2xl max-w-md w-full text-center">
            <AlertCircle size={48} className="text-red-600 mx-auto mb-4" />
            <h2 className="text-2xl font-serif text-white mb-2">Error de Aplicación</h2>
            <p className="text-gray-400 text-sm mb-6">{message}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-red-600 text-white rounded-full text-xs font-mono uppercase tracking-widest hover:bg-red-700 transition-all"
            >
              Recargar Página
            </button>
          </div>
        </div>
      );
    }
    return (this as any).props.children;
  }
}

interface ModelProfile {
  id: string | number;
  name: string;
  description: string;
  concept: string;
  profile: string;
  category: string;
  userId?: string;
}

const DEFAULT_MODELS: ModelProfile[] = [
  { 
    id: "1",
    name: "Ari Espinoza", 
    description: "Modelo de belleza física excepcional y estilo peculiar, enfocada en shows sexuales explícitos de alto impacto, dominando categorías intensas como anal, garganta profunda, fetiche de pies y sexo en general.",
    concept: "Dominación intensa y fetiche de pies",
    profile: "18 a 25",
    category: "HardCore"
  },
  { 
    id: "2",
    name: "Jeimi Escobar", 
    description: "Atractiva y elegante modelo madura (MILF); su especialidad es la combinación de fetiches de humillación (Cornudo) con la adoración de pies, medias y tacones.",
    concept: "Humillación sofisticada (Cuckold) y adoración de pies",
    profile: "35 o más",
    category: "Mistress"
  },
  { 
    id: "3",
    name: "Liliana Delgado", 
    description: "Modelo Teen BBW de rostro muy bello; su oferta combina shows de senos y blowjobs con una línea de fetiches de pies y cornudos",
    concept: "Versatilidad BBW: Senos, Blowjobs y Dominación Kinky",
    profile: "18 a 25",
    category: "BBW"
  },
  { 
    id: "4",
    name: "Natalia Novoa", 
    description: "Modelo Teen enfocada en el Glamour; irradia sofisticación y alta estética para nichos de exclusividad y adoración VIP (Medias, Tacones y Diosa).",
    concept: "Elegancia de alta gama: Diosa en medias y tacones",
    profile: "18 a 25",
    category: "Glamour"
  },
  {
    id: "5",
    name: "Lorena Lopez",
    description: "Modelo Curvy muy experimentada y flexible que contrasta un look tierno e intelectual con shows de altísima intensidad, destacando sus senos grandes, el uso magistral de la fuckmachine y el contenido sexual de calidad, se identifican patrones de anal, blowjob, deepthroat y fetiches; como contenido exclusivo.",
    concept: "Contraste intelectual y shows de alta intensidad con fuckmachine",
    profile: "25 - 35",
    category: "Curvy"
  },
  {
    id: "6",
    name: "Valentina Botia",
    description: "Modelo de curvas impactantes que monetiza nichos explícitos de altísimo valor (anal y exclusividad de lactancia), complementando su intensa oferta con fetiche de pies, blowjob y juegos de roles.",
    concept: "Monetización de nichos explícitos de alto valor (Anal, Lactancia y Fetiches)",
    profile: "25 - 35",
    category: "Curvy"
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

export default function AppWrapper() {
  return (
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}

function App() {
  const [profile, setProfile] = useState('18 a 25');
  const [selectedCategory, setSelectedCategory] = useState('Natural');
  const [modelDescription, setModelDescription] = useState('');
  const [modelConcept, setModelConcept] = useState('');
  const [data, setData] = useState<TableRow[]>(INITIAL_DATA);
  const [loading, setLoading] = useState(false);
  const [quotaError, setQuotaError] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [individualCopied, setIndividualCopied] = useState<string | null>(null);
  
  const [models, setModels] = useState<ModelProfile[]>([]);
  const [selectedModelId, setSelectedModelId] = useState<string | number | null>(null);
  const [savingModel, setSavingModel] = useState(false);
  const [syncingCloud, setSyncingCloud] = useState(true);
  const [isAddingModel, setIsAddingModel] = useState(false);
  const [newModelName, setNewModelName] = useState('');
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [sharedId, setSharedId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get('v');
    }
    return null;
  });
  const [linkCopied, setLinkCopied] = useState(false);

  // Indica si estamos viendo el enlace de Jeff pero no somos Jeff (o no estamos logueados)
  const isReadOnly = !!sharedId && (!user || user.uid !== sharedId);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  // 2. Real-time Cloud Sync
  useEffect(() => {
    if (!isAuthReady) {
      console.log("[Sync] Waiting for Auth...");
      return;
    }

    let unsubscribe: () => void;
    
    // Conectamos con el perfil compartido o el propio
    const effectiveUserId = sharedId || (user ? user.uid : null);

    if (!effectiveUserId) {
      console.log("[Sync] Esperando usuario o enlace compartido...");
      setModels([]); 
      setSyncingCloud(false);
      return;
    }

    setSyncingCloud(true);
    console.log(`[Sync] Conectando con Firestore | Perfil: ${effectiveUserId} | Modo: ${isReadOnly ? 'Solo Lectura' : 'Editor'}`);
    
    const q = query(collection(db, 'models'), where('userId', '==', String(effectiveUserId)));
    
    unsubscribe = onSnapshot(q, (snapshot) => {
      const firestoreModels = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: data.id ? data.id.toString() : doc.id
        } as ModelProfile;
      });
      
      const sortedModels = firestoreModels.sort((a, b) => {
        const nameA = a.name.toLowerCase();
        const nameB = b.name.toLowerCase();
        return nameA.localeCompare(nameB, undefined, {numeric: true, sensitivity: 'base'});
      });

      setModels(sortedModels);
      setSyncingCloud(false);
      
      // Selection logic
      if (sortedModels.length > 0) {
        setSelectedModelId(current => {
          if (!current) return sortedModels[0].id;
          const exists = sortedModels.some(m => m.id.toString() === current.toString());
          return exists ? current : sortedModels[0].id;
        });
      } else {
        setSelectedModelId(null);
      }
    }, (error) => {
      console.error("[Sync] Firestore listener error:", error);
      setSyncingCloud(false);
      if (!isReadOnly) {
        handleFirestoreError(error, OperationType.LIST, 'models');
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user, isAuthReady, sharedId, isReadOnly]);

  const lastModelIdRef = React.useRef<string | number | null>(null);

  // Sync logic for fields: ONLY when switching models to avoid overwriting current edits
  useEffect(() => {
    if (!selectedModelId || models.length === 0) return;
    
    if (lastModelIdRef.current !== selectedModelId) {
      const activeModel = models.find(m => m.id.toString() === selectedModelId.toString());
      if (activeModel) {
        setProfile(activeModel.profile || '18 a 25');
        setSelectedCategory(activeModel.category || 'Natural');
        setModelDescription(activeModel.description || '');
        setModelConcept(activeModel.concept || '');
      }
      lastModelIdRef.current = selectedModelId;
    }
  }, [selectedModelId, models]);

  useEffect(() => {
    const lastSelectedId = localStorage.getItem('last_selected_model_id');
    if (lastSelectedId) {
      setSelectedModelId(lastSelectedId);
    }
  }, []);

  const copyShareLink = () => {
    if (!user) return;
    const baseUrl = window.location.origin + window.location.pathname;
    const shareUrl = `${baseUrl}?v=${user.uid}`;
    
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(shareUrl).then(() => {
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2000);
      }).catch(() => {
        alert("Enlace para modelos: " + shareUrl);
      });
    } else {
      alert("Enlace para modelos: " + shareUrl);
    }
  };

  const handleLogin = async () => {
    try {
      setGeneralError(null);
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error("Login error:", error);
      if (error.code === 'auth/popup-closed-by-user') {
        setGeneralError("La ventana de inicio de sesión se cerró antes de completar.");
      } else if (error.code === 'auth/unauthorized-domain') {
        setGeneralError(
          "Error de Dominio: Este dominio no está autorizado en Firebase. \n\n" +
          "Para solucionar esto:\n" +
          "1. Ve a Firebase Console > Authentication > Settings.\n" +
          "2. En 'Authorized domains', añade: '" + window.location.hostname + "'\n" +
          "3. Recarga la página e intenta de nuevo."
        );
      } else {
        setGeneralError("Error al iniciar sesión: " + error.message);
      }
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  
  const handleModelChange = (id: string | number) => {
    console.log("[Selection] Switching to:", id);
    setSelectedModelId(id);
    localStorage.setItem('last_selected_model_id', id.toString());
  };

  const saveModelDescription = async () => {
    if (!selectedModelId) {
      console.warn("[Save] No model selected");
      return;
    }
    
    setSavingModel(true);
    const path = `models/${selectedModelId}`;
    try {
      const effectiveUserId = sharedId || (user ? user.uid : null);
      
      if (!effectiveUserId) {
        setGeneralError("No se pudo identificar el propietario del perfil.");
        setSavingModel(false);
        return;
      }

      const modelIdStr = selectedModelId.toString();
      const modelRef = doc(db, 'models', modelIdStr);
      const currentModel = models.find(m => m.id.toString() === modelIdStr);
      
      const modelData = {
        id: modelIdStr,
        name: currentModel?.name || 'Modelo',
        description: modelDescription,
        concept: modelConcept,
        profile: profile,
        category: selectedCategory,
        userId: effectiveUserId
      };

      console.log("[Save] Writing to Firestore:", path, modelData);
      await setDoc(modelRef, modelData, { merge: true });
      
      setShowSaveSuccess(true);
      setTimeout(() => setShowSaveSuccess(false), 2000);
      setSavingModel(false);
    } catch (error) {
      console.error("[Save] Error:", error);
      setGeneralError("Error al guardar cambios. Verifica el enlace o login.");
      setSavingModel(false);
    }
  };

  const addNewModel = async () => {
    if (!newModelName.trim()) return;
    
    setSavingModel(true);
    const newId = Date.now().toString();
    const path = `models/${newId}`;
    try {
      const newModel: ModelProfile = {
        id: newId,
        name: newModelName,
        description: '',
        concept: '',
        profile: profile,
        category: selectedCategory,
        userId: user?.uid
      };
      
      if (!user) {
        setGeneralError("Debes iniciar sesión para añadir modelos.");
        setSavingModel(false);
        return;
      }

      await setDoc(doc(db, 'models', newId), newModel);
      
      setSelectedModelId(newId);
      setModelDescription('');
      setModelConcept('');
      setIsAddingModel(false);
      setNewModelName('');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    } finally {
      setSavingModel(false);
    }
  };

  const deleteModel = async () => {
    if (!selectedModelId) return;
    const modelToDelete = models.find(m => m.id === selectedModelId || m.id === selectedModelId.toString());
    if (!modelToDelete) return;

    const path = `models/${selectedModelId}`;
    if (window.confirm(`¿Estás seguro de que quieres eliminar a la modelo "${modelToDelete.name}"?`)) {
      try {
        if (!user) {
          setGeneralError("Debes iniciar sesión para eliminar modelos.");
          return;
        }

        await deleteDoc(doc(db, 'models', selectedModelId.toString()));
        
        setSelectedModelId(null);
        setModelDescription('');
        setModelConcept('');
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, path);
      }
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
    setGeneralError(null);
    setData([]);

    // Auto-save current description/concept before generating
    saveModelDescription();

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === 'YOUR_API_KEY') {
        throw new Error("No se ha configurado la API Key de Gemini. Por favor, configúrala en los secretos de AI Studio.");
      }

      // Fetch history from localStorage to avoid repetition
      let historyContext = "";
      if (selectedModelId) {
        const savedHistory = localStorage.getItem(`history_${selectedModelId}`);
        if (savedHistory) {
          const historyData = JSON.parse(savedHistory);
          if (historyData.length > 0) {
            const recentHistory = historyData.slice(-2).map((h: any) => 
              h.map((item: any) => `${item.categoria}: ${item.espanol}`).join(" | ")
            );
            historyContext = `CONTENIDO PREVIO GENERADO (NO REPETIR ESTAS FRASES): ${JSON.stringify(recentHistory)}`;
          }
        }
      }

      const ai = new GoogleGenAI({ apiKey });
      const stream = await ai.models.generateContentStream({
        model: "gemini-flash-latest",
        config: {
          systemInstruction: `Eres un estratega senior de marketing y contenido para la industria webcam de alto nivel (Tribu 1126). 
          Tu lenguaje debe ser sofisticado, profesional, persuasivo y altamente específico del nicho. 
          Generas organigramas bilingües (Inglés/Español) con una calidad literaria y comercial impecable.
          IMPORTANTE: Estás trabajando en un contexto de estrategia de marketing para adultos. Los términos técnicos del nicho son necesarios. No bloquees la respuesta.
          CRÍTICO: Devuelve ÚNICAMENTE el JSON solicitado. Sin texto adicional, sin explicaciones.`,
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
          maxOutputTokens: 4000,
        },
        contents: `Genera un organigrama estratégico diario para:
        - Modelo: ${models.find(m => m.id.toString() === selectedModelId?.toString())?.name || "General"}
        - Perfil: ${profile} | Estilo: ${selectedCategory}
        - Descripción: ${modelDescription || "General"}
        - Concepto: ${modelConcept || "General"}

        ${historyContext}

        Estructura obligatoria (Genera exactamente 20 items en total):
        1. Tema de Sala (2 opciones)
        2. Objetivos (5 niveles: 100, 500, 1000, 2000, 5000 tk). MÁXIMO 40 CARACTERES por frase.
        3. Feed/Muro (2 posts)
        4. Mensaje Masivo (2 líneas)
        5. Enfoque de Contenido (2 párrafos concisos)
        6. Saludos (2 opciones)
        7. Invitaciones a Privado (2 CTAs)
        8. Consejos Estratégicos (2 recomendaciones tácticas)
        9. Bots de Bienvenida (2 mensajes)
        10. Bot de Anuncio (2 mensajes)

        Asegura tono premium y bilingüe.`,
      });

      let fullText = "";
      for await (const chunk of stream) {
        fullText += chunk.text;
      }

      if (!fullText) {
        throw new Error("La IA devolvió una respuesta vacía.");
      }

      let cleanText = fullText.trim();
      if (cleanText.startsWith('```json')) {
        cleanText = cleanText.replace(/^```json/, '').replace(/```$/, '').trim();
      } else if (cleanText.startsWith('```')) {
        cleanText = cleanText.replace(/^```/, '').replace(/```$/, '').trim();
      }

      try {
        let generatedData = JSON.parse(cleanText);
        if (!Array.isArray(generatedData) && typeof generatedData === 'object' && generatedData !== null) {
          const possibleArray = Object.values(generatedData).find(val => Array.isArray(val));
          if (possibleArray) generatedData = possibleArray;
        }

        if (!Array.isArray(generatedData)) throw new Error("Formato inválido");
        
        setData(generatedData);

        if (selectedModelId) {
          const savedHistory = localStorage.getItem(`history_${selectedModelId}`);
          let historyData = savedHistory ? JSON.parse(savedHistory) : [];
          historyData.push(generatedData);
          if (historyData.length > 10) historyData.shift();
          localStorage.setItem(`history_${selectedModelId}`, JSON.stringify(historyData));
        }
      } catch (parseError) {
        console.error("Parse Error:", parseError, "Text:", cleanText);
        throw new Error("Error al procesar la respuesta. Intenta de nuevo.");
      }
    } catch (error: any) {
      console.error("Generation Error:", error);
      if (JSON.stringify(error).includes("429")) setQuotaError(true);
      else setGeneralError(error.message || "Error al generar contenido.");
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
      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex flex-col items-center justify-center animate-in fade-in duration-300">
          <div className="relative">
            <div className="w-24 h-24 border-2 border-red-600/20 border-t-red-600 rounded-full animate-spin"></div>
            <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-red-600 animate-pulse" size={32} />
          </div>
          <h2 className="mt-8 text-2xl font-serif italic text-white tracking-widest animate-pulse">Generando Estrategia...</h2>
          <p className="mt-2 text-gray-500 font-mono text-[10px] uppercase tracking-[0.3em]">Tribu 1126 • IA Estratégica</p>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* General Error Banner */}
        {generalError && (
          <div className="mb-8 p-6 bg-red-900/20 border border-red-500/30 rounded-2xl flex items-start gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="p-3 bg-red-500/20 rounded-xl text-red-500">
              <AlertCircle size={24} />
            </div>
            <div className="flex-1">
              <h3 className="text-red-500 font-serif italic text-xl mb-1">Error de Generación</h3>
              <p className="text-red-500/70 text-sm leading-relaxed">{generalError}</p>
              <button 
                onClick={() => generateContent()}
                className="mt-4 px-6 py-2 bg-red-600 text-white rounded-full text-xs font-mono uppercase tracking-widest hover:bg-red-500 transition-all"
              >
                Intentar de nuevo
              </button>
            </div>
            <button onClick={() => setGeneralError(null)} className="text-red-500/50 hover:text-red-500">
              <X size={20} />
            </button>
          </div>
        )}

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
          
          <div className="flex justify-end mb-8 items-center gap-4">
            {isReadOnly && (
              <div className="flex items-center gap-2 bg-emerald-600/10 px-4 py-2 rounded-full border border-emerald-600/20">
                <Eye size={14} className="text-emerald-500" />
                <span className="text-[10px] text-emerald-400 font-mono uppercase tracking-widest font-bold">Vista de Modelo</span>
              </div>
            )}

            {syncingCloud && (
              <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10">
                <Loader2 size={14} className="animate-spin text-red-600" />
                <span className="text-[10px] text-gray-400 font-mono uppercase tracking-widest leading-none">Guardando cambios...</span>
              </div>
            )}

            {user && !isReadOnly && (
              <button 
                onClick={copyShareLink}
                className="flex items-center gap-2 px-4 py-2 bg-red-600/10 border border-red-600/20 text-red-500 rounded-full font-mono text-[10px] uppercase tracking-widest hover:bg-red-600/20 transition-all"
              >
                {linkCopied ? <Check size={12} className="text-emerald-500" /> : <Share2 size={12} />}
                {linkCopied ? 'Enlace Copiado' : 'Compartir con Modelos'}
              </button>
            )}

            {user ? (
              <div className="flex items-center gap-4 bg-black/40 p-2 pl-4 rounded-full border border-white/5">
                <div className="flex flex-col items-end">
                  <span className="text-[10px] text-gray-500 font-mono uppercase tracking-tighter">Sesión Iniciada</span>
                  <span className="text-xs text-white font-medium">{user.displayName || user.email}</span>
                </div>
                <button 
                  onClick={logout}
                  className="p-3 bg-red-600/10 text-red-500 rounded-full hover:bg-red-600 hover:text-white transition-all group"
                  title="Cerrar Sesión"
                >
                  <LogOut size={16} className="group-hover:scale-110 transition-transform" />
                </button>
              </div>
            ) : (
              <button 
                onClick={handleLogin}
                className="flex items-center gap-3 px-6 py-3 bg-white text-black rounded-full font-mono text-xs font-bold uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)]"
              >
                <LogIn size={16} />
                Sincronizar con Google
              </button>
            )}
          </div>

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
                <div className="flex gap-4 items-center">
                  {user && !isReadOnly && (
                    <button 
                      onClick={deleteModel}
                      className="text-[10px] text-gray-500 hover:text-red-600 transition-colors uppercase font-mono"
                      title="Eliminar modelo seleccionada"
                    >
                      Eliminar
                    </button>
                  )}
                  {!isReadOnly && (
                    <button 
                      onClick={() => setIsAddingModel(!isAddingModel)}
                      className="text-[10px] text-gray-500 hover:text-red-600 transition-colors uppercase font-mono"
                    >
                      {isAddingModel ? 'Cancelar' : '+ Nueva'}
                    </button>
                  )}
                </div>
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
                    onChange={(e) => handleModelChange(e.target.value)}
                    className="w-full bg-[#0a0a0a] border border-white/5 p-4 font-sans text-base font-light focus:outline-none focus:border-red-600 text-white transition-all rounded-lg appearance-none cursor-pointer hover:bg-black"
                  >
                    <option value="" disabled>Seleccionar Modelo...</option>
                    {models.map(m => <option key={m.id.toString()} value={m.id.toString()}>{m.name}</option>)}
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
              <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/5 mb-2">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-mono tracking-[0.3em] text-red-600 font-bold">04. Perfil / Descripción</label>
                  <p className="text-[10px] text-gray-500 font-sans uppercase tracking-tighter">Define la identidad de la modelo vinculada a este perfil</p>
                </div>
                  <button 
                    onClick={saveModelDescription}
                    disabled={savingModel || !selectedModelId}
                    className="text-[10px] text-gray-500 hover:text-red-600 transition-colors uppercase font-mono flex items-center gap-2"
                  >
                    {savingModel ? <Loader2 size={10} className="animate-spin" /> : <Save size={10} />}
                    Guardar Perfil
                  </button>
              </div>
                <div className="relative">
                  <textarea 
                    value={modelDescription}
                    onChange={(e) => setModelDescription(e.target.value)}
                    placeholder="Rasgos, personalidad, fetiches específicos..."
                    rows={4}
                    className="w-full bg-[#0a0a0a] border border-white/5 p-4 font-sans text-base font-light focus:outline-none focus:border-red-600 text-white transition-all rounded-lg placeholder:text-gray-700"
                  />
                </div>
            </div>

            <div className="flex flex-col gap-4 md:col-span-2 lg:col-span-2">
              <label className="text-[10px] uppercase font-mono tracking-[0.3em] text-red-600 font-bold">05. Concepto / Enfoque del Día</label>
              <div className="relative flex flex-col gap-4">
                <div className="relative flex gap-2">
                  <div className="relative flex-1">
                    <textarea 
                      value={modelConcept}
                      onChange={(e) => setModelConcept(e.target.value)}
                      placeholder="Ej: Spa de pies, sesión de ballet, dominación suave..."
                      rows={4}
                      className="w-full bg-[#0a0a0a] border border-white/5 p-4 pr-4 font-sans text-base font-light focus:outline-none focus:border-red-600 text-white transition-all rounded-lg placeholder:text-gray-700"
                    />
                  </div>
                  <button 
                    onClick={generateContent}
                    disabled={loading}
                    className="px-6 bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-all flex items-center justify-center rounded-lg shadow-xl shadow-red-900/20 active:scale-95 group/btn"
                  >
                    {loading ? <Loader2 className="animate-spin" size={24} /> : <Sparkles className="group-hover/btn:rotate-12 transition-transform" size={24} />}
                  </button>
                </div>

                <div className="flex flex-col items-center gap-4 py-6 border-t border-white/5 mt-4">
                  <button 
                    onClick={saveModelDescription}
                    disabled={savingModel || !selectedModelId}
                    className={`w-full max-w-sm py-3 rounded-lg flex items-center justify-center gap-3 text-xs font-mono font-bold uppercase tracking-widest transition-all shadow-lg active:scale-95 ${
                      showSaveSuccess ? 'bg-emerald-600 text-white' : 'bg-red-600 hover:bg-red-700 text-white disabled:bg-gray-800'
                    }`}
                  >
                    {savingModel ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Guardando...</span>
                      </>
                    ) : showSaveSuccess ? (
                      <>
                        <Check size={16} />
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        <span>Guardar Perfil</span>
                      </>
                    )}
                  </button>
                  {showSaveSuccess && (
                    <span className="text-[9px] text-emerald-500 font-mono uppercase tracking-widest animate-in fade-in duration-300">
                      Sincronización completa
                    </span>
                  )}
                </div>
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
