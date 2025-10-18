# MCP Singleton Architecture

## Problem Statement

Global variables `mcpClientInstance` and `mcpToolsInstance` in the file `app/api/chat/route.ts` are lost on every page refresh due to Next.js Hot Module Replacement (HMR), causing:

- ✗ Loss of MCP instances on every reload
- ✗ Creation of multiple conflicting MCP servers
- ✗ Lack of cleanup for previous connections
- ✗ No error handling for reconnections
- ✗ No connection state monitoring

## Solution: Singleton Pattern with Lifecycle Management

### Proposed Architecture

```mermaid
graph TD
    A[API Route Handler] --> B[MCPSingleton.getInstance()]
    B --> C{Instance Exists?}
    C -->|Yes| D[Verify Connection]
    C -->|No| E[Create New Instance]
    D -->|Active| F[Return Client and Tools]
    D -->|Inactive| G[Reconnect]
    E --> H[Initialize Transport]
    H --> I[Create MCP Client]
    I --> J[Retrieve Tools]
    J --> K[Register Cleanup Handlers]
    K --> F
    G --> F
    F --> L[Execute Chat Operation]
    
    M[Process Exit Handler] --> N[Cleanup Connections]
    O[Error Handler] --> P[Automatic Reconnection]
    Q[Health Check Timer] --> R[Verify Connection Status]
```

### Architecture Components

#### 1. MCPSingleton
**Responsibility**: Main singleton manager for MCP connections

**Key Features**:
- Ensures single instance per process
- Manages MCP client and tools lifecycle
- Handles initialization and reconnection logic
- Tracks connection state and health
- Provides thread-safe access to MCP resources

**State Management**:
- Connection status tracking
- Last health check timestamp
- Connection attempt counter
- Transport instance management

#### 2. Connection Manager
**Responsibility**: Health monitoring and automatic recovery

**Key Features**:
- Periodic health checks (configurable interval)
- Automatic reconnection on failure
- Exponential backoff for retry attempts
- Maximum reconnection attempt limits
- Connection status reporting

**Health Check Strategy**:
- Regular verification of client connectivity
- Detection of stale or broken connections
- Proactive reconnection before failures impact users

#### 3. Lifecycle Manager
**Responsibility**: Process lifecycle and graceful shutdown

**Key Features**:
- Process signal handling (SIGTERM, SIGINT)
- Cleanup handler registration
- Graceful shutdown coordination
- Uncaught exception handling
- Resource cleanup orchestration

**Shutdown Flow**:
1. Intercept shutdown signals
2. Execute all registered cleanup handlers
3. Close active connections
4. Release system resources
5. Exit process cleanly

#### 4. Logger
**Responsibility**: Structured logging for monitoring and debugging

**Key Features**:
- Configurable log levels (debug, info, warn, error)
- Structured log formatting
- Include contextual information
- Environment-aware verbosity
- Consistent prefix for MCP logs

### File Structure

```
lib/
├── mcp/
│   ├── types.ts              # TypeScript type definitions
│   ├── singleton.ts          # Main singleton manager
│   ├── connection-manager.ts # Connection management and health checks
│   ├── lifecycle.ts          # Lifecycle and cleanup management
│   ├── logger.ts            # Dedicated logging system
│   └── config.ts            # MCP configuration
```

### Configuration Structure

**Transport Configuration**:
- Command and arguments for MCP server process
- Connection timeout settings
- Keep-alive configuration

**Connection Configuration**:
- Maximum reconnection attempts
- Reconnection delay (with optional backoff)
- Health check interval
- Connection timeout threshold

**Logging Configuration**:
- Log level based on environment
- Custom prefix for log identification

## Architectural Patterns

### Singleton Pattern
Ensures one MCP connection instance per process. Prevents resource conflicts and duplicate connections.

### Lazy Initialization
Initialize MCP client and tools only when first requested. Optimizes startup time and resource usage.

### Health Check Pattern
Periodic health checks with automatic recovery to maintain reliability.

### Graceful Degradation
System continues operating with temporary connection issues. Attempts automatic recovery without user intervention.

### Observer Pattern
Lifecycle manager observes process signals and coordinates cleanup across registered handlers.

## Data Flow

### Connection Initialization Flow
1. Route handler requests MCP instance
2. Singleton checks for existing instance
3. If absent, initialize transport and client
4. Retrieve available tools
5. Register cleanup handlers
6. Start health check monitoring
7. Return client and tools to caller

### Health Check Flow
1. Timer triggers periodic health check
2. Singleton verifies connection status
3. If healthy, update last check timestamp
4. If unhealthy, trigger reconnection process
5. Connection manager handles retry logic
6. On success, restore normal operation
7. On failure after max attempts, log error

### Shutdown Flow
1. Process receives termination signal
2. Lifecycle manager intercepts signal
3. Execute all cleanup handlers in sequence
4. Stop health check monitoring
5. Close MCP transport connections
6. Release resources
7. Exit process gracefully

## Architecture Benefits

### ✅ Persistence
- MCP instances survive module refreshes
- Singleton pattern guarantees one instance per process
- Automatic lifecycle management

### ✅ Resilience
- Automatic health checks every 30 seconds
- Automatic reconnection on errors
- Graceful shutdown with resource cleanup

### ✅ Monitoring
- Structured logging with configurable levels
- Connection metrics (uptime, attempts, status)
- Complete system state visibility

### ✅ Performance
- Connection reuse for existing instances
- Lazy initialization only when needed
- Prevents multiple MCP server creation

### ✅ Maintainability
- Modular and well-structured code
- Centralized configuration
- Easy testing and debugging

## Design Principles Applied

### Single Responsibility Principle
Each component has one clear responsibility:
- Singleton: instance management
- Connection Manager: health and reconnection
- Lifecycle Manager: shutdown and cleanup
- Logger: structured logging

### Dependency Inversion
High-level modules depend on abstractions (interfaces), not concrete implementations. Facilitates testing and flexibility.

### Separation of Concerns
Connection management, lifecycle handling, and logging are separate, loosely coupled modules.

### Fail-Safe Defaults
System defaults to safe behavior on errors. Attempts recovery before failing.

## Scalability Considerations

### Horizontal Scaling
Singleton works for single-process apps. For multi-process deployments (cluster mode), consider:
- Shared state management via Redis or similar
- Process-specific singleton instances
- Load balancer health checks integration

### Resource Management
- Connection pooling for high-traffic scenarios
- Configurable timeout and retry parameters
- Memory footprint monitoring

## Security Considerations

- Secure configuration management for MCP server credentials
- Proper error message sanitization in logs
- Resource cleanup to prevent leaks
- Timeout enforcement to prevent hanging connections

---

This architecture provides a robust solution for managing persistent MCP connections with automatic recovery and monitoring.