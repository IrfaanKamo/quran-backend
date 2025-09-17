import { Controller, Get, Param, Query } from '@nestjs/common';
import { QuranApiService } from './quran-api.service';

@Controller('quran-api')
export class QuranApiController {
    constructor(private readonly quranApiService: QuranApiService) { }

    @Get('reciters')
    async getListOfReciters() {
        return this.quranApiService.getListOfReciters();
    }

    @Get('tafsirs')
    async getListOfTafsirs() {
        return this.quranApiService.getListOfTafsirs();
    }

    @Get('surahs')
    async getListOfSurahs() {
        return this.quranApiService.getListOfSurahs();
    }

    @Get('surahs/:id')
    async getSurah(@Param('id') id: string) {
        return this.quranApiService.getSurah(Number(id));
    }

    @Get('surahs/:id/info')
    async getSurahInfo(@Param('id') id: string) {
        return this.quranApiService.getSurahInfo(Number(id));
    }

    @Get('random-ayah-from-surah/:id')
    async getRandomAyahFromSurah(@Param('id') id: string, @Query('reciterId') reciterId?: string, @Query('tafsirId') tafsirId?: string) {
        return this.quranApiService.getRandomAyahFromSurah(Number(id), Number(reciterId), Number(tafsirId));
    }

    @Get('verses-from-surah/:id')
    async getVersesOfSurah(@Param('id') id: string, @Query('reciterId') reciterId?: string) {
        return this.quranApiService.getVersesOfSurah(Number(id), Number(reciterId));
    }
}
