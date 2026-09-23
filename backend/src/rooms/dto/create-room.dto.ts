export class CreateRoomDto {
  raumBezeichnung!: string;
  gebaeude!: string;
  etage!: string;
  kapazitaet!: number;

  autoCloseWhenEmpty?: boolean;
}
