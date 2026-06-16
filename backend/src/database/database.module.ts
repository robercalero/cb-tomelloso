import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get<string>('DB_HOST'),
        port: parseInt(config.get<string>('DB_PORT') ?? '3306', 10),
        username: config.get<string>('DB_USERNAME'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_NAME'),
        autoLoadEntities: true,
        synchronize: config.get<string>('NODE_ENV')?.toLowerCase() !== 'production',
        logging: config.get<string>('NODE_ENV')?.toLowerCase() !== 'production',
        charset: 'utf8mb4',
        ssl: config.get<string>('DB_SSL') === 'DISABLED'
          ? false
          : { rejectUnauthorized: false },
      }),
    }),
  ],
})
export class DatabaseModule {}
