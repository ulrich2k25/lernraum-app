import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class UpdateRoomDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  raumBezeichnung?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  gebaeude?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  etage?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  kapazitaet?: number;

  @IsOptional()
  @IsBoolean()
  autoCloseWhenEmpty?: boolean;
}
