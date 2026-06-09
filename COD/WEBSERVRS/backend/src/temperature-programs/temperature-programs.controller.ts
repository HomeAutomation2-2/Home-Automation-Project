import { Controller, Get, Post, Delete, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { TemperatureProgramsService } from './temperature-programs.service';
import { CreateTemperatureProgramDto } from './dto/create-program.dto';
import { SessionGuard } from '../users/guards/session.guard';



@Controller('heating-programs')
export class TemperatureProgramsController
{
    constructor(private readonly programsService: TemperatureProgramsService) 
    {}


    @Get()
    @UseGuards(SessionGuard)
    getAllPrograms() 
    {
        return this.programsService.findAll();
    }


    @Post()
    @UseGuards(SessionGuard)
    createProgram(@Body() createDto: CreateTemperatureProgramDto) 
    {
        return this.programsService.create(createDto);
    }


    @Delete(':id')
    @UseGuards(SessionGuard)
    deleteProgram(@Param('id', ParseIntPipe) id: number) 
    {
        return this.programsService.remove(id);
    }
}