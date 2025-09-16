import { Module } from '@nestjs/common';
import { QuranApiService } from './quran-api.service';
import { QuranApiController } from './quran-api.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [QuranApiService],
  controllers: [QuranApiController],
  exports: [QuranApiService],
})
export class QuranApiModule {}
