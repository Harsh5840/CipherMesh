# Replit.md - Secure File Sharing Platform

## Overview

This is a secure file sharing platform built with a modern full-stack architecture featuring client-side encryption, automatic file expiration, and zero-knowledge security. The application ensures that all files are encrypted on the client side before being uploaded to the server, providing end-to-end encryption where even the server cannot access the original file contents.

## System Architecture

### Technology Stack
- **Frontend**: React 18 with TypeScript, Vite for build tooling
- **Backend**: Node.js with Express.js
- **Database**: PostgreSQL with Neon serverless adapter
- **ORM**: Drizzle ORM with type-safe queries
- **UI Components**: Radix UI with shadcn/ui components
- **Styling**: Tailwind CSS with custom design system
- **Authentication**: Replit Auth with OpenID Connect
- **State Management**: TanStack Query for server state
- **Routing**: Wouter for client-side routing
- **Encryption**: Web Crypto API for client-side encryption

### Architecture Pattern
The application follows a monorepo structure with clear separation between client and server code:
- **Client**: React SPA with TypeScript
- **Server**: Express.js REST API
- **Shared**: Common schema definitions and types

## Key Components

### Frontend Architecture
- **Component Structure**: Modular React components with TypeScript
- **State Management**: TanStack Query for server state, React hooks for local state
- **Routing**: File-based routing with Wouter
- **UI System**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming

### Backend Architecture
- **API Design**: RESTful endpoints with Express.js
- **Database Layer**: Drizzle ORM with connection pooling
- **Authentication**: Passport.js with OpenID Connect strategy
- **File Storage**: Local file system with encrypted file storage
- **Middleware**: Rate limiting, file upload handling, authentication guards

### Security Architecture
- **Client-Side Encryption**: AES-256-GCM encryption using Web Crypto API
- **Zero-Knowledge**: Server never sees plaintext files
- **Key Management**: Ephemeral key generation per file
- **Secure Memory**: Automatic cleanup of sensitive data
- **Access Control**: JWT-based authentication with session management

## Data Flow

### File Upload Process
1. User selects file in React frontend
2. File is encrypted client-side using Web Crypto API (AES-256-GCM)
3. Encrypted file and metadata sent to server
4. Server stores encrypted file without access to plaintext
5. Database stores file metadata and encryption keys
6. Unique sharing URL generated with embedded access keys

### File Download Process
1. User accesses sharing URL
2. Server validates access permissions and download limits
3. Encrypted file data sent to client
4. Client decrypts file using stored encryption keys
5. Decrypted file downloaded to user's device
6. Access logged for security audit

### Authentication Flow
1. User initiates login through Replit Auth
2. OpenID Connect flow with Replit identity provider
3. JWT tokens stored in HTTP-only cookies
4. Session management with PostgreSQL store
5. Automatic token refresh and validation

## External Dependencies

### Database
- **Neon PostgreSQL**: Serverless PostgreSQL database
- **Connection**: Using @neondatabase/serverless with connection pooling
- **Migrations**: Drizzle Kit for schema management

### Authentication
- **Replit Auth**: OpenID Connect provider
- **Session Storage**: PostgreSQL-based session store
- **Security**: HTTP-only cookies with secure flags

### File Storage
- **Local Storage**: Files stored in uploads directory
- **Encryption**: Client-side encryption before upload
- **Cleanup**: Automatic cleanup of expired files

### UI Components
- **Radix UI**: Accessible component primitives
- **shadcn/ui**: Pre-built component library
- **Tailwind CSS**: Utility-first styling framework

## Deployment Strategy

### Development
- **Vite Dev Server**: Hot module replacement for frontend
- **tsx**: TypeScript execution for backend
- **Concurrent Development**: Frontend and backend served together

### Production Build
- **Frontend**: Vite build with static asset optimization
- **Backend**: esbuild bundling with ESM output
- **Static Serving**: Express serves built frontend assets

### Environment Configuration
- **Database**: Neon PostgreSQL connection string
- **Authentication**: Replit Auth configuration
- **Sessions**: Secure session secret management
- **File Storage**: Configurable upload directory

## Changelog

Changelog:
- July 04, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.