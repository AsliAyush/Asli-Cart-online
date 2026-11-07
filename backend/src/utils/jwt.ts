import jwt, { SignOptions } from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../config/env.js';
import { JwtTokenPayload } from '../types/index.js';

export class JwtUtil {
  static signAccessToken(payload: JwtTokenPayload): string {
    const options: SignOptions = {
      expiresIn: env.JWT_ACCESS_EXPIRES_IN as any,
      jwtid: crypto.randomUUID(),
    };
    return jwt.sign(payload, env.JWT_ACCESS_SECRET, options);
  }

  static signRefreshToken(payload: JwtTokenPayload): string {
    const options: SignOptions = {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN as any,
      jwtid: crypto.randomUUID(),
    };
    return jwt.sign(payload, env.JWT_REFRESH_SECRET, options);
  }

  static verifyAccessToken(token: string): JwtTokenPayload {
    return jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtTokenPayload;
  }

  static verifyRefreshToken(token: string): JwtTokenPayload {
    return jwt.verify(token, env.JWT_REFRESH_SECRET) as JwtTokenPayload;
  }

  static hashToken(rawToken: string): string {
    return crypto.createHash('sha256').update(rawToken).digest('hex');
  }

  static getRefreshTokenExpiryDate(): Date {
    // Parse duration string e.g., '7d', '24h', '30d' or fallback to 7 days
    const durationStr = env.JWT_REFRESH_EXPIRES_IN;
    let days = 7;
    if (durationStr.endsWith('d')) {
      days = parseInt(durationStr.replace('d', ''), 10) || 7;
    } else if (durationStr.endsWith('h')) {
      const hours = parseInt(durationStr.replace('h', ''), 10) || 168;
      return new Date(Date.now() + hours * 60 * 60 * 1000);
    }
    return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  }
}
