import { Type } from 'class-transformer';
import {
  IsDefined,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class PushSubscriptionKeysDto {
  @IsString()
  @IsNotEmpty()
  p256dh!: string;

  @IsString()
  @IsNotEmpty()
  auth!: string;
}

export class PushSubscriptionDataDto {
  @IsString()
  @IsNotEmpty()
  endpoint!: string;

  @IsOptional()
  @IsNumber()
  expirationTime?: number | null;

  @IsDefined()
  @IsObject()
  @ValidateNested()
  @Type(() => PushSubscriptionKeysDto)
  keys!: PushSubscriptionKeysDto;
}

export class SubscribePushDto {
  @IsString()
  @IsNotEmpty()
  clientId!: string;

  @IsDefined()
  @IsObject()
  @ValidateNested()
  @Type(() => PushSubscriptionDataDto)
  subscription!: PushSubscriptionDataDto;
}
