# Data Collection Management System

## Overview

This is a full-stack data collection management system built with React, Node.js, Express, and Supabase. The application enables organizations to create structured forms, manage data collection schedules, and collect data from users across different departments. It features role-based access control with admin, department user, and data entry user roles.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Components**: Shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design system
- **State Management**: React Query for server state management
- **Routing**: React Router for client-side navigation
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express framework
- **Database**: PostgreSQL via Supabase
- **ORM**: Drizzle ORM (configured but not fully utilized - falls back to Supabase client)
- **Authentication**: Supabase Auth with Row Level Security (RLS)
- **API Architecture**: RESTful API design (routes placeholder exists)

### Database Design
- **Users & Profiles**: User authentication and profile management with role-based access
- **Departments**: Organizational structure for user grouping
- **Data Banks**: Master data management for reference data
- **Forms**: Dynamic form builder with field definitions
- **Schedules**: Time-based data collection periods
- **Form Submissions**: Collected data storage with JSON fields

## Key Components

### Authentication & Authorization
- Supabase Auth integration with email/password authentication
- Three-tier role system: admin, department_user, data_entry_user
- Row Level Security policies for data access control
- Profile management with department assignments

### Form Management
- Dynamic form builder with multiple field types (text, textarea, select, radio, number, email, date)
- Reference data integration for dropdown/radio options
- Primary and secondary column designation for data display
- Form validation and field ordering

### Schedule Management
- Time-bounded data collection periods
- Form association with schedules
- Status tracking (open, collection, published)
- User completion tracking

### Data Collection
- Dynamic form rendering based on schedule assignments
- Real-time submission tracking
- Progress monitoring for administrators
- Department-based data organization

### Reporting System
- Schedule publishing capability when all forms are completed
- Tabular data visualization for published schedules
- Form-specific data reports with submission details
- CSV export functionality for data analysis
- Completion status tracking and validation

## Data Flow

1. **Admin Setup**: Administrators create departments, reference data, and forms
2. **Schedule Creation**: Admins create collection schedules and assign forms
3. **User Assignment**: Users are assigned to departments and given appropriate roles
4. **Data Collection**: Users access assigned forms through schedules and submit data
5. **Progress Tracking**: Admins monitor completion status and collected data
6. **Form Completion**: Users mark forms as complete when finished with data entry
7. **Schedule Publishing**: Admins publish schedules when all forms are completed
8. **Report Generation**: Published schedules provide tabular data views and CSV exports

## External Dependencies

### Core Dependencies
- **Supabase**: Backend-as-a-Service for database, authentication, and real-time features
- **Neon Database**: PostgreSQL hosting (configured in Drizzle but using Supabase)
- **Shadcn/ui**: Modern React component library
- **React Query**: Server state management and caching
- **Zod**: Schema validation for forms and API data

### Development Tools
- **TypeScript**: Type safety across the application
- **ESBuild**: Fast JavaScript bundling for production
- **PostCSS**: CSS processing with Tailwind
- **Replit**: Development environment integration

## Deployment Strategy

### Development Environment
- Replit-based development with live reload
- Vite dev server for frontend with HMR
- Express server for API development
- PostgreSQL database provisioning

### Production Build
- **Frontend**: Vite build process generating optimized static assets
- **Backend**: ESBuild bundling Node.js application
- **Database**: Supabase managed PostgreSQL with migrations
- **Deployment**: Replit autoscale deployment target

### Environment Configuration
- Database connection via `DATABASE_URL` environment variable
- Supabase configuration with public API keys
- Development/production environment detection

## Changelog

```
Changelog:
- June 16, 2025. Initial setup
- June 16, 2025. Fixed data collection functionality - users can now submit multiple entries per form, removed artificial completion limits
- June 16, 2025. Added comprehensive reporting system - schedules can be published when all forms are complete, published schedules show tabular data reports with CSV export functionality
- June 17, 2025. Implemented hierarchical sub-header system for complex nested forms (Province → Medical Personnel → Doctors/Dentists/Specialists → Gender breakdowns)
- June 17, 2025. Fixed form creation bug where sub-header data wasn't being saved to database
- June 17, 2025. Enhanced validation logic - fields with sub-headers skip required validation and hide main input field
- June 17, 2025. Fixed reporting system to properly display hierarchical form data - now works with both simple and nested form structures
- June 17, 2025. Enhanced PDF export to match hierarchical table structure with proper multi-level headers and organized columns
- June 18, 2025. Implemented comprehensive filtering system across all modules (Reports, Forms, Schedules, Departments) to efficiently handle large datasets with search, status, date, and category filters
- June 18, 2025. Added user creation capabilities with department assignment and implemented department-based access control - non-admin users only see data from their assigned department
- June 18, 2025. Fixed Data Collection page filtering to show schedules with "collection" status regardless of end date, ensuring department users can access their assigned forms
- June 18, 2025. Enabled shared access to Data Bank Management for all authenticated users while maintaining department isolation for operational data
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```