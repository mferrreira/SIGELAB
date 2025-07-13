#!/bin/bash

echo "🚀 Setting up Jogos application with Docker..."

# Stop any existing containers
echo "📦 Stopping existing containers..."
docker-compose down

# Build and start the application
echo "🔨 Building and starting containers..."
docker-compose up -d

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 10

# Run database migrations
echo "🗄️ Running database migrations..."
docker-compose exec app npx prisma db push

# Create admin user
echo "👤 Creating admin user..."
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

echo "✅ Setup complete!"
echo "🌐 Application is running at: http://localhost:3000"
echo "👤 Admin login: admin@example.com / 123" 