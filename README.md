# ProcureFlow - Project Procurement Management

A modern procurement management application built with Next.js, designed to streamline project-wise purchases, track budgets, and manage purchase requisitions.

## Features

- **Project Management**: Track multiple projects with individual budgets
- **Purchase Requisitions**: Create and manage PRs with approval workflows
- **Budget Tracking**: Monitor spending against approved budgets
- **Material Management**: Track materials across different projects
- **Real-time Dashboard**: Comprehensive overview of procurement status
- **Modern UI**: Built with Shadcn/UI and Tailwind CSS

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/UI
- **Icons**: Lucide React
- **State Management**: React Query (TanStack Query)
- **Forms**: React Hook Form with Zod validation

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <YOUR_REPO_URL>

# Navigate to the project directory
cd projectprocure

# Install dependencies
npm install

# Start the development server
npm run dev
```

The application will be available at `http://localhost:3000`

## Project Structure

```
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   ├── dashboard/         # Dashboard pages
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/               # Shadcn/UI components
│   ├── Header.tsx        # Navigation header
│   ├── Hero.tsx          # Landing page hero
│   ├── Features.tsx      # Features section
│   └── Dashboard.tsx     # Main dashboard
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions
└── public/               # Static assets
```

## Development

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## Deployment

This project can be deployed to various platforms:

- **Vercel** (recommended for Next.js)
- **Netlify**
- **Railway**
- **AWS Amplify**

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.
