import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TemperatureProgram } from '../database/entities';
import { CreateTemperatureProgramDto } from './dto/create-temperature-program.dto';

@Injectable()
export class HeatingProgramsService {
  constructor(
    @InjectRepository(TemperatureProgram)
    private readonly programRepository: Repository<TemperatureProgram>,
  ) {}

  findAll(): Promise<TemperatureProgram[]> {
    return this.programRepository.find({ order: { id: 'ASC' } });
  }

  create(dto: CreateTemperatureProgramDto): Promise<TemperatureProgram> {
    return this.programRepository.save(this.programRepository.create(dto));
  }

  async remove(id: number): Promise<{ success: true }> {
    const program = await this.programRepository.findOne({ where: { id } });

    if (!program) {
      throw new NotFoundException(`Program with ID ${id} not found`);
    }

    await this.programRepository.remove(program);
    return { success: true };
  }
}
