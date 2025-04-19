import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { generateToken } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

export async function POST(request: Request) {
  try {
    const { providerName, admin } = await request.json();

    // Validate input
    if (!providerName || !admin?.name || !admin?.email || !admin?.password) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if provider with this name already exists
    const existingProvider = await prisma.provider.findUnique({
      where: { name: providerName },
    });

    if (existingProvider) {
      return NextResponse.json(
        { message: 'Provider with this name already exists' },
        { status: 400 }
      );
    }

    // Check if user with this email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: admin.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hash(admin.password, 10);

    // Create provider and admin user in a transaction
    const result = await prisma.$transaction(async (tx: PrismaClient) => {
      // Create provider
      const provider = await tx.provider.create({
        data: {
          name: providerName,
          status: 'active',
        },
      });

      // Create admin user
      const user = await tx.user.create({
        data: {
          name: admin.name,
          email: admin.email,
          password: hashedPassword,
          role: 'admin',
          providerId: provider.id,
        },
      });

      return { provider, user };
    });

    // Generate JWT token
    const token = generateToken({
      id: result.user.id,
      email: result.user.email,
      role: result.user.role,
      providerId: result.user.providerId,
    });

    return NextResponse.json({
      message: 'Provider and admin user created successfully',
      token,
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        role: result.user.role,
        providerId: result.user.providerId,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 