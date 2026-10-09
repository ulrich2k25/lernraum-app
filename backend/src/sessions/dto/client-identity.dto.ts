import { IsNotEmpty, IsString } from 'class-validator';

export class ClientIdentityDto {
  @IsString()
  @IsNotEmpty()
  clientId!: string;

  @IsString()
  @IsNotEmpty()
  secret!: string;
}