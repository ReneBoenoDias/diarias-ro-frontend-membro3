import type {
  ResultadoCalculo as Resultado,
} from "@/types/diarias";

interface Props {
  resultado: Resultado;
}

export default function ResultadoCalculo({
  resultado,
}: Props) {
  function moeda(valor: number) {
    return valor.toLocaleString(
      "pt-BR",
      {
        style: "currency",
        currency: "BRL",
      }
    );
  }

  return (
    <section className="mt-10 rounded-xl border border-gray-200 bg-gray-50 p-6">

      <h2 className="mb-5 text-2xl font-bold text-gray-900">
        Resultado da Simulação
      </h2>

      {!resultado.elegivel ? (
        <div className="rounded-lg bg-red-50 p-4 text-red-700">

          <p className="font-bold">
            Solicitação não elegível
          </p>

          <p className="mt-1">
            {
              resultado
                .motivoIneligibilidade
            }
          </p>

        </div>
      ) : (
        <div className="space-y-4 text-gray-900">

          <div className="flex justify-between border-b pb-3">
            <span>
              Total de diárias
            </span>

            <strong>
              {resultado.totalDias}
            </strong>
          </div>

          <div className="flex justify-between border-b pb-3">
            <span>
              Valor unitário
            </span>

            <strong>
              {moeda(
                resultado.valorUnitario
              )}
            </strong>
          </div>

          <div className="flex justify-between border-b pb-3">
            <span>
              Proventos / valor bruto
            </span>

            <strong>
              {moeda(
                resultado.valorBruto
              )}
            </strong>
          </div>

          <div className="flex justify-between border-b pb-3">

            <span>
              Descontos
            </span>

            <strong className="text-red-600">
              -{" "}
              {moeda(
                resultado.desconto
              )}
            </strong>

          </div>

          <div className="flex justify-between border-t pt-5 text-xl">

            <span className="font-bold">
              Valor total
            </span>

            <strong className="text-blue-700">
              {moeda(
                resultado.valorTotal
              )}
            </strong>

          </div>

        </div>
      )}

    </section>
  );
}