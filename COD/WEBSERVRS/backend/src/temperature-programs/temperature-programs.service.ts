import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TemperatureProgram } from './entities/temperature-program.entity';
import { CreateTemperatureProgramDto } from './dto/create-program.dto';



@Injectable()
export class TemperatureProgramsService 
{
    constructor(
        @InjectRepository(TemperatureProgram)
        private readonly programRepository: Repository<TemperatureProgram>,
    ) {}


    async findAll() 
    {
        return await this.programRepository.find({
            order: { id: 'ASC' }
        })
    }


    async create(createDto: CreateTemperatureProgramDto) 
    {
        const newProgram = this.programRepository.create(createDto)
        return await this.programRepository.save(newProgram)
    }


    async remove(id: number) 
    {
        const program = await this.programRepository.findOne({ where: { id } })

        if (!program) 
            throw new NotFoundException(`Program with ID ${id} not found`)
        
        await this.programRepository.remove(program)
        
        return { success: true }
    }
}