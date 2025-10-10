// MedicalGlossary.jsx
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  TextField,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';

const MEDICAL_TERMS = {
  es: {
    'Células madre': 'Células especiales que tienen la capacidad de convertirse en diferentes tipos de células del cuerpo.',
    'Criopreservación': 'Proceso de congelación a muy bajas temperaturas para preservar células vivas.',
    'Cordón umbilical': 'Estructura que conecta al bebé con la placenta durante el embarazo.',
    'Sangre de cordón': 'Sangre rica en células madre que se encuentra en el cordón umbilical.',
    'Trasplante': 'Procedimiento médico para reemplazar células, tejidos u órganos dañados.',
    'Leucemia': 'Tipo de cáncer que afecta las células sanguíneas.',
    'Linfoma': 'Cáncer del sistema linfático.',
    'Anemia': 'Condición donde hay una deficiencia de glóbulos rojos.',
    'Inmunodeficiencia': 'Trastorno del sistema inmunológico.',
    'Metabólico': 'Relacionado con los procesos químicos del cuerpo.',
    'Regenerativo': 'Capacidad de reparar o reemplazar tejidos dañados.',
    'Diferenciación': 'Proceso por el cual las células madre se convierten en células especializadas.',
    'Proliferación': 'Proceso de multiplicación celular.',
    'Autólogo': 'Trasplante usando las propias células del paciente.',
    'Alogénico': 'Trasplante usando células de un donante compatible.',
    
    // Terapia Celular - Conceptos Básicos
    'Terapia celular': 'Tratamiento médico que utiliza células vivas para reparar, reemplazar o regenerar tejidos dañados.',
    'Células madre mesenquimales': 'Células madre multipotentes que pueden diferenciarse en hueso, cartílago, músculo y grasa.',
    'Células madre hematopoyéticas': 'Células madre que dan origen a todos los tipos de células sanguíneas.',
    'Células madre pluripotentes': 'Células madre que pueden convertirse en cualquier tipo de célula del cuerpo.',
    'Células madre multipotentes': 'Células madre que pueden diferenciarse en varios tipos de células relacionadas.',
    
    // Terapia Celular - Aplicaciones
    'Medicina regenerativa': 'Campo médico que utiliza células madre y biomateriales para regenerar tejidos dañados.',
    'Terapia con células madre': 'Tratamiento que utiliza células madre para tratar enfermedades y lesiones.',
    'Inyección de células madre': 'Administración directa de células madre en el área afectada del cuerpo.',
    'Cultivo celular': 'Proceso de crecimiento y multiplicación de células en condiciones controladas.',
    'Expansión celular': 'Proceso de multiplicar células madre en el laboratorio para obtener mayor cantidad.',
    
    // Terapia Celular - Condiciones Tratadas
    'Osteoartritis': 'Enfermedad degenerativa de las articulaciones que puede tratarse con terapia celular.',
    'Lesiones deportivas': 'Daños en músculos, tendones o ligamentos que pueden beneficiarse de células madre.',
    'Enfermedades autoinmunes': 'Condiciones donde el sistema inmune ataca el propio cuerpo.',
    'Diabetes tipo 1': 'Enfermedad donde las células productoras de insulina son destruidas.',
    'Enfermedades neurodegenerativas': 'Condiciones que afectan el sistema nervioso como Alzheimer y Parkinson.',
    'Lesiones de médula espinal': 'Daños en la médula espinal que pueden tratarse con terapia celular.',
    'Enfermedades cardíacas': 'Condiciones del corazón que pueden beneficiarse de células madre.',
    'Enfermedades pulmonares': 'Condiciones respiratorias que pueden tratarse con terapia celular.',
    
    // Terapia Celular - Procesos
    'Aislamiento celular': 'Proceso de separar células madre de otros tipos de células.',
    'Caracterización celular': 'Análisis de las propiedades y características de las células madre.',
    'Potencial de diferenciación': 'Capacidad de las células madre para convertirse en diferentes tipos celulares.',
    'Viabilidad celular': 'Porcentaje de células que permanecen vivas después del procesamiento.',
    'Contaminación microbiana': 'Presencia de bacterias, virus u hongos en cultivos celulares.',
    'Esterilidad': 'Ausencia de microorganismos en productos celulares.',
    'Criopreservación celular': 'Congelación de células madre para preservarlas a largo plazo.',
    'Descongelación celular': 'Proceso de restaurar células congeladas a temperatura corporal.',
    
    // Terapia Celular - Mecanismos
    'Paracrino': 'Señalización celular donde las células liberan factores que afectan células cercanas.',
    'Factores de crecimiento': 'Proteínas que estimulan el crecimiento y diferenciación celular.',
    'Citocinas': 'Moléculas que regulan la comunicación entre células del sistema inmune.',
    'Antiinflamatorio': 'Sustancia que reduce la inflamación y el dolor.',
    'Inmunomodulación': 'Regulación del sistema inmunológico por parte de las células madre.',
    'Angiogénesis': 'Formación de nuevos vasos sanguíneos estimulada por células madre.',
    'Neurogénesis': 'Formación de nuevas neuronas en el cerebro.',
    'Osteogénesis': 'Formación de nuevo tejido óseo.',
    
    // Terapia Celular - Seguridad y Eficacia
    'Eficacia terapéutica': 'Capacidad de un tratamiento para producir el efecto deseado.',
    'Seguridad celular': 'Evaluación de riesgos asociados con el uso de células madre.',
    'Tumorigénesis': 'Formación de tumores, riesgo potencial de algunas terapias celulares.',
    'Rechazo inmunológico': 'Respuesta del sistema inmune contra células trasplantadas.',
    'Compatibilidad': 'Grado de similitud entre donante y receptor para evitar rechazo.',
    'Seguimiento clínico': 'Monitoreo del paciente después del tratamiento con células madre.',
    'Resultados a largo plazo': 'Efectos del tratamiento observados meses o años después.',
    'Calidad celular': 'Estándares que deben cumplir las células madre para uso terapéutico.'
  },
  en: {
    'Stem cells': 'Special cells that have the ability to become different types of body cells.',
    'Cryopreservation': 'Process of freezing at very low temperatures to preserve living cells.',
    'Umbilical cord': 'Structure that connects the baby to the placenta during pregnancy.',
    'Cord blood': 'Blood rich in stem cells found in the umbilical cord.',
    'Transplant': 'Medical procedure to replace damaged cells, tissues or organs.',
    'Leukemia': 'Type of cancer that affects blood cells.',
    'Lymphoma': 'Cancer of the lymphatic system.',
    'Anemia': 'Condition where there is a deficiency of red blood cells.',
    'Immunodeficiency': 'Disorder of the immune system.',
    'Metabolic': 'Related to the chemical processes of the body.',
    'Regenerative': 'Ability to repair or replace damaged tissues.',
    'Differentiation': 'Process by which stem cells become specialized cells.',
    'Proliferation': 'Process of cell multiplication.',
    'Autologous': 'Transplant using the patient\'s own cells.',
    'Allogeneic': 'Transplant using cells from a compatible donor.',
    
    // Cellular Therapy - Basic Concepts
    'Cellular therapy': 'Medical treatment that uses living cells to repair, replace or regenerate damaged tissues.',
    'Mesenchymal stem cells': 'Multipotent stem cells that can differentiate into bone, cartilage, muscle and fat.',
    'Hematopoietic stem cells': 'Stem cells that give rise to all types of blood cells.',
    'Pluripotent stem cells': 'Stem cells that can become any type of cell in the body.',
    'Multipotent stem cells': 'Stem cells that can differentiate into several related cell types.',
    
    // Cellular Therapy - Applications
    'Regenerative medicine': 'Medical field that uses stem cells and biomaterials to regenerate damaged tissues.',
    'Stem cell therapy': 'Treatment that uses stem cells to treat diseases and injuries.',
    'Stem cell injection': 'Direct administration of stem cells to the affected area of the body.',
    'Cell culture': 'Process of growing and multiplying cells under controlled conditions.',
    'Cell expansion': 'Process of multiplying stem cells in the laboratory to obtain greater quantity.',
    
    // Cellular Therapy - Treated Conditions
    'Osteoarthritis': 'Degenerative joint disease that can be treated with cellular therapy.',
    'Sports injuries': 'Damage to muscles, tendons or ligaments that can benefit from stem cells.',
    'Autoimmune diseases': 'Conditions where the immune system attacks the body itself.',
    'Type 1 diabetes': 'Disease where insulin-producing cells are destroyed.',
    'Neurodegenerative diseases': 'Conditions that affect the nervous system such as Alzheimer\'s and Parkinson\'s.',
    'Spinal cord injuries': 'Damage to the spinal cord that can be treated with cellular therapy.',
    'Heart diseases': 'Heart conditions that can benefit from stem cells.',
    'Lung diseases': 'Respiratory conditions that can be treated with cellular therapy.',
    
    // Cellular Therapy - Processes
    'Cell isolation': 'Process of separating stem cells from other cell types.',
    'Cell characterization': 'Analysis of the properties and characteristics of stem cells.',
    'Differentiation potential': 'Ability of stem cells to become different cell types.',
    'Cell viability': 'Percentage of cells that remain alive after processing.',
    'Microbial contamination': 'Presence of bacteria, viruses or fungi in cell cultures.',
    'Sterility': 'Absence of microorganisms in cellular products.',
    'Cell cryopreservation': 'Freezing of stem cells to preserve them long-term.',
    'Cell thawing': 'Process of restoring frozen cells to body temperature.',
    
    // Cellular Therapy - Mechanisms
    'Paracrine': 'Cell signaling where cells release factors that affect nearby cells.',
    'Growth factors': 'Proteins that stimulate cell growth and differentiation.',
    'Cytokines': 'Molecules that regulate communication between immune system cells.',
    'Anti-inflammatory': 'Substance that reduces inflammation and pain.',
    'Immunomodulation': 'Regulation of the immune system by stem cells.',
    'Angiogenesis': 'Formation of new blood vessels stimulated by stem cells.',
    'Neurogenesis': 'Formation of new neurons in the brain.',
    'Osteogenesis': 'Formation of new bone tissue.',
    
    // Cellular Therapy - Safety and Efficacy
    'Therapeutic efficacy': 'Ability of a treatment to produce the desired effect.',
    'Cell safety': 'Risk assessment associated with the use of stem cells.',
    'Tumorigenesis': 'Tumor formation, potential risk of some cellular therapies.',
    'Immune rejection': 'Immune system response against transplanted cells.',
    'Compatibility': 'Degree of similarity between donor and recipient to avoid rejection.',
    'Clinical follow-up': 'Patient monitoring after stem cell treatment.',
    'Long-term outcomes': 'Treatment effects observed months or years later.',
    'Cell quality': 'Standards that stem cells must meet for therapeutic use.'
  }
};

export default function MedicalGlossary({ open, onClose, language = 'es', darkMode = false }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTerm, setSelectedTerm] = useState(null);

  const terms = MEDICAL_TERMS[language] || MEDICAL_TERMS.es;
  const filteredTerms = Object.entries(terms).filter(([term, definition]) =>
    term.toLowerCase().includes(searchTerm.toLowerCase()) ||
    definition.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: darkMode ? '#1a1a1a' : '#ffffff',
          color: darkMode ? '#ffffff' : '#000000',
          border: `1px solid ${darkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'}`
        }
      }}
    >
      <DialogTitle sx={{ 
        fontFamily: 'Manrope', 
        fontWeight: 700,
        color: darkMode ? '#ffffff' : '#000000'
      }}>
        {language === 'es' ? 'Glosario Médico' : 'Medical Glossary'}
      </DialogTitle>
      
      <DialogContent sx={{ 
        backgroundColor: darkMode ? '#1a1a1a' : '#ffffff',
        color: darkMode ? '#ffffff' : '#000000'
      }}>
        <TextField
          fullWidth
          placeholder={language === 'es' ? 'Buscar término médico...' : 'Search medical term...'}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ 
              mr: 1, 
              color: darkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' 
            }} />
          }}
          sx={{ 
            mb: 2,
            '& .MuiInputBase-input': {
              fontFamily: 'Manrope',
              color: darkMode ? '#ffffff' : '#000000'
            },
            '& .MuiInputBase-input::placeholder': {
              fontFamily: 'Manrope',
              color: darkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)'
            },
            '& .MuiOutlinedInput-root': {
              backgroundColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
              '& fieldset': {
                borderColor: darkMode ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)',
              },
              '&:hover fieldset': {
                borderColor: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)',
              },
              '&.Mui-focused fieldset': {
                borderColor: darkMode ? '#7d7da8' : '#7d7da8',
              },
            }
          }}
        />

        <Box sx={{ display: 'flex', gap: 2, height: '400px' }}>
          {/* Terms List */}
          <Box sx={{ flex: 1, overflow: 'auto' }}>
            <List>
              {filteredTerms.map(([term, definition], index) => (
                <React.Fragment key={index}>
                  <ListItem
                    button
                    onClick={() => setSelectedTerm({ term, definition })}
                    sx={{
                      backgroundColor: selectedTerm?.term === term 
                        ? (darkMode ? 'rgba(125, 125, 168, 0.2)' : 'rgba(125, 125, 168, 0.1)')
                        : 'transparent',
                      borderRadius: 1,
                      mb: 0.5,
                      fontFamily: 'Manrope',
                      '&:hover': {
                        backgroundColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'
                      }
                    }}
                  >
                    <ListItemText
                      primary={term}
                      secondary={definition.length > 100 ? definition.substring(0, 100) + '...' : definition}
                      primaryTypographyProps={{ 
                        fontWeight: 600,
                        fontFamily: 'Manrope',
                        color: darkMode ? '#ffffff' : '#000000'
                      }}
                      secondaryTypographyProps={{
                        fontFamily: 'Manrope',
                        color: darkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)'
                      }}
                    />
                  </ListItem>
                  {index < filteredTerms.length - 1 && (
                    <Divider sx={{ 
                      mx: 2, 
                      opacity: 0.3,
                      borderColor: darkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'
                    }} />
                  )}
                </React.Fragment>
              ))}
            </List>
          </Box>

          {/* Selected Term Details */}
          {selectedTerm && (
            <Box sx={{ 
              flex: 1, 
              pl: 2, 
              borderLeft: 1, 
              borderColor: darkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'
            }}>
              <Typography variant="h6" sx={{ 
                fontFamily: 'Manrope', 
                fontWeight: 700, 
                mb: 1,
                color: darkMode ? '#ffffff' : '#000000'
              }}>
                {selectedTerm.term}
              </Typography>
              <Typography variant="body1" sx={{ 
                lineHeight: 1.6, 
                fontFamily: 'Manrope',
                color: darkMode ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.9)'
              }}>
                {selectedTerm.definition}
              </Typography>
              
              <Box sx={{ mt: 2 }}>
                <Chip
                  label={language === 'es' ? 'Término médico' : 'Medical term'}
                  size="small"
                  variant="outlined"
                  sx={{
                    borderColor: darkMode ? '#7d7da8' : '#7d7da8',
                    color: darkMode ? '#7d7da8' : '#7d7da8',
                    backgroundColor: darkMode ? 'rgba(125, 125, 168, 0.1)' : 'rgba(125, 125, 168, 0.05)',
                    fontFamily: 'Manrope'
                  }}
                />
              </Box>
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ 
        backgroundColor: darkMode ? '#1a1a1a' : '#ffffff',
        borderTop: `1px solid ${darkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'}`
      }}>
        <Button 
          onClick={onClose} 
          sx={{ 
            fontFamily: 'Manrope',
            color: darkMode ? '#ffffff' : '#000000',
            '&:hover': {
              backgroundColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'
            }
          }}
        >
          {language === 'es' ? 'Cerrar' : 'Close'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

