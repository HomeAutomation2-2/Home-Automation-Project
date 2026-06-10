import { Controller, Get, Param, ParseIntPipe, Patch, Query, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { AdminSessionGuard } from '../users/guards/admin-session.guard';

@Controller('notifications')
@UseGuards(AdminSessionGuard)
export class NotificationsController
{
    constructor(private readonly notificationsService: NotificationsService) {}

    @Get()
    async list(@Query('unread_only') unreadOnly?: string)
    {
        const notifications = await this.notificationsService.findAllForAdmin(
            unreadOnly === 'true',
        );
        const unreadCount = await this.notificationsService.countUnread();
        return { notifications, unreadCount };
    }

    @Patch('read-all')
    async markAllRead()
    {
        return this.notificationsService.markAllRead();
    }

    @Patch(':id/read')
    async markRead(@Param('id', ParseIntPipe) id: number)
    {
        return this.notificationsService.markRead(id);
    }
}
