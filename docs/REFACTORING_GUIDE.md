/\*\*

- Refactored Architecture Documentation
-
- This document outlines the clean architecture refactoring of the GabAI codebase.
- All refactoring follows SOLID principles without changing any existing features or behavior.
  \*/

## Architecture Overview

### Folder Structure

```
gab-ai/
├── src/                          # New source code directory
│   ├── domain/                   # Business logic (ENTITIES & USE CASES)
│   │   ├── auth/                # Authentication domain
│   │   │   ├── services/        # Auth business logic (IAuthService, AuthService)
│   │   │   └── index.ts         # Public API
│   │   ├── session/             # Session domain
│   │   │   ├── services/        # Session business logic (ISessionService, SessionService)
│   │   │   ├── hooks/           # React hooks for session
│   │   │   └── index.ts         # Public API
│   │   ├── resume/              # Resume domain
│   │   │   ├── services/        # Resume business logic (IResumeService, ResumeService)
│   │   │   ├── hooks/           # React hooks for file upload
│   │   │   └── index.ts         # Public API
│   │   └── interview/           # Interview domain
│   │       └── (Interview-specific logic)
│   ├── application/             # APPLICATION LAYER
│   │   └── di/                  # Dependency Injection
│   │       └── ServiceContainer.ts  # Central DI container
│   ├── infrastructure/          # INFRASTRUCTURE LAYER
│   │   ├── supabase/           # External service clients
│   │   │   └── client.ts        # Supabase client factory
│   │   └── websocket/          # WebSocket utilities
│   │       └── ConnectionManager.ts
│   └── shared/                  # SHARED UTILITIES & TYPES
│       ├── types/              # Centralized type definitions
│       │   └── index.ts
│       ├── constants/          # Constants and configuration
│       │   └── index.ts
│       └── utils/              # Reusable utilities
│           ├── validation.ts    # Validation logic
│           └── common.ts        # Common helper functions
│
├── app/                         # Next.js app directory (existing - keep for compatibility)
│   ├── api/                    # API routes
│   ├── dashboard/              # Dashboard pages
│   ├── session/                # Session pages
│   └── ...
│
├── components/                  # Shared React components
└── lib/                        # Configuration and utilities (keep existing for now)

websocket-server/
├── src/                        # New source code directory
│   ├── domain/
│   │   └── interview/         # Interview domain logic
│   │       └── InterviewSessionManager.ts
│   ├── infrastructure/
│   │   └── websocket/
│   │       └── ConnectionManager.ts
│   └── shared/
│       └── constants/         # Shared constants
└── (existing API and services)
```

## SOLID Principles Applied

### 1. Single Responsibility Principle (SRP)

- **AuthService**: Only handles authentication
- **ResumeService**: Only handles resume operations
- **SessionService**: Only handles session operations
- **ServiceContainer**: Only manages dependency creation
- **useSessionStart**: Only handles session initiation
- **useFileUpload**: Only handles file upload logic

### 2. Open/Closed Principle (OCP)

- Services implement interfaces (IAuthService, IResumeService, ISessionService)
- New service implementations can be added without modifying existing code
- ServiceContainer can accept new service registrations

### 3. Liskov Substitution Principle (LSP)

- All service implementations follow their interfaces precisely
- Any IAuthService implementation can replace AuthService
- Interfaces define contracts that implementations honor

### 4. Interface Segregation Principle (ISP)

- Interfaces are focused and minimal
- IAuthService has only authentication methods
- IResumeService has only resume-related methods
- Clients don't depend on unnecessary methods

### 5. Dependency Inversion Principle (DIP)

- Components depend on abstractions (interfaces), not concrete classes
- ServiceContainer provides dependencies to services
- Hooks get services from the DI container, not direct imports
- Supabase client is abstracted as ISupabaseClient

## Key Improvements

### 1. Code Duplication Eliminated

- **Before**: `sessionService.ts` and `resumeService.ts` were duplicates in `app/session/services/`
- **After**: Single implementation of each service in the domain folder

### 2. Centralized Validation

- **Before**: Validation logic scattered in form components
- **After**: `validation.ts` contains all validation rules (DRY principle)

### 3. Centralized Constants & Configuration

- **Before**: Magic strings and API endpoints in multiple files
- **After**: `constants/index.ts` centralizes all configuration

### 4. Type Safety & Organization

- **Before**: `speech.ts` with only speech types
- **After**: `shared/types/index.ts` with all domain types organized together

### 5. Service Locator Pattern

- **Before**: Direct imports (tight coupling)
- **After**: Dependency Injection via ServiceContainer (loose coupling)

### 6. Utility Functions Library

- **Before**: Utility functions scattered in hooks and components
- **After**: `shared/utils/` with organized, reusable utilities

## Migration Guide

### For Existing Code

1. Update imports to use new paths:

   ```typescript
   // Old
   import { useSessionStart } from "@/app/session/hooks/useSessionStart";

   // New
   import { useSessionStart } from "@/src/domain/session";
   ```

2. Services are accessed via DI container:

   ```typescript
   // Old
   const supabase = createClient();

   // New
   const supabase = ServiceContainer.getInstance().getSupabaseClient();
   ```

3. Use shared validation utilities:

   ```typescript
   // Old
   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

   // New
   import { validateEmail } from "@/src/shared/utils/validation";
   ```

## Behavior Preservation

✅ **No features added or removed**
✅ **No business logic changed**
✅ **All API contracts remain the same**
✅ **Database structure unchanged**
✅ **UI/UX identical**

The refactoring is purely organizational and architectural, improving:

- Code maintainability
- Testing capability
- Extensibility
- Code reuse
- Team collaboration

## Next Steps (Optional)

1. Add unit tests using the service interfaces
2. Create mock implementations for testing
3. Add integration tests for service interactions
4. Document API contracts with OpenAPI/Swagger
5. Add error handling middleware
6. Implement logging service
7. Add configuration management service
