# Instagram Profile Analyzer

## Overview

Instagram Profile Analyzer is a web application designed to analyze public Instagram profiles using AI. It scrapes profile data, extracts text from post images via OCR, and leverages Google's Gemini AI to generate comprehensive insights. These insights include content themes, audience profiles, engagement patterns, and strategic recommendations, aiming to provide data-driven understanding of Instagram content strategies and audience engagement.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

The frontend is a React-based Single Page Application built with TypeScript and Vite. It utilizes `shadcn/ui` components based on Radix UI primitives, styled with Tailwind CSS, following a "new-york" design aesthetic. State management for server data is handled by TanStack React Query. The design system features an Instagram-inspired purple primary color, Inter and JetBrains Mono typography, and a dark mode default.

### Backend Architecture

The backend is an Express.js application in TypeScript, providing a RESTful API with a primary endpoint `/api/analyze-profile`. This endpoint accepts a username, scrapes Instagram data, performs OCR on post images using Gemini, and then generates an AI-powered analysis. Error handling is robust, including API key validation and request schema validation with Zod.

### Data Storage Solutions

While PostgreSQL with Drizzle ORM is configured using Neon for serverless capabilities, it is not actively used for data persistence. The current implementation focuses on in-memory processing for real-time analysis, with database infrastructure prepared for future features like analysis history.

### AI Integration Architecture

The application integrates with Google Gemini AI (`gemini-2.5-flash` or `gemini-2.5-pro`) for profile analysis and OCR. AI capabilities include generating structured insights, extracting text from images, and providing categorized results in Portuguese. Prompt engineering is used to guide Gemini as a social media/marketing expert. The system includes retry logic with exponential backoff for AI errors (quota, overload) and provides graceful fallbacks to basic statistical analysis when AI is unavailable, optimizing Gemini quota by skipping OCR for demo images.

## External Dependencies

### Third-Party Services

-   **Google Gemini AI**: Used for profile analysis and image OCR. Authentication via `GEMINI_API_KEY`.
-   **Neon Database (PostgreSQL)**: Configured for future data persistence, accessed via `DATABASE_URL`, but not actively utilized.

### UI Dependencies

-   **Radix UI Primitives**: Provides accessible, unstyled React components for UI elements.
-   **shadcn/ui**: Component system built on Radix UI with Tailwind CSS styling, using the "new-york" style variant.

### Development Dependencies

-   **Vite**: Build tool and development server for React applications.
-   **TypeScript**: Ensures type safety across the frontend and backend.
-   **Drizzle Kit**: Used for database migrations and schema management (configured but migrations not applied).

### Instagram Data Source

-   **Primary Data Source**: Unofficial Instagram public API (`i.instagram.com/api/v1/users/web_profile_info/`) for real profile data, including bio, follower counts, and up to 12 recent posts. Handles private profiles and implements graceful fallback to demo data upon rate limiting or network errors.
-   **Fallback Data Source**: Generates realistic simulated demo data when real scraping fails, using `ui-avatars.com` and `picsum.photos` for images.