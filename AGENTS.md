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
- **Features Documentation**: `docs/features.md` - Complete list of implemented features and capabilities
- **Architecture**: `docs/architecture.md` - System design and architectural decisions
- **New Features**: `docs/features/` - Specifications for new or in-progress features only
- **Development Plans**: `docs/plans/` - Implementation plans and checklists for features

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

## Documentation Style Guidelines

**IMPORTANT**: All documentation must be clear, simple, and concise.

### Writing Principles
- **Be Clear**: Use straightforward language that anyone can understand
- **Be Simple**: Avoid unnecessary complexity and jargon
- **Be Concise**: Say what you need to say in as few words as possible
- **Avoid Verbosity**: Don't repeat the same concept multiple times
- **Avoid Wordiness**: Cut unnecessary words and filler phrases
- **Be Direct**: Get to the point quickly

### What to Avoid
- ❌ Long, complex sentences with multiple clauses
- ❌ Unnecessary adjectives and adverbs
- ❌ Redundant explanations
- ❌ Overly formal or academic language
- ❌ Excessive technical jargon without explanation
- ❌ Repetitive content

### What to Prefer
- ✅ Short, clear sentences
- ✅ Active voice over passive voice
- ✅ Bullet points for lists
- ✅ Direct statements
- ✅ One idea per sentence
- ✅ Plain language explanations

### Examples

**❌ Verbose:**
> "In order to facilitate the implementation of the authentication mechanism, it is necessary to first undertake a comprehensive analysis of the existing system architecture, thereby ensuring that all relevant components are properly identified and their interdependencies are thoroughly understood."

**✅ Concise:**
> "Before implementing authentication, analyze the system architecture and identify component dependencies."

**❌ Complex:**
> "The utilization of environment variables provides a mechanism by which configuration parameters can be externalized from the codebase, thereby enhancing security and facilitating deployment across multiple environments."

**✅ Simple:**
> "Use environment variables to store configuration outside the code. This improves security and makes deployment easier."

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
- **Private methods**: prefix with underscore (`_validateInput`) or use TypeScript `private`
- **File names**: kebab-case (`user-service.js`, `auth-middleware.js`)

### Error Handling
- Always use try-catch blocks for async operations
- Create custom error classes that extend Error
- Log errors with context using a structured logger
- Never swallow errors silently
- Use descriptive error messages
- Implement graceful error recovery

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

### 1. Feature Development Workflow (MANDATORY)

When a new feature is requested, follow this **strict workflow** with mandatory review checkpoints:

#### Step 1: Requirements Documentation (Feature Specification)
**AI Agent Actions:**
1. Analyze the feature request
2. Create requirements document in `docs/features/[feature-name].md`
3. The document must include:
   - **Overview**: What the feature does and why it's needed
   - **Problem Statement**: Current issues and pain points
   - **Proposed Solution**: Explain the approach
   - **User Experience**: Before/after scenarios with examples
   - **UI/UX Design**: Visual specifications and mockups (if applicable)
   - **Technical Approach**: High-level technical strategy
   - **Success Criteria**: Clear acceptance criteria
   - **Future Enhancements**: Potential improvements (optional)

4. **⚠️ STOP HERE** - Present the requirements document to the user
5. Wait for user review and approval before proceeding

**Example Requirements Document Structure:**
```markdown
# Feature Name - Specification

## Overview
What this feature does and why.

## Problem Statement
### Current Issues
- Issue 1: Description
- Issue 2: Description

## Proposed Solution
Explain the approach...

## User Experience
### Before (Current State)
Example scenario...

### After (With New Feature)
Example scenario...

## Technical Approach
High-level technical strategy...

## Success Criteria
- [ ] Requirement 1
- [ ] Requirement 2
```

#### Step 2: Implementation Plan (Development Checklist)
**AI Agent Actions (after requirements approval):**
1. Create implementation plan in `docs/plans/[feature-name]-plan.md`
2. The plan must be structured with:
   - **Overview**: Reference to the feature specification
   - **Development Checklist**: Organized by phases with checkboxes
   - **Technical Implementation Details**: Architecture decisions and rationale
   - **File Structure**: List of all files to create/modify
   - **Testing Strategy**: Unit, integration, and manual testing requirements
   - **Code Examples**: Key code snippets for complex parts
   - **References**: Links to relevant documentation

3. Break down implementation into **clear phases**:
   - Phase 1: Documentation (this phase - always completed first)
   - Phase 2: Core utilities/logic
   - Phase 3: UI components (if applicable)
   - Phase 4: Backend modifications (if applicable)
   - Phase 5: Frontend integration
   - Phase 6: Testing (unit + manual)
   - Phase 7: Code review & quality checks
   - Phase 8: Deployment preparation

4. Each phase must have:
   - Numbered tasks with checkboxes `[ ]`
   - Specific, actionable items
   - Clear completion criteria
   - Reference to AGENTS.md guidelines where applicable

5. **⚠️ STOP HERE** - Present the implementation plan to the user
6. Wait for user review and approval before starting implementation

**Example Implementation Plan Structure:**
```markdown
# Feature Name - Implementation Plan

## Overview
Implementation guide for [Feature Name] as specified in `docs/features/[feature-name].md`.
Follows guidelines in AGENTS.md.

## Development Checklist

### Phase 1: Documentation ✅ COMPLETED
- [x] Create feature specification
- [x] Create implementation plan

### Phase 2: Core Utilities
- [ ] **Task 2.1**: Create utility file `lib/[utility-name].ts`
  - [ ] Implement function X
  - [ ] Add TypeScript types
  - [ ] Add JSDoc comments
  - [ ] Handle edge cases

- [ ] **Task 2.2**: Write unit tests
  - [ ] Test happy path
  - [ ] Test error cases
  - [ ] Achieve >80% coverage

### Phase 3: [Next Phase]
- [ ] **Task 3.1**: Description
  - [ ] Subtask 1
  - [ ] Subtask 2

[Continue with all phases...]

## Technical Implementation Details

### Architecture Decision: [Decision Name]
**Decision**: What approach to use
**Rationale**: Why this approach
- Reason 1
- Reason 2

### File Structure
All files to create or modify with descriptions.

## Testing Strategy
Testing approach...

## References
- AGENTS.md
- docs/features/[feature-name].md
- Relevant external documentation
```

#### Step 3: Implementation
**AI Agent Actions (after plan approval):**
1. Follow the approved plan
2. Mark tasks as completed with `[x]`
3. Follow all coding standards in AGENTS.md:
   - Code style and naming conventions
   - Error handling patterns
   - Testing requirements
   - Documentation standards
4. Implement one phase at a time
5. Update the plan checklist as tasks are completed
6. Ask for clarification if requirements are ambiguous

#### Step 4: Review and Completion
**After implementation:**
1. Run all tests and linters
2. Complete the code review checklist (see section 8)
3. Update `docs/features.md` with the new feature documentation
4. Move the completed feature spec from `docs/features/` to archive (or remove)
5. Keep the plan in `docs/plans/` for historical reference
6. Present the completed work to the user

### 2. Key Principles for Feature Development

- **User Approval Required**: Never proceed to implementation without user approval of both requirements and plan
- **One Phase at a Time**: Complete each phase fully before moving to the next
- **Follow the Plan**: Stick to the approved plan; if changes are needed, discuss with user first
- **Documentation First**: Always document before coding
- **Testing Mandatory**: Every feature must have tests (>80% coverage)
- **AGENTS.md Compliance**: All code must follow the guidelines in this document

### 3. Writing Code
- Write self-documenting code with clear variable names
- Add JSDoc comments for functions and classes
- Keep functions small and focused (single responsibility)
- Extract magic numbers into named constants
- Validate all inputs
- Handle edge cases explicitly

### 4. Dependencies
- Use npm for package management
- Keep dependencies up to date
- Prefer well-maintained packages with active communities
- Check package size and bundle impact
- Review security vulnerabilities: `npm audit`

### 5. Environment Variables
- Never commit `.env` files
- Use `.env.example` as a template
- Document all required environment variables
- Use a library like `dotenv` for loading env vars
- Validate required env vars on startup

### 6. Testing
- Write unit tests for all new features (mandatory)
- Write a few end-to-end tests for critical user flows
- Integration tests are optional
- Use Jest or Mocha as testing framework
- Aim for >80% code coverage
- Test error cases, not just happy paths
- Run tests before committing: `npm test`

### 7. Git Workflow
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

### 8. Code Review Checklist
- [ ] Code follows style guidelines
- [ ] No console.logs left in code (use proper logging)
- [ ] Error handling is implemented
- [ ] Tests are written and passing
- [ ] No hardcoded credentials or sensitive data
- [ ] Documentation is updated
- [ ] Performance considerations addressed

## Best Practices

### Design Patterns
- Use Singleton for single instances (database connections, service clients)
- Implement lifecycle management for long-lived resources
- Use dependency injection for testability
- Apply separation of concerns

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
- Implement caching (Redis, in-memory)
- Use pagination for large datasets
- Avoid N+1 queries
- Profile and optimize bottlenecks
- Use streams for large file operations
- Implement health checks for external connections
- Reuse instances and connections (singleton pattern)

### Logging
- Use a logging library (winston, pino, bunyan) or create custom logger
- Create dedicated logger classes for specific modules
- Include context in logs
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
 * Get user by ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>} User object without sensitive fields
 * @throws {NotFoundError} User not found
 * @throws {DatabaseError} Database operation failed
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

*Last updated: 2025-10-18*