import { IsNotEmpty } from 'class-validator';

export class PortfolioDto {
    @IsNotEmpty()
    network: string;

    @IsNotEmpty()
    publicKey: string;
}
