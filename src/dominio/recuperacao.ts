/**
 * Orientação de recuperação.
 *
 * Aparece quando a planta cruza o limiar de atenção. O conteúdo é o da
 * seção 6 do design, e o ponto central contraria o instinto de todo mundo:
 * **não se aumenta a quantidade de água.** O volume é definido pelo vaso;
 * o que muda é a técnica.
 */

export interface PassoDeRecuperacao {
  titulo: string
  detalhe: string
}

export const PASSOS_DE_RECUPERACAO: PassoDeRecuperacao[] = [
  {
    titulo: 'Não aumente a quantidade de água',
    detalhe:
      'O volume é o mesmo de sempre: regue até escorrer pelo furo e descarte o que ficar no ' +
      'prato. Encharcar uma raiz que passou por seca é como boa parte das plantas morre.',
  },
  {
    titulo: 'Regue por imersão',
    detalhe:
      'Substrato muito seco repele água: ela desce pelas beiradas e sai pelo furo sem molhar ' +
      'o miolo do torrão. Deixe o vaso numa bacia com água por 10 a 20 minutos, até a ' +
      'superfície ficar úmida.',
  },
  {
    titulo: 'Não adube agora',
    detalhe:
      'Adubo em raiz seca queima a raiz. O app já suspendeu a sugestão de adubação desta ' +
      'planta e volta a sugerir um ciclo de rega depois da recuperação.',
  },
  {
    titulo: 'Não aumente a luz',
    detalhe: 'Planta desidratada em sol mais forte piora. Mantenha onde está enquanto se refaz.',
  },
  {
    titulo: 'Espere perder as folhas mais velhas',
    detalhe:
      'As de baixo podem amarelar e cair. É a planta se desfazendo do que não consegue ' +
      'sustentar, não sinal de que você errou na correção.',
  },
  {
    titulo: 'Flores e botões podem cair',
    detalhe:
      'A planta abandona a floração antes de abandonar a folhagem. Perder a flor é o preço ' +
      'do atraso, não um novo problema.',
  },
]
