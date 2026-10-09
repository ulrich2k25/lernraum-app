import { IsNotEmpty, IsString } from 'class-validator';

export class ExtendSessionDto {
  @IsString()
  @IsNotEmpty()
  clientId!: string;
}
