import { Controller, Get } from '@nestjs/common';



@Controller("health")
export class AppController 
{
    @Get()
    checkHealth()     
    {
        return {
            status: "ok",
            name: "Dev Bluelock v0.0"
        }
    }
}
