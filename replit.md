# Priority Matrix - Task Prioritization Tool (v1.3)

## Overview

Priority Matrix is a full-stack web application that helps users organize and prioritize tasks using a visual 2x2 matrix interface. Users can create up to 100 tasks and drag them across customizable urgency and impact axes to effectively categorize their work priorities. The application features multi-user support with custom shareable URLs, a collapsible sidebar, intelligent number reuse system, and comprehensive export capabilities including JSON, PDF, and PNG formats.

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
- **Storage**: PostgreSQL database with Drizzle ORM for performance and reliability
- **Schema**: Drizzle ORM types with comprehensive input sanitization and validation
- **API Design**: RESTful JSON API with UUID-based list IDs for enhanced security
- **Backup/Recovery**: Automated data export/import system for data protection

### Development Environment
- **Hot Reload**: Vite HMR for frontend, tsx for backend development
- **Type Safety**: Full TypeScript coverage across frontend, backend, and shared schemas
- **Development Server**: Integrated Vite middleware in Express for seamless development

## Key Components

### Data Models
```typescript
// Todo Items - Core task entities (up to 100 items)
- id: Primary key
- text: Task description (128-character limit)
- number: Display number (1-100, automatically reused when items completed)
- positionX/positionY: Matrix coordinates (0-1 range)
- quadrant: Categorization helper (deprecated, not used for sorting)
- completed: Boolean completion status
- lastPositionX/lastPositionY/lastQuadrant: Position memory for completion toggle

// Matrix Settings - Customizable axis labels (swapped in v1.2)
- xAxisLabel: Vertical axis name (default: "Impact") 
- yAxisLabel: Horizontal axis name (default: "Urgency")
```

### Frontend Components
- **MatrixPage**: Main application layout with collapsible sidebar and centered matrix
- **PriorityMatrix**: Interactive 2x2 grid with customizable axis labels and drag-drop zones
- **TodoSidebar**: Collapsible task management panel with separate completed/active sections
- **MatrixItem**: Draggable colored number circles with hover tooltips and double-click removal
- **AddTodoModal**: Streamlined form for creating new tasks (auto-assigns next available number)
- **PriorityMatrixControls**: Header controls for export (JSON/PDF/PNG) and clear functions

### Backend Routes
- `POST /api/lists` - Create new list (returns listId)
- `GET /api/lists/:listId` - Fetch list details
- `GET /api/lists/:listId/todo-items` - Fetch tasks for specific list
- `POST /api/lists/:listId/todo-items` - Create new task in list
- `PATCH /api/lists/:listId/todo-items/:id` - Update task properties
- `DELETE /api/lists/:listId/todo-items/:id` - Remove task from list
- `GET /api/lists/:listId/matrix-settings` - Get axis labels for list
- `PATCH /api/lists/:listId/matrix-settings` - Update axis labels for list

## Data Flow

1. **Task Creation**: Users create tasks via streamlined modal → automatic number assignment → 128-character validation → stored in JSON file → UI updates via React Query cache invalidation

2. **Matrix Interaction**: Users drag colored number circles onto matrix → position coordinates calculated → backend updated with new position → real-time UI feedback with visual animations

3. **Task Management**: Edit/delete operations trigger optimistic updates → backend validation → cache synchronization → sidebar displays in simple numerical order

4. **Completion System**: Mark items complete → automatically removed from matrix → position stored in memory → can be restored when uncompleted → numbers released for reuse

5. **Export Operations**: Generate JSON data export, PDF reports, or PNG screenshots → comprehensive data preservation

6. **Settings Management**: Double-click axis labels to edit → immediate UI reflection → persistent file storage

## External Dependencies

### Core Dependencies
- **drizzle-orm**: Type-safe schema definitions and validation
- **@tanstack/react-query**: Server state management and caching
- **react-dnd**: Drag and drop functionality with HTML5 backend
- **@radix-ui/***: Accessible UI primitives (dialogs, tooltips, form components)
- **zod**: Runtime type validation and form schemas
- **framer-motion**: Animation effects and drag feedback
- **html2canvas**: Screenshot generation for PNG export
- **jspdf**: PDF generation capabilities
- **lucide-react**: Icon library for UI components

### Development Dependencies
- **tsx**: TypeScript execution for development server
- **esbuild**: Production backend bundling
- **tailwindcss**: Utility-first CSS framework with shadcn/ui integration

## Deployment Strategy

### Build Process
1. **Frontend**: Vite builds React app to `dist/public`
2. **Backend**: esbuild bundles Express server to `dist/index.js`

### Environment Requirements
- `NODE_ENV`: Environment flag (development/production)
- No external database dependencies (uses local file storage)

### Production Setup
- Single-process deployment with static file serving
- Express serves built React app as static assets
- No external database dependencies (uses JSON file-based storage)
- Data persisted in `data.json` (excluded from Git via `.gitignore` for privacy)
- Template file `data.template.json` provides structure for new installations
- Supports up to 100 concurrent tasks with intelligent number management

### Development Workflow
- `npm run dev`: Starts development server with hot reload
- `npm run build`: Creates production builds
- `npm run start`: Runs production server
- `npm run db:push`: Applies database schema changes

## Version History

### v1.3 - Multi-User System (June 30, 2025)
**Major Features:**
- **Multi-User Support**: Custom shareable URLs for each task list (e.g., `/lists/abc123`)
- **Browser Persistence**: Users automatically return to their last used list after app restarts
- **Server Storage Sync**: Efficient list-based data management with automatic cleanup
- **100-List Capacity**: Support for up to 100 concurrent lists with oldest-first deletion
- **List Isolation**: Each list maintains independent tasks, settings, and matrix configurations
- **Red Circle Indicators**: Visual marking of unplaced items with red borders around numbers

**Technical Implementation:**
- URL-based list routing with unique identifiers
- localStorage integration for browser-based list persistence
- List-specific API endpoints (`/api/lists/:listId/...`)
- Enhanced storage system with timestamp-based cleanup
- Backward-compatible architecture maintaining all v1.2 features

### v1.2 - Core Release (June 28, 2025)
**Major Features:**
- **Axis Label Swap**: Impact moved to vertical (left), Urgency to horizontal (bottom)
- **100-Item Capacity**: Increased from 15 to 100 tasks with intelligent number reuse
- **Enhanced Export**: JSON, PDF, and PNG screenshot capabilities
- **Collapsible Interface**: Sidebar toggle for focused matrix view
- **Position Memory**: Completed tasks remember matrix locations for restoration
- **Simplified Sorting**: Removed complex quadrant-based sorting, now displays by creation order

**Technical Improvements:**
- JSON file-based storage with Git privacy protection
- 128-character task description validation
- Harmonious color palette for visual distinction
- Coordinate system fixes for proper matrix mapping
- Custom SVG favicon with consistent branding

### v1.1 - Label Refinements (June 28, 2025)
- Restored Urgency label to vertical orientation
- Fine-tuned label positioning and spacing
- Optimized visual balance and readability

### v1.0 - Core Release (June 28, 2025)
- Intelligent number reuse system
- Position memory for completion workflow
- Streamlined add item dialog
- Enhanced matrix positioning

### Early Development (June 28, 2025)
- Initial PostgreSQL implementation (later migrated to JSON)
- Completion tracking with separated sections
- Drag-and-drop functionality with visual feedback
- Minimalist design without quadrant backgrounds
- Double-click interactions for editing and removal

## User Preferences

Preferred communication style: Simple, everyday language.

## Current Features (v1.2)

### Core Functionality
- **Task Management**: Create up to 100 tasks with 128-character descriptions
- **Visual Matrix**: Interactive 2x2 grid with customizable Impact (vertical) and Urgency (horizontal) axes
- **Drag & Drop**: Intuitive positioning of colored number circles across quadrants
- **Completion System**: Mark tasks complete with automatic matrix removal and position memory
- **Number Reuse**: Intelligent number assignment system that recycles completed task numbers

### User Interface
- **Collapsible Sidebar**: Toggle sidebar visibility for focused matrix view
- **Harmonious Colors**: 100-color palette ensuring visual distinction for all task numbers
- **Minimalist Design**: Clean interface without quadrant labels or background colors
- **Responsive Layout**: Matrix remains centered and properly sized across screen sizes
- **Double-Click Actions**: Edit axis labels and remove items from matrix via double-click

### Data Management
- **JSON Storage**: File-based persistence with Git privacy protection via `.gitignore`
- **Position Memory**: Completed tasks remember matrix positions for restoration
- **Export Capabilities**: Generate JSON data, PDF reports, and PNG screenshots
- **Template System**: `data.template.json` provides clean installation structure

### Technical Implementation
- **Simple Sorting**: Tasks display in numerical order (creation sequence) in sidebar
- **Real-time Updates**: Immediate UI feedback for all operations via React Query
- **Type Safety**: Full TypeScript coverage with Drizzle ORM schema validation
- **No External Dependencies**: Completely self-contained with local file storage