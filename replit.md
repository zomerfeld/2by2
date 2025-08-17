# 2by2 - To Do List

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
- **UI/UX Decisions**: Full-screen peach matrix area (#FFDCCC at 40%), collapsible sidebar, interactive 2x2 matrix with transparent background and sharp corners, draggable TaskNums (32px in matrix, 24px in sidebar), external quadrant labels for clean appearance, brown theme (#7F2700 labels, #CC3F00 active tasks, #413B51 unplaced), Space Mono typography, responsive layout for various screen sizes, minimalist design focusing on core functionality.

## Recent Changes (August 16, 2025)
- **Matrix sizing optimization**: Significantly improved space utilization on widescreen displays by reducing padding constraints (80px more height, 50px more width) and optimizing viewport calculations
- **Mobile layout refinements**: Added brown separator line (#4B1700) above first todo item in stacked view for better visual hierarchy
- **Sticky matrix behavior**: Matrix area remains fixed while sidebar scrolls on desktop (810px+) for enhanced user experience
- **Mobile interface improvements**: Logo moved to top with brown background, matrix centered with 32px spacing, "Add New Item" button positioned above todo list
- **Edit interface polish**: Removed edit/trash buttons from active tasks, reduced input height, borderless design with exact typography matching

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