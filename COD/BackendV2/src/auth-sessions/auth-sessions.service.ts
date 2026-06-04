import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthSession, User } from '../database/entities';

@Injectable()
export class AuthSessionsService {
  constructor(
    @InjectRepository(AuthSession)
    private readonly sessionRepository: Repository<AuthSession>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async login(phoneNumber: string, passwordPlaintext: string): Promise<{ token: string }> {
    const errorMessage = 'Invalid credentials or suspended account';
    const user = await this.userRepository.findOne({ where: { phone: phoneNumber } });

    if (!user || user.isSuspended) {
      throw new UnauthorizedException(errorMessage);
    }

    const passwordMatches = await bcrypt.compare(passwordPlaintext, user.passwordHash);

    if (!passwordMatches) {
      throw new UnauthorizedException(errorMessage);
    }

    await this.sessionRepository.update(
      { userId: user.id, isActive: true },
      { isActive: false },
    );

    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = this.hashToken(token);
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    await this.sessionRepository.save(
      this.sessionRepository.create({
        userId: user.id,
        tokenHash,
        isActive: true,
        expiresAt,
      }),
    );

    return { token };
  }

  async getUserForToken(token: string): Promise<User | null> {
    const tokenHash = this.hashToken(token);
    const session = await this.sessionRepository.findOne({
      where: { tokenHash, isActive: true },
    });

    if (!session || session.expiresAt.getTime() <= Date.now()) {
      return null;
    }

    const user = await this.userRepository.findOne({ where: { id: session.userId } });

    if (!user || user.isSuspended) {
      return null;
    }

    return user;
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}
