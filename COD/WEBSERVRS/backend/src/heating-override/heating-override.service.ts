import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateHeatingOverrideDto } from './dto/create-heating-override.dto';
import { HeatingOverride } from './entities/heating-override.entity';
import { TemperatureProgram } from '../temperature-programs/entities/temperature-program.entity';

export type HeatingOverrideStatus = {
    active: boolean;
    program_id?: number;
    duration_minutes?: number | null;
    expires_at?: string | null;
};

@Injectable()
export class HeatingOverrideService {
    constructor(
        @InjectRepository(HeatingOverride)
        private readonly overrideRepository: Repository<HeatingOverride>,
        @InjectRepository(TemperatureProgram)
        private readonly programRepository: Repository<TemperatureProgram>,
    ) {}

    async getStatus(): Promise<HeatingOverrideStatus> {
        const row = await this.findActiveOverride();
        if (!row) return { active: false };
        return this.toStatus(row);
    }

    async activate(dto: CreateHeatingOverrideDto): Promise<HeatingOverrideStatus> {
        const program = await this.programRepository.findOne({
            where: { id: dto.program_id },
        });
        if (!program) {
            throw new NotFoundException(`Program with ID ${dto.program_id} not found`);
        }

        await this.overrideRepository.update({ isActive: true }, { isActive: false });

        const expiresAt =
            dto.duration_minutes > 0
                ? new Date(Date.now() + dto.duration_minutes * 60_000)
                : null;

        const created = this.overrideRepository.create({
            programId: dto.program_id,
            durationMinutes: dto.duration_minutes > 0 ? dto.duration_minutes : null,
            expiresAt,
            isActive: true,
        });
        const saved = await this.overrideRepository.save(created);
        return this.toStatus(saved);
    }

    async deactivate(): Promise<HeatingOverrideStatus> {
        await this.overrideRepository.update({ isActive: true }, { isActive: false });
        return { active: false };
    }

    private async findActiveOverride(): Promise<HeatingOverride | null> {
        const candidates = await this.overrideRepository.find({
            where: { isActive: true },
            order: { id: 'DESC' },
            take: 5,
        });

        const now = Date.now();
        for (const row of candidates) {
            if (row.expiresAt && row.expiresAt.getTime() <= now) {
                row.isActive = false;
                await this.overrideRepository.save(row);
                continue;
            }
            return row;
        }
        return null;
    }

    private toStatus(row: HeatingOverride): HeatingOverrideStatus {
        return {
            active: true,
            program_id: row.programId,
            duration_minutes: row.durationMinutes,
            expires_at: row.expiresAt ? row.expiresAt.toISOString() : null,
        };
    }
}
