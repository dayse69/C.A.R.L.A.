import { logger } from "../utils/logger.js";
/**
 * Parser de PDF para Fichas Tormenta 20
 * Extrai dados de PDFs de ficha e converte para o formato JSON do bot
 *
 * Nota: Para usar PDFs reais, instale: npm i pdf-parse @types/pdf-parse
 */

interface FichaExtraidaPDF {
    nome: string;
    raca: string;
    classe: string;
    nivel: number;
    atributos: {
        FOR: number;
        DES: number;
        CON: number;
        INT: number;
        SAB: number;
        CAR: number;
    };
    recursos?: {
        pv?: { maximo: number };
        pm?: { maximo: number };
        defesa?: number;
    };
    pericias?: Record<string, number>;
    magias?: Array<{ nome: string; circulo: number; custoPM: number }>;
}

/**
 * Extrai texto de um PDF (requer pdf-parse instalado)
 */
export async function extrairTextoPDF(caminhoArquivo: string): Promise<string> {
    try {
        // Importação dinâmica para evitar erro se pdf-parse não está instalado
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const PDFParse = require("pdf-parse");
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const fs = require("fs");
        const dadosArquivo = fs.readFileSync(caminhoArquivo);
        const dados = await PDFParse(dadosArquivo);
        return dados.text;
    } catch (erro) {
        logger.error("Erro ao extrair PDF. Instale com: npm i pdf-parse @types/pdf-parse");
        throw erro;
    }
}

/**
 * Parser básico de PDF de ficha Tormenta 20
 * Identifica padrões comuns em fichas padrão do sistema
 */
export function parsearFichaPDF(textoExtraido: string): FichaExtraidaPDF {
    const ficha: FichaExtraidaPDF = {
        nome: "",
        raca: "",
        classe: "",
        nivel: 1,
        atributos: {
            FOR: 10,
            DES: 10,
            CON: 10,
            INT: 10,
            SAB: 10,
            CAR: 10,
        },
        pericias: {},
        magias: [],
    };

    // Extrai nome (primeira linha importante)
    const nomeMatch = textoExtraido.match(/(?:Nome|NAME)[\s:]*([^\n]+)/i);
    if (nomeMatch) ficha.nome = nomeMatch[1].trim();

    // Extrai raça
    const racaMatch = textoExtraido.match(/(?:Raça|Race)[\s:]*([^\n]+)/i);
    if (racaMatch) ficha.raca = racaMatch[1].trim();

    // Extrai classe
    const classeMatch = textoExtraido.match(/(?:Classe|Class)[\s:]*([^\n]+)/i);
    if (classeMatch) ficha.classe = classeMatch[1].trim();

    // Extrai nível
    const nivelMatch = textoExtraido.match(/(?:Nível|Level)[\s:]*(\d+)/i);
    if (nivelMatch) ficha.nivel = parseInt(nivelMatch[1], 10);

    // Extrai atributos (padrão: FOR 15, DES 14, etc)
    const atributosPatterns: (keyof typeof ficha.atributos)[] = [
        "FOR",
        "DES",
        "CON",
        "INT",
        "SAB",
        "CAR",
    ];
    atributosPatterns.forEach((attr) => {
        const regex = new RegExp(`${attr}\\s*[:\\-]?\\s*(\\d+)`, "i");
        const match = textoExtraido.match(regex);
        if (match) {
            const valor = parseInt(match[1], 10);
            if (valor >= 3 && valor <= 20) {
                ficha.atributos[attr] = valor;
            }
        }
    });

    // Extrai PV máximo
    const pvMatch = textoExtraido.match(/(?:PV|HP|Pontos? de Vida)[\s\/:]*(\d+)/i);
    if (pvMatch && ficha.recursos) {
        ficha.recursos.pv = { maximo: parseInt(pvMatch[1], 10) };
    }

    // Extrai PM máximo
    const pmMatch = textoExtraido.match(/(?:PM|MP|Pontos? de Mana)[\s\/:]*(\d+)/i);
    if (pmMatch && ficha.recursos) {
        ficha.recursos.pm = { maximo: parseInt(pmMatch[1], 10) };
    }

    // Extrai defesa
    const defesaMatch = textoExtraido.match(/(?:Defesa|CA|AC)[\s:\-]*(\d+)/i);
    if (defesaMatch && ficha.recursos) {
        ficha.recursos.defesa = parseInt(defesaMatch[1], 10);
    }

    return ficha;
}

/**
 * Converte ficha extraída para o formato Character completo
 */
export function converterParaCharacter(fichaExtraida: FichaExtraidaPDF, usuarioId: string) {
    return {
        _id: `${usuarioId}-${fichaExtraida.nome.toLowerCase().replace(/\s+/g, "-")}`,
        usuarioId,
        nome: fichaExtraida.nome || "Personagem Sem Nome",
        raca: fichaExtraida.raca || "Humano",
        classe: fichaExtraida.classe || "Guerreiro",
        nivelTotal: fichaExtraida.nivel || 1,
        atributos: fichaExtraida.atributos,
        recursos: {
            pv: {
                atual:
                    Math.floor((fichaExtraida.atributos.CON - 10) / 2) +
                    12 +
                    (fichaExtraida.nivel - 1) * 3,
                maximo:
                    Math.floor((fichaExtraida.atributos.CON - 10) / 2) +
                    12 +
                    (fichaExtraida.nivel - 1) * 3,
                temporario: 0,
            },
            pm: {
                atual: fichaExtraida.nivel * 2,
                maximo: fichaExtraida.nivel * 2,
            },
            defesa: fichaExtraida.recursos?.defesa || 10,
            deslocamento: 9,
            resistencias: {
                fortitude: Math.floor((fichaExtraida.atributos.CON - 10) / 2),
                reflexos: Math.floor((fichaExtraida.atributos.DES - 10) / 2),
                vontade: Math.floor((fichaExtraida.atributos.SAB - 10) / 2),
            },
        },
        pericias: fichaExtraida.pericias || {},
        poderes: [],
        magias: fichaExtraida.magias || [],
        inventario: [],
        historia: {
            aparencia: "Um aventureiro de Arton",
            anotacoes: `Ficha importada de PDF em ${new Date().toLocaleDateString("pt-BR")}`,
        },
        status: [],
        ressonancia: {
            atual: 0,
            proximo: fichaExtraida.nivel * 1000,
            total: 0,
        },
        paginas: {
            total: 0,
        },
        criadoEm: new Date().toISOString(),
        atualizadoEm: new Date().toISOString(),
    };
}
