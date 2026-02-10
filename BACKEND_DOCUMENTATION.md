# Prosto Dating App - Backend Documentation

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Architecture & Design Patterns](#architecture--design-patterns)
5. [Database Schema](#database-schema)
6. [API Endpoints](#api-endpoints)
7. [Authentication & Authorization](#authentication--authorization)
8. [Environment Configuration](#environment-configuration)
9. [Development Workflow](#development-workflow)
10. [Deployment](#deployment)

---

## 🎯 Project Overview

**Prosto** is an enterprise-grade dating application backend built with NestJS, featuring a clean architecture, comprehensive user profile management, OTP-based authentication, and advanced search capabilities.

### Key Features

- ✅ **OTP-based Authentication** - Email and SMS OTP login
- ✅ **Multi-step Registration** - Draft profile system with 9 steps
- ✅ **Extended User Profiles** - 15+ dating-specific fields
- ✅ **Photo Management** - Multiple photo upload with ordering
- ✅ **AI-Powered Matching** - Azure AI Search integration
- ✅ **Email Service** - SendGrid integration
- ✅ **Queue System** - RabbitMQ for async processing
- ✅ **Password Recovery** - Forgot password with OTP
- ✅ **Role-Based Access Control** - Admin, Manager, User roles

---

## 🛠 Technology Stack

### Core Framework
- **NestJS** (v10.3.0) - Progressive Node.js framework
- **TypeScript** (v5.3.3) - Type-safe JavaScript
- **Node.js** - Runtime environment

### Database & ORM
- **PostgreSQL** - Primary database
- **TypeORM** (v0.3.19) - ORM for database operations
- **Redis** (ioredis v5.3.2) - Caching and session management

### Authentication & Security
- **Passport JWT** - JWT-based authentication
- **bcrypt** - Password hashing
- **Helmet** - Security headers
- **Throttler** - Rate limiting

### External Services
- **Azure AI Search** - Intelligent user matching
- **SendGrid** - Email delivery
- **OpenAI** - AI features
- **RabbitMQ** (amqplib) - Message queue

### Validation & Documentation
- **class-validator** - DTO validation
- **class-transformer** - Object transformation
- **Swagger** (@nestjs/swagger) - API documentation
- **Zod** - Schema validation

### Development Tools
- **Jest** - Testing framework
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Winston** - Logging

---

## 📁 Project Structure

```
prosto/
├── src/
│   ├── main.ts                    # Application entry point
│   ├── app.module.ts              # Root module
│   │
│   ├── config/                    # Configuration management
│   │   ├── app-config.service.ts  # Centralized config service
│   │   ├── configurations/        # Environment-specific configs
│   │   └── schemas/               # Config validation schemas
│   │
│   ├── core/                      # Core functionality
│   │   ├── decorators/            # Custom decorators
│   │   ├── exceptions/            # Custom exceptions
│   │   ├── filters/               # Exception filters
│   │   ├── guards/                # Route guards
│   │   ├── interceptors/          # Request/response interceptors
│   │   ├── logging/               # Winston logger setup
│   │   ├── middleware/            # Custom middleware
│   │   └── pipes/                 # Validation pipes
│   │
│   ├── common/                    # Shared utilities
│   │   ├── constants/             # App constants & messages
│   │   ├── decorators/            # Shared decorators
│   │   ├── dto/                   # Base DTOs
│   │   ├── enums/                 # Enumerations
│   │   ├── helpers/               # Helper functions
│   │   ├── interfaces/            # TypeScript interfaces
│   │   ├── types/                 # Custom types
│   │   └── utils/                 # Utility functions
│   │
│   ├── database/                  # Database layer
│   │   ├── entities/              # Base entities
│   │   ├── migrations/            # Database migrations
│   │   ├── repositories/          # Custom repositories
│   │   ├── seeders/               # Database seeders
│   │   └── data-source.ts         # TypeORM configuration
│   │
│   └── modules/                   # Feature modules
│       ├── auth/                  # Authentication module
│       │   ├── controllers/       # Auth controllers
│       │   ├── services/          # Auth services
│       │   ├── dto/               # Auth DTOs
│       │   ├── entities/          # Auth entities
│       │   ├── guards/            # JWT guards
│       │   ├── strategies/        # Passport strategies
│       │   └── auth.module.ts
│       │
│       ├── user/                  # User management module
│       │   ├── controllers/       # User controllers
│       │   ├── services/          # User services
│       │   ├── dto/               # User DTOs
│       │   ├── entities/          # User & UserPhoto entities
│       │   ├── repositories/      # User repositories
│       │   └── user.module.ts
│       │
│       ├── profile/               # Profile management module
│       │   ├── controllers/       # Profile controllers
│       │   ├── services/          # Profile services
│       │   ├── dto/               # Profile DTOs
│       │   └── profile.module.ts
│       │
│       ├── draft/                 # Draft profile module
│       │   ├── controllers/       # Draft controllers
│       │   ├── services/          # Draft services
│       │   ├── entities/          # Draft entities
│       │   ├── repositories/      # Draft repositories
│       │   └── draft.module.ts
│       │
│       ├── email/                 # Email service module
│       │   ├── services/          # Email services
│       │   └── email.module.ts
│       │
│       ├── queue/                 # Queue module
│       │   ├── services/          # Queue services
│       │   └── queue.module.ts
│       │
│       ├── search/                # Search module (Azure AI)
│       │   ├── services/          # Search services
│       │   └── search.module.ts
│       │
│       └── ai/                    # AI module (OpenAI)
│           ├── services/          # AI services
│           └── ai.module.ts
│
├── test/                          # E2E tests
├── .env                           # Environment variables
├── .env.example                   # Environment template
├── package.json                   # Dependencies
├── tsconfig.json                  # TypeScript config
├── nest-cli.json                  # NestJS CLI config
└── README.md                      # Project README
```

---

## 🏗 Architecture & Design Patterns

### Clean Architecture

The project follows **Clean Architecture** principles:

1. **Separation of Concerns** - Each module handles specific functionality
2. **Dependency Injection** - NestJS built-in DI container
3. **Repository Pattern** - Data access abstraction
4. **Service Layer** - Business logic separation
5. **DTO Pattern** - Data validation and transformation

### Module Structure

Each feature module follows this structure:

```
module-name/
├── controllers/        # HTTP request handlers
├── services/          # Business logic
├── dto/               # Data Transfer Objects
├── entities/          # Database entities
├── repositories/      # Data access layer
├── guards/            # Authorization guards
├── interfaces/        # TypeScript interfaces
└── module-name.module.ts
```

### Design Patterns Used

1. **Repository Pattern** - Data access abstraction
2. **Factory Pattern** - Object creation
3. **Strategy Pattern** - Authentication strategies
4. **Decorator Pattern** - Custom decorators
5. **Observer Pattern** - Event-driven architecture
6. **Singleton Pattern** - Service instances

---

## 🗄 Database Schema

### Core Entities

#### **users**
```typescript
{
  id: UUID (PK)
  email: string (unique)
  password: string (hashed)
  firstName: string
  lastName: string
  phone: string
  dateOfBirth: date
  gender: enum ('man', 'woman')
  seeking: enum ('man', 'woman')
  latitude: decimal
  longitude: decimal
  locationSkipped: boolean
  role: enum ('user', 'admin', 'manager')
  status: enum ('active', 'inactive', 'suspended')
  emailVerified: boolean
  lastLoginAt: timestamp
  
  // Extended profile fields
  aboutMe: text
  currentWork: string
  school: string
  lookingFor: array<string>
  pets: array<string>
  children: string
  astrologicalSign: string
  religion: string
  education: string
  height: string
  bodyType: string
  exercise: string
  drink: string
  smoker: string
  marijuana: string
  
  createdAt: timestamp
  updatedAt: timestamp
  deletedAt: timestamp (soft delete)
}
```

#### **user_photos**
```typescript
{
  id: UUID (PK)
  userId: UUID (FK -> users.id)
  photoUrl: string
  photoOrder: integer
  isPrimary: boolean
  createdAt: timestamp
  updatedAt: timestamp
}
```

#### **draft_profiles**
```typescript
{
  id: UUID (PK)
  email: string (unique)
  firstName: string
  latitude: decimal
  longitude: decimal
  locationSkipped: boolean
  gender: enum
  seeking: enum
  dateOfBirth: date
  rulesAccepted: boolean
  status: enum ('draft', 'completed', 'expired')
  expiresAt: timestamp (24 hours)
  
  // Extended fields (same as users)
  aboutMe: text
  currentWork: string
  // ... all extended fields
  
  createdAt: timestamp
  updatedAt: timestamp
}
```

#### **draft_photos**
```typescript
{
  id: UUID (PK)
  draftId: UUID (FK -> draft_profiles.id)
  photoUrl: string
  photoOrder: integer
  createdAt: timestamp
  updatedAt: timestamp
}
```

#### **otps**
```typescript
{
  id: UUID (PK)
  email: string
  otp: string (6 digits)
  type: enum ('login', 'forgot_password')
  expiresAt: timestamp (10 minutes)
  verified: boolean
  createdAt: timestamp
  updatedAt: timestamp
}
```

### Relationships

- **users** 1:N **user_photos** (One user has many photos)
- **draft_profiles** 1:N **draft_photos** (One draft has many photos)
- **users.id** = **draft_profiles.id** (Same ID for draft → user transition)

---

## 🔌 API Endpoints

### Base URL
```
http://localhost:4005/api
```

### 1. Authentication Endpoints

#### **POST /api/login**
Send OTP to email for login

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "otp": "123456",
    "expires_at": "2024-01-01T12:10:00Z"
  },
  "message": "OTP sent successfully"
}
```

---

#### **POST /api/login/verify-otp**
Verify OTP and login

**Request:**
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "first_name": "John",
      "age": 28,
      "gender": "man",
      "seeking": "woman",
      "about_me": "I love hiking",
      "looking_for": ["long_term_relationship"],
      "pets": ["Dog"],
      "photos": [
        {
          "id": "uuid",
          "url": "https://...",
          "is_primary": true
        }
      ],
      "created_at": "2024-01-01T12:00:00Z"
    },
    "access_token": "eyJhbGc...",
    "refresh_token": "eyJhbGc...",
    "token_type": "Bearer",
    "expires_in": 3600
  },
  "message": "Login successful"
}
```

---

#### **POST /api/login/resend-otp**
Resend OTP

**Request:**
```json
{
  "email": "user@example.com"
}
```

---

#### **POST /api/forgot-password**
Send OTP for password recovery

**Request:**
```json
{
  "email": "user@example.com"
}
```

---

#### **POST /api/forgot-password/verify**
Verify forgot password OTP and auto-login

**Request:**
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Response:** Same as login/verify-otp

---

### 2. Registration Endpoints (Draft Profile Flow)

#### **POST /api/draft**
**Step 1:** Create draft profile

**Request:**
```json
{
  "email": "newuser@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user_id": "uuid",
    "email": "newuser@example.com"
  },
  "message": "Draft profile created successfully"
}
```

---

#### **PATCH /api/profile/:userId**
**Steps 2-6, 8:** Update draft profile fields

**Request:**
```json
{
  "first_name": "John",
  "gender": "man",
  "seeking": "woman",
  "date_of_birth": "1995-06-15",
  "latitude": 40.7128,
  "longitude": -74.006,
  "location_skipped": false,
  "rules_accepted": true,
  
  // Extended fields
  "about_me": "I love hiking and technology",
  "current_work": "Software Engineer",
  "school": "MIT",
  "looking_for": ["long_term_relationship", "marriage"],
  "pets": ["Dog"],
  "children": "Want someday",
  "height": "6'0\"",
  "body_type": "Athletic",
  "exercise": "Daily",
  "drink": "Socially",
  "smoker": "No",
  "marijuana": "Never",
  "astrological_sign": "Leo",
  "religion": "Agnostic",
  "education": "Masters Degree"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user_id": "uuid",
    "first_name": "John",
    "gender": "man",
    "seeking": "woman",
    "date_of_birth": "1995-06-15",
    "age": 28,
    "about_me": "I love hiking and technology",
    "looking_for": ["long_term_relationship", "marriage"]
    // ... all updated fields
  },
  "message": "Profile updated successfully"
}
```

---

#### **POST /api/profile/:userId/photos**
**Step 7:** Upload photos

**Request:** (multipart/form-data)
```
photo: File (single upload)
OR
photos: File[] (batch upload)
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user_id": "uuid",
    "photo": {
      "id": "uuid",
      "url": "https://...",
      "order": 0
    },
    "photos": [
      {
        "id": "uuid",
        "url": "https://...",
        "order": 0
      }
    ],
    "photo_count": 1
  },
  "message": "Photo uploaded successfully"
}
```

---

#### **DELETE /api/profile/:userId/photos/:photoId**
Delete a photo from draft

**Response:**
```json
{
  "success": true,
  "data": {
    "deleted_photo_id": "uuid",
    "photo_count": 2
  },
  "message": "Photo deleted successfully"
}
```

---

#### **POST /api/profile/:userId/complete**
**Step 9:** Complete registration

**Request:**
```json
{
  "password": "SecurePassword123!"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "first_name": "John",
      "age": 28,
      "gender": "man",
      "seeking": "woman",
      "photos": [...]
    },
    "tokens": {
      "access_token": "eyJhbGc...",
      "refresh_token": "eyJhbGc...",
      "token_type": "Bearer",
      "expires_in": 3600
    }
  },
  "message": "Registration completed successfully"
}
```

---

### 3. User Profile Endpoints

#### **GET /api/users/profile/:id**
Get user profile by ID

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "age": 28,
    "gender": "man",
    "seeking": "woman",
    "latitude": 40.7128,
    "longitude": -74.006,
    "location_skipped": false,
    
    // Extended profile fields
    "about_me": "I love hiking and technology",
    "current_work": "Software Engineer at Google",
    "school": "MIT",
    "looking_for": ["long_term_relationship", "marriage"],
    "pets": ["Dog", "Cat"],
    "children": "Want someday",
    "astrological_sign": "Leo",
    "religion": "Agnostic",
    "education": "Masters Degree",
    "height": "6'0\"",
    "body_type": "Athletic",
    "exercise": "Daily",
    "drink": "Socially",
    "smoker": "No",
    "marijuana": "Never",
    
    "photos": [
      {
        "id": "uuid",
        "url": "https://example.com/photo1.jpg",
        "order": 0,
        "is_primary": true
      }
    ],
    "created_at": "2024-01-01T12:00:00Z",
    "updated_at": "2024-01-02T12:00:00Z"
  }
}
```

---

#### **PATCH /api/profile/user/:userId** ⭐ NEW
Update existing user profile (including photos)

**Request:**
```json
{
  "first_name": "John",
  "about_me": "Updated bio",
  "looking_for": ["long_term_relationship"],
  "pets": ["Dog"],
  "height": "6'0\"",
  "body_type": "Athletic",
  
  // Photos (replaces all existing photos)
  "photos": [
    { "url": "https://example.com/photo1.jpg", "order": 0 },
    { "url": "https://example.com/photo2.jpg", "order": 1 },
    { "url": "https://example.com/photo3.jpg", "order": 2 }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user_id": "uuid",
    "about_me": "Updated bio",
    "looking_for": ["long_term_relationship"],
    "pets": ["Dog"],
    "height": "6'0\"",
    "body_type": "Athletic",
    "photos": [
      {
        "id": "new-uuid-1",
        "url": "https://example.com/photo1.jpg",
        "order": 0,
        "is_primary": true
      },
      {
        "id": "new-uuid-2",
        "url": "https://example.com/photo2.jpg",
        "order": 1,
        "is_primary": false
      },
      {
        "id": "new-uuid-3",
        "url": "https://example.com/photo3.jpg",
        "order": 2,
        "is_primary": false
      }
    ]
  },
  "message": "Profile updated successfully"
}
```

**Note:** When `photos` array is provided:
- All old photos are **deleted**
- New photos are **created** with provided URLs
- First photo (order: 0) is automatically set as **primary**

---

#### **PUT /api/users/:id** (Admin/Manager only)
Update user (requires admin/manager role)

**Headers:**
```
Authorization: Bearer {admin-token}
```

**Request:** Same as PATCH /api/profile/user/:userId

---

#### **GET /api/users**
List all users (Admin only)

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `search` - Search term
- `role` - Filter by role
- `status` - Filter by status

---

#### **GET /api/users/search**
Search users

**Query Parameters:**
- `q` - Search query
- `gender` - Filter by gender
- `seeking` - Filter by seeking
- `minAge` - Minimum age
- `maxAge` - Maximum age
- `latitude` - User latitude
- `longitude` - User longitude
- `radius` - Search radius (km)

---

#### **GET /api/users/statistics**
Get user statistics (Admin only)

**Response:**
```json
{
  "total_users": 1000,
  "active_users": 850,
  "new_users_today": 15,
  "users_by_gender": {
    "man": 600,
    "woman": 400
  }
}
```

---

### 4. Admin Endpoints

#### **POST /api/users** (Admin only)
Create new user

#### **DELETE /api/users/:id** (Admin only)
Delete user (soft delete)

#### **POST /api/users/:id/verify-email** (Admin only)
Manually verify user email

---

## 🔐 Authentication & Authorization

### JWT Authentication

The application uses **JWT (JSON Web Tokens)** for authentication:

1. **Access Token** - Short-lived (1 hour), used for API requests
2. **Refresh Token** - Long-lived (7 days), used to get new access tokens

### Token Structure

```typescript
{
  sub: "user-uuid",      // User ID
  email: "user@example.com",
  role: "user",          // user | admin | manager
  iat: 1234567890,       // Issued at
  exp: 1234571490        // Expires at
}
```

### Authorization Levels

1. **Public** - No authentication required
   - `@Public()` decorator
   - Examples: Login, Registration, Forgot Password

2. **Authenticated** - Requires valid JWT
   - Default for all endpoints
   - Examples: Get Profile, Update Profile

3. **Role-Based** - Requires specific role
   - `@Roles(UserRole.ADMIN)` decorator
   - Examples: User Management, Statistics

### Guards

1. **JwtAuthGuard** - Validates JWT token
2. **RolesGuard** - Checks user role
3. **ThrottlerGuard** - Rate limiting

---

## ⚙️ Environment Configuration

### Required Environment Variables

```bash
# Application
NODE_ENV=development
PORT=4005
APP_NAME=Prosto Dating App

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your-password
DB_DATABASE=prosto_db
DB_SYNCHRONIZE=true  # Set to false in production

# JWT
JWT_SECRET=your-super-secret-key
JWT_EXPIRES_IN=1h
JWT_REFRESH_SECRET=your-refresh-secret
JWT_REFRESH_EXPIRES_IN=7d

# SendGrid Email
SENDGRID_API_KEY=your-sendgrid-api-key
SENDGRID_FROM_EMAIL=noreply@prosto.com
SENDGRID_FROM_NAME=Prosto Dating

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# RabbitMQ
RABBITMQ_URL=amqp://localhost:5672

# Azure AI Search
AZURE_SEARCH_ENDPOINT=https://your-search.search.windows.net
AZURE_SEARCH_API_KEY=your-api-key
AZURE_SEARCH_INDEX_NAME=users-index

# OpenAI
OPENAI_API_KEY=your-openai-key

# File Upload
MAX_FILE_SIZE=5242880  # 5MB
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/webp

# OTP
OTP_EXPIRY_MINUTES=10
OTP_LENGTH=6

# Draft Profile
DRAFT_EXPIRY_HOURS=24
```

---

## 🚀 Development Workflow

### Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Update .env with your values
```

### Running the Application

```bash
# Development mode (with hot reload)
npm run start:dev

# Production mode
npm run build
npm run start:prod

# Debug mode
npm run start:debug
```

### Database Operations

```bash
# Generate migration
npm run migration:generate -- src/database/migrations/MigrationName

# Run migrations
npm run migration:run

# Revert migration
npm run migration:revert

# Seed database
npm run seed
```

### Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov

# Watch mode
npm run test:watch
```

### Code Quality

```bash
# Lint code
npm run lint

# Format code
npm run format
```

---

## 📊 API Response Format

### Success Response

```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Operation successful",
  "meta": {
    "timestamp": "2024-01-01T12:00:00Z",
    "path": "/api/users/profile/123",
    "version": "1",
    "requestId": "uuid"
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "USER_NOT_FOUND",
    "message": "User not found",
    "details": {}
  },
  "statusCode": 404,
  "timestamp": "2024-01-01T12:00:00Z",
  "path": "/api/users/123",
  "method": "GET",
  "requestId": "uuid"
}
```

---

## 🔄 Registration Flow (9 Steps)

```
Step 1: Create Draft Profile
  POST /api/draft
  → Returns user_id

Step 2: Add Name
  PATCH /api/profile/:userId
  { "first_name": "John" }

Step 3: Select Gender
  PATCH /api/profile/:userId
  { "gender": "man" }

Step 4: Select Seeking
  PATCH /api/profile/:userId
  { "seeking": "woman" }

Step 5: Add Date of Birth
  PATCH /api/profile/:userId
  { "date_of_birth": "1995-06-15" }

Step 6: Add Location
  PATCH /api/profile/:userId
  { "latitude": 40.7128, "longitude": -74.006 }
  OR
  { "location_skipped": true }

Step 7: Upload Photos (2-6 photos required)
  POST /api/profile/:userId/photos
  (Upload files)

Step 8: Accept Rules
  PATCH /api/profile/:userId
  { "rules_accepted": true }

Step 9: Complete Registration
  POST /api/profile/:userId/complete
  { "password": "SecurePassword123!" }
  → Returns user + tokens
```

---

## 📦 Deployment

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Set `DB_SYNCHRONIZE=false`
- [ ] Use strong JWT secrets
- [ ] Configure CORS properly
- [ ] Enable HTTPS
- [ ] Set up logging (Winston)
- [ ] Configure rate limiting
- [ ] Set up monitoring
- [ ] Database backups
- [ ] Redis caching
- [ ] RabbitMQ clustering

### Docker Deployment

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 4005

CMD ["node", "dist/main"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "4005:4005"
    environment:
      - NODE_ENV=production
    depends_on:
      - postgres
      - redis
      - rabbitmq

  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: prosto_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  rabbitmq:
    image: rabbitmq:3-management
    ports:
      - "5672:5672"
      - "15672:15672"

volumes:
  postgres_data:
```

---

## 📚 Additional Resources

### API Documentation
- **Swagger UI**: `http://localhost:4005/docs`
- **OpenAPI JSON**: `http://localhost:4005/docs-json`

### Code Examples

#### Making Authenticated Request

```typescript
const response = await fetch('http://localhost:4005/api/users/profile/123', {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
```

#### Updating Profile with Photos

```typescript
const response = await fetch('http://localhost:4005/api/profile/user/123', {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    about_me: 'I love hiking',
    looking_for: ['long_term_relationship'],
    photos: [
      { url: 'https://example.com/photo1.jpg', order: 0 },
      { url: 'https://example.com/photo2.jpg', order: 1 }
    ]
  })
});
```

---

## 🎯 Key Features Summary

### ✅ Implemented Features

1. **Authentication**
   - ✅ OTP-based login (email/SMS)
   - ✅ JWT authentication
   - ✅ Refresh tokens
   - ✅ Forgot password with OTP

2. **User Management**
   - ✅ Multi-step registration (9 steps)
   - ✅ Draft profile system (24-hour expiry)
   - ✅ Extended profile fields (15+ fields)
   - ✅ Photo management (2-6 photos)
   - ✅ Profile updates with photo replacement
   - ✅ Role-based access control

3. **Search & Matching**
   - ✅ Azure AI Search integration
   - ✅ Location-based search
   - ✅ Advanced filtering

4. **Infrastructure**
   - ✅ Email service (SendGrid)
   - ✅ Queue system (RabbitMQ)
   - ✅ Caching (Redis)
   - ✅ Logging (Winston)
   - ✅ API documentation (Swagger)

---

## 📞 Support

For questions or issues:
- **Email**: support@prosto.com
- **Documentation**: `/docs`
- **API Spec**: `BACKEND_API_SPEC.md`

---

**Last Updated**: February 10, 2026
**Version**: 1.0.0
**Author**: Enterprise Team
