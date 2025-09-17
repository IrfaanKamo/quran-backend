import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { AccessToken } from './quran-api.types';

@Injectable()
export class QuranApiService {
    private readonly logger = new Logger(QuranApiService.name);
    private baseUrl = process.env.QURAN_API_URL;
    private authToken: AccessToken | null = null;

    constructor(private readonly httpService: HttpService) { }

    /**
     * Fetches an access token from the Quran API authentication service using client credentials.
     *
     * This method constructs a Basic Auth header using the client ID and secret from environment variables,
     * sends a POST request to the authentication URL, and retrieves the access token and its expiration time.
     * The token and its expiration are stored in the service for future use.
     *
     * @returns {Promise<string | undefined>} The access token if successful, otherwise `undefined`.
     * @throws Will log an error if the request fails.
     */
    private async fetchAccessToken() {
        const clientId = process.env.QURAN_API_CLIENT_ID;
        const clientSecret = process.env.QURAN_API_CLIENT_SECRET;

        const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
        const url = `${process.env.QURAN_AUTH_URL}`;

        try {
            const response = await firstValueFrom(this.httpService.post(url, { grant_type: 'client_credentials', scope: 'content' }, {
                headers: {
                    'Authorization': `Basic ${auth}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
            }));

            const { access_token, expires_in } = response.data;
            const expiresAt = Date.now() + expires_in * 1000;
            this.authToken = { accessToken: access_token, expiresAt };

            return this.authToken.accessToken;
        } catch (error) {
            this.logger.error('Error fetching access token', error);
        }
    }

    private async getValidAccessToken() {
        if (this.authToken && Date.now() < this.authToken.expiresAt) {
            return this.authToken.accessToken;
        }
        return this.fetchAccessToken();
    }

    private generateHeaders(authToken: string | undefined) {
        return {
            'Content-Type': 'application/json',
            'x-client-id': process.env.QURAN_API_CLIENT_ID,
            'x-auth-token': authToken,
        };
    }

    async getListOfReciters(): Promise<any> {
        const url = `${this.baseUrl}/resources/recitations`;
        const authToken = await this.getValidAccessToken();
        const headers = this.generateHeaders(authToken);

        try {
            const response = await firstValueFrom(this.httpService.get(url, { headers }));
            return response.data;
        }
        catch (error) {
            this.logger.error('Error fetching reciters', error);
        }
    }

    async getListOfTafsirs(): Promise<any> {
        const url = `${this.baseUrl}/resources/tafsirs`;
        const authToken = await this.getValidAccessToken();
        const headers = this.generateHeaders(authToken);

        try {
            const response = await firstValueFrom(this.httpService.get(url, { headers }));
            return response.data;
        }
        catch (error) {
            this.logger.error('Error fetching tafsirs', error);
        }
    }

    async getListOfSurahs(): Promise<any> {
        const url = `${this.baseUrl}/chapters`;
        const authToken = await this.getValidAccessToken();
        const headers = this.generateHeaders(authToken);

        try {
            const response = await firstValueFrom(this.httpService.get(url, { headers }));
            return response.data;
        }
        catch (error) {
            this.logger.error('Error fetching surahs', error);
        }
    }

    async getSurah(surahId: number): Promise<any> {
        const url = `${this.baseUrl}/chapters/${surahId}`;
        const authToken = await this.getValidAccessToken();
        const headers = this.generateHeaders(authToken);

        try {
            const response = await firstValueFrom(
                this.httpService.get(url, { headers }),
            );
            return response.data;
        }
        catch (error) {
            this.logger.error(`Error fetching surah ${surahId}`, error);
        }
    }

    async getSurahInfo(surahId: number): Promise<any> {
        const url = `${this.baseUrl}/chapters/${surahId}/info`;
        const authToken = await this.getValidAccessToken();
        const headers = this.generateHeaders(authToken);

        try {
            const response = await firstValueFrom(
                this.httpService.get(url, { headers }),
            );
            return response.data;
        }
        catch (error) {
            this.logger.error(`Error fetching surah info ${surahId}`, error);
        }
    }

    async getVersesOfSurah(surahId: number, reciterId: number): Promise<any> {
        const url = `${this.baseUrl}/verses/by_chapter/${surahId}`;
        
        const authToken = await this.getValidAccessToken();
        const headers = this.generateHeaders(authToken);

        const params = {
            words: "true",
            translations: "85",
            audio: reciterId.toString(),
        }

        try {
            const response = await firstValueFrom(
                this.httpService.get(url, { headers, params }),
            );
            return response.data;
        }
        catch (error) {
            this.logger.error(`Error fetching verses for surah ${surahId}`, error);
        }
    }

    async getRandomAyahFromSurah(surahId: number, reciterId: number, tafsirId: number): Promise<any> {
        const url = `${this.baseUrl}/verses/random`;

        const authToken = await this.getValidAccessToken();
        const headers = this.generateHeaders(authToken);

        const params = {
            chapter_number: surahId,
            audio: reciterId.toString(),
            tafsirs: tafsirId.toString(),
            fields: "text_uthmani,image_url",
            word_fields: "text_uthmani",
            translations: "85"
        };

        try {
            const response = await firstValueFrom(
                this.httpService.get(url, { headers, params }),
            );
            return response.data;
        }
        catch (error) {
            this.logger.error(`Error fetching random ayah from surah ${surahId}`, error);
        }
    }
}
