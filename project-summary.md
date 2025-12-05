# Project Summary: gacc-auth

## Overview

This is an Angular application named `gacc-auth`. The project structure suggests a focus on authentication and a dashboard, likely serving as a foundation for a larger application requiring user management. It is built with a modern Angular stack, leveraging standalone components, signals for state management, and a clean, feature-based architecture.

## Key Technologies

*   **Framework**: [Angular](https://angular.dev/)
*   **UI Components**: [Angular Material](https://material.angular.io/)
*   **State Management**: [NgRx Signals](https://ngrx.io/guide/signals)
*   **Backend Integration**: [AngularFire](https://github.com/angular/angularfire) for Firebase services.
*   **Styling**: SCSS
*   **Package Manager**: bun

## Features

The application is divided into two main features:

*   **Authentication**: Handles user sign-in. It includes a sign-in page and is protected by a guard (`auth.guard`), which likely prevents authenticated users from accessing the sign-in page again.
*   **Dashboard**: A protected area of the application, accessible after successful authentication. It has a home page and is protected by a `dashboard.guard`.

## Project Structure

The project follows a clean and scalable architecture, with a clear separation of concerns:

```
src/app/
├── core/         # Core services, guards, and models.
├── features/     # Application features (auth, dashboard).
│   ├── auth/
│   └── dashboard/
└── shared/       # Shared components, directives, and pipes.
```

The application uses lazy loading for its feature modules to improve initial load performance.

## Available Scripts

*   `bun start`: Starts the development server at `http://localhost:4200/`.
*   `bun build`: Builds the application for production.
*   `bun test`: Runs unit tests using Karma and Jasmine.
