/**
 * Sistema de Habilidades Reagentes
 * Permite que personagens usem reações em combate
 */

export interface Reacao {
    id: string;
    nome: string;
    descricao: string;
    acionador: string; // quando pode ser usada (ataque contra você, aliado cai, etc)
    efeito: string; // o que faz
    custo: {
        tipo: "reacao" | "pm" | "nenhum";
        valor: number;
    };
    frequencia: "por-turno" | "por-combate" | "ilimitada";
    usosRestantes: number;
    nivel: number; // nível mínimo para ter
    pericias?: string[]; // perícias necessárias
    condicoes?: string[]; // condições de ativação
}

export interface HabilidadesReagentes {
    reacoes: Reacao[];
    ultimaReacaoUsada?: Date;
    contraAtaques: number; // quantos contra-ataques restam
    aparicoes: number; // aparições especiais restantes
}

/**
 * Habilidades padrão de reação em Tormenta 20
 */
export const REACOES_PADRAO: Record<string, Reacao> = {
    // REAÇÕES DE ESQUIVA
    esquiva_reflexiva: {
        id: "esquiva-reflexiva",
        nome: "Esquiva Reflexiva",
        descricao: "Quando atingido por um ataque, você pode se esquivar",
        acionador: "Quando sofre um ataque corpo a corpo",
        efeito: "+2 à defesa contra este ataque",
        custo: { tipo: "reacao", valor: 1 },
        frequencia: "por-turno",
        usosRestantes: 1,
        nivel: 1,
    },

    // REAÇÕES DE DEFESA
    escudo_improviso: {
        id: "escudo-improviso",
        nome: "Escudo Improviso",
        descricao: "Use um objeto próximo como escudo",
        acionador: "Quando seria atingido por dano a distância",
        efeito: "Reduce dano em 1d6",
        custo: { tipo: "reacao", valor: 1 },
        frequencia: "por-turno",
        usosRestantes: 1,
        nivel: 3,
    },

    // REAÇÕES DE CONTRAATAQUE
    contra_ataque: {
        id: "contra-ataque",
        nome: "Contra-Ataque",
        descricao: "Responda a um ataque com um ataque próprio",
        acionador: "Quando um inimigo erra um ataque contra você",
        efeito: "Role um ataque contra o atacante",
        custo: { tipo: "reacao", valor: 1 },
        frequencia: "por-turno",
        usosRestantes: 1,
        nivel: 2,
    },

    // REAÇÕES MÁGICAS
    disparo_arcano: {
        id: "disparo-arcano",
        nome: "Disparo Arcano",
        descricao: "Lance uma magia rapidamente em resposta",
        acionador: "Quando um inimigo entra em seu alcance",
        efeito: "Conjura uma magia de até 1º círculo como reação",
        custo: { tipo: "pm", valor: 2 },
        frequencia: "por-turno",
        usosRestantes: 1,
        nivel: 4,
    },

    // REAÇÕES DEFENSIVAS ESPECIAIS
    proteccao_aliado: {
        id: "proteccao-aliado",
        nome: "Proteção de Aliado",
        descricao: "Coloque-se entre um aliado e um ataque",
        acionador: "Quando um aliado próximo é alvo de um ataque",
        efeito: "O ataque o atinge em vez do aliado",
        custo: { tipo: "reacao", valor: 1 },
        frequencia: "por-turno",
        usosRestantes: 1,
        nivel: 3,
    },
};

/**
 * Calcula reações disponíveis baseado no nível do personagem
 */
export function calcularReacoesDisponiveis(nivel: number): Reacao[] {
    return Object.values(REACOES_PADRAO)
        .filter((r) => r.nivel <= nivel)
        .map((r) => ({
            ...r,
            usosRestantes: r.frequencia === "ilimitada" ? Infinity : 1,
        }));
}

/**
 * Usa uma reação e atualiza seu cooldown
 */
export function usarReacao(
    reacoes: Reacao[],
    reacaoId: string
): { sucesso: boolean; erro?: string } {
    const reacao = reacoes.find((r) => r.id === reacaoId);

    if (!reacao) {
        return { sucesso: false, erro: "Reação não encontrada" };
    }

    if (reacao.usosRestantes <= 0 && reacao.frequencia !== "ilimitada") {
        return { sucesso: false, erro: "Reação já foi usada este turno" };
    }

    if (reacao.frequencia !== "ilimitada") {
        reacao.usosRestantes--;
    }

    return { sucesso: true };
}

/**
 * Restaura reações no início do turno
 */
export function restaurarReacoes(reacoes: Reacao[]): void {
    reacoes.forEach((r) => {
        if (r.frequencia === "por-turno") {
            r.usosRestantes = 1;
        }
    });
}

/**
 * Restaura reações no início do combate
 */
export function restaurarReacoesCombate(reacoes: Reacao[]): void {
    reacoes.forEach((r) => {
        if (r.frequencia === "por-combate") {
            r.usosRestantes = 1;
        }
    });
}
