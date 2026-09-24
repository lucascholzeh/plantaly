/**
 * O que fazer quando o aparelho e o banco discordam sobre a inscrição.
 *
 * Separado de `push.ts` para ser testável sem navegador e sem Supabase: é a
 * decisão que importa acertar, e o erro caro é um só — tratar falha de rede
 * como inscrição perdida. Nesse caso o app descartaria uma inscrição que
 * funciona só porque a consulta não voltou.
 */

export interface SituacaoDaInscricao {
  permissao: NotificationPermission
  /** O navegador ainda guarda uma inscrição (`getSubscription()`). */
  temNoAparelho: boolean
  /**
   * O banco tem a linha deste endpoint. `null` quando a consulta falhou —
   * não sabemos, e "não sei" nunca pode virar "sumiu".
   */
  temNoBanco: boolean | null
}

export type Reconciliacao = 'nada' | 'refazer'

export function decidirReconciliacao(s: SituacaoDaInscricao): Reconciliacao {
  // Sem permissão não há o que refazer, e sem inscrição no aparelho a tela
  // já mostra "desligado" corretamente — o convite cuida disso.
  if (s.permissao !== 'granted' || !s.temNoAparelho) return 'nada'

  // Linha ausente com inscrição presente só acontece de um jeito: a Edge
  // Function recebeu 404/410 da Apple e apagou. O endpoint está morto —
  // regravar o mesmo seria apagado de novo na manhã seguinte.
  return s.temNoBanco === false ? 'refazer' : 'nada'
}
