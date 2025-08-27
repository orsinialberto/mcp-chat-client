# MCP Chat Client - Documento Descrittivo del Progetto

## Panoramica Generale

**MCP Chat Client** è un'applicazione web moderna sviluppata con Next.js 15 che funge da client per server MCP (Model Context Protocol). L'applicazione è specializzata come assistente AI per la segmentazione clienti su Marketing Cloud, con il nome "Archimede".

### Informazioni di Base
- **Nome**: MCP Chat Client
- **Versione**: 0.1.0
- **Framework**: Next.js 15.2.4 con React 19
- **Linguaggio**: TypeScript
- **Styling**: Tailwind CSS con componenti Radix UI
- **Font**: Raleway (Google Fonts)
- **Lingua**: Italiano

## Architettura dell'Applicazione

### Stack Tecnologico

#### Frontend
- **Next.js 15.2.4**: Framework React con App Router
- **React 19**: Libreria UI con hooks moderni
- **TypeScript**: Tipizzazione statica
- **Tailwind CSS**: Framework CSS utility-first
- **Radix UI**: Componenti UI accessibili e personalizzabili
- **Lucide React**: Icone moderne
- **Chart.js + React-chartjs-2**: Visualizzazione dati e grafici

#### AI e Integrazione
- **AI SDK**: Framework per integrazione AI (`@ai-sdk/anthropic`, `@ai-sdk/groq`, `@ai-sdk/openai`)
- **Model Context Protocol SDK**: Comunicazione con server MCP
- **Ollama AI Provider**: Supporto per modelli locali

#### Gestione Stato e Dati
- **React Hook Form**: Gestione form
- **Zod**: Validazione schema
- **LocalStorage**: Persistenza dati client-side

### Struttura del Progetto

```
mcp-chat-client/
├── app/                          # App Router di Next.js
│   ├── api/                      # API Routes
│   │   ├── chat/                 # Endpoint principale chat
│   │   ├── debug/                # Endpoint di debug
│   │   ├── mcp/                  # Test connessione MCP
│   │   └── test-api-key/         # Validazione API keys
│   ├── globals.css               # Stili globali
│   ├── layout.tsx                # Layout principale
│   └── page.tsx                  # Pagina principale (MCPChatClient)
├── components/                   # Componenti React
│   ├── ui/                       # Componenti UI base (Radix)
│   ├── chart-renderer.tsx        # Renderer per grafici
│   ├── message-content.tsx       # Rendering messaggi chat
│   ├── sidebar.tsx               # Sidebar navigazione
│   └── theme-provider.tsx        # Provider tema
├── hooks/                        # Custom hooks
├── lib/                          # Utilities
└── public/                       # Asset statici
```

## Funzionalità Principali

### 1. Chat Interface
- **Chat multipla**: Gestione di più conversazioni simultanee
- **Persistenza**: Salvataggio automatico in localStorage
- **Editing**: Modifica titoli chat e gestione cronologia
- **Messaggi ricchi**: Supporto per testo formattato e grafici

### 2. Integrazione AI Multi-Provider
- **Groq**: Modelli Llama (llama-3.1-8b-instant)
- **Anthropic**: Claude (claude-3-5-sonnet-20241022)
- **Configurazione flessibile**: API keys via localStorage o variabili ambiente

### 3. Model Context Protocol (MCP)
- **Server Java Spring Boot**: Connessione a server MCP esterno
- **Transport STDIO**: Comunicazione tramite processo Java
- **Tools dinamici**: Caricamento automatico strumenti MCP
- **Health check**: Monitoraggio stato connessione

### 4. Visualizzazione Dati
- **Chart.js**: Grafici line, bar, pie, doughnut, area
- **Parsing automatico**: Riconoscimento blocchi ```chart``` nei messaggi
- **Stile coerente**: Design integrato con l'interfaccia

### 5. Gestione Configurazione
- **Sidebar configurabile**: Ridimensionamento e persistenza
- **API Keys**: Gestione sicura con validazione
- **Provider switching**: Cambio dinamico tra AI providers
- **Modelli personalizzabili**: Selezione modello per provider

## Componenti Chiave

### MCPChatClient (`app/page.tsx`)
Componente principale che orchestra:
- Gestione stato chat e messaggi
- Integrazione con AI SDK (`useChat` hook)
- Persistenza localStorage
- Gestione errori e loading states

### Sidebar (`components/sidebar.tsx`)
Pannello laterale con:
- Lista chat con preview
- Configurazione provider AI
- Gestione API keys con validazione
- Impostazioni MCP server
- Ridimensionamento dinamico

### Chat API (`app/api/chat/route.ts`)
Endpoint principale che:
- Gestisce richieste chat multi-provider
- Integra MCP client con transport STDIO
- Applica system prompt specializzato
- Gestisce streaming responses

### MessageContent (`components/message-content.tsx`)
Renderer messaggi con:
- Parsing contenuto markdown
- Riconoscimento grafici embedded
- Pulizia automatica contenuto
- Integrazione ChartRenderer

### ChartRenderer (`components/chart-renderer.tsx`)
Componente visualizzazione con:
- Supporto 5 tipi grafici
- Configurazione colori personalizzata
- Stile coerente con design system
- Responsive design

## Configurazione e Setup

### Variabili Ambiente (`.env.local`)
```bash
# Groq API Key (gratuita)
GROQ_API_KEY="gsk_..."

# Anthropic API Key
ANTHROPIC_API_KEY="sk-ant-..."

# Google AI Studio API Key
GOOGLE_GENERATIVE_AI_API_KEY="AIza..."
```

### Server MCP Esterno
L'applicazione si connette a un server Java Spring Boot:
- **Path**: `/home/alberto_orsini_linux/dev/albe/plan-segment-assistant/plan-segment-assistant/target/plan-segment-assistant-0.0.1-SNAPSHOT.jar`
- **Transport**: STDIO con timeout 30s
- **Health endpoint**: `/api/health`

### Comandi Principali
```bash
# Installazione dipendenze
npm install --legacy-peer-deps

# Sviluppo
npm run dev

# Build produzione
npm run build

# Avvio produzione
npm start
```

## Specializzazione Marketing Cloud

### System Prompt
L'assistente "Archimede" è configurato con prompt specifico per:
- Segmentazione clienti Marketing Cloud
- Linguaggio tecnico ma accessibile
- Approccio step-by-step
- Focus su sicurezza dati e conformità

### Funzionalità Suggerite
L'interfaccia propone 4 aree principali:
1. **Creazione segmenti**: Guide per nuovi segmenti
2. **Ottimizzazione**: Analisi e miglioramenti
3. **Visualizzazioni**: Grafici e dashboard
4. **Risoluzione errori**: Supporto troubleshooting

## Caratteristiche Tecniche

### Performance
- **Next.js 15**: App Router per performance ottimali
- **React 19**: Concurrent features e Suspense
- **Streaming**: Risposte AI in tempo reale
- **Lazy loading**: Componenti caricati on-demand

### Accessibilità
- **Radix UI**: Componenti accessibili by design
- **Keyboard navigation**: Navigazione completa da tastiera
- **Screen reader**: Supporto tecnologie assistive
- **Color contrast**: Palette colori accessibile

### Sicurezza
- **API Keys**: Gestione sicura lato client
- **Validazione**: Input sanitization e validation
- **CORS**: Configurazione appropriata
- **Environment**: Separazione dev/prod

### Responsive Design
- **Mobile-first**: Design ottimizzato per mobile
- **Breakpoints**: Responsive su tutti i dispositivi
- **Touch-friendly**: Interfaccia touch ottimizzata
- **Sidebar collapsible**: Adattamento spazio schermo

## Estensibilità

### Nuovi Provider AI
Il sistema è progettato per aggiungere facilmente nuovi provider:
1. Aggiungere SDK nel `package.json`
2. Estendere switch in `app/api/chat/route.ts`
3. Aggiornare UI in `components/sidebar.tsx`
4. Implementare validazione in `app/api/test-api-key/route.ts`

### Nuovi Tipi Grafici
Per aggiungere grafici:
1. Registrare componenti Chart.js
2. Estendere `ChartRenderer` con nuovo tipo
3. Aggiornare interfaccia `ChartData`

### Personalizzazione UI
- **Tailwind**: Configurazione in `tailwind.config.js`
- **Componenti**: Estensione componenti Radix in `components/ui/`
- **Temi**: Sistema temi con `next-themes`

## Dipendenze Principali

### Core Framework
- `next@15.2.4`: Framework React
- `react@^19`: Libreria UI
- `typescript@^5`: Tipizzazione

### AI e MCP
- `ai@^4.3.19`: AI SDK principale
- `@modelcontextprotocol/sdk@^1.17.0`: MCP SDK
- `@ai-sdk/anthropic@latest`: Provider Anthropic
- `@ai-sdk/groq@latest`: Provider Groq

### UI e Styling
- `tailwindcss@^3.4.17`: Framework CSS
- `@radix-ui/*`: Componenti UI (20+ pacchetti)
- `lucide-react@^0.454.0`: Icone
- `chart.js@latest`: Grafici

### Utilities
- `zod@^3.24.1`: Validazione schema
- `clsx@^2.1.1`: Utility classi CSS
- `date-fns@4.1.0`: Manipolazione date

## Note di Sviluppo

### Configurazione Build
- **ESLint**: Ignorato durante build per velocità
- **TypeScript**: Errori ignorati in build
- **Images**: Non ottimizzate per compatibilità
- **Dev indicators**: Disabilitati

### Gestione Errori
- **Try-catch**: Gestione errori completa
- **User feedback**: Messaggi errore user-friendly
- **Logging**: Console logging dettagliato
- **Fallback**: Stati di fallback per componenti

### Testing e Debug
- **API debug**: Endpoint `/api/debug/*` per testing
- **MCP test**: Endpoint `/api/mcp/test` per connessione
- **Console logs**: Logging dettagliato per debugging
- **Error boundaries**: Gestione errori React

## Roadmap e Miglioramenti Futuri

### Funzionalità Pianificate
1. **Autenticazione**: Sistema login/logout
2. **Condivisione chat**: Export/import conversazioni
3. **Temi personalizzati**: Dark/light mode
4. **Plugin system**: Estensioni modulari
5. **Offline support**: PWA capabilities

### Ottimizzazioni Tecniche
1. **Caching**: Redis per performance
2. **Database**: Migrazione da localStorage
3. **WebSockets**: Real-time updates
4. **CDN**: Asset delivery ottimizzato
5. **Monitoring**: Analytics e metriche

---

*Documento generato automaticamente - Ultimo aggiornamento: 27 Agosto 2025*