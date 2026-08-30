/**
 * Detecção de instalação na Tela de Início.
 *
 * No iOS, notificação só funciona para web app instalado — não existe push
 * para site aberto no Safari. Como os dois usuários usam iPhone, esta
 * detecção é pré-requisito da Etapa 7, não enfeite.
 */

/** O app está rodando como aplicativo instalado? */
export function estaInstalado(): boolean {
  // `standalone` é a propriedade do Safari no iOS; a media query é o padrão
  // que os demais navegadores implementam. Os dois precisam ser checados.
  const safariIOS = (window.navigator as { standalone?: boolean }).standalone === true
  const padrao = window.matchMedia('(display-mode: standalone)').matches
  return safariIOS || padrao
}

export function ehIOS(): boolean {
  const ua = window.navigator.userAgent
  // iPadOS moderno se apresenta como Macintosh; o toque é o que o distingue.
  const iPadDisfarçado = /Macintosh/.test(ua) && navigator.maxTouchPoints > 1
  return /iPhone|iPad|iPod/.test(ua) || iPadDisfarçado
}

/** O Safari é o único navegador do iOS que instala na Tela de Início. */
export function ehSafari(): boolean {
  const ua = window.navigator.userAgent
  return /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS/.test(ua)
}

const CHAVE_DISPENSA = 'plantaly:convite-instalacao-dispensado'
const CHAVE_JA_INSTALADO = 'plantaly:ja-instalado'

export function conviteDispensado(): boolean {
  try {
    if (window.localStorage.getItem(CHAVE_JA_INSTALADO) === 'sim') return true
    const ate = window.localStorage.getItem(CHAVE_DISPENSA)
    return ate !== null && Number(ate) > Date.now()
  } catch {
    // Navegação privada pode recusar o armazenamento. Sem memória, o convite
    // reaparece — é melhor insistir um pouco que sumir para sempre.
    return false
  }
}

/** Dispensa o convite por uma semana, não para sempre. */
export function dispensarConvite(): void {
  try {
    const umaSemana = Date.now() + 7 * 24 * 60 * 60 * 1000
    window.localStorage.setItem(CHAVE_DISPENSA, String(umaSemana))
  } catch {
    // Sem armazenamento não há o que fazer; o convite volta na próxima visita.
  }
}

/**
 * "Já adicionei": esconde o convite para sempre.
 *
 * A detecção automática (`estaInstalado`) já esconde o convite quando o app
 * roda pela Tela de Início. Mas o Safari e o app instalado têm
 * `localStorage` separados, então quem instalou e depois volta ao Safari vê
 * o convite de novo, para sempre — e não tem como dizer que já fez. Este é o
 * caminho para essa pessoa sair do laço.
 */
export function marcarComoInstalado(): void {
  try {
    window.localStorage.setItem(CHAVE_JA_INSTALADO, 'sim')
  } catch {
    // Sem armazenamento o convite volta; nada a fazer além de não quebrar.
  }
}
