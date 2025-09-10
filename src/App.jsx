// App.jsx
//////

/////////
/////////////
////
import { Canvas, useFrame } from '@react-three/fiber'
import { useRef, useState, useEffect } from 'react'
import Membrane from './Membrane'
import Nucleus from './NucleusMesh'
import Cytoplasm from './Cytoplasm'
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
import {
  Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, Button, Tabs, Tab, Grid
} from '@mui/material'

import Collapse from '@mui/material/Collapse';


import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';



import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'


import Logo from './assets/STEM CARE-03.png'

const TF_FILLED_SX = {
  '& .MuiFilledInput-root': {
    borderRadius: 2,
    backgroundColor: '#eef2f6',
    transition: 'background-color .2s',
    '&:hover': { backgroundColor: '#e8eef5' },
    '&.Mui-focused': { backgroundColor: '#eaf2ff' },
  },
  '& .MuiInputBase-input': { fontFamily: 'Manrope' },
  '& .MuiInputLabel-root': { fontFamily: 'Manrope' },
};

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

const SECTION_TITLE_SX = {
  fontFamily:'Manrope', fontSize:10, letterSpacing:1, fontWeight:700, color:'#6b7a8c',
  mb:1, mt:2, textTransform:'uppercase',
  '&:first-of-type': { mt: 0 },   // no extra top gap on the first title
};


function AutoOrbitCamera() {
  const ref = useRef()
  useFrame(({ camera, clock }) => {
    const t = clock.getElapsedTime()
    camera.position.x = Math.sin(t * 0.2) * 5
    camera.position.z = Math.cos(t * 0.2) * 5
    camera.lookAt(0, 0, 0)
  })
  return null
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




  // const sendMessage = async (customInput) => {
  //   const contentToSend = customInput || input
  //   if (!contentToSend.trim()) return
  //   const newMessages = [...messages, { role: 'user', content: contentToSend }]
  //   setMessages(newMessages)
  //   setInput('')
  //   setLoading(true)

  //   try {
  //     const res = await fetch('/api/chat/stream', {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify({ messages: newMessages, language: 'es' })
  //     })

  //     const reader = res.body.getReader()
  //     const decoder = new TextDecoder('utf-8')
  //     let fullText = ''

  //     setMessages([...newMessages, { role: 'assistant', content: '' }])

  //     while (true) {
  //       const { value, done } = await reader.read()
  //       if (done) break
  //       const chunk = decoder.decode(value, { stream: true })
  //       fullText += chunk
  //       setMessages(prev => {
  //         const updated = [...prev]
  //         updated[updated.length - 1] = { role: 'assistant', content: fullText }
  //         return updated
  //       })
  //     }
  //   } catch (error) {
  //     setMessages([...newMessages, { role: 'assistant', content: 'Error contacting assistant.' }])
  //   }

  //   setLoading(false)
  // }

  ///// 

  const sendMessage = async (customInput) => {
  const contentToSend = customInput || input;
  if (!contentToSend.trim()) return;
  const newMessages = [...messages, { role: 'user', content: contentToSend }];
  setMessages(newMessages);
  setInput('');
  setLoading(true);

  try {
    const res = await fetch('/api/chat/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: newMessages, language: 'es' })
    });

    const reader = res.body.getReader();
    const decoder = new TextDecoder('utf-8');

    // 1) placeholder del asistente
    setMessages([...newMessages, { role: 'assistant', content: '' }]);

    // 2) buffer + flush temporizado
    let fullText = '';
    let buffer = '';
    const FLUSH_EVERY_MS = 45; // ajusta a 30–45ms para “vibe ChatGPT”
    const flush = () => {
      if (!buffer) return;
      fullText += buffer;
      buffer = '';
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: 'assistant', content: fullText };
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
  } catch (error) {
    setMessages([...newMessages, { role: 'assistant', content: 'Error contacting assistant.' }]);
  }

  setLoading(false);
};


  const handleChipClick = (question) => {
    setInput(question)
    sendMessage(question)
  }

const renderForm = () => {
  const isCrio = activeTab === TABS.CRIO;

  return (
    <Box sx={{ pt: 1 }}>
      {/* DATOS DE CONTACTO */}
      <Typography sx={SECTION_TITLE_SX}>Datos de contacto</Typography>
      <Box component={Grid} container spacing={1.5}>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth variant="filled" label="Nombre"
            required value={formData.nombre || ''}
            onChange={(e)=>setFormData(p=>({...p,nombre:e.target.value}))}
            sx={TF_FILLED_SX}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth variant="filled" label="Apellidos"
            value={formData.apellidos || ''}
            onChange={(e)=>setFormData(p=>({...p,apellidos:e.target.value}))}
            sx={TF_FILLED_SX}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth variant="filled" label="E-mail" type="email"
            required value={formData.email || ''}
            onChange={(e)=>setFormData(p=>({...p,email:e.target.value}))}
            sx={TF_FILLED_SX}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth variant="filled" label="Teléfono"
            placeholder="+502 5555 5555"
            value={formData.telefono || ''}
            onChange={(e)=>setFormData(p=>({...p,telefono:e.target.value}))}
            helperText="Sólo números o +; ej: +502 5555 5555"
            sx={TF_FILLED_SX}
          />
        </Grid>
      </Box>

      {/* INFORMACIÓN MÉDICA */}
      <Typography sx={SECTION_TITLE_SX}>Información médica</Typography>
      <Box component={Grid} container spacing={1.5}>
        {isCrio && (
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth variant="filled" type="number"
              label="Semana de Embarazo"
              value={formData.semana_de_embarazo || ''}
              onChange={(e)=>setFormData(p=>({...p,semana_de_embarazo:e.target.value}))}
              helperText="Opcional"
              sx={TF_FILLED_SX}
            />
          </Grid>
        )}
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth variant="filled" label="Nombre de Ginecólogo"
            value={formData.nombre_de_ginecologo || ''}
            onChange={(e)=>setFormData(p=>({...p,nombre_de_ginecologo:e.target.value}))}
            helperText="Opcional"
            sx={TF_FILLED_SX}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth variant="filled" label="Teléfonos de Contacto"
            value={formData.telefonos_de_contacto || ''}
            onChange={(e)=>setFormData(p=>({...p,telefonos_de_contacto:e.target.value}))}
            helperText="Opcional — separa con comas si son varios"
            sx={TF_FILLED_SX}
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
              sx={TF_FILLED_SX}
            />
          </Grid>
        )}
      </Box>

      {/* MENSAJE */}
      <Typography sx={SECTION_TITLE_SX}>Mensaje</Typography>
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
    <div className="container" style={{ fontFamily: 'Manrope, sans-serif' }}>
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
            background-color: rgba(0,0,0,0.3);
            border-radius: 4px;
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
        gl={{ alpha: true, antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
        shadows
      >
        <color attach="background" args={["#dfe4ea"]} />
        <ambientLight intensity={0.3} />
        <directionalLight position={[5, 5, 5]} intensity={0.4} castShadow />
        <Environment preset="sunset" background={false} />
        <AutoOrbitCamera />
        <Membrane />
        {/* <GlowRing /> */}
        <Nucleus />
        <Cytoplasm />
        <EffectComposer>
          <Bloom intensity={0.15} luminanceThreshold={0.7} luminanceSmoothing={0.4} />
          <DepthOfField focusDistance={0.02} focalLength={0.01} bokehScale={1.2} height={480} />
        </EffectComposer>
      </Canvas>

      <Collapse in={hasConversation} timeout={300} unmountOnExit>
        <Box
          // ref={scrollRef}
          // sx={{
          //   position: 'fixed',
          //   bottom: messagesBottom,
          //   left: '50%',
          //   transform: 'translateX(-50%)',
          //   px: 2,
          //   maxHeight: isMobile ? '42vh' : '50vh',
          //   overflowY: 'auto',
          //   display: 'flex',
          //   flexDirection: 'column',
          //   width: '100%',
          //   maxWidth: chatMaxWidth,
          //   backdropFilter: 'blur(12px)',
          //   backgroundColor: 'rgba(255,255,255,0.3)',
          //   borderRadius: 2,
          //   padding: 2,
          // }}
          ref={scrollRef}
          sx={{
            position:'fixed',
            left:'50%',
            transform:'translateX(-50%)',
            bottom: (footerHeight + 6) + (isMobile ? 96 : 108), // ~dock height; adjust once
            width:'100%', maxWidth: chatMaxWidth,
            maxHeight: isMobile ? '42vh' : '50vh',
            overflowY:'auto',
            backdropFilter:'blur(12px)',
            backgroundColor:'rgba(255,255,255,0.3)',
            borderRadius:2, p:2,
          }}
        >
          {messages.map((m,i)=>(
            <Typography
              key={i}
              sx={{
                // mb: 1,
                // color: m.role === 'user' ? '#000' : '#565457ff',
                // fontFamily: 'Manrope',
                // fontWeight: m.role === 'user' ? 700 : 300,
                // textAlign: 'left',
                // whiteSpace: 'pre-line',
                // fontSize: bodyFontSize,
                // '& h1, & h2, & h3': { fontWeight: 700, mt: 1.2, mb: 0.6 },
                // '& p': { m: 0, mb: 1, lineHeight: 1.6, fontSize: bodyFontSize },
                // '& ol, & ul': { pl: 3, mb: 1, lineHeight: 1.6, fontSize: bodyFontSize },
                // '& li': { mb: 0.5 },
                // '& strong': { fontWeight: 700 },
                // '& a': { textDecoration: 'underline' }
                color: m.role === 'user' ? '#000' : '#565457ff',
                fontFamily: 'Manrope',
                fontWeight: m.role === 'user' ? 700 : 300,
                whiteSpace: 'pre-line',
                fontSize: bodyFontSize,
                '& h1, & h2, & h3': { fontWeight: 700, mt: 1, mb: 0.6 },
                '& a': { textDecoration: 'underline' },
                '& + &': { mt: 1 },            // spacing BETWEEN messages (single source of truth)
                '& p, & ul, & ol': { m: 0 },   // kill inner margins
                '& li': { m: 0 },
              }}
            >
            <ReactMarkdown
              // remarkPlugins={[remarkGfm]}
              // rehypePlugins={[rehypeRaw]}
              // components={{
              //   ol: ({node, ...props}) => (
              //     <ol
              //       style={{
              //         paddingLeft: '1.5rem',
              //         marginTop: 0,
              //         marginBottom: '0.5rem', // margen reducido
              //         lineHeight: 1.6
              //       }}
              //       {...props}
              //     />
              //   ),
              //   ul: ({node, ...props}) => (
              //     <ul
              //       style={{
              //         paddingLeft: '1.5rem',
              //         marginTop: 0,
              //         marginBottom: '0.5rem', // margen reducido
              //         lineHeight: 1.6
              //       }}
              //       {...props}
              //     />
              //   ),
              //   li: ({node, ...props}) => (
              //     <li
              //       style={{
              //         marginBottom: '0.3rem', // menos espacio entre bullets
              //       }}
              //       {...props}
              //     />
              //   ),
              //   p: ({node, ...props}) => (
              //     <p
              //       style={{
              //         marginTop: 0,
              //         marginBottom: '0.5rem', // margen compacto para párrafos
              //       }}
              //       {...props}
              //     />
              //   ),
              //   strong: ({node, ...props}) => <strong {...props} />
              // }}
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
              // components={{
              //   p:  (props)=><p style={{margin:0, lineHeight:1.6}} {...props}/>,
              //   ul: (props)=><ul style={{margin:0, paddingLeft:'1.5rem', lineHeight:1.6}} {...props}/>,
              //   ol: (props)=><ol style={{margin:0, paddingLeft:'1.5rem', lineHeight:1.6}} {...props}/>,
              //   li: (props)=><li style={{margin:0}} {...props}/>,
              // }}
              components={{
                p:  (props) => <p style={{ margin: 0, lineHeight: 1.3 }} {...props} />,
                ul: (props) => <ul style={{ margin: 0, paddingLeft: '1.5rem', lineHeight: 1.3 }} {...props} />,
                ol: (props) => <ol style={{ margin: 0, paddingLeft: '1.5rem', lineHeight: 1.3 }} {...props} />,
                li: (props) => <li style={{ margin: 0 }} {...props} />,
                h1: (props) => <h1 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }} {...props} />,
                h2: (props) => <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }} {...props} />,
                h3: (props) => <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }} {...props} />,
              }}
            >
              {m.content}
            </ReactMarkdown>
            </Typography>
          ))}
        </Box>
      </Collapse>

      {/* <Box
         sx={{
            position: 'fixed',
            bottom: chipsBottom,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: isMobile ? 0.5 : 1,
            flexWrap: 'wrap',
            justifyContent: 'center',
            maxWidth: chipsMaxWidth,
            px: 2
          }}
      >
        {['Beneficios de células madre','Terapia Celular','Pruebas Genéticas'].map((q,i)=>(
          <Chip
            key={i}
            size={isMobile ? 'small' : 'medium'}
            label={q}
            variant="outlined"
            onClick={() => handleChipClick(q)}
            sx={{ fontFamily: 'Manrope' }}
          />
        ))}
      </Box>




      <Box
        className="prompt-box"
        sx={{
              position: 'fixed',
              bottom: promptBottom,
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              bgcolor: '#f0f0f0ff',
              borderRadius: '20px',
              mx: 'auto',
              maxWidth: promptMaxWidth,
              width: '100%',
              px: 2,
              py: isMobile ? 0.75 : 1
        }}
      >
        <TextField
          fullWidth
          variant="standard"
          placeholder="Pregunta sobre células madre"
          InputProps={{
            disableUnderline: true,
            sx: { ml: 1, color: '#202020', fontFamily: 'Manrope', fontSize: isMobile ? 13 : 14 },
            value: input,
            onChange: (e) => setInput(e.target.value),
            onKeyDown: (e) => e.key === 'Enter' && sendMessage(),
            endAdornment: (
              <InputAdornment position="end">
                <Tooltip title="Haz click para agendar tu consulta">
                  <IconButton onClick={() => setOpenDialog(true)} size={isMobile ? 'small' : 'medium'}>
                    <AccountCircleIcon sx={{ color: '#535353ff' }} />
                  </IconButton>
                </Tooltip>
              </InputAdornment>
            )
          }}
        />
      </Box> */}

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
            <Chip key={i} size={isMobile ? 'small' : 'medium'} label={q} variant="outlined"
                  onClick={() => handleChipClick(q)} sx={{ fontFamily: 'Manrope' }} />
          ))}
        </Box>

        {/* Prompt box (no absolute bottom) */}
        <Box sx={{ display:'flex', alignItems:'center', bgcolor:'#f0f0f0ff', borderRadius:'20px', px:2, py: isMobile ? 0.75 : 1 }}>
          <TextField
            fullWidth variant="standard" placeholder="Pregunta sobre células madre"
            InputProps={{ disableUnderline:true, sx:{ ml:1, fontFamily:'Manrope', fontSize: isMobile ? 13 : 14 },
              value: input, onChange:(e)=>setInput(e.target.value),
              onKeyDown:(e)=> e.key==='Enter' && sendMessage(),
              endAdornment:(
                <InputAdornment position="end">
                  <Tooltip title="Haz click para agendar tu consulta">
                    <IconButton onClick={()=>setOpenDialog(true)} size={isMobile ? 'small' : 'medium'}>
                      <AccountCircleIcon sx={{ color:'#535353ff' }} />
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
              backgroundColor: 'rgba(255,255,255,0.94)',
              borderRadius: isMobile ? 0 : 2,
              boxShadow: '0 8px 40px rgba(0,0,0,.08)',
              px: isMobile ? 1.5 : 3,
              py: isMobile ? 1 : 2,
              border: '1px solid #78797bff',
            }
          }}
        >


      
        <DialogTitle sx={{fontFamily: 'Manrope'}}>Agendar Consulta</DialogTitle>
        <Tabs
          value={activeTab}
          onChange={(e, v) => setActiveTab(v)}
          variant={isMobile ? 'scrollable' : 'fullWidth'}
          scrollButtons={isMobile ? 'auto' : false}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
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
            '& .MuiDialogContent-root': { p: 0 },
          }}
        >
          {renderForm()}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} sx={{fontFamily: 'Manrope', fontWeight:700}} >Cancelar</Button>
          <Button variant="contained" onClick={handleSubmit} sx={{fontFamily: 'Manrope', fontWeight:700}} >Enviar</Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}


