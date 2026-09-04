export enum CategoriaCargo {
  GovernadorVice = 1,
  Secretarios = 2,
  GerenciaSuperior = 3,
  GerenciaIntermediariaDemais = 4,
}

export enum TipoViagem {
  Nacional = 0,
  Internacional = 1,
}

export enum TipoRegra {
  Padrao = "Padrao",
  CursoLongo = "CursoLongo",
  AgenteMultiplicador = "AgenteMultiplicador",
  JOER = "JOER",
}

export interface RequisicaoCalculoDiaria {
  categoria: CategoriaCargo;
  dataHoraInicio: string;
  dataHoraFim: string;
  tipo: TipoViagem;
  cotacaoDolar: number | null;
  hospedagemInclusa: boolean;
  custosTotaisTerceiros: boolean;
  tipoRegra: TipoRegra;
  categoriaAutoridadeAcompanhada: CategoriaCargo | null;
}

export interface ResultadoCalculo {
  elegivel: boolean;
  motivoIneligibilidade: string;

  totalDias: number;

  valorUnitario: number;
  valorBruto: number;
  desconto: number;
  valorTotal: number;
}