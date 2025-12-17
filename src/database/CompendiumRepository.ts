/**
 * Repositório do Compendium - Acervo do Golem
 * Gerencia leitura e acesso aos dados do compendium
 */

import { readFileSync } from "fs";
import { join } from "path";

// Tipos do Compendium
export interface CompendiumData {
    nome: string;
    descricao: string;
    versao: string;
    ultimaAtualizacao: string;
    classes: {
        classe_principal: Class[];
        classe_alternativa: Class[];
    };
    distincoes: Distincao[];
    racas: Raca[];
    poderes_gerais: Poder[];
    deuses: Deus[];
    itens: {
        mundanos: Item[];
        aprimados: Item[];
        magicos: Item[];
    };
}

export interface Class {
    id: string;
    nome: string;
    descricao: string;
    pv_base: number;
    pm_base?: number;
    habilidades: string[];
}

export interface Distincao {
    id: string;
    nome: string;
    descricao: string;
    tipo: string;
    requisitos: string;
    beneficios: string[];
}

export interface Raca {
    id: string;
    nome: string;
    descricao: string;
    bonus: Record<string, number>;
    habilidades: string[];
}

export interface Poder {
    id: string;
    nome: string;
    descricao: string;
    tipo: string;
    tempo: string;
    nivel_minimo: number;
    bonus?: string;
}

export interface Deus {
    id: string;
    nome: string;
    descricao: string;
    dominio: string;
    alinhamento: string;
    simbolo: string;
    clerigos: {
        pv_base: number;
        pm_base?: number;
        habilidades: string[];
    };
}

export interface Item {
    id: string;
    nome: string;
    descricao: string;
    peso: string;
    valor: string;
    raridade: string;
    tipo: string;
    [key: string]: any;
}

/**
 * Repositório de Compendium
 * Carrega e fornece acesso aos dados do Acervo do Golem
 */
export class CompendiumRepository {
    private static compendiumData: CompendiumData | null = null;

    /**
     * Carrega o compendium do arquivo JSON
     */
    private static loadCompendium(): CompendiumData {
        if (this.compendiumData !== null) {
            return this.compendiumData as CompendiumData;
        }

        try {
            const filePath = join(process.cwd(), "data", "compendium", "acervo-do-golem.json");
            const data = readFileSync(filePath, "utf-8");
            this.compendiumData = JSON.parse(data);
            return this.compendiumData as CompendiumData;
        } catch (error) {
            console.error("Erro ao carregar compendium:", error);
            throw new Error("Não foi possível carregar o Acervo do Golem");
        }
    }

    /**
     * Obter todas as classes principais
     */
    static getClassesPrincipais(): Class[] {
        const data = this.loadCompendium();
        return data.classes.classe_principal;
    }

    /**
     * Obter todas as classes alternativas
     */
    static getClassesAlternativas(): Class[] {
        const data = this.loadCompendium();
        return data.classes.classe_alternativa;
    }

    /**
     * Obter uma classe por ID
     */
    static getClasseById(id: string): Class | undefined {
        const data = this.loadCompendium();
        const allClasses = [...data.classes.classe_principal, ...data.classes.classe_alternativa];
        return allClasses.find((c) => c.id === id);
    }

    /**
     * Obter uma classe por nome
     */
    static getClasseByName(nome: string): Class | undefined {
        const data = this.loadCompendium();
        const allClasses = [...data.classes.classe_principal, ...data.classes.classe_alternativa];
        return allClasses.find((c) => c.nome.toLowerCase() === nome.toLowerCase());
    }

    /**
     * Obter todas as distinções
     */
    static getDistincoes(): Distincao[] {
        const data = this.loadCompendium();
        return data.distincoes;
    }

    /**
     * Obter uma distinção por ID
     */
    static getDistincaoById(id: string): Distincao | undefined {
        const data = this.loadCompendium();
        return data.distincoes.find((d) => d.id === id);
    }

    /**
     * Obter todas as raças
     */
    static getRacas(): Raca[] {
        const data = this.loadCompendium();
        return data.racas;
    }

    /**
     * Obter uma raça por ID
     */
    static getRacaById(id: string): Raca | undefined {
        const data = this.loadCompendium();
        return data.racas.find((r) => r.id === id);
    }

    /**
     * Obter uma raça por nome
     */
    static getRacaByName(nome: string): Raca | undefined {
        const data = this.loadCompendium();
        return data.racas.find((r) => r.nome.toLowerCase() === nome.toLowerCase());
    }

    /**
     * Obter todos os poderes gerais
     */
    static getPoderesGerais(): Poder[] {
        const data = this.loadCompendium();
        return data.poderes_gerais;
    }

    /**
     * Obter um poder por ID
     */
    static getPoderById(id: string): Poder | undefined {
        const data = this.loadCompendium();
        return data.poderes_gerais.find((p) => p.id === id);
    }

    /**
     * Obter todos os deuses
     */
    static getDeuses(): Deus[] {
        const data = this.loadCompendium();
        return data.deuses;
    }

    /**
     * Obter um deus por ID
     */
    static getDeusById(id: string): Deus | undefined {
        const data = this.loadCompendium();
        return data.deuses.find((d) => d.id === id);
    }

    /**
     * Obter um deus por nome
     */
    static getDeusByName(nome: string): Deus | undefined {
        const data = this.loadCompendium();
        return data.deuses.find((d) => d.nome.toLowerCase() === nome.toLowerCase());
    }

    /**
     * Obter itens mundanos
     */
    static getItensMundanos(): Item[] {
        const data = this.loadCompendium();
        return data.itens.mundanos;
    }

    /**
     * Obter itens aprimados
     */
    static getItensAprimados(): Item[] {
        const data = this.loadCompendium();
        return data.itens.aprimados;
    }

    /**
     * Obter itens mágicos
     */
    static getItensMagicos(): Item[] {
        const data = this.loadCompendium();
        return data.itens.magicos;
    }

    /**
     * Obter um item por ID (de qualquer categoria)
     */
    static getItemById(id: string): Item | undefined {
        const data = this.loadCompendium();
        const allItens = [...data.itens.mundanos, ...data.itens.aprimados, ...data.itens.magicos];
        return allItens.find((i) => i.id === id);
    }

    /**
     * Obter um item por nome
     */
    static getItemByName(nome: string): Item | undefined {
        const data = this.loadCompendium();
        const allItens = [...data.itens.mundanos, ...data.itens.aprimados, ...data.itens.magicos];
        return allItens.find((i) => i.nome.toLowerCase() === nome.toLowerCase());
    }

    /**
     * Obter informações completas do compendium
     */
    static getCompendium(): CompendiumData {
        return this.loadCompendium();
    }

    /**
     * Obter nome do compendium
     */
    static getCompendiumName(): string {
        return this.loadCompendium().nome;
    }

    /**
     * Obter versão do compendium
     */
    static getCompendiumVersion(): string {
        return this.loadCompendium().versao;
    }
}
