import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { QuranApiModule } from './quran-api/quran-api.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // makes ConfigService available everywhere
    }),QuranApiModule],
})
export class AppModule {}
