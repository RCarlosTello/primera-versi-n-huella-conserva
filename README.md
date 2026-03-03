# 🌿 Huella Conserva

**Asistente conversacional institucional** para el ecosistema de productos y servicios de Conserva.

---

## 📋 Descripción

Huella Conserva es una aplicación web que funciona como asistente de inteligencia artificial especializado en la normatividad, procesos y políticas institucionales de Conserva. Permite a los colaboradores consultar información precisa y confiable sobre créditos, manuales operativos, viáticos y más.

## 🗂️ Estructura del Proyecto

```
prueba huella conserva/
├── index.html                      # Punto de entrada principal
├── styles/
│   └── main.css                    # Estilos globales de la aplicación
├── app/
│   ├── main.js                     # Inicialización y orquestador principal
│   ├── auth.js                     # Módulo de autenticación
│   ├── chat.js                     # Lógica del chat conversacional
│   ├── modules.js                  # Módulos del ecosistema institucional
│   ├── stats.js                    # Módulo de estadísticas
│   └── ui.js                       # Componentes y control de la interfaz
├── data/
│   ├── manuales.js                 # Base de conocimiento de manuales
│   ├── collaborators.js            # Datos de colaboradores
│   ├── stats_cc_names.json         # Catálogo de centros de costos
│   └── _collab_raw.json            # Datos crudos de colaboradores
└── [Manuales institucionales .md]  # Documentos fuente de conocimiento
```

## 🚀 Uso

Abrir `index.html` directamente en un navegador moderno (Chrome, Edge, Firefox). No requiere servidor ni instalación de dependencias.

## 📚 Documentos Institucionales Incluidos

- `PROMPT_HuellaConserva_v1.0.md` — Definición del asistente
- `Layout_Ecosistema_v1.0_modulos_CON_MAN_VIA.md` — Ecosistema de módulos
- `Manual_de_Credito_Mujeres_de_Palabra.md`
- `Manual_de_credito_T_activa.md`
- `Manual_de_credito_paralelo.md`
- `Manual_de_credito_tu_hogar.md`
- `manual_credito_individual.md`
- `MANUAL_DE_CAJA_CHICA.md`
- `MANUAL_VIATICOS.md`

## ⚙️ Tecnologías

- **HTML5** + **CSS3** (Vanilla)
- **JavaScript** (ES Modules, sin framework)
- Arquitectura modular con separación de responsabilidades

---

> Desarrollado internamente para Conserva. Uso exclusivo institucional.
