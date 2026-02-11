import { User } from '@/backend/models';
import { mockUsers } from '@/backend/lib/mockData';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

class AuthService {
  private users: User[] = mockUsers;

  async registerUser(email: string, password: string, name: string): Promise<User | null> {
    // Check if user already exists
    const existingUser = this.users.find(u => u.email === email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser: User = {
      id: uuidv4(),
      email,
      name,
      password: hashedPassword,
      createdAt: new Date(),
    };

    this.users.push(newUser);
    return this.sanitizeUser(newUser);
  }

  async loginUser(email: string, password: string): Promise<User | null> {
    const user = this.users.find(u => u.email === email);
    if (!user || !user.password) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return null;
    }

    return this.sanitizeUser(user);
  }

  getUserById(userId: string): User | undefined {
    const user = this.users.find(u => u.id === userId);
    return user ? this.sanitizeUser(user) : undefined;
  }

  getUserByEmail(email: string): User | undefined {
    const user = this.users.find(u => u.email === email);
    return user ? this.sanitizeUser(user) : undefined;
  }

  private sanitizeUser(user: User): User {
    const { password, ...sanitizedUser } = user;
    return sanitizedUser as User;
  }
}

export const authService = new AuthService();
