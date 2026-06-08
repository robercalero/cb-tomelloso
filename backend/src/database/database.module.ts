import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const sslMode = config.get<string>('DB_SSL', 'DISABLED');
        let ssl: any = undefined;
        if (sslMode === 'REQUIRED') {
          const caPath = config.get<string>('DB_CA_CERT');
          if (caPath && fs.existsSync(caPath)) {
            ssl = { ca: fs.readFileSync(caPath).toString() };
          } else {
            ssl = { rejectUnauthorized: false };
          }
        }

        return {
          type: 'mysql',
          host: config.get<string>('DB_HOST'),
          port: parseInt(config.get<string>('DB_PORT') ?? '3306', 10),
          username: config.get<string>('DB_USERNAME'),
          password: config.get<string>('DB_PASSWORD'),
          database: config.get<string>('DB_NAME'),
          autoLoadEntities: true,
          synchronize: config.get<string>('DB_SYNC') === 'true',
          logging: config.get<string>('DB_LOGGING') === 'true',
          charset: 'utf8mb4_unicode_ci',
          timezone: 'Z',
          ssl,
        };
      },
    }),
  ],
})
export class DatabaseModule {}
