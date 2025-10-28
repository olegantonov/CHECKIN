export enum Trecho {
  IDA = 'IDA',
  VOLTA = 'VOLTA',
}

export enum StatusEmbarque {
  AGUARDANDO = 'Aguardando',
  EMBARCADO = 'Embarcado',
}

export interface Passageiro {
  ID_PULSEIRA: string;
  NOME_CONVIDADO: string;
  CPF?: string;
  DESTINO_ONIBUS: string;
  DATA_HORA_VIAGEM: string; // "yyyy-MM-dd HH:mm"
  TRECHO: Trecho;
  ID_VEICULO?: string;
  GRUPO_VIAGEM: string; // "DESTINO :: yyyy-MM-dd HH:mm"
  STATUS_EMBARQUE: StatusEmbarque;
  ONIBUS_EMBARCADO?: string;
  TIMESTAMP_EMBARQUE?: string; // "dd/MM/yyyy HH:mm:ss"
}

export interface Fiscal {
  NOME_DO_FISCAL: string;
  VIAGENS_AUTORIZADAS?: string[];
}

export interface Viagem {
  destino: string;
  dataHora: string; // "yyyy-MM-dd HH:mm"
  veiculos: string[];
}

export interface ViagemSelecionada {
  trecho: Trecho;
  destino: string;
  dataHora: string;
  veiculo: string;
}

export interface Stats {
  embarcados: number;
  total: number;
  faltantes?: number;
}

export interface VeiculoStats {
  [key: string]: Stats;
}

export interface DashboardData {
  statsGeral: Stats;
  statsPorVeiculo: VeiculoStats;
  passageirosEmbarcados: Passageiro[];
  passageirosFaltantes: Passageiro[];
}
