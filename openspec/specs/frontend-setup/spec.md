# frontend-setup Specification

## Purpose
TBD - created by archiving change setup000. Update Purpose after archive.
## Requirements
### Requirement: Frontend project initialized with Vite + React + TypeScript
The frontend SHALL be initialized using Vite as the build tool, with React 18.x and TypeScript 5.x properly configured.

#### Scenario: Vite project structure exists
- **WHEN** inspecting the `frontend/` directory
- **THEN** it SHALL contain Vite configuration (vite.config.ts), TypeScript configuration (tsconfig.json), and package.json with react, react-dom, typescript, and vite as dependencies

#### Scenario: Development server runs correctly
- **WHEN** running `npm run dev` in the frontend directory
- **THEN** the Vite dev server SHALL start on http://localhost:5173 with hot module replacement enabled

### Requirement: Feature-Sliced Design architecture implemented
The frontend SHALL follow Feature-Sliced Design (FSD) methodology with layers: app, pages, widgets, features, entities, and shared.

#### Scenario: FSD layer directories exist
- **WHEN** inspecting `frontend/src/`
- **THEN** it SHALL contain directories: app/, pages/, widgets/, features/, entities/, shared/

#### Scenario: Import flow follows FSD rules
- **WHEN** code in the pages layer imports from another layer
- **THEN** it SHALL only import from layers below it (pages can import from widgets, features, entities, shared; NOT from other pages)

### Requirement: Tailwind CSS configured
The frontend SHALL have Tailwind CSS 3.x configured and integrated with Vite via PostCSS.

#### Scenario: Tailwind processes utility classes
- **WHEN** a React component uses Tailwind utility classes (e.g., `className="bg-blue-500 p-4"`)
- **THEN** the classes SHALL be included in the build output and applied correctly in the browser

### Requirement: State management with Zustand and TanStack Query
The frontend SHALL use Zustand for client state (cart, auth session, UI state) and TanStack Query for server state (products, orders, remote data with caching).

#### Scenario: Zustand store for client state
- **WHEN** the application needs to manage cart items or auth session
- **THEN** it SHALL use Zustand stores (e.g., useCartStore, useAuthStore) with TypeScript types

#### Scenario: TanStack Query for server state
- **WHEN** the application needs to fetch products or orders from the backend
- **THEN** it SHALL use TanStack Query hooks (useQuery, useMutation) with proper TypeScript typing and caching behavior

### Requirement: HTTP client with Axios and interceptors
The frontend SHALL configure Axios with interceptors that automatically attach JWT tokens to requests and handle token refresh.

#### Scenario: Axios attaches JWT to requests
- **WHEN** a request is made to the backend API
- **THEN** the Axios interceptor SHALL attach the Authorization header with the JWT token (if available)

#### Scenario: Axios handles token refresh
- **WHEN** a request returns HTTP 401 (Unauthorized) due to expired token
- **THEN** the Axios interceptor SHALL attempt to refresh the token using the refresh token and retry the original request

