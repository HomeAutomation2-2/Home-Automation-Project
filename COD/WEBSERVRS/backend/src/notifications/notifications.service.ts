import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { User } from '../users/entities/user.entity';

const CURFEW_END_HOUR = 6;
const TEMP_ALERT_DEBOUNCE_MINUTES = 30;

@Injectable()
export class NotificationsService
{
    constructor(
        @InjectRepository(Notification)
        private readonly notificationsRepository: Repository<Notification>,

        @InjectRepository(User)
        private readonly usersRepository: Repository<User>,
    ) {}

    async findAllForAdmin(unreadOnly = false): Promise<Notification[]>
    {
        return this.notificationsRepository.find({
            where: unreadOnly ? { isRead: false } : {},
            order: { createdAt: 'DESC' },
            take: 50,
        });
    }

    async countUnread(): Promise<number>
    {
        return this.notificationsRepository.count({ where: { isRead: false } });
    }

    async markRead(id: number): Promise<Notification>
    {
        const notification = await this.notificationsRepository.findOne({ where: { id } });
        if (!notification)
            throw new NotFoundException('Notification not found');

        notification.isRead = true;
        return this.notificationsRepository.save(notification);
    }

    async markAllRead(): Promise<{ updated: number }>
    {
        const result = await this.notificationsRepository.update(
            { isRead: false },
            { isRead: true },
        );
        return { updated: result.affected ?? 0 };
    }

    async handleChildEntry(userId: number, occurredAt: Date): Promise<void>
    {
        const user = await this.usersRepository.findOne({ where: { id: userId } });
        if (!user || !user.isChild || user.allowReturnAfterMidnight)
            return;

        if (!this.isAfterMidnightCurfew(occurredAt))
            return;

        await this.notificationsRepository.save(
            this.notificationsRepository.create({
                type: 'child_late_return',
                severity: 'warning',
                title: 'Întoarcere după miezul nopții',
                message: `${user.firstName} ${user.lastName} a intrat acasă la ${this.formatTime(occurredAt)}.`,
                relatedUserId: user.id,
                relatedRoomId: null,
                isRead: false,
            }),
        );
    }

    async maybeCreateTemperatureAlert(
        roomId: number,
        roomName: string,
        temp: number,
        threshold: number,
    ): Promise<void>
    {
        if (temp <= threshold)
            return;

        const recent = await this.hasRecentTemperatureAlert(roomId);
        if (recent)
            return;

        await this.notificationsRepository.save(
            this.notificationsRepository.create({
                type: 'temperature_critical',
                severity: 'critical',
                title: 'Temperatură critică',
                message: `Camera ${roomName} raportează ${temp.toFixed(1)}°C (prag: ${threshold.toFixed(1)}°C).`,
                relatedUserId: null,
                relatedRoomId: roomId,
                isRead: false,
            }),
        );
    }

    private isAfterMidnightCurfew(occurredAt: Date): boolean
    {
        const hour = occurredAt.getHours();
        return hour >= 0 && hour < CURFEW_END_HOUR;
    }

    private formatTime(date: Date): string
    {
        return date.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' });
    }

    private async hasRecentTemperatureAlert(roomId: number): Promise<boolean>
    {
        const since = new Date(Date.now() - TEMP_ALERT_DEBOUNCE_MINUTES * 60 * 1000);
        const count = await this.notificationsRepository.count({
            where: {
                type: 'temperature_critical',
                relatedRoomId: roomId,
                isRead: false,
                createdAt: MoreThan(since),
            },
        });
        return count > 0;
    }
}
