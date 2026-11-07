import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;

export class PasswordUtil {
  static async hash(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
  }

  static async compare(plainText: string, passwordHash: string): Promise<boolean> {
    return bcrypt.compare(plainText, passwordHash);
  }

  static isStrongPassword(password: string): { valid: boolean; reasons: string[] } {
    const reasons: string[] = [];
    if (password.length < 8) {
      reasons.push('Password must be at least 8 characters long');
    }
    if (!/[A-Z]/.test(password)) {
      reasons.push('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      reasons.push('Password must contain at least one lowercase letter');
    }
    if (!/[0-9]/.test(password)) {
      reasons.push('Password must contain at least one digit');
    }
    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
      reasons.push('Password must contain at least one special character');
    }
    return {
      valid: reasons.length === 0,
      reasons,
    };
  }
}

