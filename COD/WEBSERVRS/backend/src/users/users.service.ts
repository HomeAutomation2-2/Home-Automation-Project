import { ConflictException, Injectable, NotFoundException, Session, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { DataSource, Repository } from 'typeorm';
import * as bcrypt from "bcrypt"
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UserResponse } from './dto/user-response.dto';
import { AccessEvent } from '../events/entities/access-event.entity';
import { UnifiedLog } from './dto/unified-log.dto';
import { LogType } from './dto/log-type.dto';
import { AuthSession } from '../auth-sessions/entities/auth-session.entity';
import { DevicesService } from '../devices/devices.service';


@Injectable()
export class UsersService 
{
    constructor(
        private dataSource: DataSource,

        @InjectRepository(User)
        private readonly user_repository: Repository<User>,

        @InjectRepository(AccessEvent)
        private readonly access_event_repository: Repository<AccessEvent>,

        @InjectRepository(AuthSession)
        private readonly session_repository: Repository<AuthSession>,

        private readonly devicesService: DevicesService
    ) {}


    /**
     * Search for a user by their phone number.
     * @param phone_number The phone number of the user.
     * @returns The user with the phone number or `null`.
     */
    async findByPhone(phone_number: string): Promise<User|null>
    {
        return await this.user_repository.findOne({
            where: { phone: phone_number }
        })
    }


    /**
     * Create a new user.
     * @param new_user An object containing the new user data.
     * @returns The new user.
     */
    async registerAccount(new_user: CreateUserDto): Promise<UserResponse>
    {
        const existing_user = await this.user_repository.findOne({
            where: [{ phone: new_user.phone }, { cnp: new_user.cnp }]
        })

        if (existing_user)
            throw new ConflictException("A user with this phone number of CNP already exists")

        const salt = await bcrypt.genSalt()
        const hashed_password = await bcrypt.hash(new_user.password_plaintext, salt)

        const user = this.user_repository.create({
            ...new_user,
            passwordHash: hashed_password
        })
        
        const saved_user = await this.user_repository.save(user)
        const { passwordHash, ...user_without_hash } = saved_user
        
        return user_without_hash as UserResponse
    }


    async getFormattedProfile(userId: number) 
    {
        const user = await this.user_repository.findOne({ where: { id: userId } });
        if (!user) throw new NotFoundException('User not found');

        const lastEvent = await this.access_event_repository.findOne({
            where: { userId: user.id },
            order: { occurredAt: 'DESC' }
        });

        let lastEventText = "No access history";
        
        if (lastEvent) {
            const timeString = lastEvent.occurredAt.toLocaleTimeString('ro-RO', {
                hour: '2-digit',
                minute: '2-digit',
            });
            
            const action = lastEvent.direction === 'in' ? 'Entered' : 'Left';
            lastEventText = `${action} at ${timeString}`;
        }

        return {
            first_name: user.firstName,
            last_name: user.lastName,
            is_home: user.isHome,
            is_suspended: user.isSuspended,
            last_access_event: lastEventText
        };
    }

    async getAllUsersPresence() 
    {
        // 1. Luăm toți utilizatorii din baza de date
        const users = await this.user_repository.find({
            order: { firstName: 'ASC' }
        });

        // 2. Luăm cel mai recent eveniment pentru FIECARE utilizator folosind QueryBuilder
        // Folosim DISTINCT ON (PostgreSQL specific) pentru a lua doar rândul cel mai nou per user_id
        const lastEvents = await this.access_event_repository
            .createQueryBuilder('event')
            .distinctOn(['event.user_id'])
            .orderBy('event.user_id')
            .addOrderBy('event.occurred_at', 'DESC')
            .getMany();

        // 3. Mapăm evenimentele într-un Dicționar { [userId]: event } pentru căutare rapidă O(1)
        const eventsMap = new Map<number, AccessEvent>();
        lastEvents.forEach(event => {
            if (event.userId) eventsMap.set(event.userId, event);
        });

        // 4. Compilăm vectorul final cu datele formatate pentru fiecare utilizator
        return users.map(user => {
            const lastEvent = eventsMap.get(user.id);
            let lastEventText = "No access history";

            if (lastEvent) {
                const timeString = lastEvent.occurredAt.toLocaleTimeString('ro-RO', {
                    hour: '2-digit',
                    minute: '2-digit',
                });
                const action = lastEvent.direction === 'in' ? 'Entered' : 'Left';
                lastEventText = `${action} at ${timeString}`;
            }

            return {
                id: user.id,
                first_name: user.firstName,
                last_name: user.lastName,
                is_home: user.isHome,
                is_suspended: user.isSuspended,
                last_access_event: lastEventText
            };
        });
    }


    async getUnifiedLogs(currentUser: User): Promise<UnifiedLog[]> 
    {
        let rawLogs: any[] = [];

        if (currentUser.isAdmin) 
        {
            rawLogs = await this.dataSource.query(`
                SELECT 
                    a.id, 
                    'access' AS type, 
                    a.direction AS detail_1, 
                    NULL AS detail_2,
                    u.first_name, u.last_name,
                    a.occurred_at
                FROM access_events a
                LEFT JOIN users u ON a.user_id = u.id
                
                UNION ALL
                
                SELECT 
                    l.id, 
                    'lights' AS type, 
                    CASE WHEN l.new_state THEN 'ON' ELSE 'OFF' END AS detail_1, 
                    CAST(l.zone_id AS VARCHAR) AS detail_2,
                    u.first_name, u.last_name,
                    l.occurred_at
                FROM light_events l
                LEFT JOIN users u ON l.user_id = u.id
                
                UNION ALL
                
                SELECT 
                    b.id, 
                    'boiler' AS type, 
                    CASE WHEN b.new_state THEN 'ON' ELSE 'OFF' END AS detail_1, 
                    NULL AS detail_2,
                    'System' AS first_name, '' AS last_name,
                    b.occurred_at
                FROM boiler_events b

                ORDER BY occurred_at DESC
            `);
        } 
        else 
        {
            rawLogs = await this.dataSource.query(`
                SELECT 
                    a.id, 
                    'access' AS type, 
                    a.direction AS detail_1, 
                    NULL AS detail_2,
                    u.first_name, u.last_name,
                    a.occurred_at
                FROM access_events a
                LEFT JOIN users u ON a.user_id = u.id
                WHERE a.user_id = $1
                
                UNION ALL
                
                SELECT 
                    l.id, 
                    'lights' AS type, 
                    CASE WHEN l.new_state THEN 'ON' ELSE 'OFF' END AS detail_1, 
                    CAST(l.zone_id AS VARCHAR) AS detail_2,
                    u.first_name, u.last_name,
                    l.occurred_at
                FROM light_events l
                LEFT JOIN users u ON l.user_id = u.id
                WHERE l.user_id = $1

                ORDER BY occurred_at DESC
            `, [currentUser.id]);
        }

        return rawLogs.map( (log, index) => 
        {
            const time = new Date(log.occurred_at).toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' });
            const date = new Date(log.occurred_at).toLocaleDateString('ro-RO');
            const name = log.last_name ? `${log.first_name} ${log.last_name}` : log.first_name;
            
            let message = '';

            if (log.type === 'access') {
                const action = log.detail_1 === 'in' ? 'a intrat în casă' : 'a părăsit casa';
                message = `${name} ${action} la ora ${time} (${date})`;
            } else if (log.type === 'lights') {
                message = `${name} a aprins/stins lumina în Zona ${log.detail_2} -> Stare: ${log.detail_1} la ora ${time}`;
            } else if (log.type === 'boiler') {
                message = `Boilerul a fost oprit/pornit -> Stare: ${log.detail_1} la ora ${time} (${date})`;
            }

            return {
                id: index + 1,
                type: log.type as LogType,
                message: message,
                occurred_at: log.occurred_at
            };
        });
    }


    async getDetailedProfileForAdmin(userId: number) 
    {
        const user = await this.user_repository.findOne({ where: { id: userId } })
        
        if (!user) 
            throw new NotFoundException(`User with ID ${userId} not found`)

        return {
            first_name: user.firstName,
            last_name: user.lastName,
            cnp: user.cnp,
            is_home: user.isHome,
            is_admin: user.isAdmin,
            is_suspended: user.isSuspended
        };
    }

    async suspendUser(userId: number) 
    {
        const user = await this.user_repository.findOne({ where: { id: userId } });
        if (!user) throw new NotFoundException('User not found');

        // Schimbă starea (comută între suspendat/activ)
        user.isSuspended = !user.isSuspended;
        await this.user_repository.save(user);

        // Dacă l-am suspendat, îi închidem forțat toate sesiunile active din DB
        if (user.isSuspended) {
            await this.session_repository.update(
                { userId: user.id, isActive: true },
                { isActive: false }
            );
        }

        this.devicesService.pushBtCodes()

        return { 
            message: `User status updated successfully`, 
            is_suspended: user.isSuspended 
        };
    }

    async deleteUser(userId: number) {
        const user = await this.user_repository.findOne({ where: { id: userId } });
        if (!user) throw new NotFoundException('User not found');

        // 1. Ștergem mai întâi sesiunile utilizatorului pentru a nu bloca Foreign Key-ul
        await this.session_repository.delete({ userId: user.id });

        // 2. Ștergem utilizatorul (tabela access_events va pune automat NULL pe user_id conform bazei tale de date)
        await this.user_repository.remove(user);

        this.devicesService.pushBtCodes()

        return { message: `User with ID ${userId} has been permanently deleted` };
    }

    async save(user: User): Promise<User> 
    {
        return this.user_repository.save(user);
    }
}
