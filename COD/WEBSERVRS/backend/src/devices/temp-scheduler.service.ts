import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common'
import { DevicesService } from './devices.service'



@Injectable()
export class TempSchedulerService implements OnModuleInit, OnModuleDestroy 
{
    private intervalRef: NodeJS.Timeout | null = null

    constructor(private readonly devicesService: DevicesService) {}

    async onModuleInit() {
        const settings = await this.devicesService.getHomeSettings()
        this.startInterval(settings.samplingPeriod)
    }

    onModuleDestroy() {
        this.clearInterval()
    }

    restartInterval(seconds: number) {
        console.log(`[SCHEDULER] Restarting interval at ${seconds}s`)
        this.startInterval(seconds)
    }

    private startInterval(seconds: number) {
        this.clearInterval()
        this.intervalRef = setInterval(async () => {
            console.log('[SCHEDULER] Tick — pushing target temps')
            await this.devicesService.pushTargetTemps()
        }, seconds * 1000)
    }

    private clearInterval() {
        if (this.intervalRef) {
            clearInterval(this.intervalRef)
            this.intervalRef = null
        }
    }
}