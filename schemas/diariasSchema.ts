import { z } from "zod";

import {
  CategoriaCargo,
  TipoRegra,
  TipoViagem,
} from "@/types/diarias";

const categoriaSchema = z.union([
  z.literal(CategoriaCargo.GovernadorVice),
  z.literal(CategoriaCargo.Secretarios),
  z.literal(CategoriaCargo.GerenciaSuperior),
  z.literal(
    CategoriaCargo.GerenciaIntermediariaDemais
  ),
]);

const tipoViagemSchema = z.union([
  z.literal(TipoViagem.Nacional),
  z.literal(TipoViagem.Internacional),
]);

const tipoRegraSchema = z.union([
  z.literal(TipoRegra.Padrao),
  z.literal(TipoRegra.CursoLongo),
  z.literal(TipoRegra.AgenteMultiplicador),
  z.literal(TipoRegra.JOER),
]);

export const diariasSchema = z
  .object({
    categoria: categoriaSchema,

    dataHoraInicio: z
      .string()
      .min(
        1,
        "Informe a data e hora de início."
      ),

    dataHoraFim: z
      .string()
      .min(
        1,
        "Informe a data e hora de término."
      ),

    tipo: tipoViagemSchema,

    cotacaoDolar: z
      .number()
      .positive(
        "A cotação precisa ser maior que zero."
      )
      .nullable(),

    hospedagemInclusa: z.boolean(),

    custosTotaisTerceiros: z.boolean(),

    tipoRegra: tipoRegraSchema,

    categoriaAutoridadeAcompanhada:
      categoriaSchema.nullable(),
  })
  .superRefine((dados, contexto) => {
    if (
      dados.dataHoraInicio &&
      dados.dataHoraFim
    ) {
      const inicio = new Date(
        dados.dataHoraInicio
      );

      const fim = new Date(
        dados.dataHoraFim
      );

      if (
        fim.getTime() <=
        inicio.getTime()
      ) {
        contexto.addIssue({
          code: "custom",

          path: ["dataHoraFim"],

          message:
            "A data e hora de término precisam ser posteriores ao início.",
        });
      }
    }

    if (
      dados.tipo ===
        TipoViagem.Internacional &&
      dados.cotacaoDolar === null
    ) {
      contexto.addIssue({
        code: "custom",

        path: ["cotacaoDolar"],

        message:
          "Informe a cotação do dólar para viagens internacionais.",
      });
    }
  });

export type FormularioDiaria =
  z.infer<typeof diariasSchema>;