/**
 * FichaService
 * Lógica de negócio para criação, edição e gerenciamento de fichas
 * Estrutura completa conforme especificação de Tormenta 20
 */
/**
 * Rola dados (4d6, descarta o menor)
 */
export function rolarAtributo() {
    const rolls = Array(4)
        .fill(0)
        .map(() => Math.floor(Math.random() * 6) + 1);
    rolls.sort((a, b) => b - a);
    return rolls.slice(0, 3).reduce((a, b) => a + b, 0);
}
/**
 * Calcula modificador baseado no valor do atributo
 */
export function calcularModificador(valor) {
    return Math.floor((valor - 10) / 2);
}
/**
 * Formata modificador com sinal
 */
export function formatarModificador(mod) {
    return mod >= 0 ? `+${mod}` : `${mod}`;
}
/**
 * Calcula stats da ficha baseado nos atributos
 */
export function calcularStats(atributos, _raca, classe, nivel) {
    const modCON = calcularModificador(atributos.CON);
    const modDES = calcularModificador(atributos.DES);
    // PV base: 12 + modificador de CON por nível
    const pvMax = 12 + modCON * nivel;
    // PM base: varia por classe (isso é simplificado)
    const pmBase = classe === "Mago" ? 20 : classe === "Clérigo" ? 15 : 10;
    const pmMax = pmBase + nivel * 2;
    // Defesa: 10 + modificador de DES + bônus de armadura
    const defesa = 10 + modDES;
    // Deslocamento padrão
    const deslocamento = 9;
    // Resistências base (simplificadas)
    return {
        pv: {
            maximo: pvMax,
            atual: pvMax,
            temporario: 0,
        },
        pm: {
            maximo: pmMax,
            atual: pmMax,
        },
        defesa,
        deslocamento,
        resistencias: {
            fortitude: modCON,
            reflexos: modDES,
            vontade: 0,
        },
    };
}
/**
 * Cria um personagem novo
 */
export function criarPersonagem(userId, nome, raca, classe, nivel = 1) {
    const atributos = {
        FOR: rolarAtributo(),
        DES: rolarAtributo(),
        CON: rolarAtributo(),
        INT: rolarAtributo(),
        SAB: rolarAtributo(),
        CAR: rolarAtributo(),
    };
    const recursos = calcularStats(atributos, raca, classe, nivel);
    return {
        id: `${userId}_${Date.now()}`,
        userId,
        nome,
        jogador: userId,
        raca,
        origem: "Indefinida",
        classes: [{ nome: classe, nivel }],
        nivelTotal: nivel,
        atributos,
        recursos,
        pericias: inicializarPericias(),
        equipamento: {
            armadura: { nome: "Roupa comum", bonus: 0 },
            armasPrincipais: [],
            armasSecundarias: [],
            acessorios: [],
        },
        poderes: [],
        podoresRaciais: [],
        podoresDeOrigem: [],
        talentos: [],
        habilidadesEspeciais: [],
        magias: [],
        inventario: [],
        historia: {
            aparencia: "",
            personalidade: "",
            historico: "",
            objetivos: "",
            anotacoes: "",
            aliados: [],
            inimigos: [],
            marcaDaTormenta: false,
        },
        criadoEm: new Date(),
        atualizadoEm: new Date(),
    };
}
/**
 * Inicializa perícias com valor 0
 */
function inicializarPericias() {
    return {
        acrobacia: 0,
        adestramento: 0,
        atletismo: 0,
        atuacao: 0,
        cavalgar: 0,
        conhecimento: 0,
        cura: 0,
        diplomacia: 0,
        enganacao: 0,
        fortitude: 0,
        furtividade: 0,
        guerra: 0,
        iniciativa: 0,
        intimidacao: 0,
        investigacao: 0,
        intuicao: 0,
        jogatina: 0,
        ladinagem: 0,
        luta: 0,
        misticismo: 0,
        nobreza: 0,
        oficio1: 0,
        oficio2: 0,
        pilotagem: 0,
        pontaria: 0,
        reflexos: 0,
        religiao: 0,
        sobrevivencia: 0,
        vontade: 0,
        percepcao: 0,
    };
}
/**
 * Atualiza um atributo
 */
export function atualizarAtributo(character, atributo, novoValor) {
    const atributosAtualizados = { ...character.atributos, [atributo]: novoValor };
    const recursosAtualizados = calcularStats(atributosAtualizados, character.raca, character.classes[0]?.nome || "Aventureiro", character.nivelTotal);
    return {
        ...character,
        atributos: atributosAtualizados,
        recursos: recursosAtualizados,
        atualizadoEm: new Date(),
    };
}
/**
 * Adiciona item ao inventário
 */
export function adicionarItemInventario(character, item) {
    return {
        ...character,
        inventario: [...character.inventario, item],
        atualizadoEm: new Date(),
    };
}
/**
 * Subi de nível o personagem
 */
export function subirDeNivel(character) {
    const novoNivel = Math.min(character.nivelTotal + 1, 20);
    const recursosAtualizados = calcularStats(character.atributos, character.raca, character.classes[0]?.nome || "Aventureiro", novoNivel);
    return {
        ...character,
        nivelTotal: novoNivel,
        classes: character.classes.map((c, i) => (i === 0 ? { ...c, nivel: c.nivel + 1 } : c)),
        recursos: recursosAtualizados,
        atualizadoEm: new Date(),
    };
}
/**
 * Remove item do inventário
 */
export function removerItemInventario(character, itemId) {
    return {
        ...character,
        inventario: character.inventario.filter((item) => item.id !== itemId),
        atualizadoEm: new Date(),
    };
}
