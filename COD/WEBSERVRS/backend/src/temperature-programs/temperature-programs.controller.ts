import { Controller, Get, Post, Delete, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { TemperatureProgramsService } from './temperature-programs.service';
import { CreateTemperatureProgramDto } from './dto/create-program.dto';
import { SessionGuard } from '../users/guards/session.guard';



@UseGuards(SessionGuard)
@Controller('heating-programs')
export class TemperatureProgramsController
{
    constructor(private readonly programsService: TemperatureProgramsService) 
    {}


    @Get()
    getAllPrograms() 
    {
        return this.programsService.findAll();
    }


    @Post()
    createProgram(@Body() createDto: CreateTemperatureProgramDto) 
    {
        return this.programsService.create(createDto);
    }


    @Delete(':id')
    deleteProgram(@Param('id', ParseIntPipe) id: number) 
    {
        return this.programsService.remove(id);
    }
}