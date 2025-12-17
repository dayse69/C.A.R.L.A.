/**
 * Database Seed Service
 * Popula o banco com dados iniciais
 */

import { CharacterClass, Item, Power, Race, Spell } from "./models.js";
import { getCollections, isConnected } from "./mongodb.js";

export class DatabaseSeeder {
    /**
     * Executa todo o seed
     */
    static async seedAll(): Promise<void> {
        if (!isConnected()) {
            logger.error("Database not connected");
            return;
        }

        try {
            console.log("🌱 Starting database seed...");

            await this.seedRaces();
            await this.seedClasses();
            await this.seedPowers();
            await this.seedSpells();
            await this.seedItems();

            console.log("✓ Database seed completed successfully");
        } catch (erro) {
            logger.error("✗ Seed failed:", erro);
        }
    }

    /**
     * Seed de raças
     */
    private static async seedRaces(): Promise<void> {
        const races: Race[] = [
            {
                id: "humano",
                nome: "Humano",
                descricao:
                    "Versáteis e ambiciosos, os humanos são encontrados em todo o mundo de Tormenta 20.",
                bônus: { FOR: 1, DES: 1, CON: 1, INT: 1, SAB: 1, CAR: 1 },
                habilidades: ["Versátil", "Bônus em Perícia"],
                tamanho: "Médio",
                deslocamentoBase: 9,
                idiomas: ["Português", "Tradição"],
                criadoEm: new Date(),
                atualizadoEm: new Date(),
            },
            {
                id: "anao",
                nome: "Anão",
                descricao:
                    "Resistentes e fortes, os anões vivem nas montanhas e profundezas da terra.",
                bônus: { CON: 2, SAB: 1, CAR: -1 },
                habilidades: ["Resistência", "Visão no Escuro", "Resistência à Magia"],
                tamanho: "Pequeno",
                deslocamentoBase: 7,
                idiomas: ["Português", "Anão"],
                criadoEm: new Date(),
                atualizadoEm: new Date(),
            },
            {
                id: "elfo",
                nome: "Elfo",
                descricao: "Graciosos e mágicos, os elfos são mestres da magia e da natureza.",
                bônus: { DES: 2, INT: 1, CON: -1 },
                habilidades: ["Agilidade", "Sensibilidade Mágica", "Visão no Escuro"],
                tamanho: "Médio",
                deslocamentoBase: 9,
                idiomas: ["Português", "Élfico"],
                criadoEm: new Date(),
                atualizadoEm: new Date(),
            },
            {
                id: "meio_orc",
                nome: "Meio-Orc",
                descricao:
                    "Filhos de dois mundos, os meio-orcs frequentemente enfrentam preconceito.",
                bônus: { FOR: 2, CAR: -1 },
                habilidades: ["Força Bruta", "Intimidação Natural"],
                tamanho: "Médio",
                deslocamentoBase: 9,
                idiomas: ["Português", "Orc"],
                criadoEm: new Date(),
                atualizadoEm: new Date(),
            },
            {
                id: "goblin",
                nome: "Goblin",
                descricao: "Pequenos e astutos, os goblins são conhecidos por sua engenhosidade.",
                bônus: { DES: 2, SAB: -1 },
                habilidades: ["Agilidade", "Engenhosidade", "Visão no Escuro"],
                tamanho: "Pequeno",
                deslocamentoBase: 8,
                idiomas: ["Português", "Goblin"],
                criadoEm: new Date(),
                atualizadoEm: new Date(),
            },
        ];

        const collections = getCollections();
        const count = await collections.compendium_races.countDocuments();

        if (count === 0) {
            await collections.compendium_races.insertMany(races as any);
            console.log(`✓ Seeded ${races.length} races`);
        } else {
            console.log("  Races already exist, skipping...");
        }
    }

    /**
     * Seed de classes
     */
    private static async seedClasses(): Promise<void> {
        const classes: CharacterClass[] = [
            {
                id: "guerreiro",
                nome: "Guerreiro",
                descricao: "Mestres do combate, os guerreiros excelem no uso de armas e armaduras.",
                pontos: { pvBase: 12, períciasBase: 2 },
                habilidades: ["Maestria em Armas", "Estilo de Combate", "Segundo Vento"],
                armas: ["Espadas", "Machados", "Lanças", "Arcos"],
                armaduras: ["Leve", "Média", "Pesada"],
                pericias: ["Atletismo", "Percepção", "Intimidação"],
                criadoEm: new Date(),
                atualizadoEm: new Date(),
            },
            {
                id: "mago",
                nome: "Mago",
                descricao:
                    "Canalizadores de magia arcana, os magos usam feitiços para controlar a batalha.",
                pontos: { pvBase: 6, pmBase: 20, períciasBase: 3 },
                habilidades: ["Lançamento de Feitiços", "Truques Mágicos", "Escudo Mágico"],
                armas: ["Adagas", "Cajados"],
                armaduras: ["Nenhuma"],
                pericias: ["Arcanismo", "Investigação", "Percepção"],
                criadoEm: new Date(),
                atualizadoEm: new Date(),
            },
            {
                id: "clerigo",
                nome: "Clérigo",
                descricao: "Devotos de poderes divinos, os clérigos canalizam magia curadora.",
                pontos: { pvBase: 8, pmBase: 15, períciasBase: 2 },
                habilidades: ["Canalizar Poder Divino", "Cura", "Virada de Inimigos"],
                armas: ["Clavas", "Maças", "Machados"],
                armaduras: ["Leve", "Média", "Pesada"],
                pericias: ["Religião", "Medicina", "Percepção"],
                criadoEm: new Date(),
                atualizadoEm: new Date(),
            },
            {
                id: "ladrao",
                nome: "Ladrão",
                descricao: "Astutos e ágeis, os ladrões operam nas sombras com precisão letal.",
                pontos: { pvBase: 8, períciasBase: 4 },
                habilidades: ["Ataque Furtivo", "Furtividade", "Esquiva Sobrenatural"],
                armas: ["Adagas", "Espadas Curtas", "Arcos"],
                armaduras: ["Leve"],
                pericias: ["Furtividade", "Prestidigitação", "Percepção"],
                criadoEm: new Date(),
                atualizadoEm: new Date(),
            },
            {
                id: "paladino",
                nome: "Paladino",
                descricao: "Guerreiros sagrados que misturaram combate e magia divina.",
                pontos: { pvBase: 10, pmBase: 10, períciasBase: 2 },
                habilidades: ["Golpe Divino", "Cura Divina", "Aura de Proteção"],
                armas: ["Espadas", "Maças", "Lanças"],
                armaduras: ["Leve", "Média", "Pesada"],
                pericias: ["Religião", "Atletismo", "Persuasão"],
                criadoEm: new Date(),
                atualizadoEm: new Date(),
            },
        ];

        const collections = getCollections();
        const count = await collections.compendium_classes.countDocuments();

        if (count === 0) {
            await collections.compendium_classes.insertMany(classes as any);
            console.log(`✓ Seeded ${classes.length} classes`);
        } else {
            console.log("  Classes already exist, skipping...");
        }
    }

    /**
     * Seed de poderes
     */
    private static async seedPowers(): Promise<void> {
        const powers: Power[] = [
            {
                id: "potencia_brutal",
                nome: "Potência Brutal",
                descricao: "Aumenta o dano dos seus ataques em 1d6.",
                nivel: 1,
                requisitos: { minNivel: 1, atributos: { FOR: 10 } },
                efeitos: {
                    tipo: "dano",
                    valor: 6,
                    descricao: "+1d6 de dano",
                },
                custo: { açõesNecessárias: 1 },
                alcance: "Pessoal",
                duração: "Instantâneo",
                criadoEm: new Date(),
                atualizadoEm: new Date(),
            },
        ];

        const collections = getCollections();
        const count = await collections.compendium_powers.countDocuments();

        if (count === 0) {
            await collections.compendium_powers.insertMany(powers as any);
            console.log(`✓ Seeded ${powers.length} powers`);
        } else {
            console.log("  Powers already exist, skipping...");
        }
    }

    /**
     * Seed de magias
     */
    private static async seedSpells(): Promise<void> {
        const spells: Spell[] = [
            {
                id: "magic_missile",
                nome: "Mísseis Mágicos",
                descricao: "Lança mísseis de energia mágica que atingem automaticamente.",
                nivel: 1,
                escolas: ["Evocação"],
                requisitos: { nivelMagia: 1, atributo: "INT" },
                execução: {
                    tempo: "1 ação",
                    componentes: ["Verbal", "Somático"],
                },
                alcance: "30 metros",
                duração: "Instantâneo",
                dano: { tipo: "Mágico", dado: "d4+1", modificador: "INT" },
                criadoEm: new Date(),
                atualizadoEm: new Date(),
            },
        ];

        const collections = getCollections();
        const count = await collections.compendium_spells.countDocuments();

        if (count === 0) {
            await collections.compendium_spells.insertMany(spells as any);
            console.log(`✓ Seeded ${spells.length} spells`);
        } else {
            console.log("  Spells already exist, skipping...");
        }
    }

    /**
     * Seed de itens
     */
    private static async seedItems(): Promise<void> {
        const items: Item[] = [
            {
                id: "espada_longa",
                nome: "Espada Longa",
                descricao: "Uma clássica espada longa de aço.",
                tipo: "arma",
                raridade: "Comum",
                propriedades: { peso: 2, valor: 100, efeitos: ["Versátil"] },
                bônus: { ataque: 1, dano: 1 },
                criadoEm: new Date(),
                atualizadoEm: new Date(),
            },
            {
                id: "armadura_couro",
                nome: "Armadura de Couro",
                descricao: "Uma armadura leve feita de couro resistente.",
                tipo: "armadura",
                raridade: "Comum",
                propriedades: { peso: 5, valor: 50 },
                bônus: { defesa: 1 },
                criadoEm: new Date(),
                atualizadoEm: new Date(),
            },
        ];

        const collections = getCollections();
        const count = await collections.compendium_items.countDocuments();

        if (count === 0) {
            await collections.compendium_items.insertMany(items as any);
            console.log(`✓ Seeded ${items.length} items`);
        } else {
            console.log("  Items already exist, skipping...");
        }
    }
}
