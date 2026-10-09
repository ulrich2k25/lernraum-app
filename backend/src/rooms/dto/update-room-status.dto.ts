import { IsIn } from 'class-validator';

export class UpdateRoomStatusDto {
  @IsIn(['ACTIVE', 'INACTIVE'])
  status!: 'ACTIVE' | 'INACTIVE';
}