// App.jsx
//////

/////////
/////////////
import { Canvas, useFrame } from '@react-three/fiber'
import { useRef, useState, useEffect } from 'react'
import Membrane from './Membrane'
import Nucleus from './NucleusMesh'
import Cytoplasm from './Cytoplasm'
import MedicalGlossary from './MedicalGlossary'
import GlowRing from './GlowRing'
import * as THREE from 'three'
import './App.css'
import { Environment, OrbitControls, AdaptiveDpr } from '@react-three/drei'
import { EffectComposer, Bloom, DepthOfField } from '@react-three/postprocessing'
import TextField from '@mui/material/TextField'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import CircularProgress from '@mui/material/CircularProgress'
import Chip from '@mui/material/Chip'
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import EditCalendarIcon from '@mui/icons-material/EditCalendar';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import DownloadForOfflineIcon from '@mui/icons-material/DownloadForOffline';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import LanguageIcon from '@mui/icons-material/Language';
import DownloadIcon from '@mui/icons-material/Download';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import ScheduleIcon from '@mui/icons-material/Schedule';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import CloseIcon from '@mui/icons-material/Close';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import SettingsIcon from '@mui/icons-material/Settings';
import {
  Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, Button, Tabs, Tab, Grid,
  Switch, FormControlLabel, Select, MenuItem, FormControl, InputLabel, Drawer, List,
  ListItem, ListItemIcon, ListItemText, Divider, Card, CardContent, SpeedDial,
  SpeedDialAction, SpeedDialIcon, Snackbar, Alert
} from '@mui/material'

import Collapse from '@mui/material/Collapse';


import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';



import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'


import Logo from './assets/STEM CARE-03.png'

const TF_FILLED_SX = (darkMode) => ({
  '& .MuiFilledInput-root': {
    borderRadius: 2,
    backgroundColor: darkMode ? 'rgba(255,255,255,0.1)' : '#eef2f6',
    transition: 'background-color .2s',
    '&:hover': { backgroundColor: darkMode ? 'rgba(255,255,255,0.15)' : '#e8eef5' },
    '&.Mui-focused': { backgroundColor: darkMode ? 'rgba(255,255,255,0.2)' : '#eaf2ff' },
    '& fieldset': {
      borderColor: darkMode ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)',
    },
    '&:hover fieldset': {
      borderColor: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)',
    },
    '&.Mui-focused fieldset': {
      borderColor: darkMode ? '#7d7da8' : '#7d7da8',
    },
  },
  '& .MuiInputBase-input': { 
    fontFamily: 'Manrope',
    color: darkMode ? '#ffffff' : '#000000',
  },
  '& .MuiInputLabel-root': { 
    fontFamily: 'Manrope',
    color: darkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: darkMode ? '#7d7da8' : '#7d7da8',
  },
  '& .MuiFormHelperText-root': {
    color: darkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)',
  },
});

// const SECTION_TITLE_SX = {
//   fontFamily: 'Manrope',
//   fontSize: 10,
//   letterSpacing: 1,
//   fontWeight: 700,
//   color: '#6b7a8c',
//   mb: 1,
//   mt: 2,
//   textTransform: 'uppercase',
// };

const SECTION_TITLE_SX = (darkMode) => ({
  fontFamily:'Manrope', fontSize:10, letterSpacing:1, fontWeight:700, color: darkMode ? 'rgba(255,255,255,0.7)' : '#6b7a8c',
  mb:1, mt:2, textTransform:'uppercase',
  '&:first-of-type': { mt: 0 },   // no extra top gap on the first title
});


function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(
    () => typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  )

  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)')
    if (!mq) return
    const onChange = (e) => setReduced(e.matches)
    mq.addEventListener?.('change', onChange)
    return () => mq.removeEventListener?.('change', onChange)
  }, [])

  return reduced
}

// Auto-orbits like before, but the user can grab, rotate and zoom the cell.
// Auto-rotation pauses while they interact and resumes after a few seconds idle.
function CellCameraRig({ isAIResponding = false, reducedMotion = false }) {
  const controlsRef = useRef()
  const idleTimer = useRef(null)
  const [userActive, setUserActive] = useState(false)

  useEffect(() => () => clearTimeout(idleTimer.current), [])

  useFrame((_, delta) => {
    const controls = controlsRef.current
    if (!controls) return
    // autoRotateSpeed 2 ≈ one orbit every 30s (matches the previous pace); faster while the AI responds
    const target = isAIResponding ? 4 : 2
    controls.autoRotateSpeed += (target - controls.autoRotateSpeed) * Math.min(1, delta * 2)
  })

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={false}
      enableDamping
      dampingFactor={0.08}
      minDistance={3}
      maxDistance={8}
      autoRotate={!reducedMotion && !userActive}
      regress
      onStart={() => {
        clearTimeout(idleTimer.current)
        setUserActive(true)
      }}
      onEnd={() => {
        clearTimeout(idleTimer.current)
        idleTimer.current = setTimeout(() => setUserActive(false), 4000)
      }}
    />
  )
}

function DynamicDepthOfField({ isAIResponding = false }) {
  const ref = useRef({
    focusDistance: 0.02,
    targetFocusDistance: 0.02
  })
  
  useFrame(() => {
    // Smooth focus distance based on AI responding state
    const targetFocusDistance = isAIResponding ? 0.015 : 0.02
    const lerpSpeed = 0.03
    
    ref.current.targetFocusDistance = targetFocusDistance
    ref.current.focusDistance += (ref.current.targetFocusDistance - ref.current.focusDistance) * lerpSpeed
  })
  
  return (
    <DepthOfField 
      focusDistance={ref.current.focusDistance}
      focalLength={0.01} 
      bokehScale={1.2} 
      height={720}
      width={720}
    />
  )
}


const TABS = {
  CRIO: 0,
  TERAPIA: 1,
  GENETICAS: 2,
};

// Field configs for each tab - function to support multiple languages
const getFieldSets = (lang = 'es') => {
  const labels = {
    es: {
      nombre: 'Nombre',
      apellidos: 'Apellidos',
      email: 'E-mail',
      telefono: 'Teléfono',
      semana_de_embarazo: 'Semana de embarazo',
      nombre_de_ginecologo: 'Nombre de Ginecólogo',
      telefonos_de_contacto: 'Teléfonos de contacto',
      mensaje: 'Mensaje'
    },
    en: {
      nombre: 'Name',
      apellidos: 'Last Name',
      email: 'E-mail',
      telefono: 'Phone',
      semana_de_embarazo: 'Pregnancy Week',
      nombre_de_ginecologo: 'Gynecologist Name',
      telefonos_de_contacto: 'Contact Phones',
      mensaje: 'Message'
    }
  };

  const l = labels[lang] || labels.es;

  return {
    [TABS.CRIO]: [
      { name: 'nombre',  label: l.nombre,               required: true },
      { name: 'apellidos', label: l.apellidos },
      { name: 'email',   label: l.email,              required: true, type: 'email' },
      { name: 'telefono', label: l.telefono },
      { name: 'semana_de_embarazo', label: l.semana_de_embarazo, type: 'number' },
      { name: 'nombre_de_ginecologo', label: l.nombre_de_ginecologo },
      { name: 'telefonos_de_contacto', label: l.telefonos_de_contacto },
    ],

    [TABS.TERAPIA]: [
      { name: 'nombre',  label: l.nombre,               required: true },
      { name: 'apellidos', label: l.apellidos },
      { name: 'email',   label: l.email,              required: true, type: 'email' },
      { name: 'telefono', label: l.telefono },
      { name: 'telefonos_de_contacto', label: l.telefonos_de_contacto },
      { name: 'mensaje', label: l.mensaje, type: 'textarea' },
    ],

    // Pruebas genéticas = same as terapia
    [TABS.GENETICAS]: [
      { name: 'nombre',  label: l.nombre,               required: true },
      { name: 'apellidos', label: l.apellidos },
      { name: 'email',   label: l.email,              required: true, type: 'email' },
      { name: 'telefono', label: l.telefono },
      { name: 'telefonos_de_contacto', label: l.telefonos_de_contacto },
      { name: 'mensaje', label: l.mensaje, type: 'textarea' },
    ],
  };
};



export default function App() {
  const [messages, setMessages] = useState(() => {
    // Survive a page refresh within the same browser session
    try {
      const saved = sessionStorage.getItem('teravida-chat')
      return saved ? JSON.parse(saved) : []
    } catch { return [] }
  })
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [typing, setTyping] = useState(false)
  const [darkMode, setDarkMode] = useState(() => {
    try { return localStorage.getItem('teravida-dark-mode') === '1' } catch { return false }
  })
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    try { return localStorage.getItem('teravida-language') || 'es' } catch { return 'es' }
  })
  const [glossaryOpen, setGlossaryOpen] = useState(false)
  const [meetingDrawerOpen, setMeetingDrawerOpen] = useState(false)
  const [userQuestionCount, setUserQuestionCount] = useState(0)
  const [speedDialOpen, setSpeedDialOpen] = useState(false)
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' })
  const [formErrors, setFormErrors] = useState({})
  const [openDialog, setOpenDialog] = useState(false)
  const [activeTab, setActiveTab] = useState(0)
  const [formData, setFormData] = useState({ nombre: '', apellidos: '', email: '', telefono: '', semana_de_embarazo: '', nombre_de_ginecologo: '', telefonos_de_contacto: '', hospital_donde_se_atendera: '', mensaje: '' })
  
  // if you keep a system message, ignore it for the check
  const hasConversation = messages.some(m => m.role === 'user' || m.role === 'assistant');


  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))     // <=600px
  const isTablet = useMediaQuery(theme.breakpoints.between('sm','md')) // 600–900px
  const prefersReducedMotion = usePrefersReducedMotion()

  const notify = (message, severity = 'success') => setSnack({ open: true, message, severity })

  
  const scrollRef = useRef()

  // Agent (concierge) feature flag + server-side session id.
  // Set VITE_AGENT_ENABLED=true to route chat through /api/agents/concierge.
  const AGENT_ENABLED = import.meta.env.VITE_AGENT_ENABLED === 'true'
  const agentSessionRef = useRef(null)

  const chatMaxWidth = isMobile ? '92vw' : isTablet ? 640 : 720
  const promptMaxWidth = isMobile ? '92vw' : 600
  const logoSize       = isMobile ? 64  : 140
  const bodyFontSize   = isMobile ? 13  : 14

  const footerHeight = isMobile ? 20 : 24 // estimated px height of footer text



  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  useEffect(() => {
    try { sessionStorage.setItem('teravida-chat', JSON.stringify(messages)) } catch { /* storage unavailable */ }
  }, [messages])

  useEffect(() => {
    try { localStorage.setItem('teravida-dark-mode', darkMode ? '1' : '0') } catch { /* storage unavailable */ }
  }, [darkMode])

  useEffect(() => {
    try { localStorage.setItem('teravida-language', currentLanguage) } catch { /* storage unavailable */ }
  }, [currentLanguage])

  // const handleChange = (field) => (e) => setFormData({ ...formData, [field]: e.target.value })

  async function sendContact(formData, origen) {
  const res = await fetch('/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...formData, origen }) // e.g. 'Criopreservación'
  });

  const json = await res.json();
  if (!res.ok || !json.ok) throw new Error(json.error || 'Send failed');
  return json;
}



const handleSubmit = async () => {
  // 1) Validate only required fields for the current tab (errors shown inline per field)
  const FIELD_SETS = getFieldSets(currentLanguage);
  const required = FIELD_SETS[activeTab].filter(f => f.required).map(f => f.name);
  const errors = {};
  const requiredMsg = currentLanguage === 'es' ? 'Campo requerido' : 'Required field';
  required.forEach(k => {
    if (!String(formData[k] ?? '').trim()) errors[k] = requiredMsg;
  });
  if (!errors.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(formData.email ?? '').trim())) {
    errors.email = currentLanguage === 'es' ? 'E-mail inválido' : 'Invalid e-mail';
  }
  if (Object.keys(errors).length) {
    setFormErrors(errors);
    notify(
      currentLanguage === 'es' ? 'Revisa los campos marcados' : 'Please check the highlighted fields',
      'error'
    );
    return;
  }
  setFormErrors({});

  // 2) Set "origen" label for the email subject
  const origen =
    activeTab === TABS.CRIO     ? 'Criopreservación' :
    activeTab === TABS.TERAPIA  ? 'Terapia Celular'  :
                                  'Pruebas Genéticas';

  // 3) Shape the payload for /api/contact per tab
  let payload;

  if (activeTab === TABS.CRIO) {
    payload = {
      nombre: formData.nombre,
      apellidos: formData.apellidos,
      email: formData.email,
      telefono: formData.telefono,
      telefonos_de_contacto: formData.telefonos_de_contacto,
      semana_de_embarazo: formData.semana_de_embarazo,
      nombre_de_ginecologo: formData.nombre_de_ginecologo,
      mensaje: '', // optional for this tab
    };
  } else {
    // Terapia Celular + Pruebas Genéticas
    payload = {
      nombre: formData.nombre,
      apellidos: formData.apellidos,
      email: formData.email,
      telefono: formData.telefono,
      telefonos_de_contacto: formData.telefonos_de_contacto,
      mensaje: formData.mensaje || '',
    };
  }

  try {
    // Call your email function (Resend)
    await sendContact(payload, origen);

    notify(currentLanguage === 'es' ? 'Formulario enviado con éxito' : 'Form submitted successfully');
    setOpenDialog(false);
    // optional: clear only the fields for the current tab
    const FIELD_SETS_CLEAR = getFieldSets(currentLanguage);
    const cleared = { ...formData };
    FIELD_SETS_CLEAR[activeTab].forEach(f => { cleared[f.name] = '' });
    setFormData(cleared);
  } catch (err) {
    console.error(err);
    notify(currentLanguage === 'es' ? 'Error al enviar el formulario' : 'Error submitting form', 'error');
  }
};

  const sendMessage = async (customInput) => {
  if (loading) return; // don't allow overlapping streams
  const contentToSend = customInput || input;
  if (!contentToSend.trim()) return;
  
  // Add timestamp to user message
  const userMessage = { 
    role: 'user', 
    content: contentToSend, 
    timestamp: new Date().toISOString() 
  };
  
  const newMessages = [...messages, userMessage];
  setMessages(newMessages);
  setInput('');
  setLoading(true);
  setTyping(true);
  
  // Increment user question count
  setUserQuestionCount(prev => prev + 1);

  try {
    const res = AGENT_ENABLED
      ? await fetch('/api/agents/concierge', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: contentToSend,
            language: currentLanguage,
            sessionId: agentSessionRef.current,
          })
        })
      : await fetch('/api/chat/stream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: newMessages, language: currentLanguage })
        });

    // Persist the server-side session id so multi-turn memory works.
    if (AGENT_ENABLED) {
      const sid = res.headers.get('X-Session-Id');
      if (sid) agentSessionRef.current = sid;
    }

    if (!res.ok || !res.body) {
      const detail = await res.text().catch(() => '');
      throw new Error(`API ${res.status}: ${detail.slice(0, 200)}`);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder('utf-8');

    // 1) placeholder del asistente with timestamp
    const assistantMessage = { 
      role: 'assistant', 
      content: '', 
      timestamp: new Date().toISOString() 
    };
    setMessages([...newMessages, assistantMessage]);

    // 2) buffer + flush temporizado
    let fullText = '';
    let buffer = '';
    const FLUSH_EVERY_MS = 45; // ajusta a 30–45ms para "vibe ChatGPT"
    const flush = () => {
      if (!buffer) return;
      fullText += buffer;
      buffer = '';
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { 
          ...updated[updated.length - 1], 
          content: fullText 
        };
        return updated;
      });
    };
    const timer = setInterval(flush, FLUSH_EVERY_MS);

    // 3) leer el stream y sólo llenar el buffer
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
    }

    // 4) flush final
    clearInterval(timer);
    flush();
    
    // Note: Meeting drawer is now replaced with inline button in chat
    
  } catch (error) {
    console.error('Chat error:', error);
    setMessages([...newMessages, {
      role: 'assistant',
      content: currentLanguage === 'es'
        ? 'Lo siento, hubo un error al procesar tu consulta. Por favor, intenta nuevamente.'
        : 'Sorry, there was an error processing your question. Please try again.',
      timestamp: new Date().toISOString()
    }]);
  }

  setLoading(false);
  setTyping(false);
};


  const handleChipClick = (question) => {
    setInput(question)
    sendMessage(question)
  }

  // Utility functions
  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

      const exportConversation = () => {
        const conversationText = messages.map(msg => 
          `${msg.role === 'user' ? (currentLanguage === 'es' ? 'Usuario' : 'User') : (currentLanguage === 'es' ? 'Asistente' : 'Assistant')}: ${msg.content}`
        ).join('\n\n');
        
        const blob = new Blob([conversationText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `conversacion-stem-care-${new Date().toISOString().split('T')[0]}.txt`;
        a.click();
        URL.revokeObjectURL(url);
      };

      const copyConversation = async () => {
        const conversationText = messages.map(msg => 
          `${msg.role === 'user' ? (currentLanguage === 'es' ? 'Usuario' : 'User') : (currentLanguage === 'es' ? 'Asistente' : 'Assistant')}: ${msg.content}`
        ).join('\n\n');
        
        try {
          await navigator.clipboard.writeText(conversationText);
          notify(currentLanguage === 'es' ? 'Conversación copiada al portapapeles' : 'Conversation copied to clipboard');
        } catch (err) {
          console.error('Failed to copy conversation:', err);
          notify(currentLanguage === 'es' ? 'Error al copiar la conversación' : 'Error copying conversation', 'error');
        }
      };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const changeLanguage = (lang) => {
    setCurrentLanguage(lang);
    setUserQuestionCount(0);
  };

  // Copy message content to clipboard
  const copyMessageContent = async (content) => {
    try {
      await navigator.clipboard.writeText(content);
      notify(currentLanguage === 'es' ? 'Mensaje copiado al portapapeles' : 'Message copied to clipboard');
    } catch (err) {
      console.error('Failed to copy message:', err);
      notify(currentLanguage === 'es' ? 'Error al copiar el mensaje' : 'Error copying message', 'error');
    }
  };

  // Export individual message to file
  const exportMessage = (content, timestamp) => {
    const date = new Date(timestamp).toISOString().split('T')[0];
    const time = new Date(timestamp).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
    
    const messageText = currentLanguage === 'es' 
      ? `Stem Care - Mensaje del Asistente\nFecha: ${date}\nHora: ${time}\n\n${content}`
      : `Stem Care - Assistant Message\nDate: ${date}\nTime: ${time}\n\n${content}`;
    
    const blob = new Blob([messageText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stem-care-mensaje-${date}-${time.replace(':', '')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };


  // Check if we should show meeting drawer (every 3 questions)
  const shouldShowMeetingDrawer = () => {
    return userQuestionCount > 0 && userQuestionCount % 3 === 0;
  };

  // Close meeting drawer
  const closeMeetingDrawer = () => {
    setMeetingDrawerOpen(false);
  };

      // Speed dial actions
      const speedDialActions = [
        {
          icon: <EditCalendarIcon />,
          name: currentLanguage === 'es' ? 'Agendar consulta con especialistas' : 'Schedule consultation with specialists',
          action: () => setOpenDialog(true)
        },
        {
          icon: <ContentCopyIcon />,
          name: currentLanguage === 'es' ? 'Copiar conversación' : 'Copy conversation',
          action: () => copyConversation()
        },
        {
          icon: <DownloadIcon />,
          name: currentLanguage === 'es' ? 'Exportar conversación' : 'Export conversation',
          action: () => exportConversation()
        },
        {
          icon: <MenuBookIcon />,
          name: currentLanguage === 'es' ? 'Glosario médico' : 'Medical glossary',
          action: () => setGlossaryOpen(true)
        }
      ];

const renderForm = () => {
  const isCrio = activeTab === TABS.CRIO;
  const t = {
    es: {
      contactData: 'Datos de contacto',
      medicalInfo: 'Información médica',
      message: 'Mensaje',
      nombre: 'Nombre',
      apellidos: 'Apellidos',
      email: 'E-mail',
      telefono: 'Teléfono',
      telefonoPlaceholder: '+502 5555 5555',
      telefonoHelper: 'Sólo números o +; ej: +502 5555 5555',
      semanaEmbarazo: 'Semana de Embarazo',
      nombreGinecologo: 'Nombre de Doctor/Especialista',
      telefonosContacto: 'Teléfonos de Contacto',
      telefonosHelper: 'Opcional — separa con comas si son varios',
      hospital: 'Hospital en donde se Atenderá',
      opcional: 'Opcional',
      mensaje: 'Mensaje'
    },
    en: {
      contactData: 'Contact Data',
      medicalInfo: 'Medical Information',
      message: 'Message',
      nombre: 'Name',
      apellidos: 'Last Name',
      email: 'E-mail',
      telefono: 'Phone',
      telefonoPlaceholder: '+502 5555 5555',
      telefonoHelper: 'Only numbers or +; e.g.: +502 5555 5555',
      semanaEmbarazo: 'Pregnancy Week',
      nombreGinecologo: 'Doctor/Specialist Name',
      telefonosContacto: 'Contact Phones',
      telefonosHelper: 'Optional — separate with commas if multiple',
      hospital: 'Hospital Where You Will Be Attended',
      opcional: 'Optional',
      mensaje: 'Message'
    }
  };
  const lang = t[currentLanguage] || t.es;

  return (
    <Box sx={{ pt: 1 }}>
      {/* DATOS DE CONTACTO */}
      <Typography sx={SECTION_TITLE_SX(darkMode)}>{lang.contactData}</Typography>
      <Box component={Grid} container spacing={1.5}>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth variant="filled" label={lang.nombre}
            required value={formData.nombre || ''}
            error={!!formErrors.nombre}
            helperText={formErrors.nombre || ''}
            onChange={(e)=>{ setFormData(p=>({...p,nombre:e.target.value})); setFormErrors(p=>({...p,nombre:undefined})); }}
            sx={TF_FILLED_SX(darkMode)}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth variant="filled" label={lang.apellidos}
            value={formData.apellidos || ''}
            onChange={(e)=>setFormData(p=>({...p,apellidos:e.target.value}))}
            sx={TF_FILLED_SX(darkMode)}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth variant="filled" label={lang.email} type="email"
            required value={formData.email || ''}
            error={!!formErrors.email}
            helperText={formErrors.email || ''}
            onChange={(e)=>{ setFormData(p=>({...p,email:e.target.value})); setFormErrors(p=>({...p,email:undefined})); }}
            sx={TF_FILLED_SX(darkMode)}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth variant="filled" label={lang.telefono}
            placeholder={lang.telefonoPlaceholder}
            value={formData.telefono || ''}
            onChange={(e)=>setFormData(p=>({...p,telefono:e.target.value}))}
            helperText={lang.telefonoHelper}
            sx={TF_FILLED_SX(darkMode)}
          />
        </Grid>
      </Box>

      {/* INFORMACIÓN MÉDICA */}
      <Typography sx={SECTION_TITLE_SX(darkMode)}>{lang.medicalInfo}</Typography>
      <Box component={Grid} container spacing={1.5}>
        {isCrio && (
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth variant="filled" type="number"
              label={lang.semanaEmbarazo}
              value={formData.semana_de_embarazo || ''}
              onChange={(e)=>setFormData(p=>({...p,semana_de_embarazo:e.target.value}))}
              helperText={lang.opcional}
              sx={TF_FILLED_SX(darkMode)}
            />
          </Grid>
        )}
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth variant="filled" label={lang.nombreGinecologo}
            value={formData.nombre_de_ginecologo || ''}
            onChange={(e)=>setFormData(p=>({...p,nombre_de_ginecologo:e.target.value}))}
            helperText={lang.opcional}
            sx={TF_FILLED_SX(darkMode)}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth variant="filled" label={lang.telefonosContacto}
            value={formData.telefonos_de_contacto || ''}
            onChange={(e)=>setFormData(p=>({...p,telefonos_de_contacto:e.target.value}))}
            helperText={lang.telefonosHelper}
            sx={TF_FILLED_SX(darkMode)}
          />
        </Grid>

        {/* Hospital (solo lo mostramos en Criopreservación tal como tu formData soporta) */}
        {isCrio && (
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth variant="filled" label={lang.hospital}
              value={formData.hospital_donde_se_atendera || ''}
              onChange={(e)=>setFormData(p=>({...p,hospital_donde_se_atendera:e.target.value}))}
              helperText={lang.opcional}
              sx={TF_FILLED_SX(darkMode)}
            />
          </Grid>
        )}
      </Box>

      {/* MENSAJE */}
      <Typography sx={SECTION_TITLE_SX(darkMode)}>{lang.message}</Typography>
      <TextField
        fullWidth variant="filled" label={lang.mensaje}
        multiline minRows={5}
        value={formData.mensaje || ''}
        onChange={(e)=>setFormData(p=>({...p,mensaje:e.target.value}))}
        sx={TF_FILLED_SX(darkMode)}
      />
    </Box>
  );
};


  return (
    <div className="container" style={{ 
      fontFamily: 'Manrope, sans-serif',
      backgroundColor: darkMode ? '#1a1a1a' : '#dfe4ea',
      color: darkMode ? '#ffffff' : '#000000',
      minHeight: '100vh',
      transition: 'all 0.3s ease-in-out'
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@300;700&display=swap" rel="stylesheet" />
          <style>
            {`
              ::-webkit-scrollbar {
                width: 6px;
              }
              ::-webkit-scrollbar-track {
                background: transparent;
              }
              ::-webkit-scrollbar-thumb {
                background-color: ${darkMode ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'};
                border-radius: 4px;
              }
              @keyframes fadeIn {
                from {
                  opacity: 0;
                  transform: translateY(-10px);
                }
                to {
                  opacity: 1;
                  transform: translateY(0);
                }
              }
            `}
          </style>
          <img
            src={Logo}
            alt="Logo"
            style={{
              position: 'fixed',
              top: isMobile ? 8 : 1,
              left: isMobile ? 12 : 16,
              height: logoSize,
              zIndex: 1
            }}
          />

          {/* Control Panel */}
          <Box
            sx={{
              position: 'fixed',
              top: isMobile ? 8 : 16,
              right: isMobile ? 8 : 16,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              zIndex: 10,
              backgroundColor: darkMode ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.7)',
              backdropFilter: 'blur(10px)',
              borderRadius: 2,
              p: 1,
              border: `1px solid ${darkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'}`
            }}
          >
            {/* Dark Mode Toggle */}
            <Tooltip title={darkMode ? "Modo claro" : "Modo oscuro"}>
              <IconButton 
                onClick={toggleDarkMode} 
                size="small"
                sx={{ 
                  color: darkMode ? '#ffffff' : '#000000',
                  '&:hover': {
                    backgroundColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
                  }
                }}
              >
                {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
            </Tooltip>

            {/* Language Selector */}
            <Tooltip title="Idioma">
              <FormControl size="small" sx={{ minWidth: 80 }}>
                <Select
                  value={currentLanguage}
                  onChange={(e) => changeLanguage(e.target.value)}
                  sx={{ 
                    color: darkMode ? '#ffffff' : '#000000',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: darkMode ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'
                    }
                  }}
                >
                  <MenuItem value="es">ES</MenuItem>
                  <MenuItem value="en">EN</MenuItem>
                </Select>
              </FormControl>
            </Tooltip>

            {/* Speed Dial Toggle Button */}
            <Tooltip title={currentLanguage === 'es' ? 'Opciones adicionales' : 'Additional options'}>
              <IconButton 
                onClick={() => setSpeedDialOpen(!speedDialOpen)}
                size="small"
                sx={{ 
                  color: darkMode ? '#ffffff' : '#000000',
                  '&:hover': {
                    backgroundColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
                  }
                }}
              >
                {speedDialOpen ? <CloseIcon /> : <MoreVertIcon />}
              </IconButton>
            </Tooltip>
          </Box>

          {/* Speed Dial Actions */}
          {speedDialOpen && (
            <Box
              sx={{
                position: 'fixed',
                top: isMobile ? 68 : 78,
                right: isMobile ? 8 : 16,
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
                zIndex: 11,
                backgroundColor: darkMode ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.7)',
                backdropFilter: 'blur(10px)',
                borderRadius: 2,
                p: 1,
                border: `1px solid ${darkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'}`,
                animation: 'fadeIn 0.2s ease-in-out'
              }}
            >
              {speedDialActions.map((action) => (
                <Tooltip key={action.name} title={action.name}>
                  <IconButton
                    onClick={() => {
                      action.action();
                      setSpeedDialOpen(false);
                    }}
                    size="small"
                    sx={{
                      color: darkMode ? '#ffffff' : '#000000',
                      '&:hover': {
                        backgroundColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
                      }
                    }}
                  >
                    {action.icon}
                  </IconButton>
                </Tooltip>
              ))}
            </Box>
          )}

      <footer style={{
          position: 'fixed',
          bottom: 0,
          width: '100%',
          textAlign: 'center',
          fontSize: isMobile ? 9 : 10,
          padding: '3px 0',
          color: '#999',
          fontFamily: 'Manrope, sans-serif',
          height: footerHeight,
          zIndex:1
        }}>
          {currentLanguage === 'es' 
            ? '© 2025 Supervisado por el Departamento de Investigación & Desarrollo en Stem Care. | Comprueba la información importante ó contáctanos.'
            : '© 2025 Supervised by the Research & Development Department at Stem Care. | Verify important information or contact us.'
          }
</footer>



      <Canvas
        // camera={{ position: [0, 0, 5], fov: 50 }}
        camera={{ position: [0, 0, 5], fov: isMobile ? 55 : 50 }}
        gl={{ 
          alpha: true, 
          antialias: true, 
          toneMapping: THREE.ACESFilmicToneMapping,
          powerPreference: "high-performance"
        }}
        shadows
        dpr={[1, 2]}
      >
        <color attach="background" args={[darkMode ? "#1a1a1a" : "#dfe4ea"]} />
        <ambientLight intensity={0.3} />
        <directionalLight position={[5, 5, 5]} intensity={0.4} castShadow />
        <Environment preset="sunset" background={false} />
        <CellCameraRig isAIResponding={loading} reducedMotion={prefersReducedMotion} />
        <Membrane isAIResponding={loading} reducedMotion={prefersReducedMotion} />
        {/* <GlowRing /> */}
        <Nucleus isAIResponding={loading} reducedMotion={prefersReducedMotion} />
        {/* <Cytoplasm isAIResponding={loading} /> */}
        <AdaptiveDpr />
        <EffectComposer>
          <Bloom 
            intensity={0.15} 
            luminanceThreshold={0.7} 
            luminanceSmoothing={0.4}
            mipmapBlur={true}
            resolutionX={512}
            resolutionY={512}
          />
          <DynamicDepthOfField isAIResponding={loading} />
        </EffectComposer>
      </Canvas>

      <Collapse in={hasConversation} timeout={300} unmountOnExit>
        <Box
          ref={scrollRef}
          sx={{
            position:'fixed',
            left:'50%',
            transform:'translateX(-50%)',
            bottom: (footerHeight + 6) + (isMobile ? 96 : 108), // ~dock height; adjust once
            width:'100%', maxWidth: chatMaxWidth,
            maxHeight: isMobile ? '42vh' : '55vh',
            overflowY:'auto',
            backdropFilter: loading ? 'blur(2px)' : 'blur(12px)',
            backgroundColor: darkMode 
              ? (loading ? 'rgba(0,0,0,0.05)' : 'rgba(0,0,0,0.3)')
              : (loading ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.3)'),
            borderRadius:2, p:2,
            transition: 'all 0.3s ease-in-out',
            border: darkMode
              ? (loading ? '2px solid rgba(255,255,255,0.3)' : '1px solid rgba(255,255,255,0.1)')
              : (loading ? '2px solid rgba(255,255,255,0.3)' : '1px solid rgba(255,255,255,0.1)'),
            boxShadow: darkMode
              ? (loading ? '0 0 20px rgba(255,255,255,0.2)' : '0 0 10px rgba(255,255,255,0.1)')
              : (loading ? '0 0 20px rgba(255,255,255,0.2)' : '0 0 10px rgba(255,255,255,0.1)'),
          }}
        >
          {messages.map((m, i) => {
  const prevRole = i > 0 ? messages[i - 1].role : null;
  // more space when role changes (user↔assistant)
  const mt = i === 0 ? 0 : (prevRole && prevRole !== m.role ? 2 : 1); // 32px vs 16px

      return (
        <Box key={i} data-message-box={m.content} sx={{ 
          mt,
          mb: 1,
          p: 1.5,
          borderRadius: 2,
          backgroundColor: m.role === 'user' 
            ? (darkMode ? 'rgba(125, 125, 168, 0.1)' : 'rgba(125, 125, 168, 0.05)')
            : (darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)'),
          border: m.role === 'user'
            ? `1px solid ${darkMode ? 'rgba(125, 125, 168, 0.3)' : 'rgba(125, 125, 168, 0.2)'}`
            : `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
          transition: 'all 0.2s ease-in-out'
        }}>
        <Box
          data-message-content={m.content}
          sx={{
              color: darkMode 
                ? (m.role === 'user' ? '#ffffff' : '#e0e0e0')
                : (m.role === 'user' ? '#1a1a1a' : '#333333'),
            fontFamily: 'Manrope',
            fontWeight: m.role === 'user' ? 600 : 400,
            fontSize: bodyFontSize,
            lineHeight: 1.5,
        '& p': { 
          margin: 0,
          marginBottom: '0.8rem',
          lineHeight: 1.6,
          color: 'inherit'
        },
        '& ul, & ol': { 
          margin: 0,
          marginBottom: '0.8rem',
          paddingLeft: '1.5rem',
          color: 'inherit'
        },
        '& li': { 
          margin: 0,
          marginBottom: '0.4rem',
          lineHeight: 1.5,
          color: 'inherit'
        },
        '& h1, & h2, & h3': {
          margin: 0,
          marginBottom: '0.5rem',
          marginTop: '0.8rem',
          color: 'inherit'
        },
        '& strong': {
          fontWeight: 600,
          color: 'inherit'
        },
        '& em': {
          fontStyle: 'italic',
          color: 'inherit'
        }
      }}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          // Enhanced paragraph styling
          p: (props) => (
            <p 
              style={{ 
                margin: 0, 
                lineHeight: 1.6, 
                marginBottom: '0.8rem',
                color: darkMode ? '#e0e0e0' : '#333333'
              }} 
              {...props} 
            />
          ),
          
          // Enhanced list styling
          ul: (props) => (
            <ul 
              style={{ 
                margin: 0, 
                paddingLeft: '1.5rem', 
                lineHeight: 1.6, 
                marginBottom: '0.8rem',
                color: darkMode ? '#e0e0e0' : '#333333'
              }} 
              {...props} 
            />
          ),
          
          ol: (props) => (
            <ol 
              style={{ 
                margin: 0, 
                paddingLeft: '1.5rem', 
                lineHeight: 1.6, 
                marginBottom: '0.8rem',
                color: darkMode ? '#e0e0e0' : '#333333'
              }} 
              {...props} 
            />
          ),
          
          li: (props) => (
            <li 
              style={{ 
                margin: 0, 
                marginBottom: '0.4rem',
                lineHeight: 1.5,
                color: darkMode ? '#e0e0e0' : '#333333'
              }} 
              {...props} 
            />
          ),
          
          // Enhanced heading styling
          h1: (props) => (
            <h1 
              style={{ 
                margin: 0, 
                fontSize: '1.3rem', 
                fontWeight: 700, 
                marginBottom: '0.6rem',
                marginTop: '0.8rem',
                color: darkMode ? '#ffffff' : '#1a1a1a',
                borderBottom: `2px solid ${darkMode ? '#7d7da8' : '#7d7da8'}`,
                paddingBottom: '0.3rem',
                lineHeight: 1.3
              }} 
              {...props} 
            />
          ),
          
          h2: (props) => (
            <h2 
              style={{ 
                margin: 0, 
                fontSize: '1.2rem', 
                fontWeight: 600, 
                marginBottom: '0.5rem',
                marginTop: '0.7rem',
                color: darkMode ? '#ffffff' : '#1a1a1a',
                lineHeight: 1.3
              }} 
              {...props} 
            />
          ),
          
          h3: (props) => (
            <h3 
              style={{ 
                margin: 0, 
                fontSize: '1.1rem', 
                fontWeight: 600, 
                marginBottom: '0.4rem',
                marginTop: '0.6rem',
                color: darkMode ? '#ffffff' : '#1a1a1a',
                lineHeight: 1.3
              }} 
              {...props} 
            />
          ),
          
          // Enhanced link styling
          a: (props) => (
            <a 
              style={{ 
                textDecoration: 'underline',
                color: darkMode ? '#7d7da8' : '#7d7da8',
                fontWeight: 500,
                transition: 'color 0.2s ease'
              }} 
              {...props} 
            />
          ),
          
          // Enhanced strong/bold styling
          strong: (props) => (
            <strong 
              style={{ 
                fontWeight: 600,
                color: darkMode ? '#ffffff' : '#1a1a1a'
              }} 
              {...props} 
            />
          ),
          
          // Enhanced emphasis/italic styling
          em: (props) => (
            <em 
              style={{ 
                fontStyle: 'italic',
                color: darkMode ? '#b0b0b0' : '#666666'
              }} 
              {...props} 
            />
          ),
          
          // Enhanced code styling
          code: (props) => (
            <code 
              style={{ 
                backgroundColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                padding: '0.2rem 0.4rem',
                borderRadius: '4px',
                fontSize: '0.9em',
                fontFamily: 'Monaco, Consolas, "Courier New", monospace',
                color: darkMode ? '#ff6b6b' : '#d63384'
              }} 
              {...props} 
            />
          ),
          
          // Enhanced blockquote styling
          blockquote: (props) => (
            <blockquote 
              style={{ 
                margin: 0,
                paddingLeft: '1rem',
                borderLeft: `3px solid ${darkMode ? '#7d7da8' : '#7d7da8'}`,
                backgroundColor: darkMode ? 'rgba(125, 125, 168, 0.1)' : 'rgba(125, 125, 168, 0.05)',
                padding: '0.8rem',
                borderRadius: '0 6px 6px 0',
                marginBottom: '0.8rem',
                fontStyle: 'italic',
                color: darkMode ? '#e0e0e0' : '#555555',
                lineHeight: 1.5
              }} 
              {...props} 
            />
          ),
          
          // Enhanced table styling
          table: (props) => (
            <table 
              style={{ 
                width: '100%',
                borderCollapse: 'collapse',
                marginBottom: '0.8rem',
                backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                borderRadius: '8px',
                overflow: 'hidden',
                border: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`
              }} 
              {...props} 
            />
          ),
          
          th: (props) => (
            <th 
              style={{ 
                padding: '0.8rem',
                backgroundColor: darkMode ? 'rgba(125, 125, 168, 0.2)' : 'rgba(125, 125, 168, 0.1)',
                color: darkMode ? '#ffffff' : '#1a1a1a',
                fontWeight: 600,
                textAlign: 'left',
                borderBottom: `1px solid ${darkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'}`,
                fontSize: '0.9rem'
              }} 
              {...props} 
            />
          ),
          
          td: (props) => (
            <td 
              style={{ 
                padding: '0.8rem',
                borderBottom: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                color: darkMode ? '#e0e0e0' : '#333333',
                fontSize: '0.9rem',
                lineHeight: 1.4
              }} 
              {...props} 
            />
          ),
          
          // Enhanced horizontal rule styling
          hr: (props) => (
            <hr 
              style={{ 
                border: 'none',
                height: '2px',
                backgroundColor: darkMode ? 'rgba(125, 125, 168, 0.3)' : 'rgba(125, 125, 168, 0.2)',
                margin: '1rem 0',
                borderRadius: '1px'
              }} 
              {...props} 
            />
          )
        }}
      >
        {m.content}
      </ReactMarkdown>
    </Box>
      
      {/* Timestamp and Action Buttons */}
      {m.timestamp && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mt: 0.5
          }}
        >
          <Typography
            sx={{
              fontSize: '0.7rem',
              color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)',
              fontFamily: 'Manrope'
            }}
          >
            {formatTimestamp(m.timestamp)}
          </Typography>
          
          {/* Action buttons for assistant messages */}
          {m.role === 'assistant' && (
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <Tooltip title={currentLanguage === 'es' ? 'Copiar mensaje' : 'Copy message'}>
                <IconButton
                  size="small"
                  onClick={() => copyMessageContent(m.content)}
                  sx={{
                    padding: '3px',
                    color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)',
                    '&:hover': {
                      color: darkMode ? '#ffffff' : '#000000',
                      backgroundColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
                    }
                  }}
                >
                  <ContentCopyIcon sx={{ fontSize: '1.1rem' }} />
                </IconButton>
              </Tooltip>
              
              <Tooltip title={currentLanguage === 'es' ? 'Exportar mensaje' : 'Export message'}>
                <IconButton
                  size="small"
                  onClick={() => exportMessage(m.content, m.timestamp)}
                  sx={{
                    padding: '3px',
                    color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)',
                    '&:hover': {
                      color: darkMode ? '#ffffff' : '#000000',
                      backgroundColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
                    }
                  }}
                >
                  <DownloadIcon sx={{ fontSize: '1.1rem' }} />
                </IconButton>
              </Tooltip>

            </Box>
          )}
        </Box>
      )}
    </Box>
  );
})}

    {/* Typing Indicator */}
    {typing && (
      <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography
          sx={{
            color: darkMode ? '#cccccc' : '#565457ff',
            fontFamily: 'Manrope',
            fontSize: bodyFontSize,
            fontStyle: 'italic'
          }}
        >
          {currentLanguage === 'es' ? 'El asistente está escribiendo' : 'Assistant is typing'}
        </Typography>
        <Box sx={{ display: 'flex', gap: 0.35 }}>
          {[0, 1, 2].map((i) => (
            <Box
              key={i}
              sx={{
                width: 4,
                height: 4,
                borderRadius: '50%',
                backgroundColor: darkMode ? '#cccccc' : '#565457ff',
                animation: `typing 1.4s infinite ease-in-out ${i * 0.2}s`,
                '@keyframes typing': {
                  '0%, 60%, 100%': { transform: 'translateY(0)' },
                  '30%': { transform: 'translateY(-8px)' }
                }
              }}
            />
          ))}
        </Box>
      </Box>
    )}

    {/* Schedule Consultation Button - Show every 3 questions */}
    {shouldShowMeetingDrawer() && !typing && (
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
        <Button
          variant="contained"
          startIcon={<EditCalendarIcon />}
          onClick={() => setOpenDialog(true)}
          sx={{
            fontFamily: 'Manrope',
            fontWeight: 600,
            backgroundColor: '#7d7da8',
            color: 'white',
            borderRadius: 2,
            px: 3,
            py: 1,
            '&:hover': {
              backgroundColor: '#8787bf',
              transform: 'translateY(-1px)',
              boxShadow: '0 4px 12px rgba(62, 7, 84, 0.4)'
            },
            transition: 'all 0.2s ease-in-out'
          }}
        >
          {currentLanguage === 'es' ? 'Agendar Consulta con Especialistas' : 'Schedule Consultation with Specialists'}
        </Button>
      </Box>
    )}

        </Box>
      </Collapse>

      {/* Bottom dock (fixed once) */}
      <Box
        sx={{
          position: 'fixed',
          left: '50%',
          transform: 'translateX(-50%)',
          bottom: footerHeight + 6,   // keep only footer offset
          width: isMobile ? '95%' : '100%',
          maxWidth: promptMaxWidth,
          px: isMobile ? 1 : 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,                     // natural spacing between chips and prompt
        }}
      >
        {/* Chips row (no absolute bottom) */}
        <Box sx={{ display:'flex', flexWrap:'wrap', gap: isMobile ? 0.5 : 1, justifyContent:'center' }}>
          {(currentLanguage === 'es' 
            ? ['Beneficios de células madre','Terapia Celular','Pruebas Genéticas']
            : ['Stem Cell Benefits','Cell Therapy','Genetic Testing']
          ).map((q,i)=>(
                <Chip 
                  key={i} 
                  size={isMobile ? 'small' : 'medium'} 
                  label={q} 
                  variant="outlined"
                  onClick={() => handleChipClick(q)} 
                  sx={{ 
                    fontFamily: 'Manrope',
                    backgroundColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(255, 255, 255, 0)',
                    color: darkMode ? '#ffffff' : '#000000',
                    borderColor: darkMode ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)',
                    '&:hover': {
                      backgroundColor: darkMode ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.9)',
                      borderColor: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)',
                    },
                    transition: 'all 0.2s ease-in-out'
                  }} 
                />
          ))}
        </Box>

            {/* Prompt box (no absolute bottom) */}
            <Box sx={{ 
              display:'flex', 
              alignItems:'center', 
              bgcolor: darkMode ? 'rgba(255,255,255,0.1)' : '#f0f0f0ff', 
              borderRadius:'20px', 
              px: isMobile ? 0.5 : 2, 
              py: isMobile ? 0.75 : 1.5,
              border: darkMode ? '1px solid rgba(255,255,255,0.2)' : 'none',
              transition: 'all 0.3s ease-in-out',
              width: '100%',
              maxWidth: '100%'
            }}>
          <TextField
            fullWidth variant="standard" 
            placeholder={currentLanguage === 'es' ? "Pregunta sobre células madre" : "Ask about stem cells"}
            InputProps={{ 
              disableUnderline:true, 
              sx:{
                fontFamily:'Manrope', 
                fontSize: isMobile ? 13 : 14,
                px: isMobile ? 1 : 0,
                color: darkMode ? '#ffffff' : '#000000',
                '&::placeholder': {
                  color: darkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)'
                }
              },
              value: input, 
              onChange:(e)=>setInput(e.target.value),
              onKeyDown:(e)=> e.key==='Enter' && sendMessage(),
              endAdornment:(
                <InputAdornment position="end">
                  <Tooltip title={currentLanguage === 'es' ? "Haz click para agendar tu consulta" : "Click to schedule your consultation"}>
                    <IconButton onClick={()=>setOpenDialog(true)} size={isMobile ? 'small' : 'medium'}>
                      <EditCalendarIcon sx={{ color: darkMode ? '#ffffff' : '#535353ff' }} />
                    </IconButton>
                  </Tooltip>
                </InputAdornment>
              )
            }}
          />
        </Box>
      </Box>


        <Dialog
          open={openDialog}
          onClose={() => { setOpenDialog(false); setFormErrors({}); }}
          fullScreen={isMobile}
          PaperProps={{
            sx: {
              backdropFilter: 'blur(12px)',
              backgroundColor: darkMode ? 'rgba(0,0,0,0.94)' : 'rgba(255,255,255,0.94)',
              borderRadius: isMobile ? 0 : 2,
              boxShadow: '0 8px 40px rgba(0,0,0,.08)',
              px: isMobile ? 1.5 : 3,
              py: isMobile ? 1 : 2,
              border: `1px solid ${darkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'}`,
              color: darkMode ? '#ffffff' : '#000000'
            }
          }}
        >


      
        <DialogTitle sx={{fontFamily: 'Manrope', color: darkMode ? '#ffffff' : '#000000'}}>
          {currentLanguage === 'es' ? 'Agendar Consulta' : 'Schedule Consultation'}
        </DialogTitle>
        <Tabs
          value={activeTab}
          onChange={(e, v) => setActiveTab(v)}
          variant={isMobile ? 'scrollable' : 'fullWidth'}
          scrollButtons={isMobile ? 'auto' : false}
          sx={{ 
            borderBottom: 1, 
            borderColor: darkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
            '& .MuiTab-root': {
              color: '#7d7da8',
            },
            '& .Mui-selected': {
              color: darkMode ? '#FFFFFF' : '#7d7da8',
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#7d7da8',
            },
          }}
        >

          <Tab label={currentLanguage === 'es' ? "Criopreservación" : "Cryopreservation"} sx={{fontFamily: 'Manrope,', fontWeight:500 }} />
          <Tab label={currentLanguage === 'es' ? "Terapia Celular" : "Cell Therapy"} sx={{fontFamily: 'Manrope', fontWeight:500}}/>
          <Tab label={currentLanguage === 'es' ? "Pruebas Genéticas" : "Genetic Testing"} sx={{fontFamily: 'Manrope', fontWeight:500}} />
        </Tabs>

        {/* <DialogContent sx={{fontFamily: 'Manrope'}}  >
          {renderForm()}
        </DialogContent> */}

        <DialogContent
          sx={{
            fontFamily: 'Manrope',
            pt: 1,
            pb: 2,
            color: darkMode ? '#ffffff' : '#000000',
            '& .MuiDialogContent-root': { p: 0 },
          }}
        >
          {renderForm()}
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() => { setOpenDialog(false); setFormErrors({}); }}
            sx={{
              fontFamily: 'Manrope', 
              fontWeight: 700,
              color: '#7d7da8',
              '&:hover': {
                backgroundColor: 'rgba(125, 125, 168, 0.1)'
              }
            }}
          >
            {currentLanguage === 'es' ? 'Cancelar' : 'Cancel'}
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSubmit} 
            sx={{
              fontFamily: 'Manrope', 
              fontWeight: 700,
              backgroundColor: '#7d7da8',
              '&:hover': {
                backgroundColor: '#8787bf'
              }
            }}
          >
            {currentLanguage === 'es' ? 'Enviar' : 'Send'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Medical Glossary Dialog */}
      <MedicalGlossary 
        open={glossaryOpen} 
        onClose={() => setGlossaryOpen(false)} 
        language={currentLanguage}
        darkMode={darkMode}
      />

      {/* Meeting Drawer */}
      <Drawer
        anchor="right"
        open={meetingDrawerOpen}
        onClose={closeMeetingDrawer}
        PaperProps={{
          sx: {
            width: isMobile ? '100%' : 400,
            backgroundColor: darkMode ? '#1a1a1a' : '#ffffff',
            color: darkMode ? '#ffffff' : '#000000'
          }
        }}
      >
        <Box sx={{ p: 2 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontFamily: 'Manrope', fontWeight: 700 }}>
              {currentLanguage === 'es' ? 'Consulta con Especialistas' : 'Consult with Specialists'}
            </Typography>
            <IconButton onClick={closeMeetingDrawer} size="small">
              <CloseIcon />
            </IconButton>
          </Box>

          <Divider sx={{ mb: 2 }} />

          {/* Main Content */}
          <Card sx={{ mb: 2, backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}>
            <CardContent>
              <Typography variant="body1" sx={{ mb: 2, fontFamily: 'Manrope' }}>
                {currentLanguage === 'es' 
                  ? '¿Te gustaría hablar con nuestros especialistas en células madre?'
                  : 'Would you like to speak with our stem cell specialists?'
                }
              </Typography>
              
              <Typography variant="body2" sx={{ mb: 2, color: darkMode ? '#cccccc' : '#666666' }}>
                {currentLanguage === 'es'
                  ? 'Nuestro equipo de asesores médicos y especialistas en células madre está disponible para brindarte información personalizada y responder a tus preguntas específicas.'
                  : 'Our team of medical advisors and stem cell specialists is available to provide you with personalized information and answer your specific questions.'
                }
              </Typography>
            </CardContent>
          </Card>

          {/* Services List */}
          <List>
            <ListItem sx={{ px: 0 }}>
              <ListItemIcon>
                <VideoCallIcon sx={{ color: darkMode ? '#4a9eff' : '#1976d2' }} />
              </ListItemIcon>
              <ListItemText
                primary={currentLanguage === 'es' ? 'Consulta Virtual' : 'Virtual Consultation'}
                secondary={currentLanguage === 'es' 
                  ? 'Reunión en línea con especialistas'
                  : 'Online meeting with specialists'
                }
              />
            </ListItem>

            <ListItem sx={{ px: 0 }}>
              <ListItemIcon>
                <SupportAgentIcon sx={{ color: darkMode ? '#4a9eff' : '#1976d2' }} />
              </ListItemIcon>
              <ListItemText
                primary={currentLanguage === 'es' ? 'Asesoría Personalizada' : 'Personalized Advice'}
                secondary={currentLanguage === 'es' 
                  ? 'Información específica para tu caso'
                  : 'Specific information for your case'
                }
              />
            </ListItem>

            <ListItem sx={{ px: 0 }}>
              <ListItemIcon>
                <MedicalServicesIcon sx={{ color: darkMode ? '#4a9eff' : '#1976d2' }} />
              </ListItemIcon>
              <ListItemText
                primary={currentLanguage === 'es' ? 'Evaluación Médica' : 'Medical Evaluation'}
                secondary={currentLanguage === 'es' 
                  ? 'Revisión de tu situación médica'
                  : 'Review of your medical situation'
                }
              />
            </ListItem>
          </List>

          <Divider sx={{ my: 2 }} />

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Button
              variant="contained"
              startIcon={<ScheduleIcon />}
              onClick={() => {
                closeMeetingDrawer();
                setOpenDialog(true);
              }}
              sx={{
                fontFamily: 'Manrope',
                fontWeight: 600,
                backgroundColor: darkMode ? '#4a9eff' : '#1976d2',
                '&:hover': {
                  backgroundColor: darkMode ? '#357abd' : '#1565c0'
                }
              }}
            >
              {currentLanguage === 'es' ? 'Agendar Consulta' : 'Schedule Consultation'}
            </Button>

            <Button
              variant="outlined"
              startIcon={<VideoCallIcon />}
              onClick={() => {
                // Here you could integrate with a video calling service
                notify(
                  currentLanguage === 'es'
                    ? 'Próximamente: Consultas por video en tiempo real'
                    : 'Coming soon: Real-time video consultations',
                  'info'
                );
              }}
              sx={{
                fontFamily: 'Manrope',
                fontWeight: 600,
                borderColor: darkMode ? '#4a9eff' : '#1976d2',
                color: darkMode ? '#4a9eff' : '#1976d2',
                '&:hover': {
                  borderColor: darkMode ? '#357abd' : '#1565c0',
                  backgroundColor: darkMode ? 'rgba(74, 158, 255, 0.1)' : 'rgba(25, 118, 210, 0.1)'
                }
              }}
            >
              {currentLanguage === 'es' ? 'Llamada Inmediata' : 'Immediate Call'}
            </Button>
          </Box>

          {/* Footer */}
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="caption" sx={{ color: darkMode ? '#cccccc' : '#666666' }}>
              {currentLanguage === 'es' 
                ? 'Disponible de lunes a viernes, 8:00 AM - 6:00 PM'
                : 'Available Monday to Friday, 8:00 AM - 6:00 PM'
              }
            </Typography>
          </Box>
        </Box>
      </Drawer>

      {/* Global feedback (replaces alert()) */}
      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnack(s => ({ ...s, open: false }))}
          severity={snack.severity}
          variant="filled"
          sx={{ fontFamily: 'Manrope' }}
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </div>
  )
}


