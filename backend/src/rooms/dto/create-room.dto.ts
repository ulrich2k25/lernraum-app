import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateRoomDto {
  @IsString()
  @IsNotEmpty()
  raumBezeichnung!: string;

  @IsString()
  @IsNotEmpty()
  gebaeude!: string;

  @IsString()
  @IsNotEmpty()
  etage!: string;

  @IsInt()
  @Min(1)
  kapazitaet!: number;

  @IsOptional()
  @IsBoolean()
  autoCloseWhenEmpty?: boolean;
}
