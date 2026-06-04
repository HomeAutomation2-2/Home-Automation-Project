import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { loadAppConfig } from '../config/app-config';
import { DatabaseBootstrapService } from './database-bootstrap.service';
import { databaseEntities } from './entities';

const appConfig = loadAppConfig();

@Global()
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: appConfig.database.host,
      port: appConfig.database.port,
      username: appConfig.database.username,
      password: appConfig.database.password,
      database: appConfig.database.name,
      entities: databaseEntities,
      synchronize: false,
      logging: false,
    }),
    TypeOrmModule.forFeature(databaseEntities),
  ],
  providers: [DatabaseBootstrapService],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
