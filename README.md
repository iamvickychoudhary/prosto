# Enterprise NestJS Backend

A production-ready, scalable NestJS backend architecture following clean architecture principles, designed for large-scale enterprise applications.

## 📋 Table of Contents

- [Architecture Overview](#architecture-overview)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [Core Concepts](#core-concepts)
- [Modules Documentation](#modules-documentation)
- [Best Practices](#best-practices)
- [API Documentation](#api-documentation)

---

## 🏗️ Architecture Overview

This project follows a **modular, domain-driven architecture** with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                        API Layer                            │
│                    (Controllers + DTOs)                     │
├─────────────────────────────────────────────────────────────┤
│                     Application Layer                        │
│                   (Services + Business Logic)                │
├─────────────────────────────────────────────────────────────┤
│                      Domain Layer                            │
│               (Entities + Interfaces + Enums)                │
├─────────────────────────────────────────────────────────────┤
│                   Infrastructure Layer                       │
│    (Database + External Services + Providers + Queue)        │
└─────────────────────────────────────────────────────────────┘
```

### Key Architectural Decisions

| Decision | Rationale |
|----------|-----------|
| **Modular Structure** | Each domain is self-contained, enabling future microservices split |
| **Repository Pattern** | Abstracts data access, making it testable and maintainable |
| **Provider Abstraction** | Strategy pattern for external services (Email, AI, Search) |
| **Dependency Injection** | NestJS DI for loose coupling and testability |
| **CQRS-Ready** | Separation of read/write operations where needed |

---

## 📁 Project Structure

```
src/
├── main.ts                    # Application entry point
├── app.module.ts              # Root module
│
├── core/                      # Core infrastructure
│   ├── decorators/            # Custom decorators
│   ├── exceptions/            # Custom exception classes
│   ├── filters/               # Exception filters
│   ├── guards/                # Global guards
│   ├── interceptors/          # Request/Response interceptors
│   ├── logging/               # Winston logger service
│   ├── middleware/            # Custom middleware
│   └── pipes/                 # Validation pipes
│
├── config/                    # Configuration management
│   ├── configurations/        # Config registration (database, auth, etc.)
│   ├── schemas/               # Zod validation schemas
│   ├── config.module.ts       # Config module
│   └── app-config.service.ts  # Typed config service
│
├── database/                  # Database layer
│   ├── entities/              # Base entity classes
│   ├── migrations/            # TypeORM migrations
│   ├── repositories/          # Base repository
│   ├── seeders/               # Database seeders
│   └── data-source.ts         # TypeORM data source
│
├── modules/                   # Feature modules (domains)
│   ├── auth/                  # Authentication & Authorization
│   ├── user/                  # User domain (sample)
│   ├── email/                 # Email service
│   ├── search/                # Azure Search integration
│   ├── ai/                    # AI/LLM integration
│   └── queue/                 # Background jobs (RabbitMQ)
│
├── common/                    # Shared utilities
│   ├── constants/             # Application constants
│   ├── dto/                   # Shared DTOs (pagination, etc.)
│   ├── enums/                 # Shared enums
│   ├── helpers/               # Utility functions
│   ├── interfaces/            # Shared interfaces
│   ├── types/                 # TypeScript type definitions
│   └── utils/                 # Utility functions
│
└── test/                      # Test files
    ├── e2e/                   # End-to-end tests
    └── unit/                  # Unit tests
```

### Module Structure (Domain Pattern)

Each feature module follows this structure:

```
modules/user/
├── user.module.ts             # Module definition
├── index.ts                   # Public exports
│
├── controllers/               # API Controllers (thin)
│   └── user.controller.ts
│
├── services/                  # Business logic
│   └── user.service.ts
│
├── repositories/              # Data access layer
│   └── user.repository.ts
│
├── entities/                  # Database entities
│   └── user.entity.ts
│
├── dto/                       # Data Transfer Objects
│   ├── create-user.dto.ts
│   ├── update-user.dto.ts
│   └── user-response.dto.ts
│
└── interfaces/                # TypeScript interfaces
    └── user.interface.ts
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.x
- PostgreSQL >= 14.x
- RabbitMQ (optional, for background jobs)
- Redis (optional, for caching)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd enterprise-nestjs-backend

# Install dependencies
npm install

# Copy environment file
cp env.example .env

# Configure your .env file with appropriate values

# Run database migrations
npm run migration:run

# Start development server
npm run start:dev
```

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run start:dev` | Start in development mode with hot reload |
| `npm run start:prod` | Start in production mode |
| `npm run build` | Build the application |
| `npm run test` | Run unit tests |
| `npm run test:e2e` | Run end-to-end tests |
| `npm run migration:generate` | Generate a new migration |
| `npm run migration:run` | Run pending migrations |
| `npm run migration:revert` | Revert last migration |
| `npm run seed` | Run database seeders |

---

## ⚙️ Configuration

Configuration is managed through environment variables with Zod validation.

### Environment Variables

See `env.example` for all available configuration options:

```env
# Application
NODE_ENV=development
APP_PORT=3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_DATABASE=enterprise_db

# Authentication
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=1d

# External Services
AZURE_SEARCH_ENDPOINT=https://...
OPENAI_API_KEY=sk-...
```

### Typed Configuration

Access configuration through `AppConfigService`:

```typescript
@Injectable()
export class SomeService {
  constructor(private config: AppConfigService) {}

  someMethod() {
    const port = this.config.port;
    const dbConfig = this.config.databaseConfig;
    const isProduction = this.config.isProduction;
  }
}
```

---

## 🔑 Core Concepts

### 1. Controllers (Thin)

Controllers only handle HTTP concerns - routing, validation, and response formatting:

```typescript
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.userService.findByIdOrFail(id); // Delegate to service
  }
}
```

### 2. Services (Business Logic)

All business logic lives in services:

```typescript
@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async create(dto: CreateUserDto): Promise<UserEntity> {
    // Business logic: validation, transformation, orchestration
    const existing = await this.userRepository.findByEmail(dto.email);
    if (existing) {
      throw new EntityAlreadyExistsException('User', 'email');
    }
    return this.userRepository.create(dto);
  }
}
```

### 3. Repositories (Data Access)

Repositories abstract database operations:

```typescript
@Injectable()
export class UserRepository extends BaseRepository<UserEntity> {
  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.repository.findOne({ where: { email } });
  }
}
```

### 4. Provider Abstraction

External services use the Strategy pattern for flexibility:

```typescript
// Interface
export interface IEmailProvider {
  send(options: ISendEmailOptions): Promise<IEmailResult>;
}

// Multiple implementations
export class SmtpProvider implements IEmailProvider { ... }
export class SendGridProvider implements IEmailProvider { ... }

// Service uses abstraction
@Injectable()
export class EmailService {
  constructor(@Inject(EMAIL_PROVIDER) private provider: IEmailProvider) {}
}
```

---

## 📦 Modules Documentation

### Auth Module

JWT-based authentication with:
- Login/Register endpoints
- Access & Refresh tokens
- Guards and decorators

```typescript
// Protect routes
@UseGuards(JwtAuthGuard)
@Get('profile')
getProfile(@CurrentUser() user: IJwtPayload) { ... }

// Role-based access
@Roles(UserRole.ADMIN)
@Get('admin')
adminOnly() { ... }

// Public routes
@Public()
@Get('health')
healthCheck() { ... }
```

### Email Module

Provider-agnostic email service:

```typescript
// Send email
await emailService.send({
  to: 'user@example.com',
  subject: 'Welcome',
  template: 'welcome',
  context: { name: 'John' },
});

// Use specific templates
await emailService.sendWelcomeEmail(email, name);
await emailService.sendPasswordResetEmail(email, name, token, url);
```

### Search Module (Azure AI Search)

Full-text and semantic search:

```typescript
// Index documents
await searchService.indexDocuments('products', products);

// Search
const results = await searchService.search('products', 'laptop', {
  filter: "category eq 'electronics'",
  facets: ['brand', 'price'],
});

// Semantic search
const results = await searchService.semanticSearch('products', 'best laptop for coding', 'semantic-config');
```

### AI Module

LLM integration with OpenAI/Azure OpenAI:

```typescript
// Chat completion
const result = await aiService.chat([
  { role: 'user', content: 'Hello!' }
]);

// Use prompt templates
const result = await aiService.completeWithPrompt('summarize', {
  text: longText,
  maxLength: '100',
});

// JSON response
const data = await aiService.completeJson<MyType>(prompt);

// Streaming
for await (const chunk of aiService.streamChat(messages)) {
  process.stdout.write(chunk.content);
}
```

### Queue Module (RabbitMQ)

Background job processing:

```typescript
// Add job to queue
await queueService.addEmailJob({
  to: 'user@example.com',
  subject: 'Welcome',
  template: 'welcome',
  context: { name: 'John' },
});

// Add delayed job
await queueService.addDelayedJob('notifications', 'remind', data, 60000);

// Register processor
await queueService.registerProcessor('my-queue', async (job) => {
  // Process job
});
```

---

## ✅ Best Practices

### 1. File Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Module | `kebab-case.module.ts` | `user.module.ts` |
| Controller | `kebab-case.controller.ts` | `user.controller.ts` |
| Service | `kebab-case.service.ts` | `user.service.ts` |
| Repository | `kebab-case.repository.ts` | `user.repository.ts` |
| Entity | `kebab-case.entity.ts` | `user.entity.ts` |
| DTO | `kebab-case.dto.ts` | `create-user.dto.ts` |
| Interface | `kebab-case.interface.ts` | `user.interface.ts` |
| Enum | `kebab-case.enum.ts` | `user-role.enum.ts` |

### 2. Code Organization

- **One class per file**
- **Export through index.ts** for clean imports
- **Keep controllers thin** - delegate to services
- **Use interfaces** for external dependencies
- **Validate at boundaries** - DTOs for input, response DTOs for output

### 3. Error Handling

Use custom business exceptions:

```typescript
// Throw
throw new EntityNotFoundException('User', userId);
throw new EntityAlreadyExistsException('User', 'email');
throw new InvalidOperationException('Cannot delete active user');

// Global filter handles formatting
```

### 4. Testing Strategy

```typescript
// Unit test services
describe('UserService', () => {
  let service: UserService;
  let repository: MockType<UserRepository>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: UserRepository, useFactory: mockRepository },
      ],
    }).compile();
    
    service = module.get(UserService);
    repository = module.get(UserRepository);
  });
});
```

### 5. Documentation

- Use JSDoc comments for all public methods
- Swagger decorators for API documentation
- README in each module for complex features

---

## 📚 API Documentation

Swagger documentation is available at `/docs` in development mode.

### Standard Response Format

All responses follow this structure:

```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2024-01-15T10:30:00.000Z",
    "path": "/api/v1/users",
    "version": "v1",
    "requestId": "uuid"
  }
}
```

### Paginated Response

```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "totalPages": 10,
      "hasNext": true,
      "hasPrevious": false
    }
  }
}
```

### Error Response

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "BadRequestException",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/v1/users",
  "requestId": "uuid"
}
```

---

## 🔧 Extending the Architecture

### Adding a New Domain Module

1. Create module folder under `src/modules/`
2. Add required files following the domain pattern
3. Register in `app.module.ts`
4. Export through module's `index.ts`

### Adding a New External Provider

1. Define interface in `interfaces/`
2. Create provider implementation
3. Register with injection token in module
4. Inject interface in services

### Database Migrations

```bash
# Generate migration from entity changes
npm run migration:generate -- src/database/migrations/AddUserPhone

# Run migrations
npm run migration:run

# Revert last migration
npm run migration:revert
```

---

## 📄 License

MIT License - See [LICENSE](LICENSE) for details.

