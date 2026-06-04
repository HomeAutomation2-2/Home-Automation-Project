import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { TemperatureProgram } from '../database/entities';
import { CreateTemperatureProgramDto } from './dto/create-temperature-program.dto';
import { HeatingProgramsService } from './heating-programs.service';

@Controller('heating-programs')
export class HeatingProgramsController {
  constructor(private readonly programsService: HeatingProgramsService) {}

  @Get()
  getAllPrograms(): Promise<TemperatureProgram[]> {
    return this.programsService.findAll();
  }

  @Post()
  createProgram(
    @Body() createDto: CreateTemperatureProgramDto,
  ): Promise<TemperatureProgram> {
    return this.programsService.create(createDto);
  }

  @Delete(':id')
  deleteProgram(@Param('id', ParseIntPipe) id: number): Promise<{ success: true }> {
    return this.programsService.remove(id);
  }
}
