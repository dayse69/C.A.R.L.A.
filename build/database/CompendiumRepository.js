/**
 * Repositório do Compendium - Acervo do Golem
 * Gerencia leitura e acesso aos dados do compendium
 */
import { readFileSync } from "fs";
import { join } from "path";
/**
 * Repositório de Compendium
 * Carrega e fornece acesso aos dados do Acervo do Golem
 */
export class CompendiumRepository {
    /**
     * Carrega o compendium do arquivo JSON
     */
    static loadCompendium() {
        if (this.compendiumData !== null) {
            return this.compendiumData;
        }
        try {
            const filePath = join(process.cwd(), "data", "compendium", "acervo-do-golem.json");
            const data = readFileSync(filePath, "utf-8");
            this.compendiumData = JSON.parse(data);
            return this.compendiumData;
        }
        catch (error) {
            console.error("Erro ao carregar compendium:", error);
            throw new Error("Não foi possível carregar o Acervo do Golem");
        }
    }
    /**
     * Obter todas as classes principais
     */
    static getClassesPrincipais() {
        const data = this.loadCompendium();
        return data.classes.classe_principal;
    }
    /**
     * Obter todas as classes alternativas
     */
    static getClassesAlternativas() {
        const data = this.loadCompendium();
        return data.classes.classe_alternativa;
    }
    /**
     * Obter uma classe por ID
     */
    static getClasseById(id) {
        const data = this.loadCompendium();
        const allClasses = [...data.classes.classe_principal, ...data.classes.classe_alternativa];
        return allClasses.find((c) => c.id === id);
    }
    /**
     * Obter uma classe por nome
     */
    static getClasseByName(nome) {
        const data = this.loadCompendium();
        const allClasses = [...data.classes.classe_principal, ...data.classes.classe_alternativa];
        return allClasses.find((c) => c.nome.toLowerCase() === nome.toLowerCase());
    }
    /**
     * Obter todas as distinções
     */
    static getDistincoes() {
        const data = this.loadCompendium();
        return data.distincoes;
    }
    /**
     * Obter uma distinção por ID
     */
    static getDistincaoById(id) {
        const data = this.loadCompendium();
        return data.distincoes.find((d) => d.id === id);
    }
    /**
     * Obter todas as raças
     */
    static getRacas() {
        const data = this.loadCompendium();
        return data.racas;
    }
    /**
     * Obter uma raça por ID
     */
    static getRacaById(id) {
        const data = this.loadCompendium();
        return data.racas.find((r) => r.id === id);
    }
    /**
     * Obter uma raça por nome
     */
    static getRacaByName(nome) {
        const data = this.loadCompendium();
        return data.racas.find((r) => r.nome.toLowerCase() === nome.toLowerCase());
    }
    /**
     * Obter todos os poderes gerais
     */
    static getPoderesGerais() {
        const data = this.loadCompendium();
        return data.poderes_gerais;
    }
    /**
     * Obter um poder por ID
     */
    static getPoderById(id) {
        const data = this.loadCompendium();
        return data.poderes_gerais.find((p) => p.id === id);
    }
    /**
     * Obter todos os deuses
     */
    static getDeuses() {
        const data = this.loadCompendium();
        return data.deuses;
    }
    /**
     * Obter um deus por ID
     */
    static getDeusById(id) {
        const data = this.loadCompendium();
        return data.deuses.find((d) => d.id === id);
    }
    /**
     * Obter um deus por nome
     */
    static getDeusByName(nome) {
        const data = this.loadCompendium();
        return data.deuses.find((d) => d.nome.toLowerCase() === nome.toLowerCase());
    }
    /**
     * Obter itens mundanos
     */
    static getItensMundanos() {
        const data = this.loadCompendium();
        return data.itens.mundanos;
    }
    /**
     * Obter itens aprimados
     */
    static getItensAprimados() {
        const data = this.loadCompendium();
        return data.itens.aprimados;
    }
    /**
     * Obter itens mágicos
     */
    static getItensMagicos() {
        const data = this.loadCompendium();
        return data.itens.magicos;
    }
    /**
     * Obter um item por ID (de qualquer categoria)
     */
    static getItemById(id) {
        const data = this.loadCompendium();
        const allItens = [...data.itens.mundanos, ...data.itens.aprimados, ...data.itens.magicos];
        return allItens.find((i) => i.id === id);
    }
    /**
     * Obter um item por nome
     */
    static getItemByName(nome) {
        const data = this.loadCompendium();
        const allItens = [...data.itens.mundanos, ...data.itens.aprimados, ...data.itens.magicos];
        return allItens.find((i) => i.nome.toLowerCase() === nome.toLowerCase());
    }
    /**
     * Obter informações completas do compendium
     */
    static getCompendium() {
        return this.loadCompendium();
    }
    /**
     * Obter nome do compendium
     */
    static getCompendiumName() {
        return this.loadCompendium().nome;
    }
    /**
     * Obter versão do compendium
     */
    static getCompendiumVersion() {
        return this.loadCompendium().versao;
    }
}
CompendiumRepository.compendiumData = null;
