# CampusRide Architecture Decisions Log

## 1. Mock API Implementation
**Decision**: Use MSW (Mock Service Worker) instead of a simple static JSON file or in-memory store.
**Alternative**: Simple React state, local storage, or static `.json` files.
**Reason**: MSW intercepts requests at the network level, meaning our frontend code (TanStack Query, `fetch` calls) can be written exactly as it would be for a real production backend. It allows us to simulate network latency, server errors (500s), and conflict errors (409s).
**Trade-off**: Requires more upfront setup time and modeling the backend logic in the frontend.

## 2. State Management Strategy
**Decision**: Separate Server State (TanStack Query) and Client State (Zustand).
**Alternative**: Put all state in Redux or Context API.
**Reason**: Server state is inherently out-of-date and async. TanStack Query handles caching, refetching, and deduping automatically. Client state (UI toggles) is synchronous. Splitting them avoids massive boilerplate and performance bottlenecks.
**Trade-off**: Managing two different state management libraries.

## 3. Form Management and Validation
**Decision**: Use React Hook Form + Zod.
**Alternative**: Formik + Yup, or manual controlled inputs.
**Reason**: React Hook Form minimizes re-renders, which is critical for complex forms (like the booking creation or route editor). Zod provides strict type inference that bridges validation schemas to our domain types effortlessly.
**Trade-off**: Slight learning curve compared to simple controlled forms.
