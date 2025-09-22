"use client";

import { useMemo, useState } from 'react';

const LOTES = [
  { id: 1, nome: 'Lote 1', cota: 5000, prazo: 6, taxaMes: 0.017 },
  { id: 2, nome: 'Lote 2', cota: 25000, prazo: 12, taxaMes: 0.0185 },
  { id: 3, nome: 'Lote 3', cota: 100000, prazo: 12, taxaMes: 0.02 },
  { id: 4, nome: 'Lote 4', cota: 150000, prazo: 18, taxaMes: 0.0215 },
  { id: 5, nome: 'Lote 5', cota: 250000, prazo: 18, taxaMes: 0.023 },
  { id: 6, nome: 'Lote 6', cota: 1500000, prazo: 24, taxaMes: 0.026 },
] as const;

type Modo = 'mensal';

// Format number as BRL currency
const brl = (n: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n || 0);
const pct = (n: number) => `${(n * 100).toFixed(2)}%`;

export default function Page() {
  const [loteId, setLoteId] = useState('3');
  const [valor, setValor] = useState('');
  const modo: Modo = 'mensal';

  const lote = LOTES.find(l => String(l.id) === loteId)!;
  // Remove non-numeric characters before converting to number
  const valorNum = Number(valor.replace(/\D/g, '')) || 0;
  const cotas = Math.floor(valorNum / lote.cota);

  const res = useMemo(() => {
    if (cotas <= 0) return null;
    const principal = cotas * lote.cota;
    const n = lote.prazo;
    const i = lote.taxaMes;
    
    // Apenas rendimento mensal simples (sem juros compostos)
    const rendimentoMensal = principal * i;
    const totalRend = rendimentoMensal * n;
    return { principal, rendimentoMensal, totalRend, valorFinal: principal + totalRend };
  }, [cotas, lote]);

  return (
    <div className="min-h-screen w-full bg-black text-gray-100 py-10">
      <div className="max-w-5xl mx-auto px-4">
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-white">
            Calculadora de Simulação – TH Private
          </h1>
          <p className="text-gray-300 mt-2 max-w-3xl">
            Simule sua participação com rentabilidade pré-fixada por lote, dentro da estrutura jurídica de SCP.
            Modelo baseado em <span className="font-semibold text-white">carro por assinatura premium</span> com
            opção de compra.
          </p>
        </header>
        <div className="grid md:grid-cols-5 gap-6 items-start">
          {/* Formulário */}
          <div className="md:col-span-2 bg-gray-900 border border-gray-700 rounded-2xl shadow-lg p-6 space-y-5">
            <div>
              <label className="text-white block mb-2">Escolha o lote</label>
              <select
                className="mt-2 w-full bg-gray-950 border border-gray-700 text-white rounded-xl px-3 py-2"
                value={loteId}
                onChange={e => setLoteId(e.target.value)}
              >
                {LOTES.map(l => (
                  <option key={l.id} value={l.id}>
                    {l.nome} • cota {brl(l.cota)} • {l.prazo}m • {pct(l.taxaMes)}/m
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-white block mb-2">Quanto você deseja aportar?</label>
              <input
                type="number"
                placeholder="Ex.: 100000"
                className="mt-2 w-full bg-gray-950 border border-gray-700 text-white rounded-xl px-3 py-2 placeholder:text-gray-500"
                value={valor}
                onChange={e => setValor(e.target.value)}
              />
              <p className="text-xs text-gray-400 mt-1">
                Mínimo por cota no {lote.nome}: {brl(lote.cota)}.
              </p>
            </div>

          </div>
          {/* Resumo */}
          <div className="md:col-span-3 bg-gray-900 border border-gray-700 rounded-2xl shadow-lg p-6 space-y-5">
            <h2 className="text-xl font-medium text-white">Resumo da simulação</h2>
            {!res || cotas <= 0 ? (
              <p className="text-gray-400">Informe um valor válido para ver os resultados.</p>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gray-950 border border-gray-700 rounded-2xl p-4 space-y-2">
                  <Item k="Lote selecionado" v={`${lote.nome} | Cota ${brl(lote.cota)} | Prazo ${lote.prazo} meses | ${pct(lote.taxaMes)}/mês`} />
                  <Item k="Cotas consideradas" v={`${cotas} ${cotas === 1 ? 'cota' : 'cotas'}`} />
                  <Item k="Valor aportado" v={brl(res.principal)} />
                  <Item k="Modalidade" v="Recebimento Mensal" />
                  <Item k="Rendimento mensal" v={brl(res.rendimentoMensal)} />
                </div>
                <div className="bg-gray-950 border border-gray-700 rounded-2xl p-4 space-y-2">
                  <Item k="Rendimento total" v={brl(res.totalRend)} />
                  <Item k="Valor final ao término" v={brl(res.valorFinal)} />
                  <Item k="Prazo" v={`${lote.prazo} meses`} />
                </div>
              </div>
            )}
            <p className="text-xs text-gray-400 leading-relaxed">
              <span className="font-semibold text-white">Avisos:</span> Simulação ilustrativa com rentabilidade pré-fixada. Estrutura via SCP; operações de carro por assinatura premium. Não se trata de produto bancário.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ItemProps {
  k: string;
  v: string;
}

function Item({ k, v }: ItemProps) {
  return (
    <div className="flex flex-col text-sm">
      <span className="text-gray-400">{k}</span>
      <span className="font-medium text-white whitespace-pre-line">{v}</span>
    </div>
  );
}