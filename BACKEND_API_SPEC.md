# Backend API Specification - Prosto Dating App

> **Project**: Prosto Dating App  
> **Version**: 3.3.0  
> **Date**: February 2026

---

## 📋 Overview

The Prosto Dating App backend provides the following API modules:

1. **Login API** - OTP-based authentication (phone/email)
2. **Registration API** - Multi-step profile creation
3. **Profile API** - Profile updates and photo management

---

## 🔐 Authentication (Login with OTP)

The app uses **OTP-based authentication** for login. Users can login via phone or email.

### Login Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              LOGIN FLOW                                      │
└─────────────────────────────────────────────────────────────────────────────┘

Step 1:  POST   /api/login           → { country_code, phone } or { email }
                                     ← { message, otp_sent, expires_in }

Step 2:  POST   /api/login/verify-otp → { country_code, phone, otp } or { email, otp }
                                     ← { user, access_token }

Resend:  POST   /api/login/resend-otp → { country_code, phone } or { email }
                                     ← { message, otp_sent, expires_in }
```

---

### Step 1: Send OTP (Login)

**Endpoint**: `POST /api/login`

**Purpose**: Send OTP to user's phone or email

**Request (Phone)**:
```json
{
    "country_code": "+1",
    "phone": "3316238413"
}
```

**Request (Email)**:
```json
{
    "email": "user@example.com"
}
```

**Response (200 OK)**:
```json
{
    "success": true,
    "data": {
        "message": "OTP sent successfully",
        "otp_sent": true,
        "expires_in": 60
    }
}
```

**Errors**:
```json
// 404 - User not found
{
    "success": false,
    "error": {
        "code": "USER_NOT_FOUND",
        "message": "No account found with this phone/email"
    }
}

// 403 - Account suspended
{
    "success": false,
    "error": {
        "code": "ACCOUNT_SUSPENDED",
        "message": "Your account has been suspended"
    }
}
```

---

### Step 2: Verify OTP

**Endpoint**: `POST /api/login/verify-otp`

**Purpose**: Verify OTP and get authentication token

**Request (Phone)**:
```json
{
    "country_code": "+1",
    "phone": "3316238413",
    "otp": "1234"
}
```

**Request (Email)**:
```json
{
    "email": "user@example.com",
    "otp": "1234"
}
```

**Response (200 OK)**:
```json
{
    "success": true,
    "data": {
        "user": {
            "id": "550e8400-e29b-41d4-a716-446655440000",
            "email": "user@example.com",
            "phone": "+13316238413",
            "first_name": "John"
        },
        "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
}
```

**Errors**:
```json
// 400 - Invalid OTP
{
    "success": false,
    "error": {
        "code": "INVALID_OTP",
        "message": "Invalid OTP"
    }
}

// 400 - OTP Expired
{
    "success": false,
    "error": {
        "code": "OTP_EXPIRED",
        "message": "OTP has expired. Please request a new one."
    }
}
```

---

### Resend OTP

**Endpoint**: `POST /api/login/resend-otp`

**Purpose**: Resend OTP to user's phone or email

**Request**: Same as Login (Step 1)

**Response (200 OK)**:
```json
{
    "success": true,
    "data": {
        "message": "OTP sent successfully",
        "otp_sent": true,
        "expires_in": 60
    }
}
```

---

### Login API Summary

| Step | Method | Endpoint | Request Body |
|------|--------|----------|--------------|
| 1 | POST | `/api/login` | `{ country_code, phone }` or `{ email }` |
| 2 | POST | `/api/login/verify-otp` | `{ country_code, phone, otp }` or `{ email, otp }` |
| Resend | POST | `/api/login/resend-otp` | `{ country_code, phone }` or `{ email }` |

---

## 📝 Registration (Profile Setup)

The frontend implements a **9-step profile creation flow**. The backend provides:

1. **Draft API** - Create draft profile with email, returns `user_id`
2. **Profile PATCH API** - Update profile fields step by step
3. **Complete API** - Finalize profile and activate account

### Registration Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           REGISTRATION FLOW                                  │
└─────────────────────────────────────────────────────────────────────────────┘

Step 1:  POST   /api/draft              → { email }
                                        ← { user_id }
         
Step 2:  PATCH  /api/profile/{user_id}  → { first_name: "John" }

Step 3:  PATCH  /api/profile/{user_id}  → { latitude, longitude } or { location_skipped: true }

Step 4:  PATCH  /api/profile/{user_id}  → { gender: "man" }

Step 5:  PATCH  /api/profile/{user_id}  → { seeking: "woman" }

Step 6:  PATCH  /api/profile/{user_id}  → { date_of_birth: "1995-06-15" }

Step 7:  POST   /api/profile/{user_id}/photos  → multipart/form-data (photo upload)
         DELETE /api/profile/{user_id}/photos/{photo_id}

Step 8:  PATCH  /api/profile/{user_id}  → { rules_accepted: true }

Step 9:  POST   /api/profile/{user_id}/complete  → Finalize & activate account
                                                 ← { user, tokens }
```

---

### Visual Flow

```
┌──────────────┐     ┌─────────────────────────────────────┐     ┌──────────────┐
│  POST /draft │────▶│     PATCH /profile/{user_id}       │────▶│ POST /complete│
│              │     │                                     │     │              │
│  { email }   │     │  Step 2: { first_name }            │     │  Finalize    │
│      ↓       │     │  Step 3: { location }              │     │  account     │
│  { user_id } │     │  Step 4: { gender }                │     │      ↓       │
│              │     │  Step 5: { seeking }               │     │  { user,     │
└──────────────┘     │  Step 6: { date_of_birth }         │     │   tokens }   │
                     │  Step 8: { rules_accepted }         │     └──────────────┘
                     │                                     │
                     │  Step 7: POST /photos (separate)    │
                     └─────────────────────────────────────┘
```

---

### Step 1: Create Draft (Email)

**Endpoint**: `POST /api/draft`

**Purpose**: Create a draft profile with email, returns `user_id` for subsequent steps

**Request**:
```json
{
    "email": "user@example.com"
}
```

**Response (201 Created)**:
```json
{
    "success": true,
    "data": {
        "user_id": "550e8400-e29b-41d4-a716-446655440000",
        "email": "user@example.com"
    },
    "message": "Draft created successfully"
}
```

**Errors**:
```json
// 400 - Invalid email
{
    "success": false,
    "error": {
        "code": "INVALID_EMAIL",
        "message": "Please enter a valid email address"
    }
}

// 409 - Email already exists
{
    "success": false,
    "error": {
        "code": "EMAIL_EXISTS",
        "message": "An account with this email already exists"
    }
}
```

---

### Steps 2-6, 8: Update Profile

**Endpoint**: `PATCH /api/profile/{user_id}`

**Purpose**: Update profile fields one at a time (called on each step)

#### Step 2: First Name

**Request**:
```json
{
    "first_name": "John"
}
```

**Response (200 OK)**:
```json
{
    "success": true,
    "data": {
        "user_id": "550e8400-e29b-41d4-a716-446655440000",
        "first_name": "John"
    },
    "message": "Profile updated successfully"
}
```

---

#### Step 3: Location

**Request (Allow Location)**:
```json
{
    "latitude": 40.7128,
    "longitude": -74.0060
}
```

**Request (Skip Location)**:
```json
{
    "location_skipped": true
}
```

**Response (200 OK)**:
```json
{
    "success": true,
    "data": {
        "user_id": "550e8400-e29b-41d4-a716-446655440000",
        "latitude": 40.7128,
        "longitude": -74.0060,
        "location_skipped": false
    },
    "message": "Profile updated successfully"
}
```

---

#### Step 4: Gender

**Request**:
```json
{
    "gender": "man"
}
```

**Response (200 OK)**:
```json
{
    "success": true,
    "data": {
        "user_id": "550e8400-e29b-41d4-a716-446655440000",
        "gender": "man"
    },
    "message": "Profile updated successfully"
}
```

---

#### Step 5: Seeking

**Request**:
```json
{
    "seeking": "woman"
}
```

**Response (200 OK)**:
```json
{
    "success": true,
    "data": {
        "user_id": "550e8400-e29b-41d4-a716-446655440000",
        "seeking": "woman"
    },
    "message": "Profile updated successfully"
}
```

---

#### Step 6: Date of Birth

**Request**:
```json
{
    "date_of_birth": "1995-06-15"
}
```

**Response (200 OK)**:
```json
{
    "success": true,
    "data": {
        "user_id": "550e8400-e29b-41d4-a716-446655440000",
        "date_of_birth": "1995-06-15",
        "age": 30
    },
    "message": "Profile updated successfully"
}
```

**Error (Under 18)**:
```json
{
    "success": false,
    "error": {
        "code": "AGE_RESTRICTION",
        "message": "You must be at least 18 years old"
    }
}
```

---

#### Step 8: Accept Rules

**Request**:
```json
{
    "rules_accepted": true
}
```

**Response (200 OK)**:
```json
{
    "success": true,
    "data": {
        "user_id": "550e8400-e29b-41d4-a716-446655440000",
        "rules_accepted": true
    },
    "message": "Profile updated successfully"
}
```

---

### Step 7: Upload Photos

**Endpoint**: `POST /api/profile/{user_id}/photos`

**Content-Type**: `multipart/form-data`

**Purpose**: Upload one or multiple photos in a single request (batch upload)

**Request (Single Photo)**:
```
photo: [File]
order: 0  (optional)
```

**Request (Batch Upload - Multiple Photos)**:
```
photos: [File, File, File, ...]
orders: [0, 1, 2, ...]  (optional, array of order indices)
```

**Response (200 OK)**:
```json
{
    "success": true,
    "data": {
        "photos": [
            { "id": "photo-uuid-123", "url": "https://...", "order": 0 },
            { "id": "photo-uuid-456", "url": "https://...", "order": 1 },
            { "id": "photo-uuid-789", "url": "https://...", "order": 2 }
        ],
        "photo_count": 3
    },
    "message": "Photos uploaded successfully"
}
```

**Note**: Frontend implements batch upload pattern - all photos are stored locally as File objects and uploaded together when user clicks "Continue" button.
```

---

### Delete Photo

**Endpoint**: `DELETE /api/profile/{user_id}/photos/{photo_id}`

**Response (200 OK)**:
```json
{
    "success": true,
    "data": {
        "deleted_photo_id": "photo-uuid-123",
        "photo_count": 1
    },
    "message": "Photo deleted successfully"
}
```

---

### Step 9: Complete Profile

**Endpoint**: `POST /api/profile/{user_id}/complete`

**Purpose**: Finalize profile, create active user account, return auth tokens

**Request**:
```json
{
    "password": "SecurePassword123!",
    "confirm_password": "SecurePassword123!"
}
```

**Response (201 Created)**:
```json
{
    "success": true,
    "data": {
        "user": {
            "id": "550e8400-e29b-41d4-a716-446655440000",
            "email": "user@example.com",
            "first_name": "John",
            "age": 30,
            "gender": "man",
            "seeking": "woman",
            "photos": [
                { "id": "photo-1", "url": "https://...", "is_primary": true },
                { "id": "photo-2", "url": "https://...", "is_primary": false }
            ],
            "created_at": "2026-02-04T10:35:00Z"
        },
        "tokens": {
            "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            "token_type": "Bearer",
            "expires_in": 3600
        }
    },
    "message": "Profile completed successfully"
}
```

**Errors**:
```json
// 400 - Incomplete profile
{
    "success": false,
    "error": {
        "code": "INCOMPLETE_PROFILE",
        "message": "Please complete all required fields",
        "details": {
            "missing_fields": ["date_of_birth", "photos"],
            "photos_required": 2,
            "photos_uploaded": 1
        }
    }
}
```

---

## 🔑 Forgot Password (Account Recovery)

The app provides a **3-step password recovery flow** using OTP verification.

### Forgot Password Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        FORGOT PASSWORD FLOW                                 │
└─────────────────────────────────────────────────────────────────────────────┘

Step 1:  POST   /api/forgot-password      → { email }
                                        ← { message, otp_sent, expires_in }

Step 2:  (Frontend) Show confirmation page with "Enter Code" button

Step 3:  POST   /api/forgot-password/verify → { email, otp }
                                        ← { user, access_token }

Resend:  POST   /api/forgot-password     → { email }
                                        ← { message, otp_sent, expires_in }
```

---

### Step 1: Send OTP (Forgot Password)

**Endpoint**: `POST /api/forgot-password`

**Purpose**: Send OTP to user's email for password recovery

**Request**:
```json
{
    "email": "user@example.com"
}
```

**Response (200 OK)**:
```json
{
    "success": true,
    "data": {
        "message": "OTP sent successfully",
        "otp_sent": true,
        "expires_in": 60
    }
}
```

**Errors**:
```json
// 404 - User not found
{
    "success": false,
    "error": {
        "code": "USER_NOT_FOUND",
        "message": "No account found with this email"
    }
}
```

---

### Step 2: Verify OTP (Forgot Password)

**Endpoint**: `POST /api/forgot-password/verify`

**Purpose**: Verify OTP and get authentication token (auto-login)

**Request**:
```json
{
    "email": "user@example.com",
    "otp": "123456"
}
```

**Response (200 OK)**:
```json
{
    "success": true,
    "data": {
        "user": {
            "id": "550e8400-e29b-41d4-a716-446655440000",
            "email": "user@example.com",
            "first_name": "John"
        },
        "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
}
```

**Errors**:
```json
// 400 - Invalid OTP
{
    "success": false,
    "error": {
        "code": "INVALID_OTP",
        "message": "Invalid OTP"
    }
}

// 400 - OTP Expired
{
    "success": false,
    "error": {
        "code": "OTP_EXPIRED",
        "message": "OTP has expired. Please request a new one."
    }
}
```

---

### Resend OTP (Forgot Password)

**Endpoint**: `POST /api/forgot-password`

**Purpose**: Resend OTP to user's email

**Request**: Same as Step 1

**Response (200 OK)**:
```json
{
    "success": true,
    "data": {
        "message": "OTP sent successfully",
        "otp_sent": true,
        "expires_in": 60
    }
}
```

---

## 📋 API Summary

### Login APIs

| Step | Method | Endpoint | Request Body |
|------|--------|----------|--------------|
| 1 | POST | `/api/login` | `{ country_code, phone }` or `{ email }` |
| 2 | POST | `/api/login/verify-otp` | `{ country_code, phone, otp }` or `{ email, otp }` |
| Resend | POST | `/api/login/resend-otp` | `{ country_code, phone }` or `{ email }` |

### Registration APIs

| Step | Method | Endpoint | Request Body |
|------|--------|----------|--------------|
| 1 | POST | `/api/draft` | `{ email }` |
| 2 | PATCH | `/api/profile/{user_id}` | `{ first_name }` |
| 3 | PATCH | `/api/profile/{user_id}` | `{ latitude, longitude }` or `{ location_skipped }` |
| 4 | PATCH | `/api/profile/{user_id}` | `{ gender }` |
| 5 | PATCH | `/api/profile/{user_id}` | `{ seeking }` |
| 6 | PATCH | `/api/profile/{user_id}` | `{ date_of_birth }` |
| 7 | POST | `/api/profile/{user_id}/photos` | `multipart/form-data` (batch: `photos[]`, `orders[]`) |
| 7 | DELETE | `/api/profile/{user_id}/photos/{photo_id}` | - |
| 8 | PATCH | `/api/profile/{user_id}` | `{ rules_accepted }` |
| 9 | POST | `/api/profile/{user_id}/complete` | `{ password, confirm_password }` |

### Forgot Password APIs

| Step | Method | Endpoint | Request Body |
|------|--------|----------|--------------|
| 1 | POST | `/api/forgot-password` | `{ email }` |
| 2 | (Frontend) | Confirmation page | - |
| 3 | POST | `/api/forgot-password/verify` | `{ email, otp }` |
| Resend | POST | `/api/forgot-password` | `{ email }` |

### Token Refresh

**Endpoint**: `POST /api/auth/token/refresh`

**Headers**:
```
Authorization: Bearer {refresh_token}
```

**Response**:
```json
{
    "success": true,
    "data": {
        "access_token": "eyJ...",
        "token_type": "Bearer",
        "expires_in": 3600
    }
}
```

**Total: 10 unique endpoints**

---

## 🔒 Validation Rules

| Field | Rules |
|-------|-------|
| `email` | Valid email format, unique |
| `first_name` | 2-100 chars, letters/spaces/hyphens |
| `gender` | `"man"` or `"woman"` |
| `seeking` | `"man"` or `"woman"` |
| `date_of_birth` | `YYYY-MM-DD`, age ≥ 18 |
| `latitude` | -90 to 90 |
| `longitude` | -180 to 180 |
| `photos` | Min 2, Max 6, JPEG/PNG/WebP, Max 5MB each |
| `password` | Min 8 chars, 1 uppercase, 1 lowercase, 1 number |
| `phone` | Valid phone number format |
| `country_code` | Valid country code (e.g., `+1`, `+44`) |
| `otp` | 4-6 digit code |

---

## 🗃️ Database Schema

### `draft_profiles` Table

```sql
CREATE TABLE draft_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    location_skipped BOOLEAN DEFAULT FALSE,
    gender ENUM('man', 'woman'),
    seeking ENUM('man', 'woman'),
    date_of_birth DATE,
    rules_accepted BOOLEAN DEFAULT FALSE,
    status ENUM('draft', 'completed') DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL '24 hours')
);
```

### `draft_photos` Table

```sql
CREATE TABLE draft_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    draft_id UUID REFERENCES draft_profiles(id) ON DELETE CASCADE,
    photo_url VARCHAR(500) NOT NULL,
    photo_order INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### `users` Table (After Complete)

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY,  -- Same ID from draft
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE,
    country_code VARCHAR(5),
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL,
    age INTEGER GENERATED ALWAYS AS (
        EXTRACT(YEAR FROM AGE(CURRENT_DATE, date_of_birth))
    ) STORED,
    gender ENUM('man', 'woman') NOT NULL,
    seeking ENUM('man', 'woman') NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### `otp_codes` Table

```sql
CREATE TABLE otp_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    otp_code VARCHAR(6) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 📱 Frontend Integration

### TypeScript Interfaces

All interfaces are centralized in `src/interfaces/api.interface.ts`:

```typescript
// interfaces/api.interface.ts

// ============================================
// Login API Types
// ============================================
export interface LoginPhoneRequest {
    country_code: string;
    phone: string;
}

export interface LoginEmailRequest {
    email: string;
}

export type LoginRequest = LoginPhoneRequest | LoginEmailRequest;

export interface LoginResponse {
    message: string;
    otp_sent: boolean;
    expires_in: number;
}

export interface OtpVerifyPhoneRequest {
    country_code: string;
    phone: string;
    otp: string;
}

export interface OtpVerifyEmailRequest {
    email: string;
    otp: string;
}

export type OtpVerifyRequest = OtpVerifyPhoneRequest | OtpVerifyEmailRequest;

export interface OtpVerifyResponse {
    user: {
        id: string;
        email?: string;
        phone?: string;
        first_name: string;
    };
    access_token: string;
}

export type ResendOtpRequest = LoginRequest;

export interface ResendOtpResponse {
    message: string;
    otp_sent: boolean;
    expires_in: number;
}

// ============================================
// Registration API Types
// ============================================
export interface DraftRequest {
    email: string;
}

export interface DraftResponse {
    user_id: string;
    email: string;
}

export interface ProfileUpdateRequest {
    first_name?: string;
    gender?: 'man' | 'woman';
    seeking?: 'man' | 'woman';
    date_of_birth?: string;
    latitude?: number;
    longitude?: number;
    location_skipped?: boolean;
    rules_accepted?: boolean;
}

export interface ProfileUpdateResponse {
    user_id: string;
    [key: string]: unknown;
}

export interface Photo {
    id: string;
    url: string;
    order: number;
    is_primary?: boolean;
}

export interface PhotoUploadResponse {
    photo: Photo;
    photos: Photo[];
    photo_count: number;
}

export interface PhotoDeleteResponse {
    deleted_photo_id: string;
    photo_count: number;
}

export interface CompleteRequest {
    password: string;
    confirm_password: string;
}

export interface CompleteUser {
    id: string;
    email: string;
    first_name: string;
    age: number;
    gender: 'man' | 'woman';
    seeking: 'man' | 'woman';
    photos: Photo[];
    created_at: string;
}

export interface CompleteTokens {
    access_token: string;
    refresh_token: string;
    token_type: string;
    expires_in: number;
}

export interface CompleteResponse {
    user: CompleteUser;
    tokens: CompleteTokens;
}

// ============================================
// Forgot Password API Types
// ============================================
export interface ForgotPasswordRequest {
    email: string;
}

export interface ForgotPasswordResponse {
    message: string;
    otp_sent: boolean;
    expires_in: number;
}

export interface ForgotPasswordVerifyRequest {
    email: string;
    otp: string;
}

export interface ForgotPasswordVerifyResponse {
    user: {
        id: string;
        email: string;
        first_name: string;
    };
    access_token: string;
}

// ============================================
// Photo Upload Types (Batch)
// ============================================
export interface PhotoBatchUploadResponse {
    photos: Photo[];
    photo_count: number;
}

export interface PhotoItem {
    file: File;
    preview: string;  // URL.createObjectURL for preview
}
```

### API Service Structure

APIs are organized by HTTP method in `src/services/api/`:

```typescript
// services/api/post_apis.ts
import { postApi, postFormDataApi } from '../api_methods';
import type { 
    LoginRequest, LoginResponse, OtpVerifyRequest, OtpVerifyResponse,
    DraftRequest, DraftResponse, CompleteRequest, CompleteResponse 
} from '@interfaces';

// Login APIs
export const loginApi = async (data: LoginRequest): Promise<LoginResponse> => {
    return await postApi<LoginResponse>('/api/login', data);
};

export const otpVerifyApi = async (data: OtpVerifyRequest): Promise<OtpVerifyResponse> => {
    return await postApi<OtpVerifyResponse>('/api/login/verify-otp', data);
};

export const resendOtpApi = async (data: ResendOtpRequest): Promise<ResendOtpResponse> => {
    return await postApi<ResendOtpResponse>('/api/login/resend-otp', data);
};

// Registration APIs
export const registrationDraftApi = async (data: DraftRequest): Promise<DraftResponse> => {
    return await postApi<DraftResponse>('/api/draft', data);
};

export const registrationCompleteApi = async (
    userId: string,
    data: CompleteRequest
): Promise<CompleteResponse> => {
    return await postApi<CompleteResponse>(`/api/profile/${userId}/complete`, data);
};

// Single photo upload (legacy)
// Single photo upload (legacy)
export const profilePhotoUploadApi = async (
    userId: string,
    file: File,
    order?: number
): Promise<PhotoUploadResponse> => {
    const formData = new FormData();
    formData.append('photo', file);
    if (order !== undefined) formData.append('order', order.toString());
    return await postFormDataApi<PhotoUploadResponse>(`/api/profile/${userId}/photos`, formData);
};

// Batch photo upload (recommended - uploads all photos at once)
export const uploadPhotosApi = async (
    userId: string,
    files: File[]
): Promise<PhotoBatchUploadResponse> => {
    const formData = new FormData();
    files.forEach((file, index) => {
        formData.append('photos', file);
        formData.append('orders', index.toString());
    });
    return await postFormDataApi<PhotoBatchUploadResponse>(`/api/profile/${userId}/photos`, formData);
};

// Forgot Password APIs
export const forgotPasswordApi = async (data: ForgotPasswordRequest): Promise<ForgotPasswordResponse> => {
    return await postApi<ForgotPasswordResponse>('/api/forgot-password', data);
};

export const forgotPasswordVerifyApi = async (data: ForgotPasswordVerifyRequest): Promise<ForgotPasswordVerifyResponse> => {
    return await postApi<ForgotPasswordVerifyResponse>('/api/forgot-password/verify', data);
};

export const forgotPasswordResendApi = async (data: ForgotPasswordRequest): Promise<ForgotPasswordResponse> => {
    return await postApi<ForgotPasswordResponse>('/api/forgot-password', data);
};

// Batch photo upload (recommended)
export const uploadPhotosApi = async (
    userId: string,
    files: File[]
): Promise<PhotoBatchUploadResponse> => {
    const formData = new FormData();
    files.forEach((file, index) => {
        formData.append('photos', file);
        formData.append('orders', index.toString());
    });
    return await postFormDataApi<PhotoBatchUploadResponse>(`/api/profile/${userId}/photos`, formData);
};

// Forgot Password APIs
export const forgotPasswordApi = async (data: ForgotPasswordRequest): Promise<ForgotPasswordResponse> => {
    return await postApi<ForgotPasswordResponse>('/api/forgot-password', data);
};

export const forgotPasswordVerifyApi = async (data: ForgotPasswordVerifyRequest): Promise<ForgotPasswordVerifyResponse> => {
    return await postApi<ForgotPasswordVerifyResponse>('/api/forgot-password/verify', data);
};

export const forgotPasswordResendApi = async (data: ForgotPasswordRequest): Promise<ForgotPasswordResponse> => {
    return await postApi<ForgotPasswordResponse>('/api/forgot-password', data);
};

// services/api/patch_apis.ts
import { patchApi } from '../api_methods';
import type { ProfileUpdateRequest, ProfileUpdateResponse } from '@interfaces';

export const profileStepPatchApi = async (
    userId: string,
    data: ProfileUpdateRequest
): Promise<ProfileUpdateResponse> => {
    return await patchApi<ProfileUpdateResponse>(`/api/profile/${userId}`, data);
};

// services/api/delete_apis.ts
import { deleteApi } from '../api_methods';
import type { PhotoDeleteResponse } from '@interfaces';

export const profilePhotoDeleteApi = async (
    userId: string,
    photoId: string
): Promise<PhotoDeleteResponse> => {
    return await deleteApi<PhotoDeleteResponse>(`/api/profile/${userId}/photos/${photoId}`);
};
```

### Frontend Enums

```typescript
// types/enums.ts

// Login type (phone or email)
export const LoginType = {
    PHONE: 'phone',
    EMAIL: 'email',
} as const;

export type LoginType = (typeof LoginType)[keyof typeof LoginType];

// Profile status (for account states like suspended)
export const ProfileStatus = {
    SUSPENDED: 'suspended',
} as const;

export type ProfileStatus = (typeof ProfileStatus)[keyof typeof ProfileStatus];
```

### Centralized Messages

```typescript
// constants/messages.ts

export const ValidationMessages = {
    // OTP
    OTP_REQUIRED: 'Please enter the code',
    OTP_RESENT: 'A new code has been sent.',
    OTP_SEND_FAILED: 'Failed to send OTP',
    OTP_INVALID: 'Invalid OTP',
    OTP_RESEND_FAILED: 'Failed to resend OTP',

    // Phone
    PHONE_INVALID: 'Please enter a valid phone number',

    // Login
    LOGIN_SUCCESS: 'Login successful!',
    LOGIN_FAILED: 'Login failed',
    
    // Account
    ACCOUNT_CREATED: 'Account created successfully!',
} as const;
```

---

## 🧪 Testing Checklist

### Login API Tests

- [ ] POST /login - Send OTP via phone
- [ ] POST /login - Send OTP via email
- [ ] POST /login - Reject non-existent user
- [ ] POST /login - Reject suspended account (403)
- [ ] POST /login/verify-otp - Verify valid OTP (phone)
- [ ] POST /login/verify-otp - Verify valid OTP (email)
- [ ] POST /login/verify-otp - Reject invalid OTP
- [ ] POST /login/verify-otp - Reject expired OTP
- [ ] POST /login/resend-otp - Resend OTP successfully

### Registration API Tests

- [ ] POST /draft - Create with valid email
- [ ] POST /draft - Reject duplicate email
- [ ] PATCH /profile/{id} - Update first_name
- [ ] PATCH /profile/{id} - Update location
- [ ] PATCH /profile/{id} - Update gender
- [ ] PATCH /profile/{id} - Update seeking
- [ ] PATCH /profile/{id} - Update date_of_birth
- [ ] PATCH /profile/{id} - Validate age ≥ 18
- [ ] POST /profile/{id}/photos - Upload photo
- [ ] DELETE /profile/{id}/photos/{id} - Delete photo
- [ ] POST /profile/{id}/complete - Complete profile
- [ ] POST /profile/{id}/complete - Reject incomplete profile

---

## 📝 Changelog

### v3.4.0 (February 2026)
- **Added**: Forgot Password API (`POST /api/forgot-password`)
- **Added**: Forgot Password Verify API (`POST /api/forgot-password/verify`)
- **Added**: Batch photo upload support (multiple photos in one request)
- **Frontend**: ForgotPassword 3-step flow (Email → Confirmation → OTP Verify)
- **Frontend**: Photo upload refactored to batch upload pattern
- **Frontend**: Images centralized in `@assets` with index exports
- **Frontend**: Custom logo-based spinner component
- **Frontend**: Enhanced route guards with loading states
- **Frontend**: 404 NotFound page with catch-all route

### v3.3.0 (February 2026)
- **Added**: Suspended account handling (403 error on login)
- **Added**: `ProfileStatus` enum with `SUSPENDED` status
- **Frontend**: Warning modal for suspended accounts in LoginSetup
- **Frontend**: Enhanced ConfirmModal with `showCancel`, `width`, `confirmVariant`, `cancelVariant` props

### v3.2.0 (February 2026)
- **Added**: Login API with OTP authentication (`POST /api/login`)
- **Added**: OTP Verify API (`POST /api/login/verify-otp`)
- **Added**: Resend OTP API (`POST /api/login/resend-otp`)
- **Added**: `LoginType` enum for phone/email keys
- **Added**: Centralized OTP messages in ValidationMessages
- **Frontend**: LoginSetup with 2-step flow (credentials → OTP)
- **Frontend**: Phone input with country code support

### v3.1.0 (February 2026)
- **Frontend**: Updated to unified `handleStepSubmit` function
- **Frontend**: APIs organized by HTTP method (`services/api/`)
- **Frontend**: All interfaces centralized in `interfaces/api.interface.ts`
- **Frontend**: Full type safety with no `any` types
- **Frontend**: Object map pattern for step payloads

### v3.0.0 (February 2026)
- **Updated**: Simplified to match backend team's API structure
- **Changed**: Step 1 uses `POST /draft` instead of `/register/start`
- **Changed**: All profile updates use `PATCH /profile/{user_id}`
- **Changed**: Complete uses `POST /profile/{user_id}/complete`
- **Simplified**: 5 unique endpoints total for registration

### v2.0.0 (February 2026)
- Single PATCH endpoint with JWT registration_token

### v1.0.0 (February 2026)
- Initial specification

---

*Document Version: 3.4.0*  
*Created: February 2026*  
*Frontend Version: 3.4.0*
