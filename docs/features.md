# MCP Chat Client - Features Documentation

## Overview
AI chat assistant for Marketing Cloud customer segmentation, named "Archimede". Provides an intuitive interface for data analysts and marketers.

## Core Features

### 1. Multi-Chat Interface
**Description**: Users can manage multiple chat conversations simultaneously.

**Capabilities**:
- Create new chat sessions
- Switch between active conversations
- Edit chat titles for better organization
- View message history for each chat
- Delete completed or unwanted chats

**Data Persistence**:
- Auto-save to browser localStorage
- Persist across page refreshes
- Full message context saved

**User Experience**:
- Sidebar shows all chats with previews
- Click to switch context
- Real-time message updates

---

### 2. Multi-Provider AI Integration
**Description**: Flexible AI provider selection for different use cases and budgets.

**Supported Providers**:

#### Google Gemini (Default)
- **Model**: gemini-2.0-flash-exp
- **Benefits**: Fast inference, advanced capabilities, generous free tier
- **Use Case**: Default choice for all segmentation tasks, real-time analysis

#### Anthropic Claude
- **Model**: claude-3-5-sonnet-20241022
- **Benefits**: High quality responses, advanced reasoning
- **Use Case**: Complex segmentation tasks, production use

**Configuration**:
- API keys managed via localStorage or environment variables
- Real-time validation of API keys
- Easy switching between providers in sidebar
- Per-chat provider selection (future enhancement)

---

### 3. Model Context Protocol (MCP) Integration
**Description**: Connect to external MCP server for specialized tools and data access.

**Technical Details**:
- **Transport**: STDIO communication with Java Spring Boot server
- **Server Path**: Configurable JAR file location
- **Timeout**: 30 seconds for initialization
- **Health Monitoring**: Automatic connection status checks

**Capabilities**:
- Dynamic tool loading from MCP server
- Tools available to AI for enhanced responses
- Specialized functions for Marketing Cloud operations
- Real-time tool execution

**Architecture**:
- Singleton pattern for connection management
- Automatic reconnection on failures
- Graceful error handling
- Health check monitoring

---

### 4. Data Visualization
**Description**: Rich chart rendering embedded in chat messages.

**Supported Chart Types**:
- **Line Charts**: Trends over time
- **Bar Charts**: Comparative data
- **Pie Charts**: Proportional data
- **Doughnut Charts**: Categorical breakdowns
- **Area Charts**: Cumulative trends

**Implementation**:
- Charts defined in markdown code blocks with ```chart syntax
- Automatic parsing and rendering
- Chart.js integration for professional visualizations
- Consistent color scheme matching application theme

**Data Format**:
```javascript
{
  type: 'line' | 'bar' | 'pie' | 'doughnut' | 'area',
  data: {
    labels: string[],
    datasets: [{
      label: string,
      data: number[],
      // ... chart-specific options
    }]
  },
  options?: {
    // Chart.js options
  }
}
```

**Use Cases**:
- Segment size visualization
- Trend analysis
- Performance metrics
- Distribution analysis

---

### 5. System Prompt Specialization
**Description**: AI assistant configured for Marketing Cloud segmentation tasks.

**Persona - "Archimede"**:
- Expert in Marketing Cloud customer segmentation
- Technical yet accessible communication style
- Step-by-step guidance approach
- Focus on data security and compliance

**Core Capabilities**:
1. **Segment Creation**
   - Guide users through segment definition
   - Suggest appropriate criteria
   - Best practices for targeting

2. **Segment Optimization**
   - Analyze existing segments
   - Recommend improvements
   - Performance tuning

3. **Data Visualization**
   - Generate relevant charts
   - Interpret data patterns
   - Present insights clearly

4. **Troubleshooting**
   - Debug segment issues
   - Error resolution
   - Performance problems

**Language**: Italian (primary)

---

### 6. Suggested Actions
**Description**: Quick-start buttons for common tasks.

**Four Main Categories**:

1. **Create Segments** (Crea Segmenti)
   - New segment creation workflows
   - Template-based approaches
   - Best practices guidance

2. **Optimize** (Ottimizza)
   - Segment analysis
   - Performance improvements
   - Refinement suggestions

3. **Visualizations** (Visualizzazioni)
   - Chart generation
   - Dashboard creation
   - Data exploration

4. **Troubleshooting** (Risolvi Errori)
   - Error diagnosis
   - Solution recommendations
   - Support resources

**User Experience**:
- Display on empty chat
- One-click workflow initiation
- Context-aware suggestions

---

### 7. Configuration Management
**Description**: Flexible application configuration via sidebar interface.

**Configurable Elements**:

#### API Keys
- Input fields for each provider
- Real-time validation
- Secure storage in localStorage
- Fallback to environment variables
- Visual feedback for validation

#### Provider Selection
- Dropdown for active provider
- Model selection per provider
- Easy switching between providers

#### MCP Server Settings
- Server path configuration
- Connection status display
- Manual reconnection option

#### UI Preferences
- Sidebar width adjustment (resizable)
- Width preference persisted in localStorage
- Collapsible sidebar for more screen space

---

### 8. Message Rendering
**Description**: Rich content display with markdown support.

**Supported Content**:
- Plain text messages
- Markdown formatting (bold, italic, lists, etc.)
- Code blocks with syntax highlighting
- Embedded charts (via ```chart blocks)
- Links and references

**Parsing Pipeline**:
1. Extract chart blocks from message
2. Parse chart JSON configuration
3. Render charts via ChartRenderer
4. Display remaining text with markdown

**Content Cleaning**:
- Remove chart blocks from text
- Prevent duplicate rendering
- Handle malformed data gracefully

---

### 9. Real-Time Streaming
**Description**: Progressive message display as AI generates content.

**Implementation**:
- AI SDK `useChat` hook for streaming
- Token-by-token display
- Smooth user experience
- Cancel generation support

**Benefits**:
- Immediate feedback
- Reduced perceived latency
- Better engagement
- Interruptible responses

---

### 10. Error Handling & Recovery
**Description**: Robust error management.

**Error Types Handled**:
- API connection failures
- Invalid API keys
- MCP server disconnections
- Malformed chat data
- Chart parsing errors
- Network timeouts

**Recovery Strategies**:
- User-friendly error messages (Italian)
- Automatic retry for transient failures
- Fallback to cached data
- Clear action instructions
- Detailed logging

**User Feedback**:
- Toast notifications
- Inline error messages
- Status indicators (connection, loading)
- Suggested resolution actions

---

## Accessibility Features

### Keyboard Navigation
- Full keyboard support for chat interface
- Tab navigation through UI elements
- Keyboard shortcuts for common actions
- Focus management for modals and dialogs

### Screen Reader Support
- Semantic HTML structure
- ARIA labels for interactive elements
- Proper heading hierarchy
- Alt text for visual elements

### Visual Accessibility
- High contrast color scheme
- Readable font sizes (Raleway)
- Clear visual hierarchy
- Consistent UI patterns
- Radix UI accessible components

---

## Performance Optimizations

### Lazy Loading
- Components loaded on-demand
- Reduced initial bundle size
- Faster page load times

### Efficient Rendering
- React 19 concurrent features
- Memoization for expensive operations
- Virtual scrolling for long histories (future)

### Caching
- localStorage for configuration
- Client-side chat history
- Reduced server requests

---

## Mobile & Responsive Design

### Mobile-First Approach
- Touch-optimized interface
- Collapsible sidebar for small screens
- Responsive typography
- Thumb-friendly tap targets

### Breakpoint Strategy
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

### Adaptive Layout
- Sidebar auto-collapses on mobile
- Stacked layouts for narrow screens
- Horizontal scrolling when needed

---

## Testing & Quality Assurance

### End-to-End Testing (Playwright)
**Description**: Comprehensive E2E tests verify the complete user flow from UI interaction to API response rendering.

**Test Coverage**:
- ✅ Message sending and receiving
- ✅ API response verification
- ✅ UI rendering validation
- ✅ API-UI synchronization detection
- ✅ LocalStorage persistence
- ✅ Multiple messages handling
- ✅ New chat creation

**Key Benefits**:
- **Confidence**: Every feature change is automatically verified
- **Regression Prevention**: Catches bugs before deployment
- **API-UI Sync Detection**: Identifies if API responds but UI fails to update
- **Automated Testing**: Runs in CI/CD pipeline

**Test Architecture**:
- **Tool**: Playwright (Next.js recommended)
- **Browser**: Chromium (default)
- **Auto-start**: Next.js dev server started automatically
- **Reports**: HTML reports with screenshots on failure

**Running Tests**:
```bash
# Run all E2E tests
npm run test:e2e

# Run with UI (interactive mode)
npm run test:e2e:ui

# Debug mode
npm run test:e2e:debug
```

**Test Types**:
1. **Critical Path Tests**: Core functionality (send message → receive response)
2. **API-UI Sync Tests**: Verify API responses are displayed in UI
3. **Persistence Tests**: LocalStorage save/load verification
4. **UI-Only Tests**: Interface rendering without API calls

---

## Future Enhancements

### Planned Features
1. **User Authentication**
   - Login/logout system
   - User-specific chat history
   - Cloud synchronization

2. **Chat Sharing**
   - Export conversations
   - Share via link
   - Import chat history

3. **Theme Customization**
   - Dark/light mode toggle
   - Custom color schemes
   - Font preferences

4. **Plugin System**
   - Modular extensions
   - Community plugins
   - Custom tool integration

5. **Offline Support**
   - PWA capabilities
   - Offline message queuing
   - Service worker caching

6. **Advanced Analytics**
   - Usage metrics
   - Performance monitoring
   - User behavior insights

7. **Collaboration Features**
   - Multi-user chat sessions
   - Comments and annotations
   - Team workspaces

8. **Enhanced Visualizations**
   - More chart types
   - Interactive dashboards
   - Custom visualization builder

---

*This document describes the features of MCP Chat Client. For technical implementation details, refer to AGENTS.md and docs/architecture.md.*