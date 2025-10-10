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
import InteractiveCell from './InteractiveCell'
import GlowRing from './GlowRing'
import * as THREE from 'three'
import './App.css'
import { Environment } from '@react-three/drei'
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
import ShareIcon from '@mui/icons-material/Share';
import FacebookIcon from '@mui/icons-material/Facebook';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import InstagramIcon from '@mui/icons-material/Instagram';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import LanguageIcon from '@mui/icons-material/Language';
import DownloadIcon from '@mui/icons-material/Download';
import HistoryIcon from '@mui/icons-material/History';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import TouchAppIcon from '@mui/icons-material/TouchApp';
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
  SpeedDialAction, SpeedDialIcon
} from '@mui/material'

import Collapse from '@mui/material/Collapse';


import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import html2canvas from 'html2canvas';



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


function AutoOrbitCamera({ isAIResponding = false }) {
  const ref = useRef({
    radius: 5,
    targetRadius: 5,
    rotationSpeed: 0.2,
    targetRotationSpeed: 0.2,
    verticalOffset: 0,
    targetVerticalOffset: 0
  })
  
  useFrame(({ camera, clock }) => {
    const t = clock.getElapsedTime()
    
    // Smooth transition between normal and AI response modes
    const targetRadius = isAIResponding ? 6.5 : 5
    const targetRotationSpeed = isAIResponding ? 0.4 : 0.2
    const targetVerticalOffset = isAIResponding ? 0.5 : 0
    
    // Smooth interpolation for all parameters
    const lerpSpeed = 0.03
    ref.current.targetRadius = targetRadius
    ref.current.targetRotationSpeed = targetRotationSpeed
    ref.current.targetVerticalOffset = targetVerticalOffset
    
    ref.current.radius += (ref.current.targetRadius - ref.current.radius) * lerpSpeed
    ref.current.rotationSpeed += (ref.current.targetRotationSpeed - ref.current.rotationSpeed) * lerpSpeed
    ref.current.verticalOffset += (ref.current.targetVerticalOffset - ref.current.verticalOffset) * lerpSpeed
    
    // Smooth camera position with easing
    const angle = t * ref.current.rotationSpeed
    const radius = ref.current.radius
    
    camera.position.x = Math.sin(angle) * radius
    camera.position.z = Math.cos(angle) * radius
    
    // Smooth vertical movement
    camera.position.y = Math.sin(t * 0.3) * ref.current.verticalOffset
    
    camera.lookAt(0, 0, 0)
  })
  
  return null
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

// Field configs for each tab
const FIELD_SETS = {
  [TABS.CRIO]: [
    { name: 'nombre',  label: 'Nombre',               required: true },
    { name: 'apellidos', label: 'Apellidos' },
    { name: 'email',   label: 'E-mail',              required: true, type: 'email' },
    { name: 'telefono', label: 'Teléfono' },
    { name: 'semana_de_embarazo', label: 'Semana de embarazo', type: 'number' },
    { name: 'nombre_de_ginecologo', label: 'Nombre de Ginecólogo' },
    { name: 'telefonos_de_contacto', label: 'Teléfonos de contacto' },
  ],

  [TABS.TERAPIA]: [
    { name: 'nombre',  label: 'Nombre',               required: true },
    { name: 'apellidos', label: 'Apellidos' },
    { name: 'email',   label: 'E-mail',              required: true, type: 'email' },
    { name: 'telefono', label: 'Teléfono' },
    { name: 'telefonos_de_contacto', label: 'Teléfonos de contacto' },
    { name: 'mensaje', label: 'Mensaje', type: 'textarea' },
  ],

  // Pruebas genéticas = same as terapia
  [TABS.GENETICAS]: [
    { name: 'nombre',  label: 'Nombre',               required: true },
    { name: 'apellidos', label: 'Apellidos' },
    { name: 'email',   label: 'E-mail',              required: true, type: 'email' },
    { name: 'telefono', label: 'Teléfono' },
    { name: 'telefonos_de_contacto', label: 'Teléfonos de contacto' },
    { name: 'mensaje', label: 'Mensaje', type: 'textarea' },
  ],
};



export default function App() {
  const [prompt, setPrompt] = useState('')
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [typing, setTyping] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [conversationHistory, setConversationHistory] = useState([])
  const [currentLanguage, setCurrentLanguage] = useState('es')
  const [glossaryOpen, setGlossaryOpen] = useState(false)
  const [interactiveMode, setInteractiveMode] = useState(false)
  const [meetingDrawerOpen, setMeetingDrawerOpen] = useState(false)
  const [userQuestionCount, setUserQuestionCount] = useState(0)
  const [speedDialOpen, setSpeedDialOpen] = useState(false)
  
  // Debug: Log loading state changes
  useEffect(() => {
    console.log('Loading state changed:', loading)
  }, [loading])
  const [openDialog, setOpenDialog] = useState(false)
  const [activeTab, setActiveTab] = useState(0)
  const [formData, setFormData] = useState({ nombre: '', apellidos: '', email: '', telefono: '', semana_de_embarazo: '', nombre_de_ginecologo: '', telefonos_de_contacto: '', hospital_donde_se_atendera: '', mensaje: '' })
  
  // if you keep a system message, ignore it for the check
  const hasConversation = messages.some(m => m.role === 'user' || m.role === 'assistant');


  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))     // <=600px
  const isTablet = useMediaQuery(theme.breakpoints.between('sm','md')) // 600–900px

  
  const scrollRef = useRef()

  const chatMaxWidth = isMobile ? '92vw' : isTablet ? 640 : 720
  const chipsMaxWidth = isMobile ? '92vw' : isTablet ? 640 : 720
  const promptMaxWidth = isMobile ? '92vw' : 600
  const messagesBottom = isMobile ? 175 : 140
  const logoSize       = isMobile ? 64  : 140
  const bodyFontSize   = isMobile ? 13  : 14

  const promptHeight = isMobile ? 60 : 70 // estimated px height of prompt bar
  const footerHeight = isMobile ? 20 : 24 // estimated px height of footer text

  const promptBottom = footerHeight + 6   // 6px gap above footer
  const chipsBottom  = promptBottom + promptHeight // 6px gap above prompt



  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

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
  // 1) Validate only required fields for the current tab
  const required = FIELD_SETS[activeTab].filter(f => f.required).map(f => f.name);
  const missing = required.filter(k => !String(formData[k] ?? '').trim());
  if (missing.length) {
    alert(`Faltan campos: ${missing.join(', ')}`);
    return;
  }

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

    alert('Formulario enviado con éxito');
    setOpenDialog(false);
    // optional: clear only the fields for the current tab
    const cleared = { ...formData };
    FIELD_SETS[activeTab].forEach(f => { cleared[f.name] = '' });
    setFormData(cleared);
  } catch (err) {
    console.error(err);
    alert('Error al enviar el formulario');
  }
};

  const sendMessage = async (customInput) => {
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
    const res = await fetch('/api/chat/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: newMessages, language: currentLanguage })
    });

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
    
    // Save to conversation history
    setConversationHistory(prev => [...prev, {
      id: Date.now(),
      messages: [...newMessages, { ...assistantMessage, content: fullText }],
      timestamp: new Date().toISOString(),
      language: currentLanguage
    }]);
    
    // Note: Meeting drawer is now replaced with inline button in chat
    
  } catch (error) {
    console.error('Chat error:', error);
    setMessages([...newMessages, { 
      role: 'assistant', 
      content: 'Lo siento, hubo un error al procesar tu consulta. Por favor, intenta nuevamente.',
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
          `${msg.role === 'user' ? 'Usuario' : 'Asistente'}: ${msg.content}`
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
          `${msg.role === 'user' ? 'Usuario' : 'Asistente'}: ${msg.content}`
        ).join('\n\n');
        
        try {
          await navigator.clipboard.writeText(conversationText);
          alert(currentLanguage === 'es' ? 'Conversación copiada al portapapeles' : 'Conversation copied to clipboard');
        } catch (err) {
          console.error('Failed to copy conversation:', err);
          alert(currentLanguage === 'es' ? 'Error al copiar la conversación' : 'Error copying conversation');
        }
      };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const changeLanguage = (lang) => {
    setCurrentLanguage(lang);
  };

  // Copy message content to clipboard
  const copyMessageContent = async (content) => {
    try {
      await navigator.clipboard.writeText(content);
      alert(currentLanguage === 'es' ? 'Mensaje copiado al portapapeles' : 'Message copied to clipboard');
    } catch (err) {
      console.error('Failed to copy message:', err);
      alert(currentLanguage === 'es' ? 'Error al copiar el mensaje' : 'Error copying message');
    }
  };

  // Export individual message to file
  const exportMessage = (content, timestamp) => {
    const date = new Date(timestamp).toISOString().split('T')[0];
    const time = new Date(timestamp).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
    
    const messageText = `Stem Care - Mensaje del Asistente\nFecha: ${date}\nHora: ${time}\n\n${content}`;
    
    const blob = new Blob([messageText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stem-care-mensaje-${date}-${time.replace(':', '')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Share message to social media
  const shareMessage = (content, platform, shareType = 'text') => {
    if (shareType === 'screenshot') {
      shareAsScreenshot(content, platform);
      return;
    }

    const shareText = `Información sobre células madre de Stem Care:\n\n${content}\n\n#StemCare #CélulasMadre #MedicinaRegenerativa`;
    const encodedText = encodeURIComponent(shareText);
    const stemCareUrl = 'https://stem-care.com';
    const encodedUrl = encodeURIComponent(stemCareUrl);
    
    let shareUrl = '';
    
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodedText}%20${encodedUrl}`;
        break;
      case 'instagram':
        // Instagram doesn't support direct URL sharing, so we'll copy to clipboard
        navigator.clipboard.writeText(shareText).then(() => {
          alert(currentLanguage === 'es' 
            ? 'Texto copiado al portapapeles. Pégalo en tu historia de Instagram.' 
            : 'Text copied to clipboard. Paste it in your Instagram story.'
          );
        });
        return;
      default:
        return;
    }
    
    // Open share URL in new window
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  // Share as screenshot
  const shareAsScreenshot = async (content, platform) => {
    try {
      console.log('Attempting to capture screenshot for content:', content.substring(0, 100));
      
      // Find the message element to capture - look for the entire message box
      const messageBoxes = document.querySelectorAll('[data-message-box]');
      console.log('Found message boxes:', messageBoxes.length);
      
      let targetElement = null;
      
      // Find the element that contains our content
      for (let element of messageBoxes) {
        console.log('Checking element with content:', element.textContent.substring(0, 100));
        // Try multiple content matching strategies
        const contentMatch = element.textContent.includes(content.substring(0, 50)) ||
                           element.textContent.includes(content.substring(0, 30)) ||
                           element.textContent.includes(content.substring(0, 20)) ||
                           element.getAttribute('data-message-box') === content;
        
        if (contentMatch) {
          targetElement = element;
          console.log('Found matching element!');
          break;
        }
      }
      
      if (!targetElement) {
        // Fallback: try to find any message container with specific styling
        console.log('Primary search failed, trying fallback...');
        const allBoxes = document.querySelectorAll('.MuiBox-root');
        console.log('Found MUI boxes:', allBoxes.length);
        
        for (let element of allBoxes) {
          const hasContent = element.textContent.includes(content.substring(0, 50)) ||
                           element.textContent.includes(content.substring(0, 30)) ||
                           element.textContent.includes(content.substring(0, 20));
          const hasStyling = element.style.backgroundColor || element.style.borderRadius || 
                           element.getAttribute('sx') || element.className.includes('MuiBox');
          
          console.log('Checking fallback element:', {
            hasContent,
            hasStyling,
            content: element.textContent.substring(0, 50)
          });
          
          if (hasContent && hasStyling) {
            targetElement = element;
            console.log('Found fallback element!');
            break;
          }
        }
      }
      
      if (!targetElement) {
        // Last resort: try to find any element with the content
        console.log('Fallback failed, trying last resort...');
        const allElements = document.querySelectorAll('*');
        for (let element of allElements) {
          if (element.textContent && element.textContent.includes(content.substring(0, 50))) {
            // Make sure it's a reasonable size element
            const rect = element.getBoundingClientRect();
            if (rect.width > 100 && rect.height > 50) {
              targetElement = element;
              console.log('Found last resort element!');
              break;
            }
          }
        }
      }
      
      if (!targetElement) {
        // Final fallback: capture the most recent assistant message
        console.log('All searches failed, trying to find the most recent assistant message...');
        
        // Look for the last message box that contains assistant content
        const allMessageBoxes = document.querySelectorAll('[data-message-box]');
        let lastAssistantMessage = null;
        
        for (let i = allMessageBoxes.length - 1; i >= 0; i--) {
          const element = allMessageBoxes[i];
          // Check if this looks like an assistant message (not user message)
          const text = element.textContent;
          if (text && text.length > 50 && !text.includes('Usuario:') && !text.includes('User:')) {
            lastAssistantMessage = element;
            console.log('Found last assistant message as fallback');
            break;
          }
        }
        
        if (lastAssistantMessage) {
          targetElement = lastAssistantMessage;
        } else {
          // Ultimate fallback: capture the entire conversation area
          console.log('No assistant message found, trying conversation area...');
          const conversationArea = document.querySelector('[ref]') || 
                                  document.querySelector('.MuiBox-root[style*="position: fixed"]') ||
                                  document.querySelector('div[style*="overflowY"]');
          
          if (conversationArea) {
            targetElement = conversationArea;
            console.log('Using conversation area as ultimate fallback');
          } else {
            console.error('Could not find any element to capture');
            alert(currentLanguage === 'es' 
              ? 'No se pudo encontrar el mensaje para capturar. Intenta con un mensaje más reciente.' 
              : 'Could not find message to capture. Try with a more recent message.'
            );
            return;
          }
        }
      }
      
      console.log('Target element found:', targetElement);

      // Use html2canvas to capture the element
      const canvas = await html2canvas(targetElement, {
        backgroundColor: darkMode ? '#1a1a1a' : '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        width: targetElement.offsetWidth,
        height: targetElement.offsetHeight,
        scrollX: 0,
        scrollY: 0,
        windowWidth: targetElement.offsetWidth,
        windowHeight: targetElement.offsetHeight
      });

      // Show preview modal
      showScreenshotPreview(canvas, content, platform);
      
    } catch (error) {
      console.error('Screenshot error:', error);
      alert(currentLanguage === 'es' 
        ? 'Error al capturar la imagen' 
        : 'Error capturing image'
      );
    }
  };

  // Show screenshot preview modal
  const showScreenshotPreview = (canvas, content, platform) => {
    // Create preview modal
    const previewModal = document.createElement('div');
    previewModal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.8);
      z-index: 10001;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Manrope', sans-serif;
    `;

    const previewContent = document.createElement('div');
    previewContent.style.cssText = `
      background: ${darkMode ? '#2a2a2a' : '#ffffff'};
      border-radius: 12px;
      padding: 20px;
      max-width: 90%;
      max-height: 90%;
      overflow: auto;
      box-shadow: 0 8px 32px rgba(0,0,0,0.3);
      border: 1px solid ${darkMode ? '#444' : '#ddd'};
    `;

    const title = document.createElement('div');
    title.textContent = currentLanguage === 'es' ? 'Vista previa de la imagen' : 'Image Preview';
    title.style.cssText = `
      font-weight: 600;
      margin-bottom: 16px;
      color: ${darkMode ? '#ffffff' : '#000000'};
      font-size: 18px;
      text-align: center;
    `;

    const imageContainer = document.createElement('div');
    imageContainer.style.cssText = `
      text-align: center;
      margin-bottom: 20px;
      border: 1px solid ${darkMode ? '#444' : '#ddd'};
      border-radius: 8px;
      padding: 10px;
      background: ${darkMode ? '#1a1a1a' : '#f9f9f9'};
    `;

    const img = document.createElement('img');
    img.src = canvas.toDataURL('image/png');
    img.style.cssText = `
      max-width: 100%;
      max-height: 400px;
      border-radius: 4px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    `;

    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = `
      display: flex;
      gap: 12px;
      justify-content: center;
      flex-wrap: wrap;
    `;

    const shareButton = document.createElement('button');
    shareButton.textContent = currentLanguage === 'es' ? 'Compartir' : 'Share';
    shareButton.style.cssText = `
      padding: 12px 24px;
      background: ${platform === 'facebook' ? '#1877F2' : 
                   platform === 'whatsapp' ? '#25D366' : '#E4405F'};
      color: white;
      border: none;
      border-radius: 8px;
      font-family: 'Manrope', sans-serif;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
    `;

    const downloadButton = document.createElement('button');
    downloadButton.textContent = currentLanguage === 'es' ? 'Descargar' : 'Download';
    downloadButton.style.cssText = `
      padding: 12px 24px;
      background: #7d7da8;
      color: white;
      border: none;
      border-radius: 8px;
      font-family: 'Manrope', sans-serif;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
    `;

    const cancelButton = document.createElement('button');
    cancelButton.textContent = currentLanguage === 'es' ? 'Cancelar' : 'Cancel';
    cancelButton.style.cssText = `
      padding: 12px 24px;
      background: transparent;
      color: ${darkMode ? '#ffffff' : '#000000'};
      border: 1px solid ${darkMode ? '#444' : '#ddd'};
      border-radius: 8px;
      font-family: 'Manrope', sans-serif;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
    `;

    // Event handlers
    shareButton.onclick = () => {
      document.body.removeChild(previewModal);
      shareScreenshotImage(canvas, content, platform);
    };

    downloadButton.onclick = () => {
      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = 'stem-care-mensaje.png';
      a.click();
    };

    cancelButton.onclick = () => {
      document.body.removeChild(previewModal);
    };

    // Hover effects
    [shareButton, downloadButton, cancelButton].forEach(btn => {
      btn.onmouseover = () => {
        btn.style.transform = 'translateY(-1px)';
        btn.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
      };
      btn.onmouseout = () => {
        btn.style.transform = 'translateY(0)';
        btn.style.boxShadow = 'none';
      };
    });

    // Assemble modal
    imageContainer.appendChild(img);
    buttonContainer.appendChild(shareButton);
    buttonContainer.appendChild(downloadButton);
    buttonContainer.appendChild(cancelButton);
    
    previewContent.appendChild(title);
    previewContent.appendChild(imageContainer);
    previewContent.appendChild(buttonContainer);
    previewModal.appendChild(previewContent);
    
    document.body.appendChild(previewModal);

    // Close on outside click
    previewModal.onclick = (e) => {
      if (e.target === previewModal) {
        document.body.removeChild(previewModal);
      }
    };
  };

  // Share the screenshot image
  const shareScreenshotImage = async (canvas, content, platform) => {
    try {
      // Convert canvas to blob
      canvas.toBlob(async (blob) => {
        if (!blob) {
          alert(currentLanguage === 'es' 
            ? 'Error al generar la imagen' 
            : 'Error generating image'
          );
          return;
        }

        // Create share text
        const shareText = `Información sobre células madre de Stem Care\n\n#StemCare #CélulasMadre #MedicinaRegenerativa`;
        
        if (platform === 'instagram') {
          // For Instagram, we'll download the image and copy text
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'stem-care-mensaje.png';
          a.click();
          URL.revokeObjectURL(url);
          
          navigator.clipboard.writeText(shareText).then(() => {
            alert(currentLanguage === 'es' 
              ? 'Imagen descargada y texto copiado. Sube la imagen a Instagram con el texto copiado.' 
              : 'Image downloaded and text copied. Upload the image to Instagram with the copied text.'
            );
          });
        } else {
          // For other platforms, we'll use the Web Share API if available
          if (navigator.share && navigator.canShare) {
            const file = new File([blob], 'stem-care-mensaje.png', { type: 'image/png' });
            
            if (navigator.canShare({ files: [file] })) {
              await navigator.share({
                title: 'Stem Care - Información sobre células madre',
                text: shareText,
                files: [file]
              });
            } else {
              // Fallback: download image and copy text
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'stem-care-mensaje.png';
              a.click();
              URL.revokeObjectURL(url);
              
              navigator.clipboard.writeText(shareText).then(() => {
                alert(currentLanguage === 'es' 
                  ? 'Imagen descargada y texto copiado. Comparte la imagen con el texto copiado.' 
                  : 'Image downloaded and text copied. Share the image with the copied text.'
                );
              });
            }
          } else {
            // Fallback for browsers without Web Share API
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'stem-care-mensaje.png';
            a.click();
            URL.revokeObjectURL(url);
            
            navigator.clipboard.writeText(shareText).then(() => {
              alert(currentLanguage === 'es' 
                ? 'Imagen descargada y texto copiado. Comparte la imagen con el texto copiado.' 
                : 'Image downloaded and text copied. Share the image with the copied text.'
              );
            });
          }
        }
      }, 'image/png');
      
    } catch (error) {
      console.error('Share screenshot error:', error);
      alert(currentLanguage === 'es' 
        ? 'Error al compartir la imagen' 
        : 'Error sharing image'
      );
    }
  };

  // Check if we should show meeting drawer (every 3 questions)
  const shouldShowMeetingDrawer = () => {
    return userQuestionCount > 0 && userQuestionCount % 3 === 0;
  };

  // Open meeting drawer
  const openMeetingDrawer = () => {
    setMeetingDrawerOpen(true);
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
        },
        {
          icon: <TouchAppIcon />,
          name: currentLanguage === 'es' ? 'Modo interactivo' : 'Interactive mode',
          action: () => setInteractiveMode(!interactiveMode)
        },
        {
          icon: <HistoryIcon />,
          name: currentLanguage === 'es' ? 'Historial de conversaciones' : 'Conversation history',
          action: () => {
            // Future implementation for conversation history
            alert(currentLanguage === 'es' ? 'Próximamente: Historial de conversaciones' : 'Coming soon: Conversation history');
          }
        }
      ];

const renderForm = () => {
  const isCrio = activeTab === TABS.CRIO;

  return (
    <Box sx={{ pt: 1 }}>
      {/* DATOS DE CONTACTO */}
      <Typography sx={SECTION_TITLE_SX(darkMode)}>Datos de contacto</Typography>
      <Box component={Grid} container spacing={1.5}>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth variant="filled" label="Nombre"
            required value={formData.nombre || ''}
            onChange={(e)=>setFormData(p=>({...p,nombre:e.target.value}))}
            sx={TF_FILLED_SX(darkMode)}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth variant="filled" label="Apellidos"
            value={formData.apellidos || ''}
            onChange={(e)=>setFormData(p=>({...p,apellidos:e.target.value}))}
            sx={TF_FILLED_SX(darkMode)}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth variant="filled" label="E-mail" type="email"
            required value={formData.email || ''}
            onChange={(e)=>setFormData(p=>({...p,email:e.target.value}))}
            sx={TF_FILLED_SX(darkMode)}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth variant="filled" label="Teléfono"
            placeholder="+502 5555 5555"
            value={formData.telefono || ''}
            onChange={(e)=>setFormData(p=>({...p,telefono:e.target.value}))}
            helperText="Sólo números o +; ej: +502 5555 5555"
            sx={TF_FILLED_SX(darkMode)}
          />
        </Grid>
      </Box>

      {/* INFORMACIÓN MÉDICA */}
      <Typography sx={SECTION_TITLE_SX(darkMode)}>Información médica</Typography>
      <Box component={Grid} container spacing={1.5}>
        {isCrio && (
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth variant="filled" type="number"
              label="Semana de Embarazo"
              value={formData.semana_de_embarazo || ''}
              onChange={(e)=>setFormData(p=>({...p,semana_de_embarazo:e.target.value}))}
              helperText="Opcional"
              sx={TF_FILLED_SX(darkMode)}
            />
          </Grid>
        )}
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth variant="filled" label="Nombre de Ginecólogo"
            value={formData.nombre_de_ginecologo || ''}
            onChange={(e)=>setFormData(p=>({...p,nombre_de_ginecologo:e.target.value}))}
            helperText="Opcional"
            sx={TF_FILLED_SX(darkMode)}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth variant="filled" label="Teléfonos de Contacto"
            value={formData.telefonos_de_contacto || ''}
            onChange={(e)=>setFormData(p=>({...p,telefonos_de_contacto:e.target.value}))}
            helperText="Opcional — separa con comas si son varios"
            sx={TF_FILLED_SX(darkMode)}
          />
        </Grid>

        {/* Hospital (solo lo mostramos en Criopreservación tal como tu formData soporta) */}
        {isCrio && (
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth variant="filled" label="Hospital en donde se Atenderá"
              value={formData.hospital_donde_se_atendera || ''}
              onChange={(e)=>setFormData(p=>({...p,hospital_donde_se_atendera:e.target.value}))}
              helperText="Opcional"
              sx={TF_FILLED_SX(darkMode)}
            />
          </Grid>
        )}
      </Box>

      {/* MENSAJE */}
      <Typography sx={SECTION_TITLE_SX(darkMode)}>Mensaje</Typography>
      <TextField
        fullWidth variant="filled" label="Mensaje"
        multiline minRows={5}
        value={formData.mensaje || ''}
        onChange={(e)=>setFormData(p=>({...p,mensaje:e.target.value}))}
        sx={TF_FILLED_SX}
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
          © 2025 Supervisado por el Departamento de Investigacion & Desarrollo en Stem Care. |  Comprueba la información importante ó contáctanos.
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
        <AutoOrbitCamera isAIResponding={loading} />
        {interactiveMode ? (
          <InteractiveCell isAIResponding={loading} />
        ) : (
          <>
            <Membrane isAIResponding={loading} />
        {/* <GlowRing /> */}
            <Nucleus isAIResponding={loading} />
            {/* <Cytoplasm isAIResponding={loading} /> */}
          </>
        )}
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

              <Tooltip title={currentLanguage === 'es' ? 'Compartir en redes sociales' : 'Share on social media'}>
                <IconButton
                  size="small"
                  onClick={() => {
                    // Create a styled dropdown menu for social platforms
                    const menu = document.createElement('div');
                    menu.style.cssText = `
                      position: fixed;
                      top: 50%;
                      left: 50%;
                      transform: translate(-50%, -50%);
                      background: ${darkMode ? '#2a2a2a' : '#ffffff'};
                      border: 1px solid ${darkMode ? '#444' : '#ddd'};
                      border-radius: 12px;
                      padding: 20px;
                      box-shadow: 0 8px 32px rgba(0,0,0,0.3);
                      z-index: 10000;
                      font-family: 'Manrope', sans-serif;
                      min-width: 200px;
                    `;
                    
                    const title = document.createElement('div');
                    title.textContent = currentLanguage === 'es' ? 'Compartir en:' : 'Share on:';
                    title.style.cssText = `
                      font-family: 'Manrope', sans-serif;
                      font-weight: 600;
                      margin-bottom: 12px;
                      color: ${darkMode ? '#ffffff' : '#000000'};
                      font-size: 16px;
                      text-align: center;
                    `;
                    menu.appendChild(title);

                    // Add share type selector
                    const shareTypeContainer = document.createElement('div');
                    shareTypeContainer.style.cssText = `
                      display: flex;
                      gap: 8px;
                      margin-bottom: 16px;
                      justify-content: center;
                    `;

                    const textButton = document.createElement('button');
                    textButton.textContent = currentLanguage === 'es' ? 'Texto' : 'Text';
                    textButton.style.cssText = `
                      padding: 6px 12px;
                      border: 1px solid ${darkMode ? '#444' : '#ddd'};
                      border-radius: 6px;
                      background: ${darkMode ? '#333' : '#f5f5f5'};
                      color: ${darkMode ? '#ffffff' : '#000000'};
                      font-family: 'Manrope', sans-serif;
                      font-size: 12px;
                      cursor: pointer;
                      transition: all 0.2s ease;
                    `;

                    const screenshotButton = document.createElement('button');
                    screenshotButton.textContent = currentLanguage === 'es' ? 'Imagen' : 'Image';
                    screenshotButton.style.cssText = `
                      padding: 6px 12px;
                      border: 1px solid ${darkMode ? '#444' : '#ddd'};
                      border-radius: 6px;
                      background: transparent;
                      color: ${darkMode ? '#ffffff' : '#000000'};
                      font-family: 'Manrope', sans-serif;
                      font-size: 12px;
                      cursor: pointer;
                      transition: all 0.2s ease;
                    `;

                    let selectedShareType = 'text';

                    textButton.onclick = () => {
                      selectedShareType = 'text';
                      textButton.style.background = darkMode ? '#333' : '#f5f5f5';
                      screenshotButton.style.background = 'transparent';
                    };

                    screenshotButton.onclick = () => {
                      selectedShareType = 'screenshot';
                      screenshotButton.style.background = darkMode ? '#333' : '#f5f5f5';
                      textButton.style.background = 'transparent';
                    };

                    shareTypeContainer.appendChild(textButton);
                    shareTypeContainer.appendChild(screenshotButton);
                    menu.appendChild(shareTypeContainer);
                    
                    const platforms = [
                      { 
                        name: 'Facebook', 
                        key: 'facebook', 
                        color: '#1877F2',
                        icon: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z'
                      },
                      { 
                        name: 'WhatsApp', 
                        key: 'whatsapp', 
                        color: '#25D366',
                        icon: 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488'
                      },
                      { 
                        name: 'Instagram', 
                        key: 'instagram', 
                        color: '#E4405F',
                        icon: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z'
                      }
                    ];
                    
                    platforms.forEach(platform => {
                      const button = document.createElement('button');
                      button.style.cssText = `
                        display: flex;
                        align-items: center;
                        width: 100%;
                        padding: 12px 16px;
                        margin: 6px 0;
                        background: ${platform.color};
                        color: white;
                        border: none;
                        border-radius: 8px;
                        cursor: pointer;
                        font-family: 'Manrope', sans-serif;
                        font-size: 14px;
                        font-weight: 500;
                        transition: all 0.2s ease;
                        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                      `;
                      
                      // Create SVG icon
                      const iconSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                      iconSvg.setAttribute('width', '20');
                      iconSvg.setAttribute('height', '20');
                      iconSvg.setAttribute('viewBox', '0 0 24 24');
                      iconSvg.setAttribute('fill', 'currentColor');
                      iconSvg.style.marginRight = '12px';
                      
                      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                      path.setAttribute('d', platform.icon);
                      iconSvg.appendChild(path);
                      
                      const text = document.createElement('span');
                      text.textContent = platform.name;
                      
                      button.appendChild(iconSvg);
                      button.appendChild(text);
                      
                      button.onmouseover = () => {
                        button.style.transform = 'translateY(-1px)';
                        button.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
                      };
                      button.onmouseout = () => {
                        button.style.transform = 'translateY(0)';
                        button.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                      };
                      button.onclick = () => {
                        shareMessage(m.content, platform.key, selectedShareType);
                        document.body.removeChild(overlay);
                        document.body.removeChild(menu);
                      };
                      menu.appendChild(button);
                    });
                    
                    const closeButton = document.createElement('button');
                    closeButton.textContent = currentLanguage === 'es' ? 'Cerrar' : 'Close';
                    closeButton.style.cssText = `
                      display: block;
                      width: 100%;
                      padding: 8px 16px;
                      margin-top: 12px;
                      background: transparent;
                      color: ${darkMode ? '#ffffff' : '#000000'};
                      border: 1px solid ${darkMode ? '#444' : '#ddd'};
                      border-radius: 8px;
                      cursor: pointer;
                      font-family: 'Manrope', sans-serif;
                      font-size: 13px;
                      font-weight: 500;
                      transition: all 0.2s ease;
                    `;
                    closeButton.onmouseover = () => {
                      closeButton.style.backgroundColor = darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)';
                    };
                    closeButton.onmouseout = () => {
                      closeButton.style.backgroundColor = 'transparent';
                    };
                    closeButton.onclick = () => {
                      document.body.removeChild(overlay);
                      document.body.removeChild(menu);
                    };
                    menu.appendChild(closeButton);
                    
                    document.body.appendChild(menu);
                    
                    // Close menu when clicking outside
                    const overlay = document.createElement('div');
                    overlay.style.cssText = `
                      position: fixed;
                      top: 0;
                      left: 0;
                      width: 100%;
                      height: 100%;
                      background: rgba(0,0,0,0.4);
                      z-index: 9999;
                      backdrop-filter: blur(2px);
                    `;
                    overlay.onclick = () => {
                      document.body.removeChild(overlay);
                      document.body.removeChild(menu);
                    };
                    document.body.appendChild(overlay);
                  }}
                  sx={{
                    padding: '3px',
                    color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)',
                    '&:hover': {
                      color: darkMode ? '#ffffff' : '#000000',
                      backgroundColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
                    }
                  }}
                >
                  <ShareIcon sx={{ fontSize: '1.1rem' }} />
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
          El asistente está escribiendo
        </Typography>
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {[0, 1, 2].map((i) => (
            <Box
              key={i}
              sx={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                backgroundColor: darkMode ? '#cccccc' : '#565457ff',
                animation: `typing 1.4s infinite ease-in-out ${i * 0.2}s`,
                '@keyframes typing': {
                  '0%, 60%, 100%': { transform: 'translateY(0)' },
                  '30%': { transform: 'translateY(-10px)' }
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
          width: '100%',
          maxWidth: promptMaxWidth,
          px: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,                     // natural spacing between chips and prompt
        }}
      >
        {/* Chips row (no absolute bottom) */}
        <Box sx={{ display:'flex', flexWrap:'wrap', gap: isMobile ? 0.5 : 1, justifyContent:'center' }}>
          {['Beneficios de células madre','Terapia Celular','Pruebas Genéticas'].map((q,i)=>(
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
              px:2, 
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
          onClose={() => setOpenDialog(false)}
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


      
        <DialogTitle sx={{fontFamily: 'Manrope', color: darkMode ? '#ffffff' : '#000000'}}>Agendar Consulta</DialogTitle>
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
              color: darkMode ? '#FFFFF' : '#7d7da8',
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#7d7da8',
            },
          }}
        >

          <Tab label="Criopreservación" sx={{fontFamily: 'Manrope,', fontWeight:500 }} />
          <Tab label="Terapia Celular" sx={{fontFamily: 'Manrope', fontWeight:500}}/>
          <Tab label="Pruebas Genéticas" sx={{fontFamily: 'Manrope', fontWeight:500}} />
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
            onClick={() => setOpenDialog(false)} 
            sx={{
              fontFamily: 'Manrope', 
              fontWeight: 700,
              color: '#7d7da8',
              '&:hover': {
                backgroundColor: 'rgba(125, 125, 168, 0.1)'
              }
            }}
          >
            Cancelar
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
            Enviar
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
                alert(currentLanguage === 'es' 
                  ? 'Próximamente: Consultas por video en tiempo real'
                  : 'Coming soon: Real-time video consultations'
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
    </div>
  )
}


