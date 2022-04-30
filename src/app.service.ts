import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
    getHello(): string {
        return 'REST API for Orca DEX by Bisonai';
    }
}
