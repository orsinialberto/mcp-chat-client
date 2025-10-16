# AGENTS.md - Node.js Development Guide

## Project Context
This is a **Next.js 15 application** with the following stack:
- **Framework**: Next.js 15.2.4 with App Router
- **Language**: TypeScript
- **Runtime**: Node.js
- **UI**: React 19
- **Styling**: Tailwind CSS with Radix UI components
- **AI Integration**: AI SDK with multiple providers (Google Gemini, Anthropic, OpenAI, Ollama)
- **External Integration**: Model Context Protocol (MCP) via STDIO transport

The application is an AI chat client specialized for Marketing Cloud customer segmentation, named "Archimede".

## Project Documentation
For detailed information about the project, refer to:
- **Project Structure**: `docs/project-structure.md` - Detailed explanation of the codebase organization
- **Features**: `docs/features/` - Individual feature specifications and requirements
- **Architecture**: `docs/architecture.md` - System design and architectural decisions
- **API Documentation**: `docs/api/` - Endpoint specifications and usage examples

Always check these documents before implementing new features to understand the existing structure and requirements.

## English Language Correction
**IMPORTANT**: The developer is working to improve their English skills.
- Always correct any grammar, syntax, or spelling errors in the developer's messages
- Provide the corrected version at the beginning of your response
- Explain what was corrected and why
- Be supportive and encouraging
- Use clear, simple explanations for corrections

**Example format:**
```
✍️ Corrected: "I want to implement a new feature for user authentication."
Original: "I want to implement new feature for user authentication."
Change: Added article "a" before "new feature" (countable noun requires an article)
```

## Code Style & Standards

### General Rules
- Use ES6+ syntax and modern JavaScript features
- Prefer `const` over `let`, avoid `var`
- Use async/await over Promise chains
- Use template literals for string interpolation
- Enable strict mode: `'use strict'`
- Maximum line length: 100 characters
- Use 2 spaces for indentation
- Use semicolons consistently

### Naming Conventions
- **Variables/Functions**: camelCase (`getUserData`, `totalCount`)
- **Classes**: PascalCase (`UserService`, `DatabaseConnection`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_RETRY_ATTEMPTS`, `API_BASE_URL`)
- **Private methods**: prefix with underscore (`_validateInput`) or use TypeScript private keyword
- **File names**: kebab-case (`user-service.js`, `auth-middleware.js`) or descriptive names without separators when appropriate

### Error Handling
- Always use try-catch blocks for async operations
- Create custom error classes that extend Error when appropriate
- Log errors with appropriate context using a structured logger
- Never swallow errors silently
- Use descriptive error messages
- Implement graceful error recovery when possible

```javascript
class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
  }
}

try {
  await someAsyncOperation();
} catch (error) {
  logger.error('Operation failed:', { error: error.message, stack: error.stack });
  throw error;
}
```

## Project Structure

### Recommended Directory Layout
```
project-root/
├── src/
│   ├── config/         # Configuration files
│   ├── controllers/    # Route controllers
│   ├── models/         # Data models
│   ├── services/       # Business logic
│   ├── middlewares/    # Express middlewares
│   ├── routes/         # API routes
│   ├── utils/          # Utility functions
│   └── validators/     # Input validation
├── tests/              # Test files
├── docs/               # Documentation
├── .env.example        # Environment variables template
├── .gitignore
├── package.json
└── README.md
```

## Development Process

### 1. Before Starting New Features

#### Phase 1: Problem Definition
- Clearly define what you want to implement or what problem you want to solve
- Understand the requirements and expected outcomes
- Identify the scope and boundaries of the feature
- Review existing code structure to understand the current implementation

#### Phase 2: Design & Architecture
- Choose the appropriate architectural approach
- Identify which design patterns to apply
- Keep the design simple and clean - avoid over-engineering
- Prefer simple solutions over complex ones (KISS principle)
- Check for similar implementations in the codebase
- Plan data flow and component interactions

#### Phase 3: Implementation Plan
- Create a detailed checklist document with all tasks needed to complete the development
- Break down the feature into small, manageable steps
- Each item should be specific and actionable
- The AI agent will follow this checklist along with the coding rules below

**Example Implementation Plan Document:**
```markdown
# Feature: User Authentication

## Tasks Checklist
- [ ] Create User model with email and password fields
- [ ] Implement password hashing utility
- [ ] Create authentication middleware
- [ ] Add login endpoint
- [ ] Add registration endpoint
- [ ] Add JWT token generation
- [ ] Implement token validation
- [ ] Add error handling for invalid credentials
- [ ] Write unit tests for auth service
- [ ] Write integration tests for auth endpoints
- [ ] Update API documentation
```

### 2. Writing Code
- Write self-documenting code with clear variable names
- Add JSDoc comments for functions and classes
- Keep functions small and focused (single responsibility)
- Extract magic numbers into named constants
- Validate all inputs
- Handle edge cases explicitly

### 3. Dependencies
- Use npm for package management
- Keep dependencies up to date
- Prefer well-maintained packages with active communities
- Check package size and bundle impact
- Review security vulnerabilities: `npm audit`

### 4. Environment Variables
- Never commit `.env` files
- Use `.env.example` as a template
- Document all required environment variables
- Use a library like `dotenv` for loading env vars
- Validate required env vars on startup

### 5. Testing
- Write unit tests for all new features (mandatory)
- Write a few end-to-end tests for critical user flows
- Integration tests are optional
- Use Jest or Mocha as testing framework
- Aim for >80% code coverage
- Test error cases, not just happy paths
- Run tests before committing: `npm test`

### 6. Git Workflow
- Commit messages: use conventional commits format
  - `feat:` new feature
  - `fix:` bug fix
  - `docs:` documentation changes
  - `refactor:` code refactoring
  - `test:` adding tests
  - `chore:` maintenance tasks
- Example: `feat: add user authentication middleware`
- Make atomic commits (one logical change per commit)
- Review your own code before pushing

### 7. Code Review Checklist
- [ ] Code follows style guidelines
- [ ] No console.logs left in code (use proper logging)
- [ ] Error handling is implemented
- [ ] Tests are written and passing
- [ ] No hardcoded credentials or sensitive data
- [ ] Documentation is updated
- [ ] Performance considerations addressed

## Best Practices

### Design Patterns
- Use Singleton pattern when a single instance is required (e.g., database connections, external service clients)
- Implement lifecycle management for long-lived resources
- Use dependency injection for better testability
- Apply separation of concerns principle

### Async Operations
```javascript
// Good
const fetchData = async () => {
  try {
    const data = await database.query('SELECT * FROM users');
    return data;
  } catch (error) {
    logger.error('Database query failed:', error);
    throw new DatabaseError('Failed to fetch users');
  }
};

// Avoid
const fetchData = () => {
  return database.query('SELECT * FROM users')
    .then(data => data)
    .catch(error => console.log(error));
};
```

### Input Validation
```javascript
// Always validate inputs
const createUser = async (userData) => {
  if (!userData.email || !isValidEmail(userData.email)) {
    throw new ValidationError('Valid email is required');
  }
  
  if (!userData.password || userData.password.length < 8) {
    throw new ValidationError('Password must be at least 8 characters');
  }
  
  // Proceed with user creation
};
```

### Security
- Sanitize all user inputs
- Use parameterized queries to prevent SQL injection
- Hash passwords with bcrypt (never store plain text)
- Implement rate limiting on APIs
- Use helmet.js for Express security headers
- Keep secrets in environment variables
- Regularly update dependencies for security patches

### Performance
- Use connection pooling for databases
- Implement caching where appropriate (Redis, in-memory)
- Use pagination for large datasets
- Avoid N+1 queries
- Profile and optimize bottlenecks
- Use streams for large file operations
- Implement health checks for external connections
- Reuse instances and connections when possible (singleton pattern)

### Logging
- Use a logging library (winston, pino, bunyan) or create a custom structured logger
- Create dedicated logger classes for specific modules when needed
- Include appropriate context in logs
- Use different log levels: error, warn, info, debug
- Never log sensitive information (passwords, tokens)
- Include request IDs for tracing
- Format logs consistently with timestamps and prefixes

## Common Patterns

### Middleware Pattern (Express)
```javascript
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const decoded = await verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};
```

### Service Layer Pattern
```javascript
class UserService {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }
  
  async createUser(userData) {
    const hashedPassword = await hashPassword(userData.password);
    
    const user = await this.userRepository.create({
      ...userData,
      password: hashedPassword
    });
    
    return this.sanitizeUser(user);
  }
  
  sanitizeUser(user) {
    const { password, ...safeUser } = user;
    return safeUser;
  }
}
```

## Documentation Requirements

### Function Documentation
```javascript
/**
 * Retrieves user by ID from the database
 * @param {string} userId - The unique identifier of the user
 * @returns {Promise<Object>} The user object without sensitive fields
 * @throws {NotFoundError} When user is not found
 * @throws {DatabaseError} When database operation fails
 */
async function getUserById(userId) {
  // Implementation
}
```

### README Requirements
- Project description and purpose
- Installation instructions
- Environment variables needed
- How to run the project
- How to run tests
- API documentation or link to it
- Contributing guidelines

## Performance Monitoring
- Monitor application metrics (CPU, memory, response times)
- Set up error tracking (Sentry, Rollbar)
- Log slow queries and operations
- Use APM tools for production (New Relic, DataDog)

## Deployment Checklist
- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Dependencies audited for vulnerabilities
- [ ] Logging configured properly
- [ ] Health check endpoint implemented
- [ ] Monitoring and alerts set up
- [ ] Documentation updated

---

## Quick Commands Reference
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Lint code
npm run lint

# Format code
npm run format

# Security audit
npm audit

# Update dependencies
npm update
```

## Resources
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [MDN JavaScript Reference](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
- [Node.js Documentation](https://nodejs.org/docs/latest/api/)

---

*Last updated: 2025-10-15*
*Adapt these guidelines to your specific project needs*