# MediLink Frontend

Frontend application for the MediLink platform, built with React, Vite, TypeScript, and TailwindCSS.

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation
1. Navigate to the project directory:
   ```bash
   cd medilink-frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

### Development
Start the development server:
```bash
npm run dev
```

### Build
Build for production:
```bash
npm run build
```

### Testing
Run unit tests:
```bash
npm run test
```

## 🏗 Project Structure

The project follows a modular structure by domain:

```
src/
  ├── modules/
  │   ├── auth/          # Authentication related components/pages
  │   ├── dashboard/     # Dashboard pages
  │   ├── patients/      # Patient management
  │   └── shared/        # Shared components, hooks, layouts
  ├── routes/            # Application routing
  ├── assets/            # Static assets
  └── App.tsx            # Main application component
```

## 🛠 Tech Stack
- **Framework**: React + Vite
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Routing**: React Router DOM
- **Testing**: Vitest + React Testing Library
- **Linting**: ESLint + Prettier
