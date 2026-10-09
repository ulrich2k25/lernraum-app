import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CheckInDto {
  @IsString()
  @IsNotEmpty()
  roomToken!: string;

  @IsInt()
  @Min(1)
  roomId!: number;

  @IsString()
  @IsNotEmpty()
  clientId!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  groupSize?: number;
}
