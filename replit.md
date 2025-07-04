# Priority Matrix - Task Prioritization Tool (v3.0)

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
- **Storage**: PostgreSQL database with Drizzle ORM for production reliability and performance
- **Security**: Crypto-secure UUID identifiers and comprehensive input sanitization with Zod validation
- **Schema**: Type-safe Drizzle ORM with automated migrations and proper indexing
- **API Design**: RESTful JSON API with UUID-based list IDs preventing predictable identifiers
- **Backup/Recovery**: Production data export/import endpoints for disaster recovery

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
- `DATABASE_URL`: PostgreSQL connection string for production database
- Database automatically provisioned in Replit environment

### Production Setup
- Single-process deployment with PostgreSQL database integration
- Express serves built React app as static assets with database backend
- PostgreSQL database with automated schema migrations via Drizzle ORM
- Crypto-secure UUID identifiers for enhanced security and scalability
- Production-ready with comprehensive input validation and error handling
- Supports up to 100 concurrent tasks per list with intelligent number management
- Data export/import capabilities for backup and disaster recovery

### Development Workflow
- `npm run dev`: Starts development server with hot reload
- `npm run build`: Creates production builds
- `npm run start`: Runs production server
- `npm run db:push`: Applies database schema changes

## Version History

### v3.0 - Production Polish Release (July 1, 2025)
**Export & Interface Refinements:**
- **Streamlined Exports**: Removed PDF export functionality, optimized PNG exports with silent downloads
- **Improved User Experience**: Eliminated export success notifications for cleaner workflow
- **Enhanced Label Editing**: Fixed Impact label editing with proper form field orientation
- **Responsive Typography**: Scaled axis labels appropriately for desktop vs mobile viewing
- **Precise Positioning**: Fine-tuned Impact and Urgency label positioning for optimal spacing across all screen sizes
- **Production Ready**: Achieved final polish for professional deployment with refined visual hierarchy

### v2.3 - Stable Mobile Release (June 30, 2025)
**Stability and Polish:**
- **Production Ready**: Confirmed stable mobile-responsive layout with all features working correctly
- **Error Resolution**: Fixed any temporary layout issues during mobile optimization development
- **Version Consolidation**: Established v2.3 as the definitive mobile-responsive release
- **Quality Assurance**: Verified complete functionality across desktop, tablet, and mobile viewports

### v2.2 - Mobile Responsive (June 30, 2025)
**Mobile-First Design:**
- **Responsive Layout**: Matrix stacks above todo list on screens < 810px for optimal mobile viewing
- **Natural Scrolling**: Full-page scrollable experience with matrix and todo list flowing vertically
- **Adaptive Axis Labels**: Impact and Urgency labels resize and reposition responsively across screen sizes
- **Mobile Optimization**: Reduced padding, smaller text, and adjusted spacing for mobile devices
- **Custom Breakpoint**: 810px threshold ensures perfect desktop/mobile transition

### v2.1 - UI Polish (June 30, 2025)
**Interface Improvements:**
- **Sidebar Spacing**: Optimized padding throughout the todo sidebar for cleaner visual hierarchy
- **Button Layout**: Removed unnecessary border separator below "Add New Item" button
- **Compact Design**: Reduced top padding in active items section for tighter layout
- **Visual Polish**: Fine-tuned spacing between UI elements for improved user experience

### v2.0 - Production Release (June 30, 2025)
**Major Production Improvements:**
- **PostgreSQL Migration**: Migrated from file-based to PostgreSQL database storage for enhanced reliability and performance
- **UUID Security**: Implemented crypto-secure UUID identifiers for list IDs, replacing predictable sequential numbers
- **Input Sanitization**: Comprehensive Zod schema validation preventing injection attacks and data corruption
- **Performance Optimization**: Eliminated all file I/O bottlenecks and inefficient cleanup operations
- **Backup/Recovery System**: Added data export/import endpoints for production data management
- **Browser Persistence**: Fixed localStorage issue where root URL visits created new lists instead of returning to last used list
- **Database Schema**: Full Drizzle ORM integration with type-safe operations and automated migrations
- **Error Handling**: Robust error handling with proper HTTP status codes and detailed validation messages

**Technical Architecture:**
- Complete database migration preserving all existing functionality
- Enhanced security with crypto.randomUUID() for list generation
- Optimized query performance with proper indexing and relations
- Production-ready deployment configuration with environment variable support
- Comprehensive input validation preventing security vulnerabilities

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

## Local Deployment Guide

This guide helps you run Priority Matrix on your own computer, even if you're new to coding.

### Prerequisites (What You'll Need)

Before starting, you'll need to install these programs on your computer:

#### 1. Install Node.js
- Go to [nodejs.org](https://nodejs.org)
- Download the "LTS" version (recommended for most users)
- Run the installer and follow the setup wizard
- To verify it worked, open Terminal (Mac) or Command Prompt (Windows) and type:
  ```
  node --version
  ```
  You should see a version number like `v20.x.x`

#### 2. Install PostgreSQL Database
- Go to [postgresql.org/download](https://postgresql.org/download)
- Choose your operating system and download the installer
- During installation, remember the password you set for the "postgres" user
- Make sure PostgreSQL service starts automatically

#### 3. Install Git (Optional but Recommended)
- Go to [git-scm.com](https://git-scm.com)
- Download and install for your operating system
- This helps you download and update the code easily

### Getting the Code

#### Option 1: Using Git (Recommended)
Open Terminal/Command Prompt and run:
```bash
git clone https://github.com/your-repo/priority-matrix.git
cd priority-matrix
```

#### Option 2: Download ZIP
- Download the code as a ZIP file from your repository
- Extract it to a folder like `Documents/priority-matrix`
- Open Terminal/Command Prompt and navigate to that folder

### Setting Up the Database

1. **Create a Database**
   Open Terminal/Command Prompt and run:
   ```bash
   createdb priority_matrix
   ```
   If this doesn't work, try:
   ```bash
   psql -U postgres -c "CREATE DATABASE priority_matrix;"
   ```

2. **Set Database Connection**
   Create a file called `.env` in your project folder and add:
   ```
   DATABASE_URL=postgresql://postgres:your_password@localhost:5432/priority_matrix
   ```
   Replace `your_password` with the PostgreSQL password you set during installation.

### Installing Dependencies

In your project folder, run:
```bash
npm install
```

This downloads all the code libraries the app needs. It might take a few minutes.

### Setting Up the Database Schema

Run this command to create the necessary database tables:
```bash
npm run db:push
```

### Starting the Application

To start the app, run:
```bash
npm run dev
```

You should see messages like:
```
[express] serving on port 5000
```

Open your web browser and go to:
```
http://localhost:5000
```

You should see your Priority Matrix app running!

### Stopping the Application

To stop the app:
- Press `Ctrl+C` (Windows/Linux) or `Cmd+C` (Mac) in Terminal/Command Prompt

### Troubleshooting Common Issues

#### "npm not found" or "node not found"
- Restart your Terminal/Command Prompt after installing Node.js
- Make sure Node.js installed correctly by running `node --version`

#### Database Connection Errors
- Make sure PostgreSQL is running on your computer
- Check that your `.env` file has the correct password
- Try connecting to PostgreSQL manually: `psql -U postgres`

#### Port Already in Use
- If port 5000 is busy, the app will automatically try port 5001, 5002, etc.
- Or stop other applications using that port

#### Permission Errors
- On Mac/Linux, you might need to use `sudo` before commands
- Make sure you have write permissions in your project folder

### Development vs Production

The `npm run dev` command starts the app in development mode with:
- Automatic reloading when you change code
- Detailed error messages
- Development tools enabled

For production deployment (running on a server), you would use:
```bash
npm run build
npm run start
```

### Keeping Your App Updated

If you used Git to download the code, you can update it by running:
```bash
git pull
npm install
npm run db:push
```

This downloads any new features and updates your database if needed.

### Getting Help

If you run into issues:
1. Check the error messages carefully - they often explain what's wrong
2. Make sure all prerequisites are installed correctly
3. Verify your database connection settings in the `.env` file
4. Try restarting both the app and your database service

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