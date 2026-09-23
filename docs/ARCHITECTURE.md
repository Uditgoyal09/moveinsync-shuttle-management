# CampusRide Architecture

## Core Technology Stack
- **Framework:** React 18, utilizing Vite for fast HMR and optimized builds.
- **Language:** TypeScript for end-to-end type safety.
- **Styling:** Tailwind CSS v4 for utility-first styling, enabling rapid implementation of our design tokens.

## Data Flow & State Management
- **Server State (TanStack Query):** Manages all asynchronous data fetching, caching, invalidation, and synchronization with our Mock API (MSW). This avoids storing server data in global client state.
- **Client State (Zustand):** Handles purely UI-driven global state, such as active theme (light/dark), active user role (Admin/Rider), and transient states like active drawer contexts.
- **Form State (React Hook Form):** Localized form state management, ensuring optimal rendering performance by avoiding uncontrolled re-renders. Combined with Zod for robust schema validation.

## Domain Layer
The `src/domain` directory contains the core business logic uncoupled from UI components:
- `types.ts`: Interfaces for core entities (`Booking`, `Driver`, `Route`, `Vehicle`, etc.).
- `bookingMachine.ts`: Defines the strict state machine for booking status transitions (e.g., preventing a cancelled booking from becoming completed).
- `validation.ts`: Zod schemas mirroring the types for runtime validation.

## Mock API Layer (MSW)
The application relies on MSW to intercept requests at the network level. Handlers simulate realistic network latency and handle complex server-side operations (e.g., driver schedule overlap detection) to accurately portray how a production backend would behave.

## Project Structure
```text
src/
├── app/          # App initialization, routing, layout
├── domain/       # Core types, state machines, business rules
├── features/     # Feature-sliced modules (bookings, drivers, routes, rider, analytics)
├── shared/       # Shared UI components, hooks, utilities
├── mocks/        # MSW handlers and seed data
└── stores/       # Zustand stores
```
