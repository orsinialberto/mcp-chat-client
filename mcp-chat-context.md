# MCP Chat Client - Documento di Contesto del Progetto

## Panoramica del Progetto

**MCP Chat Client** è un'applicazione web Next.js che funge da interfaccia utente per interagire con un server MCP (Model Context Protocol) Java Spring Boot. L'applicazione è specificamente progettata per la **segmentazione clienti su piattaforme Marketing Cloud**, con un assistente AI chiamato **Archimede**.

## Architettura del Sistema

### Stack Tecnologico
- **Frontend**: Next.js 14 con React 18, TypeScript
- **Styling**: Tailwind CSS + Radix UI Components
- **Font**: Raleway (Google Fonts)
- **AI Integration**: AI SDK (`@ai-sdk/react`, `@ai-sdk/anthropic`, `@ai-sdk/openai`, `@ai-sdk/groq`)
- **MCP Integration**: `@modelcontextprotocol/sdk`
- **Charts**: Chart.js + React Chart.js 2
- **Backend Connection**: Server MCP Java Spring Boot (locale)

### Architettura dei Provider AI

L'applicazione supporta **4 provider AI**:

1. **Ollama** (Locale) - Priorità: Locale, gratuito
2. **Groq** (Cloud) - Priorità: Gratuito
3. **OpenAI** (Cloud) - Priorità: A pagamento
4. **Anthropic** (Cloud) - Priorità: A pagamento

### Struttura delle Cartelle

```
/
├── app/
│   ├── api/
│   │   ├── chat/route.ts              # API principale chat con MCP
│   │   ├── debug/                     # Endpoint di debug
│   │   ├── mcp/test/route.ts         # Test connessione MCP
│   │   └── test-api-key/route.ts     # Validazione API keys
│   ├── globals.css                   # Stili globali
│   ├── layout.tsx                    # Layout root
│   └── page.tsx                      # Pagina principale
├── components/
│   ├── ui/                           # Componenti UI (Radix/shadcn)
│   ├── chart-renderer.tsx            # Rendering grafici
│   ├── message-content.tsx           # Visualizzazione messaggi
│   └── sidebar.tsx                   # Sidebar principale
└── hooks/                            # Custom hooks React
```

## Componenti Principali

### 1. Archimede - Assistente AI Specializzato

**Personalità e Ruolo**:
- Specializzato in segmentazione clienti Marketing Cloud
- Linguaggio semplice, evita jargon tecnico
- Supporto multilingua
- Gestione errori proattiva
- Sicurezza e compliance built-in

**Capacità**:
- Supporto step-by-step per segmentazione
- Creazione autonoma di segmenti basata su pattern
- Visualizzazione dati con grafici
- Analisi di segmenti esistenti
- Rilevamento e correzione errori

### 2. Sistema MCP (Model Context Protocol)

**Configurazione MCP**:
```javascript
// Server Java Spring Boot locale
const transport = new StdioClientTransport({
  command: '/usr/lib/jvm/temurin-17-jdk-amd64/bin/java',
  args: ['-jar', 'plan-segment-assistant-0.0.1-SNAPSHOT.jar'],
  timeout: 30000,
  keepAlive: true
});
```

**Integrazione**:
- Connessione STDIO con server Java
- Riutilizzo connessioni per performance
- Gestione timeout e riconnessioni
- Tools MCP disponibili via `mcpClientInstance.tools()`

### 3. Multi-Provider AI System

**Configurazione Provider**:
```javascript
const providers = {
  ollama: { models: ['llama2:latest'], local: true },
  groq: { models: ['llama-3.1-8b-instant', 'mixtral-8x7b-32768'] },
  openai: { models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo'] },
  anthropic: { models: ['claude-3-5-sonnet', 'claude-3-5-haiku'] }
};
```

**Gestione API Keys**:
- Validazione formato keys
- Test connessioni real-time
- Storage sicuro in localStorage
- Indicatori stato visivi

### 4. Sistema di Visualizzazione

**Chart Renderer**:
- Supporto grafici: line, bar, pie, doughnut, area
- Integrazione Chart.js
- Parsing automatico da markdown
- Temi responsive
- Font Raleway consistency

**Message Content**:
- Rendering markdown avanzato
- Embedding grafici inline
- Gestione contenuti misti
- Cleanup automatico formatting

## Funzionalità Implementate

### ✅ Core Features
- [x] Chat interface completa
- [x] Sidebar ridimensionabile
- [x] Multi-provider AI support
- [x] Gestione API keys con validazione
- [x] Sistema MCP integration
- [x] Chart rendering system
- [x] Chat history management
- [x] Responsive design
- [x] Test connessioni provider

### ✅ AI Integration
- [x] System prompt Archimede
- [x] Streaming responses
- [x] Tool calling support
- [x] Error handling robusto
- [x] Provider switching
- [x] Ollama local support

### ✅ UI/UX Features
- [x] Sidebar collapsible/resizable
- [x] Chat title editing
- [x] Message formatting
- [x] Loading states
- [x] Status indicators
- [x] Theme consistency (Raleway)

## API Routes Implementate

### `/api/chat` - Chat Principale
- **POST**: Stream chat con AI + MCP tools
- **Features**: Multi-provider, streaming, MCP integration
- **Body**: `{ messages, provider, model, apiKeys, mcpServerUrl }`

### `/api/debug/*` - Debug Endpoints
- `/api/debug/env` - Verifica variabili ambiente
- `/api/debug/providers` - Test provider availability
- `/api/debug/groq` - Test specifico Groq
- `/api/debug/openai` - Test specifico OpenAI

### `/api/test-api-key` - Validazione Keys
- **POST**: Valida API key per provider specifico
- **Body**: `{ provider, apiKey }`
- **Response**: `{ valid, message, status }`

### `/api/mcp/test` - Test MCP Connection
- **POST**: Test connessione server MCP
- **Body**: `{ serverUrl }`
- **Features**: Health check, endpoint validation

## Configurazioni Speciali

### MCP Server Integration
```javascript
// Configurazione principale MCP
const SYSTEM_PROMPT = `
Identità: Sei Archimede, assistente AI specializzato in segmentazione clienti su piattaforme Marketing Cloud.

Capacità Principali:
- Supporto segmentazione step-by-step
- Creazione autonoma basata su pattern
- Visualizzazione con grafici e dashboard
- Gestione errori con soluzioni specifiche

Comportamenti Obbligatori:
- Linguaggio semplice, evita jargon
- Chiarezza: una funzione alla volta
- Precisione: informazioni accurate
- Multilingua: rispondi nella lingua della domanda
- Sicurezza: rispetta privacy/normative
`;
```

### Font e Styling
- **Font primario**: Raleway (300, 400, 500, 600, 700)
- **Design system**: Tailwind + Radix UI
- **Theme**: Light mode con variabili CSS custom
- **Responsive**: Mobile-first approach

### Storage e State
- **Chat history**: localStorage (`mcp-chats`)
- **API keys**: localStorage (`mcp-api-keys`) 
- **UI state**: localStorage (`mcp-sidebar-width`)
- **Session state**: React hooks + useChat

## Punti di Estensione

### 1. Nuovi Provider AI
Aggiungi in `/api/chat/route.ts`:
```javascript
case "nuovo-provider":
  const nuovoKey = apiKeys?.nuovo || process.env.NUOVO_API_KEY;
  model = nuovoProvider("model-name", { apiKey: nuovoKey });
  break;
```

### 2. Nuovi Tool MCP
I tools vengono automaticamente caricati da:
```javascript
mcpToolsInstance = await mcpClientInstance.tools();
```

### 3. Nuove Visualizzazioni
Estendi `chart-renderer.tsx` con nuovi tipi:
```javascript
case "nuovo-grafico":
  return <NuovoGrafico data={chartData} options={chartOptions} />;
```

### 4. Nuove API Routes
Aggiungi in `/app/api/[route]/route.ts` seguendo pattern esistenti.

## Sicurezza e Best Practices

### API Keys Security
- Validazione formato client-side
- Test connessioni before usage
- Storage locale (non server)
- Indicatori stato real-time

### MCP Security
- Timeout configurabili
- Error handling robusto
- Fallback mechanisms
- Process isolation Java

### General Security
- Input sanitization
- Rate limiting considerations
- CORS handling
- Environment variables

## Prossimi Sviluppi Suggeriti

### 🔄 Funzionalità da Completare
1. **Advanced MCP Integration**
   - Tool discovery dinamico
   - Error recovery mechanisms
   - Performance monitoring

2. **Enhanced UI/UX**
   - Dark mode support
   - Keyboard shortcuts
   - Advanced chart customization

3. **Enterprise Features**
   - User management
   - Audit logging
   - Export capabilities
   - Advanced security

4. **Performance Optimizations**
   - Connection pooling
   - Caching strategies
   - Lazy loading
   - Bundle optimization

## Note di Deployment

### Ambiente Sviluppo
```bash
npm install
npm run dev
# Server su http://localhost:3000
# MCP Server su http://localhost:8080
```

### Variabili Ambiente
```env
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GROQ_API_KEY=gsk_...
NODE_ENV=development
```

### Dipendenze Java
- JVM Temurin 17
- Spring Boot MCP Server
- Porta 8080 disponibile

---

**Status Progetto**: 🟡 **DEVELOPMENT** - Core features implementate, integrazione MCP attiva, pronto per estensioni.

**Ultimo Update**: Versione corrente con supporto multi-provider AI, MCP integration, chart rendering, e UI completa.