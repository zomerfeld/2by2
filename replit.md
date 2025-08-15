# Priority Matrix - Task Prioritization Tool

## Overview
Priority Matrix is a full-stack web application designed to help users organize and prioritize tasks using a visual 2x2 matrix. It allows users to create and manage up to 100 tasks, dragging them across customizable urgency and impact axes. The application supports multi-user environments via shareable URLs, features a collapsible sidebar, intelligent task number reuse, and comprehensive data export capabilities (JSON, PDF, PNG). The vision is to provide an intuitive and efficient tool for personal and team task prioritization, enhancing productivity and clarity in work management.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### UI/UX Decisions
- **Design Philosophy**: Minimalist and clean interface focusing on core functionality. No quadrant labels or background colors for a cleaner matrix view.
- **Color Scheme**: Harmonious 100-color palette for visual distinction of tasks.
- **Responsiveness**: Responsive layout ensures the matrix is centered and appropriately sized across various screen sizes, with a custom breakpoint at 810px for mobile optimization.
- **Interactions**: Intuitive drag & drop for task positioning, double-click actions for editing axis labels and removing items. Collapsible sidebar for focused views.
- **Typography**: Scaled axis labels appropriately for desktop vs. mobile, with fine-tuned positioning and spacing for optimal readability.

### Technical Implementation
- **Frontend**: Built with React 18 and TypeScript, styled using Tailwind CSS with `shadcn/ui`. State management is handled by TanStack Query (React Query) for server state, Wouter for routing, and React DnD for drag & drop. Vite is used for fast development and optimized builds.
- **Backend**: Node.js with Express.js and TypeScript (ES modules). It features a RESTful JSON API with crypto-secure UUIDs for list identifiers and robust input sanitization using Zod validation.
- **Database**: PostgreSQL with Drizzle ORM for type-safe schema definitions, automated migrations, and reliable data storage.
- **Data Models**:
    - **Todo Items**: Tasks with `id`, `text`, `number` (1-100, reusable), `positionX/Y` (matrix coordinates), `completed` status, and `lastPositionX/Y/Quadrant` for completion toggle memory.
    - **Matrix Settings**: Customizable `xAxisLabel` (default: "Impact") and `yAxisLabel` (default: "Urgency").
- **Core Functionality**:
    - **Task Management**: Create tasks (128-character limit) with automatic number assignment and validation.
    - **Matrix Interaction**: Real-time UI updates for drag-and-drop operations with visual animations.
    - **Completion System**: Tasks can be marked complete, removed from the matrix, and their position remembered for restoration. Task numbers are released for reuse.
    - **Number Reuse**: Intelligent system recycles numbers from completed tasks.
    - **Multi-User Support**: Each task list has a unique, shareable URL (`/lists/:listId`).
    - **Data Persistence**: Data is stored persistently in PostgreSQL.
    - **Export**: JSON data export, PDF reports, and PNG screenshots are supported.
    - **Settings Management**: Axis labels are editable and changes are persistently stored.

### System Design Choices
- **Scalability**: Designed to support multiple users and up to 100 tasks per list efficiently.
- **Security**: Utilizes crypto-secure UUIDs for identifiers and Zod for comprehensive input validation to prevent common vulnerabilities.
- **Data Integrity**: Drizzle ORM with automated migrations ensures database schema consistency.
- **Performance**: Optimized to eliminate file I/O bottlenecks (migrated from file-based to PostgreSQL storage) and ensure fast UI responses with optimistic updates.
- **Development Workflow**: Uses Vite and tsx for hot module reloading and type safety across the full stack.

## External Dependencies

- **drizzle-orm**: ORM for PostgreSQL database interactions.
- **@tanstack/react-query**: Server state management and caching for the frontend.
- **react-dnd**: Provides drag and drop functionality.
- **@radix-ui/**: Library for accessible UI primitives (dialogs, tooltips).
- **zod**: Schema validation for data integrity and input sanitization.
- **framer-motion**: For animations and interactive feedback.
- **html2canvas**: Used for generating PNG screenshots for export.
- **jspdf**: Used for generating PDF reports.
- **lucide-react**: Icon library.
- **tailwindcss**: Utility-first CSS framework.
- **tsx**: TypeScript execution for backend development.
- **esbuild**: Bundling for production backend.