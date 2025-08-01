# Data Collection Management System

## Overview
This is a full-stack data collection management system with a public-first approach, designed to enable organizations to create structured forms, manage data collection, and publish transparent reports for public access. It features interactive charts and visualizations for published reports and secure admin access for data management. The system supports role-based access control with department-based data isolation. The project aims to provide a comprehensive SDG Dashboard system, integrating authentic Balochistan data and supporting all phases of SDG implementation, from data entry to progress tracking and visualization.

## Recent Changes (August 2025)
- **Complete SDG Framework Implementation**: Successfully populated database with 81 authentic UN SDG indicators from Goals 1-5
- **Authentic UN Data Structure**: All indicators include proper tier classification, custodian agencies, measurement units, and methodologies
- **Comprehensive Indicator Coverage**: Goals 1-5 fully populated with all official targets and indicators (13+14+27+11+14 = 79 indicators)
- **Database Foundation Complete**: One-time setup completed - users will only enter data values, not create indicators
- **Dynamic Form Builder System**: Comprehensive visual form creation tool with drag-and-drop interface, supporting 10+ field types, validation rules, conditional logic, and real-time preview
- **Enhanced User Experience**: Toast notifications centered with beautiful styling, streamlined navigation with SDG Management prominently positioned, form submission with proper feedback
- **Simplified Dynamic Form Builder**: Clean modal-based form creator integrated directly into indicator cards, triggered by "Create Form" button for indicators without existing forms
- **Ready for Goal-by-Goal Finalization**: Systematic approach to finalize data collection forms for each remaining goal

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Components**: Shadcn/ui (built on Radix UI)
- **Styling**: Tailwind CSS
- **State Management**: React Query
- **Routing**: React Router
- **Forms**: React Hook Form with Zod validation
- **UI/UX**: Public-first design with a beautiful landing page, authentic UN colors for SDG elements, and integration of the official Balochistan Bureau of Statistics logo. The interface emphasizes comprehensive guidance and teaching elements for form creation.

### UI Consolidation (August 2025)
- **SDG Interface Consolidation**: Merged SDG Dashboard functionality into SDG Goals Management component to eliminate duplication and provide unified experience
- **Dashboard-Style Management**: SDG Goals Management now features dashboard-style visualizations with progress charts, statistics cards, and grid layouts matching the original SDG Dashboard design

### Backend Architecture
- **Runtime**: Node.js with Express framework
- **Database**: PostgreSQL (via Supabase)
- **ORM**: Drizzle ORM (configured, but primarily uses Supabase client)
- **Authentication**: Supabase Auth with Row Level Security (RLS)
- **API Architecture**: RESTful API design, including 15+ endpoints for the SDG Dashboard system.

### Database Design
- **Core Entities**: Users, Profiles, Departments, Data Banks, Forms, Schedules, Form Submissions.
- **SDG Implementation**: Dedicated schema including `goals`, `targets`, `indicators`, `data sources`, `indicator values`, and `progress calculations`. All populated with real Balochistan data (17 UN SDG goals, 13 targets, 14 indicators, 10 data sources, 16+ historical data values with urban/rural breakdowns).
- **Enhanced Indicator Schema**: Extended with `data_structure`, `validation_rules`, `aggregation_methods`, `disaggregation_categories`, and `data_quality_requirements` fields to support complex multi-dimensional indicators with 14+ comprehensive indicator types.

### Key Components & Features
- **Authentication & Authorization**: Supabase Auth, admin-only user creation, two-tier role system (admin, data_entry_user), RLS, department-based access control.
- **Form Management**: Dynamic builder with multiple field types, reference data integration, primary/secondary column designation, validation, hierarchical sub-headers, and auto-generated field names.
- **Schedule Management**: Time-bounded collection periods, form association, status tracking, and business validation rules.
- **Data Collection**: Dynamic form rendering, real-time submission tracking, progress monitoring, and department-based organization.
- **Reporting System**: Schedule publishing, tabular data visualization, CSV/PDF export with hierarchical table structure, comprehensive filtering (search, status, date, category, department), and completion status validation.
- **SDG Dashboard**: Comprehensive system with Goals Manager, Indicators Manager, specialized data entry forms for various indicator types, Progress Tracker with visualization, and an interactive dashboard.
- **Real SDG Data Entry System**: Advanced multi-dimensional data collection forms based on authentic UN SDG indicator structures, dynamic form builder for complex indicators, support for ratio calculations, demographic breakdowns, and geographic disaggregation following international standards.
- **Technology Transfer Page**: Admin-only section providing technical documentation, architecture, database schema, API endpoints, development workflow, and maintenance guidelines.

## External Dependencies

### Core Dependencies
- **Supabase**: Backend-as-a-Service for database, authentication, and real-time features.
- **Neon Database**: PostgreSQL hosting (configured in Drizzle, but using Supabase).
- **Shadcn/ui**: Modern React component library.
- **React Query**: Server state management and caching.
- **Zod**: Schema validation.

### Development Tools
- **TypeScript**: Type safety.
- **ESBuild**: Fast JavaScript bundling.
- **PostCSS**: CSS processing.
- **Replit**: Development environment integration.