import { Injectable } from '@nestjs/common';
import { TemperatureReading } from './entities/temperature-reading.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThanOrEqual } from 'typeorm';



@Injectable()
export class TemperatureReadingsService 
{
    constructor(
        @InjectRepository(TemperatureReading)
        private readonly readingsRepository: Repository<TemperatureReading>,
    ) {}



    async getReadings(roomId: number): Promise<{ occuredAt: Date; value: number }[]> 
    {
        const from = new Date(Date.now() - 24 * 60 * 60 * 1000);

        const raw_readings = await this.readingsRepository.find({
            where: {
                loopId: roomId,
                occuredAt: MoreThanOrEqual(from),
            },
            order: { occuredAt: 'ASC' },
            select: {
                value: true,
                occuredAt: true,
            },
        });

        return this.bucketAverage(raw_readings, 48)
    }


    private bucketAverage(
        readings: { occuredAt: Date; value: number }[],
        buckets: number,
    ): { occuredAt: Date; value: number }[] 
    {
        if (readings.length === 0) return []

        const from  = readings[0].occuredAt.getTime()
        const to    = readings[readings.length - 1].occuredAt.getTime()
        const range = to - from
        const size  = range / buckets

        if (size === 0) return readings

        const grouped: { sum: number; count: number; time: number }[] = Array.from(
            { length: buckets },
            (_, i) => ({ sum: 0, count: 0, time: from + i * size + size / 2 })
        )

        for (const r of readings) {
            const i = Math.min(
                Math.floor((r.occuredAt.getTime() - from) / size),
                buckets - 1
            )
            grouped[i].sum   += r.value
            grouped[i].count += 1
        }

        return grouped
            .filter(b => b.count > 0)
            .map(b => ({
                occuredAt: new Date(b.time),
                value:     Math.round((b.sum / b.count) * 10) / 10,
            }))
    }
}
