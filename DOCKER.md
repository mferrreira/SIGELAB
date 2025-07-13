# 🐳 Docker Setup for Jogos Application

This guide explains how to run the Jogos application using Docker.

## 📋 Prerequisites

- Docker Desktop installed and running
- Docker Compose installed

## 🚀 Quick Start

### Option 1: Automated Setup (Recommended)

Run the setup script to automatically build, start, and configure everything:

```bash
./scripts/docker-setup.sh
```

This script will:
- Stop any existing containers
- Build and start the application
- Wait for PostgreSQL to be ready
- Run database migrations
- Create the admin user

### Option 2: Manual Setup

#### 1. Build and Start Services

```bash
# Production
docker-compose up -d

# Development (with hot reloading)
docker-compose -f docker-compose.dev.yml up -d
```

#### 2. Run Database Migrations

```bash
docker-compose exec app npx prisma db push
```

#### 3. Create Admin User

```bash
docker-compose exec app node -e "
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    const hashedPassword = await bcrypt.hash('123', 10);
    
    const adminUser = await prisma.users.create({
      data: {
        name: 'Admin',
        email: 'admin@example.com',
        role: 'administrador_laboratorio',
        password: hashedPassword,
        status: 'active',
        points: 0,
        completedTasks: 0,
        weekHours: 40
      }
    });
    
    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@example.com');
    console.log('🔑 Password: 123');
  } catch (error) {
    if (error.code === 'P2002') {
      console.log('ℹ️ Admin user already exists');
    } else {
      console.error('❌ Error creating admin user:', error);
    }
  } finally {
    await prisma.\$disconnect();
  }
}

createAdminUser();
"
```

## 🌐 Access the Application

- **Application**: http://localhost:3000
- **Admin Login**: admin@example.com / 123

## 📦 Docker Commands

### Start Services
```bash
# Production
docker-compose up -d

# Development
docker-compose -f docker-compose.dev.yml up -d
```

### Stop Services
```bash
# Production
docker-compose down

# Development
docker-compose -f docker-compose.dev.yml down
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f app
docker-compose logs -f postgres
```

### Rebuild Application
```bash
# Production
docker-compose build --no-cache app
docker-compose up -d

# Development
docker-compose -f docker-compose.dev.yml build --no-cache app
docker-compose -f docker-compose.dev.yml up -d
```

### Access Container Shell
```bash
# Application container
docker-compose exec app sh

# Database container
docker-compose exec postgres psql -U jogos -d jogos
```

### Database Operations
```bash
# Run migrations
docker-compose exec app npx prisma db push

# Generate Prisma client
docker-compose exec app npx prisma generate

# Open Prisma Studio
docker-compose exec app npx prisma studio
```

## 🔧 Configuration

### Environment Variables

The application uses the following environment variables:

- `DATABASE_URL`: PostgreSQL connection string
- `NEXTAUTH_URL`: NextAuth.js URL
- `NEXTAUTH_SECRET`: NextAuth.js secret key
- `NODE_ENV`: Environment (development/production)

### Database Connection

- **Host**: localhost (or `postgres` from within containers)
- **Port**: 5432
- **Database**: jogos
- **Username**: jogos
- **Password**: jogos123

## 🗂️ File Structure

```
├── Dockerfile              # Production Docker image
├── Dockerfile.dev          # Development Docker image
├── docker-compose.yml      # Production services
├── docker-compose.dev.yml  # Development services
├── .dockerignore           # Files to exclude from build
└── scripts/
    └── docker-setup.sh     # Automated setup script
```

## 🐛 Troubleshooting

### Port Already in Use
If port 3000 is already in use, the application will automatically try port 3001.

### Database Connection Issues
1. Check if PostgreSQL container is running: `docker-compose ps`
2. Check PostgreSQL logs: `docker-compose logs postgres`
3. Ensure database is ready: `docker-compose exec postgres pg_isready -U jogos -d jogos`

### Application Build Issues
1. Clear Docker cache: `docker system prune -a`
2. Rebuild without cache: `docker-compose build --no-cache`
3. Check build logs: `docker-compose build app`

### Permission Issues
If you encounter permission issues with the setup script:
```bash
chmod +x scripts/docker-setup.sh
```

## 🧹 Cleanup

To completely remove all containers, volumes, and images:

```bash
# Stop and remove containers
docker-compose down

# Remove volumes (WARNING: This will delete all data)
docker-compose down -v

# Remove images
docker-compose down --rmi all

# Clean up Docker system
docker system prune -a
```

## 📝 Development vs Production

### Development
- Uses `docker-compose.dev.yml`
- Hot reloading enabled
- Source code mounted as volume
- Development environment variables

### Production
- Uses `docker-compose.yml`
- Optimized build
- Standalone output
- Production environment variables 