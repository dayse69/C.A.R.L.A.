/**
 * RollService
 * Lógica para rolagens de dados, ataques, danos, etc.
 */

export interface RollResult {
    total: number;
    rolls: number[];
    detalhes: string;
    tipo: "sucesso" | "fracasso" | "critico" | "falha_critica";
}

/**
 * Rola um dado d20
 */
export function rolarD20(): number {
    return Math.floor(Math.random() * 20) + 1;
}

/**
 * Rola um dado genérico
 */
export function rolarDado(tipo: string): number {
    const match = tipo.match(/d(\d+)/);
    if (!match) return 0;

    const lados = parseInt(match[1]);
    return Math.floor(Math.random() * lados) + 1;
}

/**
 * Rola múltiplos dados (ex: 3d6)
 */
export function rolarMultiplosDados(quantidade: number, tipo: string): RollResult {
    const rolls: number[] = [];

    for (let i = 0; i < quantidade; i++) {
        rolls.push(rolarDado(tipo));
    }

    const total = rolls.reduce((a, b) => a + b, 0);

    return {
        total,
        rolls,
        detalhes: `${quantidade}${tipo}: [${rolls.join(", ")}]`,
        tipo: "sucesso",
    };
}

/**
 * Rola um teste de perícia
 */
export function rolarPericia(modificador: number, descricao: string = "Teste"): RollResult {
    const d20 = rolarD20();
    const total = d20 + modificador;

    let tipo: "sucesso" | "fracasso" | "critico" | "falha_critica" = "sucesso";
    if (d20 === 20) tipo = "critico";
    if (d20 === 1) tipo = "falha_critica";

    return {
        total,
        rolls: [d20],
        detalhes: `${descricao}: d20 (${d20}) + ${modificador} = **${total}**`,
        tipo,
    };
}

/**
 * Rola um ataque
 */
export function rolarAtaque(
    modificadorAtaque: number,
    modificadorDano: number,
    dadoDano: string = "d6"
): RollResult {
    const d20 = rolarD20();
    const totalAtaque = d20 + modificadorAtaque;
    const danoRoll = rolarMultiplosDados(1, dadoDano);
    const totalDano = danoRoll.total + modificadorDano;

    let tipo: "sucesso" | "fracasso" | "critico" | "falha_critica" = "sucesso";
    if (d20 === 20) tipo = "critico";
    if (d20 === 1) tipo = "falha_critica";

    return {
        total: totalAtaque,
        rolls: [d20, danoRoll.total],
        detalhes: `Ataque: ${d20} + ${modificadorAtaque} = **${totalAtaque}**\nDano: ${danoRoll.total} + ${modificadorDano} = **${totalDano}**`,
        tipo,
    };
}

/**
 * Formata o resultado de uma rolagem para exibição
 */
export function formatarResultadoRolagem(resultado: RollResult): string {
    const emoji = {
        sucesso: "✅",
        fracasso: "❌",
        critico: "✨",
        falha_critica: "💀",
    };

    return `${emoji[resultado.tipo]} ${resultado.detalhes}`;
}

/**
 * Interpreta resultado de teste (DC = Dificuldade)
 */
export function interpretarTeste(
    resultado: number,
    dc: number
): { sucesso: boolean; margemSucesso: number; descricao: string } {
    const margemSucesso = resultado - dc;
    const sucesso = resultado >= dc;

    let descricao = "";
    if (margemSucesso >= 10) descricao = "Sucesso extraordinário!";
    else if (margemSucesso >= 5) descricao = "Sucesso bom!";
    else if (sucesso) descricao = "Sucesso por pouco!";
    else if (margemSucesso >= -5) descricao = "Falha por pouco!";
    else descricao = "Falha crítica!";

    return { sucesso, margemSucesso, descricao };
}
