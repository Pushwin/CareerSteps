# Overview

The Career Path Generator is a web-based application that helps users discover and plan their career journeys in technology fields. The app provides personalized learning paths for various tech careers including web development, data science, and mobile development. Users can create accounts, select career paths, view detailed learning steps, and access curated resources to support their learning journey.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Static HTML/CSS/JavaScript Architecture**: The application uses a traditional multi-page approach with separate HTML files for each major feature (login/signup, career selection, learning steps, and resources)
- **Client-Side Navigation**: JavaScript handles page transitions and state management using localStorage for persistence
- **Responsive Design**: CSS implements a mobile-first approach with flexbox layouts and responsive grids

## Authentication System
- **Browser-Based Storage**: User authentication is handled entirely client-side using localStorage to store user credentials and session data
- **No Backend Authentication**: The system relies on browser storage without server-side validation or security measures

## AI Integration
- **Google Gemini API**: Integrated to generate personalized learning paths and curated resources based on selected career paths
- **Dynamic Content Generation**: AI creates step-by-step learning plans, resource recommendations, and personalized content for each user's journey

## Data Management
- **Local Storage Strategy**: All user data, progress, and application state is stored in browser localStorage
- **No Database**: The application operates without a traditional database, keeping all data client-side

## User Interface Components
- **Modular CSS Architecture**: Styles are organized in a single CSS file with component-based class naming
- **Interactive Elements**: JavaScript provides dynamic interactions, form handling, and progress tracking
- **Visual Feedback**: Loading states, progress bars, and message systems provide user feedback

# External Dependencies

## AI Services
- **Google Gemini API**: Powers the AI-driven content generation for learning paths and resource curation
- **API Key Configuration**: Supports both local development and production API key management

## Package Dependencies
- **@google/genai (v1.16.0)**: Official Google Generative AI SDK for Node.js integration
- **Standard Web APIs**: Relies on browser localStorage and standard DOM APIs for functionality

## Third-Party Integrations
- **YouTube Resources**: Generated learning paths include YouTube video recommendations
- **Documentation Links**: AI generates links to official documentation and learning materials
- **Practice Platforms**: Integration recommendations for coding practice and project-based learning

## Browser Requirements
- **Modern Browser Support**: Requires browsers with ES6+ support and localStorage capabilities
- **No Server Dependencies**: Application runs entirely in the browser without backend infrastructure