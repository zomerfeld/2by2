# Priority Matrix - Task Prioritization Tool (v1.1)

## Overview

Priority Matrix is a full-stack web application that helps users organize and prioritize tasks using a visual 2x2 matrix interface. Users can create tasks and drag them across customizable urgency and impact axes to effectively categorize their work priorities.

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
- **Storage**: JSON file-based storage system (data.json)
- **Schema**: Drizzle ORM types for data validation
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
- number: Display number
- positionX/positionY: Matrix coordinates (0-1 range)
- quadrant: Categorization helper
- completed: Boolean completion status

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

1. **Task Creation**: Users create tasks via sidebar modal → validated against schema → stored in JSON file → UI updates via React Query cache invalidation

2. **Matrix Interaction**: Users drag tasks onto matrix → position coordinates calculated → backend updated with new position/quadrant → real-time UI feedback

3. **Task Management**: Edit/delete operations trigger optimistic updates → backend validation → cache synchronization

4. **Settings Management**: Axis label changes update matrix settings → immediate UI reflection → persistent file storage

## External Dependencies

### Core Dependencies
- **drizzle-orm**: Type-safe schema definitions and validation
- **@tanstack/react-query**: Server state management
- **react-dnd**: Drag and drop functionality
- **@radix-ui/***: Accessible UI primitives
- **zod**: Runtime type validation
- **framer-motion**: Animation and drag feedback

### Development Dependencies
- **tsx**: TypeScript execution for development
- **esbuild**: Production backend bundling

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
- No database setup required (uses file-based storage)
- Data persisted in `data.json` (excluded from Git for privacy)

### Development Workflow
- `npm run dev`: Starts development server with hot reload
- `npm run build`: Creates production builds
- `npm run start`: Runs production server
- `npm run db:push`: Applies database schema changes

## Changelog
- June 28, 2025. Initial setup
- June 28, 2025. Major feature expansion:
  - Migrated from in-memory to PostgreSQL database storage
  - Added completion tracking with completed/uncompleted item separation
  - Implemented 15-color harmonious color scheme for todo numbers
  - Enhanced drag-and-drop with visual feedback (red borders for unassigned items)
  - Simplified matrix display to show only colored number circles
  - Moved axis labeling controls to bottom of interface
  - Added double-click to remove items from matrix
  - Implemented automatic matrix removal when items are completed
  - Added memory for item positions when toggling completion status
- June 28, 2025. UI improvements and enhanced export:
  - Changed all "todo" references to "To-Do" in user interface
  - Removed export button label, now icon-only with tooltip
  - Enhanced export to include JSON, PDF, and PNG screenshot formats
  - Removed "Impact vs Urgency Matrix" title for cleaner interface
  - Repositioned matrix higher in container for better visual balance
  - Replaced bottom axis controls with inline double-click editing
  - Axis labels now editable via double-click with immediate visual feedback
- June 28, 2025. Final UX refinements:
  - Removed quadrant background colors and labels for minimalist design
  - Removed drag handle affordance from todo items (drag behavior is intuitive)
  - Added collapsible sidebar with toggle button in header
  - Matrix becomes centered and square when sidebar is collapsed
  - Simplified add item dialog by removing manual number selection
  - Removed success toast notifications for smoother workflow
  - Added position memory system to restore item locations after completion toggle
- June 28, 2025. Layout and positioning improvements:
  - Moved Export and Clear controls to header for cleaner interface
  - Centered matrix chart to prevent cutoff in fullscreen mode
  - Adjusted horizontal high-low labels positioning (moved 2px lower)
  - Optimized vertical high-low labels placement (moved 20px right from center)
- June 28, 2025. Version 1.0 Release:
  - Repositioned Impact label to right-align with chart edge
  - Moved Urgency label to top-right of chart with right-aligned text
  - Implemented intelligent number reuse system for completed tasks
  - Numbers are automatically released when tasks are completed
  - Returning tasks receive next available number
  - Removed manual number selection from add task dialog
  - Enhanced position memory system for task completion workflow
- June 28, 2025. Version 1.1 Release:
  - Restored Urgency label to vertical orientation on left side
  - Fine-tuned Urgency label alignment to top of chart area
  - Moved horizontal high-low labels 4px lower for better spacing
  - Adjusted horizontal label positioning: "Low" moved 2px right, "High" moved 2px left
  - Optimized visual balance and readability of all chart labels
- June 28, 2025. Version 1.2 Release:
  - Swapped axis label positions: Impact now vertical (left), Urgency now horizontal (bottom)
  - Implemented quadrant-based sorting system with counter-clockwise numbering from top-right
  - Priority order: unassigned items, then quadrants 1→2→4→3 based on strategic importance
  - Within quadrants: height priority (higher items first), then x-axis priority (rightward items first)
  - Fixed item limit validation to allow full 100-item capacity

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Updates

### Database Integration
- Added completed boolean field to todo items schema
- Implemented persistent storage for all todo items and matrix settings

### Visual Enhancements
- Each todo number displays in unique harmonious color (expanded color palette)
- Matrix items show only colored number circles for clean appearance
- Unassigned items have red borders and background for visual distinction
- Improved drag feedback with rotation and scaling effects

### Functional Improvements
- Separate completed items section with toggle functionality
- Items automatically removed from matrix when marked complete
- Position memory preserved when uncompleting items
- Double-click matrix items to move back to sidebar
- Axis controls relocated to bottom for better workflow
- All todo items remain visible in sidebar regardless of matrix placement
- Hover tooltips on matrix circles show full task descriptions
- File-based storage system for free-tier compatibility

### Storage Architecture
- Migrated from PostgreSQL to JSON file storage for Replit free tier
- Data persisted in `data.json` with automatic initialization from template
- Template file `data.template.json` provides structure for new installations
- User data excluded from Git via `.gitignore` for privacy
- Maintains all functionality without external database dependencies