import { Module, NestModule } from '@nestjs/common';
import { DashboardModule } from './dashboard/dashboard.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), AuthModule, DashboardModule],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure() {
    // Proxy configuration is now handled in main.ts
  }
}
