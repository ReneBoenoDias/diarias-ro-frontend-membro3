"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  useForm,
} from "react-hook-form";

import {
  zodResolver,
} from "@hookform/resolvers/zod";

import {
  diariasSchema,
  type FormularioDiaria,
} from "@/schemas/diariasSchema";

import {
  CategoriaCargo,
  ResultadoCalculo as TipoResultadoCalculo,
  TipoRegra,
  TipoViagem,
} from "@/types/diarias";

import ResultadoCalculo from "./ResultadoCalculo";

export default function CalculadoraForm() {
  const [
    resultado,
    setResultado,
  ] =
    useState<TipoResultadoCalculo | null>(
      null
    );

  const [
    erroFormulario,
    setErroFormulario,
  ] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    setValue,

    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<FormularioDiaria>({
    resolver:
      zodResolver(
        diariasSchema
      ),

    mode: "onChange",

    reValidateMode:
      "onChange",

    defaultValues: {
      categoria:
        CategoriaCargo
          .GerenciaIntermediariaDemais,

      dataHoraInicio: "",

      dataHoraFim: "",

      tipo:
        TipoViagem.Nacional,

      cotacaoDolar: null,

      hospedagemInclusa:
        false,

      custosTotaisTerceiros:
        false,

      tipoRegra:
        TipoRegra.Padrao,

      categoriaAutoridadeAcompanhada:
        null,
    },
  });

  /*
    Observa o tipo da viagem.
  */

  const tipoViagem =
    watch("tipo");

  const internacional =
    tipoViagem ===
    TipoViagem.Internacional;

  /*
    Quando volta para Nacional,
    limpa a cotação do dólar.
  */

  useEffect(() => {
    if (!internacional) {
      setValue(
        "cotacaoDolar",
        null,
        {
          shouldValidate:
            true,
        }
      );
    }
  }, [
    internacional,
    setValue,
  ]);

  /*
    FUNÇÃO DO CÁLCULO
    usada apenas para demonstrar
    o frontend funcionando.
  */

  function calcular(
    dados: FormularioDiaria
  ) {
    setErroFormulario("");

    const inicio =
      new Date(
        dados.dataHoraInicio
      );

    const fim =
      new Date(
        dados.dataHoraFim
      );

    const diferenca =
      fim.getTime() -
      inicio.getTime();

    const totalHoras =
      diferenca /
      (1000 * 60 * 60);

    /*
      Menos de cinco horas.
    */

    if (totalHoras < 5) {
      setResultado({
        elegivel: false,

        motivoIneligibilidade:
          "Afastamento inferior a 5 horas contínuas.",

        totalDias: 0,

        valorUnitario: 0,

        valorBruto: 0,

        desconto: 0,

        valorTotal: 0,
      });

      return;
    }

    /*
      Custos pagos integralmente
      por terceiros.
    */

    if (
      dados
        .custosTotaisTerceiros
    ) {
      setResultado({
        elegivel: false,

        motivoIneligibilidade:
          "As despesas da viagem são totalmente custeadas por terceiros.",

        totalDias: 0,

        valorUnitario: 0,

        valorBruto: 0,

        desconto: 0,

        valorTotal: 0,
      });

      return;
    }

    /*
      Valores nacionais.
    */

    const valoresNacionais:
      Record<number, number> = {
        1: 713,
        2: 623,
        3: 534,
        4: 445,
      };

    /*
      Valores internacionais
      em dólar.
    */

    const valoresInternacionais:
      Record<number, number> = {
        1: 741,
        2: 593,
        3: 474,
        4: 474,
      };

    /*
      Se houver autoridade
      acompanhada, usamos essa
      categoria no teste.
    */

    const categoriaCalculada =
      dados
        .categoriaAutoridadeAcompanhada ??
      dados.categoria;

    let valorUnitario = 0;

    /*
      Nacional.
    */

    if (
      dados.tipo ===
      TipoViagem.Nacional
    ) {
      valorUnitario =
        valoresNacionais[
          categoriaCalculada
        ];
    }

    /*
      Internacional.
    */

    if (
      dados.tipo ===
      TipoViagem.Internacional
    ) {
      const valorEmDolar =
        valoresInternacionais[
          categoriaCalculada
        ];

      valorUnitario =
        valorEmDolar *
        (dados.cotacaoDolar ?? 0);
    }

    /*
      Quantidade de diárias.
      Demonstração temporária.
    */

    const totalDias =
      Math.max(
        1,

        Math.ceil(
          totalHoras / 24
        )
      );

    /*
      Valor bruto.
    */

    const valorBruto =
      totalDias *
      valorUnitario;

    let valorTotal =
      valorBruto;

    /*
      Agente Multiplicador:
      50%.
    */

    if (
      dados.tipoRegra ===
      TipoRegra
        .AgenteMultiplicador
    ) {
      valorTotal =
        valorBruto * 0.5;
    }

    /*
      JOER:
      50%.
    */

    if (
      dados.tipoRegra ===
      TipoRegra.JOER
    ) {
      valorTotal =
        valorBruto * 0.5;
    }

    /*
      Curso longo:
      redução da 16ª diária.
    */

    if (
      dados.tipoRegra ===
        TipoRegra.CursoLongo &&
      totalDias > 15
    ) {
      const valorPrimeiras15 =
        15 *
        valorUnitario;

      const diasRestantes =
        totalDias - 15;

      const valorRestante =
        diasRestantes *
        valorUnitario *
        0.5;

      valorTotal =
        valorPrimeiras15 +
        valorRestante;
    }

    /*
      Calcula o desconto.
    */

    const desconto =
      Math.max(
        0,

        valorBruto -
          valorTotal
      );

    /*
      Envia o resultado
      para a tela.
    */

    setResultado({
      elegivel: true,

      motivoIneligibilidade:
        "",

      totalDias,

      valorUnitario,

      valorBruto,

      desconto,

      valorTotal,
    });
  }

  function formularioInvalido() {
    setResultado(null);

    setErroFormulario(
      "Existem campos inválidos. Verifique os campos destacados em vermelho."
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-10">

      <div className="mx-auto max-w-2xl rounded-2xl bg-white p-8 shadow-lg">

        <h1 className="text-3xl font-bold text-gray-900">
          Calculadora de Diárias
        </h1>

        <p className="mb-8 mt-2 text-gray-600">
          Informe os dados da viagem
          para realizar a simulação.
        </p>

        <form
          onSubmit={
            handleSubmit(
              calcular,
              formularioInvalido
            )
          }

          className="space-y-6"
        >

          {/* CATEGORIA */}

          <div>

            <label
              htmlFor="categoria"
              className="mb-2 block font-medium text-gray-900"
            >
              Categoria do servidor
            </label>

            <select
              id="categoria"

              {...register(
                "categoria",
                {
                  setValueAs:
                    (valor) =>
                      Number(valor),
                }
              )}

              className="w-full rounded-lg border border-gray-300 bg-white p-3 text-gray-900"
            >

              <option value={1}>
                Governador /
                Vice-Governador
              </option>

              <option value={2}>
                Secretários e
                equivalentes
              </option>

              <option value={3}>
                Gerência Superior
              </option>

              <option value={4}>
                Gerências
                Intermediárias e demais
              </option>

            </select>

          </div>

          {/* DATA DE INÍCIO */}

          <div>

            <label
              htmlFor="dataHoraInicio"
              className="mb-2 block font-medium text-gray-900"
            >
              Data e hora de início
            </label>

            <input
              id="dataHoraInicio"

              type="datetime-local"

              {...register(
                "dataHoraInicio"
              )}

              className="w-full rounded-lg border border-gray-300 bg-white p-3 text-gray-900"
            />

            {errors
              .dataHoraInicio && (
              <p className="mt-1 text-sm text-red-600">

                {
                  errors
                    .dataHoraInicio
                    .message
                }

              </p>
            )}

          </div>

          {/* DATA DE TÉRMINO */}

          <div>

            <label
              htmlFor="dataHoraFim"
              className="mb-2 block font-medium text-gray-900"
            >
              Data e hora de término
            </label>

            <input
              id="dataHoraFim"

              type="datetime-local"

              {...register(
                "dataHoraFim"
              )}

              className="w-full rounded-lg border border-gray-300 bg-white p-3 text-gray-900"
            />

            {errors
              .dataHoraFim && (
              <p className="mt-1 text-sm text-red-600">

                {
                  errors
                    .dataHoraFim
                    .message
                }

              </p>
            )}

          </div>

          {/* TIPO DA VIAGEM */}

          <div>

            <label
              htmlFor="tipo"
              className="mb-2 block font-medium text-gray-900"
            >
              Tipo da viagem
            </label>

            <select
              id="tipo"

              {...register(
                "tipo",
                {
                  setValueAs:
                    (valor) =>
                      Number(valor),
                }
              )}

              className="w-full rounded-lg border border-gray-300 bg-white p-3 text-gray-900"
            >

              <option value={0}>
                Nacional
              </option>

              <option value={1}>
                Internacional
              </option>

            </select>

          </div>

          {/* DÓLAR */}

          {internacional && (
            <div>

              <label
                htmlFor="cotacaoDolar"
                className="mb-2 block font-medium text-gray-900"
              >
                Cotação do dólar
              </label>

              <input
                id="cotacaoDolar"

                type="number"

                step="0.01"

                min="0.01"

                placeholder="Ex.: 5.25"

                {...register(
                  "cotacaoDolar",
                  {
                    setValueAs:
                      (
                        valor
                      ) =>
                        valor ===
                        ""
                          ? null
                          : Number(
                              valor
                            ),
                  }
                )}

                className="w-full rounded-lg border border-gray-300 bg-white p-3 text-gray-900"
              />

              {errors
                .cotacaoDolar && (
                <p className="mt-1 text-sm text-red-600">

                  {
                    errors
                      .cotacaoDolar
                      .message
                  }

                </p>
              )}

            </div>
          )}

          {/* HOSPEDAGEM */}

          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">

            <label className="flex items-center gap-3 text-gray-900">

              <input
                type="checkbox"

                {...register(
                  "hospedagemInclusa"
                )}
              />

              Hospedagem já está
              inclusa

            </label>

          </div>

          {/* CUSTOS TERCEIROS */}

          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">

            <label className="flex items-center gap-3 text-gray-900">

              <input
                type="checkbox"

                {...register(
                  "custosTotaisTerceiros"
                )}
              />

              Todas as despesas são
              custeadas por terceiros

            </label>

          </div>

          {/* REGRA */}

          <div>

            <label
              htmlFor="tipoRegra"
              className="mb-2 block font-medium text-gray-900"
            >
              Regra aplicável
            </label>

            <select
              id="tipoRegra"

              {...register(
                "tipoRegra"
              )}

              className="w-full rounded-lg border border-gray-300 bg-white p-3 text-gray-900"
            >

              <option
                value={
                  TipoRegra.Padrao
                }
              >
                Padrão
              </option>

              <option
                value={
                  TipoRegra
                    .CursoLongo
                }
              >
                Curso longo
              </option>

              <option
                value={
                  TipoRegra
                    .AgenteMultiplicador
                }
              >
                Agente multiplicador
              </option>

              <option
                value={
                  TipoRegra.JOER
                }
              >
                JOER
              </option>

            </select>

          </div>

          {/* AUTORIDADE */}

          <div>

            <label
              htmlFor="categoriaAutoridadeAcompanhada"
              className="mb-2 block font-medium text-gray-900"
            >
              Categoria da autoridade
              acompanhada
            </label>

            <select
              id="categoriaAutoridadeAcompanhada"

              {...register(
                "categoriaAutoridadeAcompanhada",
                {
                  setValueAs:
                    (
                      valor
                    ) =>
                      valor ===
                      ""
                        ? null
                        : Number(
                            valor
                          ),
                }
              )}

              className="w-full rounded-lg border border-gray-300 bg-white p-3 text-gray-900"
            >

              <option value="">
                Não se aplica
              </option>

              <option value={1}>
                Governador /
                Vice-Governador
              </option>

              <option value={2}>
                Secretários e
                equivalentes
              </option>

              <option value={3}>
                Gerência Superior
              </option>

              <option value={4}>
                Gerências
                Intermediárias e demais
              </option>

            </select>

            <p className="mt-1 text-sm text-gray-500">
              Informe somente quando
              o servidor estiver
              acompanhando uma
              autoridade.
            </p>

          </div>

          {/* ERRO */}

          {erroFormulario && (
            <div className="rounded-lg bg-red-50 p-4 text-red-700">

              {erroFormulario}

            </div>
          )}

          {/* BOTÃO */}

          <button
            type="submit"

            disabled={
              isSubmitting
            }

            className="w-full rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
          >

            Calcular diária

          </button>

        </form>

        {/* RESULTADO */}

        {resultado && (
          <ResultadoCalculo
            resultado={
              resultado
            }
          />
        )}

      </div>

    </main>
  );
}