# Archimede - AI Chat Client for Marketing Cloud

AI assistant specialized in Marketing Cloud customer segmentation using Model Context Protocol (MCP).

## 🚀 Overview

Archimede is an intelligent chat application that helps with Marketing Cloud customer segmentation tasks. It leverages multiple AI providers and integrates with MCP (Model Context Protocol) servers to provide real-time assistance with segment creation, optimization, and analysis.

## 📋 Tech Stack

- **Framework**: Next.js 15.2.4 with App Router
- **Language**: TypeScript
- **Runtime**: Node.js
- **UI**: React 19
- **Styling**: Tailwind CSS with Radix UI components
- **AI Integration**: AI SDK with multiple providers
  - Google Gemini (Default)
  - Anthropic (Claude)
  - OpenAI
- **External Integration**: Model Context Protocol (MCP) via STDIO transport

## 🛠️ Installation

### Prerequisites

- Node.js 18.x or higher
- npm or yarn package manager
- Java 17+ (for MCP server)

### Steps

1. Clone the repository:
```bash
git clone <repository-url>
cd mcp-chat-client
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Configure your API keys and MCP server path in `.env.local`

## ⚙️ Environment Variables

Create a `.env.local` file in the project root with the following variables:

### Required API Keys

```bash
# AI Provider API Keys (at least one is required)
GEMINI_API_KEY=your_gemini_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

### Optional Configuration

- **MCP Server**: Configured in `lib/mcp/config.ts`
- **Node Environment**: Defaults to `development`

## 🚀 Running the Project

### Development Mode

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

## 🧪 Running Tests

### Unit Tests (Jest)

```bash
# Run all unit tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### End-to-End Tests (Playwright)

E2E tests verify the complete user flow, including API responses and UI rendering.

```bash
# Run all E2E tests
npm run test:e2e

# Run E2E tests with UI mode (interactive)
npm run test:e2e:ui

# Run E2E tests in debug mode
npm run test:e2e:debug

# Run specific test file
npx playwright test e2e/chat.spec.ts

# View test report
npx playwright show-report
```

**What E2E Tests Cover**:
- ✅ Message sending and receiving
- ✅ API response verification
- ✅ UI rendering and updates
- ✅ API-UI synchronization (detects if API responds but UI doesn't update)
- ✅ LocalStorage persistence
- ✅ Multiple messages handling
- ✅ New chat creation

**Note**: E2E tests automatically start the Next.js dev server. Make sure port 3000 is available.

## 📚 Documentation

### Architecture & Design

- **Architecture**: [docs/architecture.md](docs/architecture.md) - System design and architectural decisions
- **Features**: [docs/features/](docs/features/) - Individual feature specifications
- **Project Structure**: [docs/project-structure.md](docs/project-structure.md) - Codebase organization

### Development Guidelines

- **AGENTS.md**: Complete development guide with coding standards, best practices, and workflows

## 🎯 Key Features

### 1. Multi-Provider AI Support
Switch between different AI providers (Gemini, Anthropic) based on your needs and API availability.

### 2. MCP Integration
Seamless integration with Model Context Protocol servers for real-time data access and tool execution.

### 3. Structured Responses
Archimede provides responses following a consistent format:
- 🎯 Objective
- 📋 Segmentation Criteria
- ⚙️ Implementation Steps
- 📊 Metrics and Monitoring
- ⚠️ Considerations

### 4. Markdown Rendering
Full markdown support including tables, code blocks, lists, and formatted text.

### 5. Persistent Chat History
Chat sessions are saved locally for easy reference and continuation.

### 6. Character Encoding Support
Automatic handling of UTF-8 encoding for international characters.

## 🏗️ Project Structure

```
mcp-chat-client/
├── app/                    # Next.js app router pages
│   ├── api/               # API routes
│   │   ├── chat/         # Chat endpoint
│   │   └── mcp/          # MCP status endpoints
│   ├── page.tsx          # Main chat interface
│   └── globals.css       # Global styles
├── components/            # React components
│   ├── message-content.tsx    # Message rendering with markdown
│   ├── chart-renderer.tsx     # Chart visualization
│   └── sidebar.tsx            # Chat sidebar
├── lib/                   # Utility libraries
│   └── mcp/              # MCP integration
│       ├── singleton.ts      # MCP client singleton
│       ├── connection-manager.ts
│       ├── lifecycle.ts
│       └── logger.ts
├── docs/                  # Documentation
│   ├── architecture.md
│   └── features/
└── AGENTS.md             # Development guidelines
```

## 🤝 Contributing

1. Follow the coding standards defined in `AGENTS.md`
2. Write unit tests for new features
3. Use conventional commit messages:
   - `feat:` for new features
   - `fix:` for bug fixes
   - `docs:` for documentation
   - `refactor:` for code refactoring
   - `test:` for adding tests
4. Ensure all tests pass before submitting PR
5. Run linter and fix any issues

## 🔒 Security

- Never commit `.env` or `.env.local` files
- API keys are stored locally and not transmitted
- All MCP communications use secure STDIO transport
- Input validation and sanitization on all user inputs

## 🐛 Issues & Support

For bugs and feature requests, please [create an issue](link-to-issues).

---

**Last Updated**: 2025-10-15

