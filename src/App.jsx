// App.jsx
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
import MicIcon from '@mui/icons-material/Mic'
import GraphicEqIcon from '@mui/icons-material/GraphicEq'
import CircularProgress from '@mui/material/CircularProgress'
import Chip from '@mui/material/Chip'
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import {
  Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, Button, Tabs, Tab
} from '@mui/material'

import Collapse from '@mui/material/Collapse';


import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'


import Logo from './assets/STEM CARE-03.png'



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
  const messagesBottom = isMobile ? 170 : 130
  // const chipsBottom    = isMobile ? 120 : 80
  // const promptBottom   = isMobile ? 20  : 28
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

  const handleChange = (field) => (e) => setFormData({ ...formData, [field]: e.target.value })

  // const handleSubmit = async () => {
  //   let endpoint = ''
  //   let payload = {}
  //   if (activeTab === 0) {
  //     endpoint = '/api/criopreservacion'
  //     payload = { ...formData }
  //   } else if (activeTab === 1) {
  //     endpoint = '/api/terapia_celular'
  //     payload = { nombre: formData.nombre, apellidos: formData.apellidos, email: formData.email, telefono: formData.telefono, telefonos_de_contacto: formData.telefonos_de_contacto, mensaje: formData.mensaje }
  //   } else if (activeTab === 2) {
  //     endpoint = '/api/pruebas_geneticas'
  //     payload = { nombre: formData.nombre, apellidos: formData.apellidos, email: formData.email, telefono: formData.telefono, telefonos_de_contacto: formData.telefonos_de_contacto, mensaje: formData.mensaje }
  //   }
  //   try {
  //     const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
  //     if (!res.ok) throw new Error()
  //     alert('Formulario enviado con éxito')
  //     setOpenDialog(false)
  //   } catch { alert('Error al enviar el formulario') }
  // }

  const handleSubmit = async () => {
  let endpoint = '';
  let payload = {};

  if (activeTab === 0) {
    endpoint = '/api/criopreservacion';
    payload = { ...formData };
  } else if (activeTab === 1) {
    endpoint = '/api/terapia_celular';
    payload = {
      nombre: formData.nombre,
      apellidos: formData.apellidos,
      email: formData.email,
      telefono: formData.telefono,
      telefonos_de_contacto: formData.telefonos_de_contacto,
      mensaje: formData.mensaje ?? ''
    };
  } else if (activeTab === 2) {
    endpoint = '/api/pruebas_geneticas';
    payload = {
      nombre: formData.nombre,
      apellidos: formData.apellidos,
      email: formData.email,
      telefono: formData.telefono,
      telefonos_de_contacto: formData.telefonos_de_contacto,
      mensaje: formData.mensaje ?? ''
    };
  }

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const text = await res.text(); // <-- see exact error from API/function
    if (!res.ok) {
      console.error(`Submit failed ${res.status}:`, text);
      alert(`Error al enviar el formulario (${res.status}). Revisa la consola.`);
      return;
    }

    console.log('Submit OK:', text);
    alert('Formulario enviado con éxito');
    setOpenDialog(false);
  } catch (err) {
    console.error('Submit crash:', err);
    alert('Error al enviar el formulario (network/client).');
  }
};



  const sendMessage = async (customInput) => {
    const contentToSend = customInput || input
    if (!contentToSend.trim()) return
    const newMessages = [...messages, { role: 'user', content: contentToSend }]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages, language: 'es' })
      })

      const reader = res.body.getReader()
      const decoder = new TextDecoder('utf-8')
      let fullText = ''

      setMessages([...newMessages, { role: 'assistant', content: '' }])

      while (true) {
        const { value, done } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        fullText += chunk
        setMessages(prev => {
          const updated = [...prev]
          updated[updated.length - 1] = { role: 'assistant', content: fullText }
          return updated
        })
      }
    } catch (error) {
      setMessages([...newMessages, { role: 'assistant', content: 'Error contacting assistant.' }])
    }

    setLoading(false)
  }

  const handleChipClick = (question) => {
    setInput(question)
    sendMessage(question)
  }

  const renderForm = () => activeTab === 0 ? (
    <>
      <TextField fullWidth margin="dense" label="Nombre" value={formData.nombre} onChange={handleChange('nombre')} />
      <TextField fullWidth margin="dense" label="Apellidos" value={formData.apellidos} onChange={handleChange('apellidos')} />
      <TextField fullWidth margin="dense" label="E-mail" value={formData.email} onChange={handleChange('email')} />
      <TextField fullWidth margin="dense" label="Teléfono" value={formData.telefono} onChange={handleChange('telefono')} />
      <TextField fullWidth margin="dense" label="Semana de embarazo" value={formData.semana_de_embarazo} onChange={handleChange('semana_de_embarazo')} />
      <TextField fullWidth margin="dense" label="Nombre de Ginecólogo" value={formData.nombre_de_ginecologo} onChange={handleChange('nombre_de_ginecologo')} />
      <TextField fullWidth margin="dense" label="Teléfonos de contacto" value={formData.telefonos_de_contacto} onChange={handleChange('telefonos_de_contacto')} />
      <TextField fullWidth margin="dense" label="Hospital donde se atenderá" value={formData.hospital_donde_se_atendera} onChange={handleChange('hospital_donde_se_atendera')} />
      <TextField fullWidth margin="dense" label="Mensaje" multiline rows={4} value={formData.mensaje} onChange={handleChange('mensaje')} />
    </>
  ) : (
    <>
      <TextField fullWidth margin="dense" label="Nombre" value={formData.nombre} onChange={handleChange('nombre')} />
      <TextField fullWidth margin="dense" label="Apellidos" value={formData.apellidos} onChange={handleChange('apellidos')} />
      <TextField fullWidth margin="dense" label="E-mail" value={formData.email} onChange={handleChange('email')} />
      <TextField fullWidth margin="dense" label="Teléfono" value={formData.telefono} onChange={handleChange('telefono')} />
      <TextField fullWidth margin="dense" label="Teléfonos de contacto" value={formData.telefonos_de_contacto} onChange={handleChange('telefonos_de_contacto')} />
      <TextField fullWidth margin="dense" label="Mensaje" multiline rows={4} value={formData.mensaje} onChange={handleChange('mensaje')} />
    </>
  )



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
      {/* <img src={Logo} alt="Logo" style={{ position: 'absolute', top: 1, left: 16, height: 140, zIndex:1 }} /> */}
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


      {/* <footer style={{
        position: 'absolute',
        bottom: 0,
        width: '100%',
        textAlign: 'center',
        fontSize: 10,
        padding: '10px 0',
        color: '#999',
        fontFamily: 'Manrope, sans-serif',
        zIndex:1
      }}>
        © {new Date().getFullYear()} Supervisado por el Departamento de Investigación de Stem Care. |  Comprueba la información importante ó contáctanos. 
      </footer> */}
      {/* <footer style={{
        position: 'fixed',
        bottom: 0,
        width: '100%',
        textAlign: 'center',
        fontSize: isMobile ? 9 : 10,
        padding: isMobile ? '6px 0' : '10px 0',
        color: '#999',
        fontFamily: 'Manrope, sans-serif',
        zIndex: 1
      }}>
        © {new Date().getFullYear()} Supervisado por el Departamento de Investigación de Stem Care. |  Comprueba la información importante ó contáctanos.
      </footer> */}
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
          © 2025 Supervisado por el Departamento de Investigación de Stem Care. |  Comprueba la información importante ó contáctanos.
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

      {/* <Box
        ref={scrollRef}
        sx={{
          position: 'absolute',
          bottom: 130,
          left: '50%',
          transform: 'translateX(-50%)',
          px: 2,
          maxHeight: '50vh',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          maxWidth: '720px',
          backdropFilter: 'blur(12px)',
          backgroundColor: 'rgba(255, 255, 255, 0.3)',
          borderRadius: 2,
          padding: 2,
          '&::-webkit-scrollbar': {
            width: '5px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: '#c6c6c6ff',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#959595ff',
            borderRadius: '5px',
          }
        }}
      >
        {messages.map((m, i) => (
          <Typography
            key={i}
            variant="body2"
            sx={{
              mb: 1,
              color: m.role === 'user' ? '#000' : '#565457ff',
              fontFamily: 'Manrope',
              fontWeight: m.role === 'user' ? 700 : 300,
              textAlign: 'left',
              whiteSpace: 'pre-line'
            }}
          >
            {m.content}
          </Typography>
        ))}
      </Box> */}
      <Collapse in={hasConversation} timeout={300} unmountOnExit>
        <Box
          ref={scrollRef}
          sx={{
            position: 'fixed',
            bottom: messagesBottom,
            left: '50%',
            transform: 'translateX(-50%)',
            px: 2,
            maxHeight: isMobile ? '42vh' : '50vh',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            maxWidth: chatMaxWidth,
            backdropFilter: 'blur(12px)',
            backgroundColor: 'rgba(255,255,255,0.3)',
            borderRadius: 2,
            padding: 2,
          }}
        >
          {messages.map((m,i)=>(
            <Typography
              key={i}
              sx={{
                mb: 1,
                color: m.role === 'user' ? '#000' : '#565457ff',
                fontFamily: 'Manrope',
                fontWeight: m.role === 'user' ? 700 : 300,
                textAlign: 'left',
                whiteSpace: 'pre-line',
                fontSize: bodyFontSize
              }}
            >
              {m.content}
            </Typography>
          ))}
        </Box>
      </Collapse>


      {/* <Box
        sx={{
          position: 'absolute',
          bottom: 80,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: 1,
          flexWrap: 'wrap',
          justifyContent: 'center',
          maxWidth: 720,
          px: 2
        }}
      >
        {[
        'Beneficios de células madre',
        'Terapia Celular',
        'Pruebas Genéticas',
        ].map((question, index) => (
          <Chip
            key={index}
            label={question}
            variant="outlined"
            onClick={() => handleChipClick(question)}
            sx={{ fontFamily: 'Manrope' }}
          />
        ))}
      </Box> */}

      <Box
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


      {/* <Box
        className="prompt-box"
        sx={{
          position: 'absolute',
          bottom: 28,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          bgcolor: '#f0f0f0ff',
          borderRadius: '20px',
          mx: 'auto',
          maxWidth: 600,
          px: 2,
          py: 1
        }}
      >
        <TextField
          fullWidth
          size={isMobile ? 'small' : 'medium'}
          variant="standard"
          placeholder="Pregunta sobre células madre"
          InputProps={{
            disableUnderline: true,
            sx: { ml: 1, color: '#202020', fontFamily: 'Manrope', fontSize:14 },
            value: input,
            onChange: (e) => setInput(e.target.value),
            onKeyDown: (e) => e.key === 'Enter' && sendMessage(),
            endAdornment: (
              <InputAdornment position="end">
                <Tooltip title="Haz click para agendar tu consulta">
                  <IconButton onClick={() => setOpenDialog(true)}>
                    <AccountCircleIcon sx={{ color: '#535353ff' }} />
                  </IconButton>
                </Tooltip>
              </InputAdornment>
            )
          }}
        />
      </Box> */}

      <Box
        className="prompt-box"
        sx={{
          // position: 'fixed',
          // bottom: promptBottom,
          // left: '50%',
          // transform: 'translateX(-50%)',
          // display: 'flex',
          // justifyContent: 'center',
          // alignItems: 'center',
          // bgcolor: '#f0f0f0ff',
          // borderRadius: '20px',
          // mx: 'auto',
          // maxWidth: promptMaxWidth,
          // width: '100%',
          // px: 2,
          // py: isMobile ? 0.75 : 1
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
      </Box>


      {/* <Dialog open={openDialog} onClose={() => setOpenDialog(false)}
        PaperProps={{
          sx: {
            backdropFilter: 'blur(12px)',
            backgroundColor: 'rgba(255, 255, 255, 0.82)',
            borderRadius: 3,
            px: 2,
            py: 1,
            fontFamily: 'Manrope',
            
          }
        }}
      > */}

        <Dialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          fullScreen={isMobile}
          PaperProps={{
            sx: {
              backdropFilter: 'blur(12px)',
              backgroundColor: 'rgba(255, 255, 255, 0.92)',
              borderRadius: isMobile ? 0 : 3,
              px: isMobile ? 1.5 : 2,
              py: isMobile ? 0.5 : 1,
              fontFamily: 'Manrope',
              width: isMobile ? '100vw' : undefined
            }
          }}
        >


      
        <DialogTitle sx={{fontFamily: 'Manrope'}}>Agendar Consulta</DialogTitle>

        {/* <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        > */}
        <Tabs
          value={activeTab}
          onChange={(e, v) => setActiveTab(v)}
          variant={isMobile ? 'scrollable' : 'fullWidth'}
          scrollButtons={isMobile ? 'auto' : false}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >

          <Tab label="Criopreservación" sx={{fontFamily: 'Manrope', fontWeight:700 }} />
          <Tab label="Terapia Celular" sx={{fontFamily: 'Manrope', fontWeight:700}}/>
          <Tab label="Pruebas Genéticas" sx={{fontFamily: 'Manrope', fontWeight:700}} />
        </Tabs>

        <DialogContent sx={{fontFamily: 'Manrope'}}  >
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


