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
        // ── Connection resilience for Render free-tier cold starts ──
        retryAttempts: 5,
        retryDelay: 3000,
        extra: {
          connectTimeout: 30000,       // 30s to establish connection
          acquireTimeout: 30000,       // 30s to acquire from pool
          waitForConnections: true,
          connectionLimit: 5,          // keep pool small for free tier
        },
      }),
    }),
  ],
})
export class DatabaseModule {}
