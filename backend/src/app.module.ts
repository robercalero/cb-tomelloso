import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TeamsModule } from './teams/teams.module';
import { PlayersModule } from './players/players.module';
import { MatchesModule } from './matches/matches.module';
import { NewsModule } from './news/news.module';
import { SponsorsModule } from './sponsors/sponsors.module';
import { GalleryModule } from './gallery/gallery.module';
import { ActivitiesModule } from './activities/activities.module';
import { ContactModule } from './contact/contact.module';
import { MembersModule } from './members/members.module';
import { InstagramModule } from './instagram/instagram.module';
import { MediaModule } from './media/media.module';
import { ProductCategoriesModule } from './shop/product-categories/product-categories.module';
import { ProductsModule } from './shop/products/products.module';
import { CartModule } from './shop/cart/cart.module';
import { OrdersModule } from './shop/orders/orders.module';
import { PaymentsModule } from './shop/payments/payments.module';
import { MailModule } from './mail/mail.module';
import { AdminModule } from './admin/admin.module';
import { ShopSeedModule } from './shop/seed/shop-seed.module';
import { DatabaseSeedModule } from './database-seed/database-seed.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 60 }]),
    DatabaseModule,
    AuthModule,
    UsersModule,
    TeamsModule,
    PlayersModule,
    MatchesModule,
    NewsModule,
    SponsorsModule,
    GalleryModule,
    ActivitiesModule,
    ContactModule,
    MembersModule,
    InstagramModule,
    MediaModule,
    ProductCategoriesModule,
    ProductsModule,
    CartModule,
    OrdersModule,
    PaymentsModule,
    MailModule,
    AdminModule,
    ShopSeedModule,
    DatabaseSeedModule,
  ],
  controllers: [AppController],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
