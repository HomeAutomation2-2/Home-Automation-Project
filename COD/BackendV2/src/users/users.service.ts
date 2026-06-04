import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  AccessEvent,
  AuthSession,
  BoilerEvent,
  LightEvent,
  User,
} from '../database/entities';
import { CreateUserDto } from './dto/create-user.dto';
import { presentUser, UserPresenceResponse, UserProfileResponse } from './user.presenter';

export type UnifiedLogResponse = {
  id: number;
  type: 'access' | 'lights' | 'boiler';
  message: string;
  occurred_at: Date;
};

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(AuthSession)
    private readonly sessionRepository: Repository<AuthSession>,
    @InjectRepository(AccessEvent)
    private readonly accessEventRepository: Repository<AccessEvent>,
    @InjectRepository(LightEvent)
    private readonly lightEventRepository: Repository<LightEvent>,
    @InjectRepository(BoilerEvent)
    private readonly boilerEventRepository: Repository<BoilerEvent>,
  ) {}

  async registerAccount(dto: CreateUserDto): Promise<UserProfileResponse> {
    const existingUser = await this.userRepository.findOne({
      where: [{ phone: dto.phone }, { cnp: dto.cnp }],
    });

    if (existingUser) {
      throw new ConflictException('A user with this phone number of CNP already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password_plaintext, 10);
    const user = await this.userRepository.save(
      this.userRepository.create({
        firstName: dto.firstName,
        lastName: dto.lastName,
        cnp: dto.cnp,
        phone: dto.phone,
        passwordHash,
        isAdmin: dto.isAdmin ?? false,
        isSuspended: false,
        isHome: false,
        btCodeHash: null,
        btCodeEpoch: null,
      }),
    );

    return presentUser(user);
  }

  async getMe(user: User): Promise<UserProfileResponse> {
    return presentUser(user);
  }

  async getDetailedProfileForAdmin(userId: number): Promise<UserProfileResponse> {
    const user = await this.findUserOrThrow(userId);
    return presentUser(user);
  }

  async getAllUsersPresence(): Promise<UserPresenceResponse[]> {
    const users = await this.userRepository.find({ order: { firstName: 'ASC' } });
    const accessEvents = await this.accessEventRepository.find({
      order: { occurredAt: 'DESC' },
    });

    return users.map((user) => {
      const lastEvent = accessEvents.find((event) => event.userId === user.id);

      return {
        id: user.id,
        first_name: user.firstName,
        last_name: user.lastName,
        is_home: user.isHome,
        is_suspended: user.isSuspended,
        last_access_event: lastEvent
          ? this.formatAccessEvent(lastEvent)
          : 'No access history',
      };
    });
  }

  async getUnifiedLogs(currentUser: User): Promise<UnifiedLogResponse[]> {
    const [users, accessEvents, lightEvents, boilerEvents] = await Promise.all([
      this.userRepository.find(),
      this.accessEventRepository.find({ order: { occurredAt: 'DESC' } }),
      this.lightEventRepository.find({ order: { occurredAt: 'DESC' } }),
      currentUser.isAdmin
        ? this.boilerEventRepository.find({ order: { occurredAt: 'DESC' } })
        : Promise.resolve([]),
    ]);
    const usersById = new Map(users.map((user) => [user.id, user]));
    const logs: UnifiedLogResponse[] = [];

    for (const event of accessEvents) {
      if (!currentUser.isAdmin && event.userId !== currentUser.id) {
        continue;
      }

      const user = event.userId ? usersById.get(event.userId) : undefined;
      const name = user ? `${user.firstName} ${user.lastName}` : 'Utilizator necunoscut';
      const action = event.direction === 'in' ? 'a intrat in casa' : 'a parasit casa';

      logs.push({
        id: event.id,
        type: 'access',
        message: `${name} ${action} la ora ${this.formatTime(event.occurredAt)}`,
        occurred_at: event.occurredAt,
      });
    }

    for (const event of lightEvents) {
      if (!currentUser.isAdmin && event.userId !== currentUser.id) {
        continue;
      }

      const user = event.userId ? usersById.get(event.userId) : undefined;
      const name = user ? `${user.firstName} ${user.lastName}` : 'System';

      logs.push({
        id: event.id,
        type: 'lights',
        message: `${name} a schimbat lumina in zona ${event.zoneId ?? 'necunoscuta'} -> ${event.newState ? 'ON' : 'OFF'}`,
        occurred_at: event.occurredAt,
      });
    }

    for (const event of boilerEvents) {
      logs.push({
        id: event.id,
        type: 'boiler',
        message: `Centrala a fost ${event.newState ? 'pornita' : 'oprita'} la ora ${this.formatTime(event.occurredAt)}`,
        occurred_at: event.occurredAt,
      });
    }

    return logs.sort(
      (left, right) => right.occurred_at.getTime() - left.occurred_at.getTime(),
    );
  }

  async suspendUser(userId: number): Promise<{ message: string; is_suspended: boolean }> {
    const user = await this.findUserOrThrow(userId);
    user.isSuspended = !user.isSuspended;
    await this.userRepository.save(user);

    if (user.isSuspended) {
      await this.sessionRepository.update(
        { userId: user.id, isActive: true },
        { isActive: false },
      );
    }

    return {
      message: 'User status updated successfully',
      is_suspended: user.isSuspended,
    };
  }

  async deleteUser(userId: number): Promise<{ message: string }> {
    const user = await this.findUserOrThrow(userId);
    await this.sessionRepository.delete({ userId: user.id });
    await this.userRepository.remove(user);

    return { message: `User with ID ${userId} has been permanently deleted` };
  }

  private async findUserOrThrow(userId: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    return user;
  }

  private formatAccessEvent(event: AccessEvent): string {
    const action = event.direction === 'in' ? 'Entered' : 'Left';
    return `${action} at ${this.formatTime(event.occurredAt)}`;
  }

  private formatTime(value: Date): string {
    return value.toLocaleTimeString('ro-RO', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
