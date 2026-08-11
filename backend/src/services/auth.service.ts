import prisma from '../config/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { LoginInput } from '../validators/auth.validator';

export class AuthService {
  static async login(input: LoginInput) {
    const { email, password } = input;

    // Find user in PostgreSQL
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      throw { statusCode: 401, message: 'Invalid email or password' };
    }

    // Verify bcrypt password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw { statusCode: 401, message: 'Invalid email or password' };
    }

    // Generate JWT token
    const secret = process.env.JWT_SECRET || 'fallback-super-secret-jwt-key';
    const payload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    const token = jwt.sign(payload, secret, { expiresIn: '24h' });

    // Safe user payload without password
    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    return { token, user: safeUser };
  }

  static async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw { statusCode: 404, message: 'User profile not found' };
    }

    return user;
  }
}
