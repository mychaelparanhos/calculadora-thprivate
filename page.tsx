'use client';
import React, { useMemo, useState } from "react";

const LOTES = [
  { id: 1, nome: "Lote 1", cota: 5000, prazo: 6, taxaMes: 0.017 },
  { id: 2, nome: "Lote 2", cota: 25000, prazo: 12, taxaMes: 0.0185 },
  { id: 3, nome: "Lote 3", cota: 100000, prazo: 12, taxaMes: 0.02 },
  { id: 4, nome: "Lote 4", cota: 150000, prazo: 18, taxaMes: 0.0215 },
  { id: 5, nome: "Lote 5", cota: 250000, prazo: 18, taxaMes: 0.023 },
  { id: 6, nome: "Lote 6", cota: 1500000, prazo: 24, taxaMes: 0.026 },
] as const;

type Modo = "mensal" | "bullet";

function brl(n: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n || 0);
}
function pct(n: number) { return `${(n * 100).toFixed(2)}%`; }

export default function Page() {
  const [loteId, setLoteId] = useState("1");
  const [valor, setValor] = useState("");
  const [modo, setModo] = useState<Modo>("mensal");

  const lote = LOTES.find(l => String(l.id) === loteId)!;
  const valorNum = Number(valor.replace(/\D/g, "")) || 0;
  const cotas = Math.floor(valorNum / lote.cota);

  const res = useMemo(() => {
    if (cotas <= 0) return null;
    const principal = cotas * lote.cota;
    const n = lote.prazo, i = lote.taxaMes;
    if (modo === "mensal") {
      const rendimentoMensal = principal * i;
      const totalRend = rendimentoMensal * n;
      return { principal, rendimentoMensal, totalRend, valorFinal: principal + totalRend };
    } else {
      const valorFinal = principal * Math.pow(1 + i, n);
      const totalRend = valorFinal - principal;
      return { principal, rendimentoMensal: totalRend / n, totalRend, valorFinal };
    }
  }, [cotas, lote, modo]);

  return (
    <div style={{minHeight:'100vh',background:'#111',color:'#fff',padding:'32px',fontFamily:'Inter,system-ui,Arial'}}>
      <h1 style={{fontSize:28,marginBottom:8}}>Calculadora de Simulação – TH Private</h1>
      <p style={{opacity:.8,maxWidth:760}}>Simule sua participação com rentabilidade pré-fixada por lote, dentro da estrutura jurídica de SCP.</p>
      <div style={{marginTop:20}}>
        <label>Lote:
          <select value={loteId} onChange={e=>setLoteId(e.target.value)}>
            {LOTES.map(l => (
              <option key={l.id} value={l.id}>{l.nome} – {brl(l.cota)} – {l.prazo}m – {pct(l.taxaMes)}/m</option>
            ))}
          </select>
        </label>
      </div>
      <div style={{marginTop:10}}>
        <label>Valor a aportar:
          <input type="number" value={valor} onChange={e=>setValor(e.target.value)} />
        </label>
      </div>
      <div style={{marginTop:10}}>
        <label><input type="radio" checked={modo==='mensal'} onChange={()=>setModo('mensal')} /> Mensal</label>
        <label style={{marginLeft:20}}><input type="radio" checked={modo==='bullet'} onChange={()=>setModo('bullet')} /> No final</label>
      </div>
      {res ? (
        <div style={{marginTop:20,background:'#222',padding:15,borderRadius:8}}>
          <p><b>Valor aportado:</b> {brl(res.principal)}</p>
          <p><b>Rendimento mensal:</b> {brl(res.rendimentoMensal)}</p>
          <p><b>Rendimento total:</b> {brl(res.totalRend)}</p>
          <p><b>Valor final:</b> {brl(res.valorFinal)}</p>
        </div>
      ) : <p style={{marginTop:20}}>Informe um valor válido.</p>}
    </div>
  );
}
