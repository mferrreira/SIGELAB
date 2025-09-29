import { NextResponse } from 'next/server'
import { prisma } from '@/lib/database/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json()

    // Validações básicas
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Nome, email e senha são obrigatórios' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'A senha deve ter pelo menos 6 caracteres' },
        { status: 400 }
      )
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Verificar se o email já existe
    const existingUser = await prisma.users.findUnique({
      where: { email: normalizedEmail }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Este email já está em uso' },
        { status: 400 }
      )
    }

    // Criptografar a senha (usando a mesma lógica do NextAuth)
    const hashedPassword = await bcrypt.hash(password, 12)

    // Criar usuário com status pending
    const user = await prisma.users.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        status: 'pending',
        roles: [], // Roles vazias inicialmente
        weekHours: 0, // Carga horária será definida na aprovação
        points: 0,
        completedTasks: 0,
        currentWeekHours: 0,
        profileVisibility: 'public'
      },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        createdAt: true
      }
    })

    return NextResponse.json({
      message: 'Conta criada com sucesso! Sua solicitação será analisada por um coordenador ou gerente.',
      user
    }, { status: 201 })

  } catch (error: any) {
    console.error('Erro no registro:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
