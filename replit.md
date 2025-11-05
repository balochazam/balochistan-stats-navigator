# Data Collection Management System

## Overview
This is a full-stack data collection management system with a public-first approach, designed to enable organizations to create structured forms, manage data collection, and publish transparent reports for public access. It features interactive charts and visualizations for published reports and secure admin access for data management. The system supports role-based access control with department-based data isolation. The project aims to provide a comprehensive SDG Dashboard system, integrating authentic Balochistan data and supporting all phases of SDG implementation, from data entry to progress tracking and visualization.

## Recent Changes (November 2025)
- **Critical Security Fix - Password Authentication**: Implemented proper password authentication using bcrypt (salt rounds: 10) with password hashing on user creation and password verification on login. Added password_hash field to profiles schema (nullable for legacy users). All API responses now sanitized to prevent password hash exposure. Added admin password reset endpoint for legacy user migration. Minimum password length: 6 characters enforced across all endpoints.
- **Production Static File Serving Fix**: Corrected production build path from `dist/` to `dist/public/` to resolve blank screen deployment issue with MIME type errors
- **Production Deployment Hardening**: Complete refactoring of configuration management to support deployment on any server environment (Digital Ocean, AWS, Azure, bare metal)
- **Configuration Externalization**: Removed all hardcoded values (PORT, HOST, timeouts) and replaced with environment variables with sensible defaults
- **Enhanced Database Configuration**: Smart SSL defaults (enabled for remote databases, disabled for localhost), support for custom CA certificates, connection pooling configuration, multiple PostgreSQL providers (Aiven, AWS RDS, Azure, self-hosted)
- **Session Management Improvements**: Trust proxy support for reverse proxies (nginx/Apache), configurable session TTL, cookie domain, and security settings
- **Health Monitoring Endpoints**: Added `/health` and `/ready` endpoints for production monitoring, load balancers, and Kubernetes deployments
- **Deployment Scripts**: Added PM2 integration scripts, database migration commands, and deployment setup automation
- **Comprehensive Documentation**: Created detailed deployment checklist (DEPLOYMENT_CHECKLIST.md), comprehensive .env.example with all configuration options documented
- **Secure Defaults**: SSL enabled by default for remote databases, localhost auto-detection, proper security headers and cookie configuration

## Previous Changes (August-September 2025)
- **Complete SDG Framework Implementation**: Successfully populated database with 81 authentic UN SDG indicators from Goals 1-5
- **Authentic UN Data Structure**: All indicators include proper tier classification, custodian agencies, measurement units, and methodologies
- **Comprehensive Indicator Coverage**: Goals 1-5 fully populated with all official targets and indicators (13+14+27+11+14 = 79 indicators)
- **Database Foundation Complete**: One-time setup completed - users will only enter data values, not create indicators
- **Dynamic Form Builder System**: Comprehensive visual form creation tool with drag-and-drop interface, supporting 10+ field types, validation rules, conditional logic, and real-time preview
- **Enhanced User Experience**: Toast notifications centered with beautiful styling, streamlined navigation with SDG Management prominently positioned, form submission with proper feedback
- **Simplified Dynamic Form Builder**: Clean modal-based form creator integrated directly into indicator cards, triggered by "Create Form" button for indicators without existing forms
- **Dynamic Indicator Details View**: Comprehensive data visualization system showing authentic Balochistan SDG data with baseline, progress, and latest values, including trend analysis and breakdowns by urban/rural/gender demographics
- **CSV Upload Integration**: Complete CSV template download and bulk upload functionality integrated into DataEntryForm with tabs interface, duplicate detection for any primary key fields, validation, and comprehensive error handling
- **Schedule Date System Updated**: Modified schedule creation to use year-only inputs (start year/end year) instead of full dates, with automatic conversion to ISO date format for database storage, comprehensive year validation (1900-2050), and updated UI displays
- **Data Bank Delete Confirmation Fixed**: Replaced browser alert with elegant confirmation dialog for data bank entry deletion, fixed API client calls throughout the component, added proper error handling with toast notifications
- **Ready for Goal-by-Goal Finalization**: Systematic approach to finalize data collection forms for each remaining goal
- **September 2025 Updates**: Fixed routing inconsistencies - SDG Management moved from `/admin/sdg-management` to `/sdg-management`, all indicator detail pages now use consistent `/indicator/{code}` format instead of UUID-based routing, resolved PostgreSQL database migration from problematic Neon to stable Replit PostgreSQL
- **BBOS/SDG Form Distinction**: Added database-level form categorization with `form_category` enum ("bbos", "sdg") to prevent accidental cross-deletion, restored BBOS forms that were mistakenly deleted, properly categorized existing SDG indicator forms
- **Improvement Direction Enhancement**: Added `improvement_direction` field ("increase"/"decrease") to SDG indicators to properly track whether progress is shown through higher values (education, income) or lower values (poverty, mortality), enabling accurate progress calculations and trend visualization

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
- **Runtime**: Node.js 20.x with Express framework
- **Database**: PostgreSQL 14+ (remote Aiven or self-hosted)
- **ORM**: Drizzle ORM for schema and migrations
- **Session Store**: PostgreSQL (connect-pg-simple)
- **API Architecture**: RESTful API design, including 15+ endpoints for the SDG Dashboard system
- **Process Management**: PM2 cluster mode for production
- **Deployment**: Supports Digital Ocean, AWS EC2, Azure VM, bare metal, Docker

### Database Design
- **Core Entities**: Users, Profiles, Departments, Data Banks, Forms, Schedules, Form Submissions.
- **SDG Implementation**: Dedicated schema including `goals`, `targets`, `indicators`, `data sources`, `indicator values`, and `progress calculations`. All populated with real Balochistan data (17 UN SDG goals, 13 targets, 14 indicators, 10 data sources, 16+ historical data values with urban/rural breakdowns).
- **Enhanced Indicator Schema**: Extended with `data_structure`, `validation_rules`, `aggregation_methods`, `disaggregation_categories`, and `data_quality_requirements` fields to support complex multi-dimensional indicators with 14+ comprehensive indicator types.

### Key Components & Features
- **Authentication & Authorization**: Secure bcrypt-based password authentication with hashing (10 salt rounds), session-based authentication using PostgreSQL session store, admin-only user creation, two-tier role system (admin, data_entry_user), department-based access control, admin password reset functionality for legacy users.
- **Form Management**: Dynamic builder with multiple field types, reference data integration, primary/secondary column designation, validation, hierarchical sub-headers, and auto-generated field names.
- **Schedule Management**: Time-bounded collection periods, form association, status tracking, and business validation rules.
- **Data Collection**: Dynamic form rendering, real-time submission tracking, progress monitoring, and department-based organization.
- **Reporting System**: Schedule publishing, tabular data visualization, CSV/PDF export with hierarchical table structure, comprehensive filtering (search, status, date, category, department), and completion status validation.
- **SDG Dashboard**: Comprehensive system with Goals Manager, Indicators Manager, specialized data entry forms for various indicator types, Progress Tracker with visualization, and an interactive dashboard.
- **Real SDG Data Entry System**: Advanced multi-dimensional data collection forms based on authentic UN SDG indicator structures, dynamic form builder for complex indicators, support for ratio calculations, demographic breakdowns, and geographic disaggregation following international standards.
- **Technology Transfer Page**: Admin-only section providing technical documentation, architecture, database schema, API endpoints, development workflow, and maintenance guidelines.

## External Dependencies

### Core Dependencies
- **PostgreSQL**: Primary database (Aiven cloud hosting, supports any PostgreSQL 14+ provider)
- **Shadcn/ui**: Modern React component library
- **React Query (TanStack Query v5)**: Server state management and caching
- **Zod**: Schema validation
- **Drizzle ORM**: Type-safe database operations and migrations
- **PM2**: Production process manager
- **Express Session**: PostgreSQL-backed session management

### Development Tools
- **TypeScript**: Type safety.
- **ESBuild**: Fast JavaScript bundling.
- **PostCSS**: CSS processing.
- **Replit**: Development environment integration.