import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'mysecretpassword',
      database: 'home_automation',
      autoLoadEntities: true, // Încarcă automat entitățile pe care le definim în cod
      synchronize: false,    // Rămâne false; baza de date este creată prin scriptul SQL din DATABASE
    }),
  ],
})
export class AppModule {}