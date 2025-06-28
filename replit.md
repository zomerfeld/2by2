# Priority Matrix - Task Prioritization Tool

## Overview

Priority Matrix is a full-stack web application that helps users organize and prioritize tasks using a visual 2x2 matrix interface. Users can create up to 15 todo items and drag them across customizable urgency and impact axes to effectively categorize their work priorities.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: Wouter for lightweight client-side routing
- **Drag & Drop**: React DnD with HTML5 backend
- **Build Tool**: Vite for fast development and optimized builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon serverless PostgreSQL
- **Session Management**: PostgreSQL session store
- **API Design**: RESTful JSON API

### Development Environment
- **Hot Reload**: Vite HMR for frontend, tsx for backend development
- **Type Safety**: Full TypeScript coverage across frontend, backend, and shared schemas
- **Development Server**: Integrated Vite middleware in Express for seamless development

## Key Components

### Data Models
```typescript
// Todo Items - Core task entities
- id: Primary key
- text: Task description
- number: Display number (1-15)
- positionX/positionY: Matrix coordinates (0-1 range)
- quadrant: Categorization helper

// Matrix Settings - Customizable axis labels
- xAxisLabel: Horizontal axis name (default: "Impact")
- yAxisLabel: Vertical axis name (default: "Urgency")
```

### Frontend Components
- **MatrixPage**: Main application layout with header and content areas
- **PriorityMatrix**: Interactive 2x2 grid with drag-drop zones
- **TodoSidebar**: Task management panel with CRUD operations
- **MatrixItem**: Draggable task components with editing capabilities
- **AddTodoModal**: Form for creating new tasks

### Backend Routes
- `GET /api/todo-items` - Fetch all tasks
- `POST /api/todo-items` - Create new task
- `PATCH /api/todo-items/:id` - Update task properties
- `DELETE /api/todo-items/:id` - Remove task
- `GET /api/matrix-settings` - Get axis labels
- `PATCH /api/matrix-settings` - Update axis labels

## Data Flow

1. **Task Creation**: Users create tasks via sidebar modal → validated against schema → stored in database → UI updates via React Query cache invalidation

2. **Matrix Interaction**: Users drag tasks onto matrix → position coordinates calculated → backend updated with new position/quadrant → real-time UI feedback

3. **Task Management**: Edit/delete operations trigger optimistic updates → backend validation → cache synchronization

4. **Settings Management**: Axis label changes update matrix settings → immediate UI reflection → persistent storage

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL connection
- **drizzle-orm**: Type-safe database operations
- **@tanstack/react-query**: Server state management
- **react-dnd**: Drag and drop functionality
- **@radix-ui/***: Accessible UI primitives
- **zod**: Runtime type validation

### Development Dependencies
- **drizzle-kit**: Database migration management
- **tsx**: TypeScript execution for development
- **esbuild**: Production backend bundling

## Deployment Strategy

### Build Process
1. **Frontend**: Vite builds React app to `dist/public`
2. **Backend**: esbuild bundles Express server to `dist/index.js`
3. **Database**: Drizzle migrations applied via `db:push` command

### Environment Requirements
- `DATABASE_URL`: PostgreSQL connection string (required)
- `NODE_ENV`: Environment flag (development/production)

### Production Setup
- Single-process deployment with static file serving
- Express serves built React app as static assets
- Database migrations must be run before deployment

### Development Workflow
- `npm run dev`: Starts development server with hot reload
- `npm run build`: Creates production builds
- `npm run start`: Runs production server
- `npm run db:push`: Applies database schema changes

## Changelog
- June 28, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.