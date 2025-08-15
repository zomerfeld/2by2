# Priority Matrix - Task Prioritization Tool

## Overview
Priority Matrix is a full-stack web application designed to help users prioritize tasks using a visual 2x2 matrix. It enables users to create up to 100 tasks and drag them across customizable urgency and impact axes. Key capabilities include multi-user support with shareable URLs, a collapsible sidebar, an intelligent number reuse system, and comprehensive export options (JSON, PDF, PNG). The project aims to provide an intuitive and efficient tool for personal and professional task management, enhancing productivity through visual prioritization.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui
- **State Management**: TanStack Query (React Query)
- **Routing**: Wouter
- **Drag & Drop**: React DnD
- **Build Tool**: Vite
- **UI/UX Decisions**: Collapsible sidebar, interactive 2x2 matrix with customizable axis labels, draggable colored number circles with hover tooltips, streamlined modals for task creation, harmonious color palette for task numbers, responsive layout for various screen sizes, minimalist design focusing on core functionality.

### Backend
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Security**: Crypto-secure UUID identifiers, Zod validation for input sanitization
- **API Design**: RESTful JSON API with UUID-based list IDs.
- **Data Models**:
    - **Todo Items**: `id`, `text` (128-char limit), `number` (1-100, reused), `positionX/positionY`, `completed`, `lastPositionX/lastPositionY/lastQuadrant`.
    - **Matrix Settings**: `xAxisLabel`, `yAxisLabel`.
- **Key Features**: Multi-user support with unique shareable URLs, browser persistence for last-used lists, support for up to 100 concurrent lists with isolation, comprehensive data export/import capabilities.

### Development Environment
- **Hot Reload**: Vite HMR (frontend), tsx (backend)
- **Type Safety**: Full TypeScript coverage
- **Development Server**: Integrated Vite middleware in Express

## External Dependencies

### Core Dependencies
- **drizzle-orm**: Type-safe schema definitions and validation.
- **@tanstack/react-query**: Server state management and caching.
- **react-dnd**: Drag and drop functionality.
- **@radix-ui/**: Accessible UI primitives.
- **zod**: Runtime type validation and form schemas.
- **framer-motion**: Animation effects.
- **html2canvas**: Screenshot generation for PNG export.
- **jspdf**: PDF generation.
- **lucide-react**: Icon library.

### Development Dependencies
- **tsx**: TypeScript execution for development server.
- **esbuild**: Production backend bundling.
- **tailwindcss**: Utility-first CSS framework.