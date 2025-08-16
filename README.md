# Priority Matrix

A dynamic priority management application that empowers users to visualize, organize, and prioritize tasks using an interactive 2x2 matrix interface.

![Priority Matrix App](https://img.shields.io/badge/Status-Production%20Ready-green)
![Node.js](https://img.shields.io/badge/Node.js-18%2B-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![React](https://img.shields.io/badge/React-18-blue)

## Features

- **Interactive 2x2 Matrix**: Drag and drop tasks across urgency and impact quadrants
- **Multi-user Support**: Shareable URLs with unique list identifiers
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Real-time Updates**: Live task management with browser persistence
- **Export Capabilities**: JSON data export and PNG screenshot generation
- **Customizable Axes**: Editable matrix labels (default: Urgency vs Impact)
- **Task Management**: Support for up to 100 tasks with intelligent number reuse
- **Clean UI**: Minimalist brown-themed design with Space Mono typography

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** + shadcn/ui components
- **Vite** for build tooling and development
- **React DnD** for drag and drop functionality
- **TanStack Query** for state management
- **Wouter** for routing
- **Framer Motion** for animations

### Backend
- **Node.js** with Express.js
- **TypeScript** with ES modules
- **PostgreSQL** database with Drizzle ORM
- **Crypto-secure UUID** identifiers
- **Zod** validation for input sanitization

## Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm or yarn package manager

## Local Development Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd priority-matrix
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Database Setup

Create a PostgreSQL database and set up your environment variables:

```bash
# Copy the example environment file
cp .env.example .env
```

Update your `.env` file with your database credentials:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/priority_matrix
PGHOST=localhost
PGPORT=5432
PGUSER=your_username
PGPASSWORD=your_password
PGDATABASE=priority_matrix
```

### 4. Database Migration

Push the database schema:

```bash
npm run db:push
```

### 5. Start the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## Available Scripts

- `npm run dev` - Start the development server with hot reload
- `npm run build` - Build the application for production
- `npm run db:push` - Push database schema changes
- `npm run db:studio` - Open Drizzle Studio for database management

## Project Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Application pages
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility functions
│   │   └── styles/         # CSS and styling files
├── server/                 # Backend Express application
│   ├── routes.ts           # API route definitions
│   ├── storage.ts          # Database operations
│   ├── db.ts              # Database configuration
│   └── index.ts           # Server entry point
├── shared/                 # Shared TypeScript schemas
│   └── schema.ts          # Database and validation schemas
└── README.md              # Project documentation
```

## Key Features Explained

### Matrix Interface
- **Four Quadrants**: High/Low Urgency × High/Low Impact
- **Drag & Drop**: Intuitive task positioning
- **Visual Feedback**: Real-time updates and hover states
- **Responsive Grid**: Scales across all device sizes

### Task Management
- **Number Reuse**: Intelligent recycling of task numbers (1-100)
- **Persistence**: Browser storage for last-used lists
- **Validation**: Input sanitization and length limits
- **State Management**: Optimistic updates with error handling

### Multi-user Support
- **Unique URLs**: Crypto-secure UUID-based list sharing
- **Isolation**: Complete data separation between lists
- **Persistence**: Database storage for reliability
- **Concurrent Access**: Support for multiple simultaneous users

### Export Options
- **JSON Export**: Complete data export with timestamps
- **PNG Export**: High-quality screenshot generation
- **Data Integrity**: Comprehensive export/import validation

## Database Schema

The application uses three main database tables:

- **Lists**: Container for matrix instances with metadata
- **TodoItems**: Individual tasks with position and completion data
- **MatrixSettings**: Customizable axis labels per list

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Create a Pull Request

## Development Guidelines

- Follow TypeScript best practices
- Use Tailwind CSS for styling
- Implement responsive design patterns
- Write meaningful commit messages
- Test across different screen sizes

## Performance Optimizations

- **Lazy Loading**: Component-level code splitting
- **Query Optimization**: Efficient database operations
- **Caching**: Browser storage for user preferences
- **Bundle Optimization**: Tree shaking and compression

## Security Features

- **Input Validation**: Zod schema validation
- **SQL Injection Protection**: Parameterized queries via Drizzle ORM
- **UUID Generation**: Crypto-secure identifiers
- **Data Sanitization**: XSS prevention measures

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, issues, or feature requests, please create an issue in the GitHub repository.