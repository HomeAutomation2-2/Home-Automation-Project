import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { loadAppConfig } from '../config/app-config';
import { DatabaseBootstrapService } from './database-bootstrap.service';
import { databaseEntities } from './entities';

@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: () => {
        const appConfig = loadAppConfig();

        return {
          type: 'postgres',
          host: appConfig.database.host,
          port: appConfig.database.port,
          username: appConfig.database.username,
          password: appConfig.database.password,
          database: appConfig.database.name,
          entities: databaseEntities,
          synchronize: false,
          logging: false,
        };
      },
    }),
    TypeOrmModule.forFeature(databaseEntities),
  ],
  providers: [DatabaseBootstrapService],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
