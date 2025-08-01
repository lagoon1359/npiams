# Academic Management System

A comprehensive academic management platform for educational institutions to manage courses, programs, assessments, and grades.

## 🚀 Features

### Core Academic Management
- **Course Management** - Create, organize and manage academic courses
- **Program Administration** - Design and manage academic programs
- **Assessment Tools** - Create various types of assessments and evaluations
- **Grade Management** - Record, calculate and track student grades

### Technical Highlights
- **Modern Stack**: Next.js 15, React 18, TypeScript
- **Database**: Supabase (PostgreSQL) with real-time features
- **UI Components**: shadcn/ui with Radix UI primitives
- **Styling**: Tailwind CSS for responsive design
- **Authentication**: Supabase Auth with role-based access

## 🛠️ Quick Start

### Prerequisites
- Node.js 18+ (or Bun runtime)
- Supabase account (for database)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/lagoon1359/npiams.git
cd npiams
```

2. **Install dependencies**
```bash
# Using Bun (recommended)
bun install

# Or using npm
npm install
```

3. **Environment Setup**
```bash
cp .env.example .env.local
```

Add your Supabase credentials to `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **Database Setup**
- Create a new Supabase project
- Run the SQL scripts in `/database/` folder to set up tables
- Configure Row Level Security (RLS) policies

5. **Development Server**
```bash
# Using Bun
bun dev

# Or using npm
npm run dev
```

Visit `http://localhost:3000` to see the application.

## 📁 Project Structure

```
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── courses/         # Course management
│   │   ├── programs/        # Program administration
│   │   ├── assessments/     # Assessment tools
│   │   ├── student-grades/  # Grade management
│   │   └── dashboard/       # Main dashboard
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # shadcn/ui components
│   │   └── layout/         # Layout components
│   ├── contexts/           # React contexts (Auth, etc.)
│   ├── lib/               # Utilities and configurations
│   └── types/             # TypeScript type definitions
├── database/              # Database schema and scripts
└── public/               # Static assets
```

## 🎯 Usage

### For Administrators
- Access the **Admin Dashboard** for system-wide overview
- Manage **Departments** and **Programs**
- Oversee **Course Creation** and curriculum
- Monitor **Assessment Performance** and grades

### For Instructors
- Create and manage **Courses**
- Design **Assessments** and evaluations
- Record and track **Student Grades**
- Generate academic reports

### For Students
- View enrolled **Courses** and schedules
- Check **Grades** and academic progress
- Access **Assessment Results** and feedback

## 🚀 Deployment

### Using Vercel (Recommended)
```bash
# Deploy to Vercel
vercel --prod
```

### Using Netlify
```bash
# Build the project
bun run build

# Deploy to Netlify
netlify deploy --prod --dir=.next
```

### Environment Variables for Production
```env
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 🔧 Development

### Available Scripts
```bash
bun dev          # Start development server
bun build        # Build for production
bun start        # Start production server
bun lint         # Run ESLint
bun format       # Format code with Biome
```

### Database Management
```bash
# Reset database (development only)
npm run db:reset

# Push schema changes
npm run db:push

# Generate types
npm run db:generate-types
```

## 📖 Documentation

- [API Documentation](./docs/api.md)
- [Database Schema](./docs/database.md)
- [Component Library](./docs/components.md)
- [Deployment Guide](./docs/deployment.md)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/lagoon1359/npiams/issues)
- **Discussions**: [GitHub Discussions](https://github.com/lagoon1359/npiams/discussions)
- **Email**: Support contact (if available)

## 🏗️ Built With

- [Next.js](https://nextjs.org/) - React framework
- [Supabase](https://supabase.com/) - Backend as a Service
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [shadcn/ui](https://ui.shadcn.com/) - Component library
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Bun](https://bun.sh/) - JavaScript runtime

---

**Academic Management System** - Streamlining educational operations for the digital age.
