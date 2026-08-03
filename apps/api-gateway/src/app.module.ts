import { Module, NestModule } from '@nestjs/common';

@Module({
  imports: [],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure() {
    // Proxy configuration is now handled in main.ts
  }
}
