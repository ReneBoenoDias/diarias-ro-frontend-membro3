import { z } from "zod";

import {
  CategoriaCargo,
  TipoRegra,
  TipoViagem,
} from "@/types/diarias";

export const diariasSchema = z
  .object({
    categoria: z.enum(CategoriaCargo),

    dataHoraInicio: z
      .string()
      .min(1, "Informe a data e hora de início."),

    dataHoraFim: z
      .string()
      .min(1, "Informe a data e hora de término."),

    tipo: z.enum(TipoViagem),

    cotacaoDolar: z
      .number()
      .positive("A cotação precisa ser maior que zero.")
      .nullable(),

    hospedagemInclusa: z.boolean(),

    custosTotaisTerceiros: z.boolean(),

    tipoRegra: z.enum(TipoRegra),

    categoriaAutoridadeAcompanhada:
      z.enum(CategoriaCargo).nullable(),
  })
   .superRefine((dados, ctx) => {
    const inicio = new Date(dados.dataHoraInicio);
    const fim = new Date(dados.dataHoraFim);

    if (fim <= inicio) {
      ctx.addIssue({
        code: "custom",
        path: ["dataHoraFim"],
        message:
          "A data e hora de término precisam ser posteriores ao início.",
      });
    }

    if (
      dados.tipo === TipoViagem.Internacional &&
      dados.cotacaoDolar === null
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["cotacaoDolar"],
        message:
          "Informe a cotação do dólar para viagens internacionais.",
      });
    }
  });
  
  export type FormularioDiaria =
  z.infer<typeof diariasSchema>;