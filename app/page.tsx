'use client';
import React, { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

/**
 * Calculadora de Simulação – sem botões de copiar/baixar.
 */

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
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 2,
  }).format(isFinite(n) ? n : 0);
}

function pct(n: number) {
  return `${(n * 100).toFixed(2)}%`;
}

export default function CalculadoraTHPrivate() {
  const [loteId, setLoteId] = useState("1");
  const [valor, setValor] = useState<string>("");
  const [modo, setModo] = useState<Modo>("mensal");
  const [lead, setLead] = useState({ nome: "", email: "", whatsapp: "" });

  const lote = useMemo(() => LOTES.find(l => String(l.id) === loteId)!, [loteId]);

  const valorNum = useMemo(() => {
    const v = Number(String(valor).replace(/[^0-9,\.]/g, "").replace(/\./g, "").replace(/,(\d{2})$/, ".$1"));
    return isFinite(v) ? v : 0;
  }, [valor]);

  const cotasInfo = useMemo(() => {
    if (!lote) return { cotas: 0, arredondado: 0, resto: 0 };
    const cotas = Math.floor(valorNum / lote.cota);
    const arredondado = cotas * lote.cota;
    const resto = valorNum - arredondado;
    return { cotas, arredondado, resto };
  }, [valorNum, lote]);

  const resultados = useMemo(() => {
    if (!lote || cotasInfo.cotas <= 0) return null;
    const principal = cotasInfo.cotas * lote.cota;
    const n = lote.prazo;
    const i = lote.taxaMes;

    if (modo === "mensal") {
      const rendimentoMensal = principal * i;
      const totalRend = rendimentoMensal * n;
      const valorFinal = principal + totalRend;
      return { principal, rendimentoMensal, totalRend, valorFinal };
    }

    const valorFinal = principal * Math.pow(1 + i, n);
    const totalRend = valorFinal - principal;
    const rendimentoMensalEquivalente = totalRend / n;
    return { principal, rendimentoMensal: rendimentoMensalEquivalente, totalRend, valorFinal };
  }, [lote, cotasInfo.cotas, modo]);

  const restoMsg = cotasInfo.resto > 0 ? `Observação: o valor informado não é múltiplo exato da cota do ${lote.nome}. Consideramos ${cotasInfo.cotas} cotas (R$ ${cotasInfo.arredondado.toLocaleString("pt-BR")}).` : "";

  return (
    <div className="min-h-screen w-full bg-black text-gray-100 py-10">
      <div className="max-w-5xl mx-auto px-4">
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-white">Calculadora de Simulação – TH Private</h1>
          <p className="text-gray-300 mt-2 max-w-3xl">Simule sua participação com rentabilidade pré‑fixada por lote, dentro da estrutura jurídica de SCP. Modelo baseado em <span className="font-semibold text-white">carro por assinatura premium</span> com opção de compra.</p>
        </header>

        <div className="grid md:grid-cols-5 gap-6 items-start">
          <Card className="md:col-span-2 bg-gray-900 border-gray-700 rounded-2xl shadow-lg">
            <CardContent className="p-6 space-y-5">
              <div>
                <Label className="text-white">Escolha o lote</Label>
                <Select value={loteId} onValueChange={setLoteId}>
                  <SelectTrigger className="mt-2 bg-gray-950 border-gray-700 text-white">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-gray-700 text-white">
                    {LOTES.map((l) => (
                      <SelectItem key={l.id} value={String(l.id)}>
                        {l.nome} • cota {brl(l.cota)} • {l.prazo}m • {pct(l.taxaMes)}/m
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-white">Quanto você deseja aportar?</Label>
                <Input
                  inputMode="numeric"
                  placeholder="Ex.: 100.000"
                  className="mt-2 bg-gray-950 border-gray-700 text-white placeholder:text-gray-500"
                  value={valor}
                  onChange={(e) => setValor(e.target.value)}
                />
                {restoMsg && (
                  <p className="text-xs text-amber-400 mt-2">{restoMsg}</p>
                )}
                <p className="text-xs text-gray-400 mt-1">Mínimo por cota no {lote.nome}: {brl(lote.cota)}.</p>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-white">Modalidade de recebimento</Label>
                  <p className="text-xs text-gray-400">Mensal ou total no final (bullet)</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs ${modo === "mensal" ? "text-white" : "text-gray-500"}`}>Mensal</span>
                  <Switch checked={modo === "bullet"} onCheckedChange={(v) => setModo(v ? "bullet" : "mensal")} />
                  <span className={`text-xs ${modo === "bullet" ? "text-white" : "text-gray-500"}`}>No Final</span>
                </div>
              </div>

              <div>
                <Label className="text-white">Observações (opcional)</Label>
                <Textarea className="bg-gray-950 border-gray-700 text-white placeholder:text-gray-500" placeholder="Ex.: desejo reaplicar rendimentos, interesse em ticket maior, etc." />
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-3 bg-gray-900 border-gray-700 rounded-2xl shadow-lg">
            <CardContent className="p-6 space-y-5">
              <h2 className="text-xl font-medium text-white">Resumo da simulação</h2>

              {(!resultados || cotasInfo.cotas <= 0) ? (
                <p className="text-gray-400">Informe um valor válido para ver os resultados.</p>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-gray-950 border border-gray-700 rounded-2xl p-4 space-y-2">
                    <Item k="Lote selecionado" v={`${lote.nome} | Cota ${brl(lote.cota)} | Prazo ${lote.prazo} meses | ${pct(lote.taxaMes)}/mês`} />
                    <Item k="Cotas consideradas" v={`${cotasInfo.cotas} ${cotasInfo.cotas === 1 ? "cota" : "cotas"}`} />
                    <Item k="Valor aportado" v={brl(resultados.principal)} />
                    <Item k="Modalidade" v={modo === "mensal" ? "Recebimento Mensal" : "Recebimento no Final (Bullet)"} />
                    <Item k={modo === "mensal" ? "Rendimento mensal" : "Média mensal (ref.)"} v={brl(resultados.rendimentoMensal)} />
                  </div>
                  <div className="bg-gray-950 border border-gray-700 rounded-2xl p-4 space-y-2">
                    <Item k="Rendimento total" v={brl(resultados.totalRend)} />
                    <Item k="Valor final ao término" v={brl(resultados.valorFinal)} />
                    <Item k="Prazo" v={`${lote.prazo} meses`} />
                  </div>
                </div>
              )}

              <p className="text-xs text-gray-400 leading-relaxed"><span className="font-semibold text-white">Avisos:</span> Simulação ilustrativa, baseada em rentabilidade pré-fixada. Estrutura via SCP, operações de carro por assinatura premium. Não é produto bancário.</p>
            </CardContent>
          </Card>
        </div>

        <section className="mt-10">
          <Card className="bg-gray-900 border-gray-700 rounded-2xl shadow-lg">
            <CardContent className="p-6">
              <h3 className="text-xl font-medium text-white mb-1">Receba sua simulação</h3>
              <p className="text-gray-400 mb-4">Preencha seus dados para receber o PDF da simulação e agendar conversa com nosso time.</p>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-white">Nome</Label>
                  <Input className="mt-2 bg-gray-950 border-gray-700 text-white" value={lead.nome} onChange={(e)=>setLead({...lead, nome: e.target.value})} placeholder="Seu nome" />
                </div>
                <div>
                  <Label className="text-white">E-mail</Label>
                  <Input className="mt-2 bg-gray-950 border-gray-700 text-white" value={lead.email} onChange={(e)=>setLead({...lead, email: e.target.value})} placeholder="voce@exemplo.com" />
                </div>
                <div>
                  <Label className="text-white">WhatsApp</Label>
                  <Input className="mt-2 bg-gray-950 border-gray-700 text-white" value={lead.whatsapp} onChange={(e)=>setLead({...lead, whatsapp: e.target.value})} placeholder="(31) 9 9999-9999" />
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3 mt-5">
                <Button className="bg-white text-black hover:bg-gray-200">Gerar PDF da Simulação</Button>
                <Button variant="secondary" className="bg-gray-800 border border-gray-600 hover:bg-gray-700 text-white">Agendar conversa privada</Button>
              </div>
            </CardContent>
          </Card>
        </section>

        <footer className="text-center text-gray-500 text-xs mt-8">
          © {new Date().getFullYear()} TH Private • Exclusividade, segurança e previsibilidade.
        </footer>
      </div>
    </div>
  );
}

function Item({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex flex-col text-sm">
      <span className="text-gray-400">{k}</span>
      <span className="font-medium text-white whitespace-pre-line">{v}</span>
    </div>
  );
}
