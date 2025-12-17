/**
 * Modelos de Dados (Schemas)
 * Define a estrutura dos documentos no MongoDB
 */

// ==================== USER ====================
export interface User {
    _id?: string;
    discordId: string;
    username: string;
    discriminator: string;
    avatar?: string;
    personagensAtivos: string[]; // IDs dos personagens
    configuraçoes: {
        idioma: "pt-BR" | "en-US";
        notificações: boolean;
        tema: "dark" | "light";
    };
    criadoEm: Date;
    atualizadoEm: Date;
}

// ==================== CHARACTER ====================
export interface Character {
    _id?: string;
    userId: string; // Discord ID do proprietário
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

    recursos: {
        pv: {
            atual: number;
            maximo: number;
            temporario: number;
        };
        pm: {
            atual: number;
            maximo: number;
        };
        defesa: number;
        deslocamento: number;
        resistencias: {
            fortitude: number;
            reflexos: number;
            vontade: number;
        };
    };

    pericias: Record<string, number>; // Nome -> modificador
    poderes: string[]; // IDs dos poderes
    magias: Array<{
        nome: string;
        circulo: number;
        custoPM: number;
        descricao?: string;
    }>;

    inventario: Array<{
        nome: string;
        quantidade: number;
        raridade: "Comum" | "Incomum" | "Raro" | "Lendário";
        descricao: string;
    }>;

    // Status e condições de combate
    status: Array<{
        nome: string; // envenenado, atordoado, assustado, etc
        intensidade: number; // 1-5
        duracao: number; // turnos restantes
        descricao: string;
        efeito: string; // penalidade aplicada
    }>;

    // Ressonância (Progressão)
    ressonancia: {
        atual: number;
        proximo: number; // Ressonância necessária para próximo nível
        total: number; // Ressonância acumulada (carreira)
    };

    // Páginas (Tempo entre missões)
    paginas?: {
        total: number; // Total de páginas acumuladas
        ultima_missao?: string; // Data da última missão (ISO string)
        proxima_disponivel?: string; // Data da próxima missão disponível
    };

    // História e narrativa
    historia: {
        aparencia: string;
        anotacoes: string;
        relacionamentos?: Array<{
            nome: string;
            tipo: string;
            confianca: number;
        }>;
    };

    notas: string;
    ouro: number;

    criadoEm: Date;
    atualizadoEm: Date;
    ultimoUso?: Date;
}

// ==================== COMPENDIUM - RACES ====================
export interface Race {
    _id?: string;
    id: string; // Identificador único
    nome: string;
    descricao: string;

    bônus: {
        FOR?: number;
        DES?: number;
        CON?: number;
        INT?: number;
        SAB?: number;
        CAR?: number;
    };

    habilidades: string[];
    tamanho: "Miúdo" | "Pequeno" | "Médio" | "Grande" | "Enorme";
    deslocamentoBase: number;
    idiomas: string[];

    criadoEm: Date;
    atualizadoEm: Date;
}

// ==================== COMPENDIUM - CLASSES ====================
export interface CharacterClass {
    _id?: string;
    id: string;
    nome: string;
    descricao: string;

    pontos: {
        pvBase: number;
        pmBase?: number;
        períciasBase: number;
    };

    habilidades: string[];
    armas: string[]; // Tipos de armas permitidas
    armaduras: string[]; // Tipos de armaduras

    pericias: string[]; // Perícias de classe

    criadoEm: Date;
    atualizadoEm: Date;
}

// ==================== COMPENDIUM - POWERS ====================
export interface Power {
    _id?: string;
    id: string;
    nome: string;
    descricao: string;
    nivel: number;

    requisitos: {
        minNivel: number;
        atributos: {
            FOR?: number;
            DES?: number;
            CON?: number;
            INT?: number;
            SAB?: number;
            CAR?: number;
        };
        outrosPoderes?: string[];
    };

    efeitos: {
        tipo: "dano" | "cura" | "buff" | "debuff" | "utilitário";
        valor: number;
        descricao: string;
    };

    custo: {
        açõesNecessárias: number;
        custoEspecial?: string;
    };

    alcance: string;
    duração: string;

    criadoEm: Date;
    atualizadoEm: Date;
}

// ==================== COMPENDIUM - SPELLS ====================
export interface Spell {
    _id?: string;
    id: string;
    nome: string;
    descricao: string;
    nivel: number;

    escolas: string[]; // Escolas de magia

    requisitos: {
        nivelMagia: number;
        atributo: "INT" | "SAB" | "CAR";
    };

    execução: {
        tempo: string; // "1 ação", "1 bônus", "reação", etc
        componentes: string[]; // "Verbal", "Somático", "Material"
    };

    alcance: string;
    duração: string;

    salvação?: string; // Tipo de salvação (FOR, DES, etc)
    dano?: {
        tipo: string;
        dado: string;
        modificador: string;
    };

    criadoEm: Date;
    atualizadoEm: Date;
}

// ==================== COMPENDIUM - ITEMS ====================
export interface Item {
    _id?: string;
    id: string;
    nome: string;
    descricao: string;

    tipo: "arma" | "armadura" | "acessório" | "consumível" | "engenhoca" | "outro";
    raridade: "Comum" | "Incomum" | "Raro" | "Muito Raro" | "Lendário" | "Artefato";

    propriedades: {
        peso: number; // em kg
        valor: number; // em ouro
        efeitos?: string[];
    };

    bônus?: {
        FOR?: number;
        DES?: number;
        CON?: number;
        INT?: number;
        SAB?: number;
        CAR?: number;
        ataque?: number;
        dano?: number;
        defesa?: number;
    };

    requerido?: {
        nivel?: number;
        atributo?: { tipo: string; valor: number };
    };

    criadoEm: Date;
    atualizadoEm: Date;
}

// ==================== CAMPAIGN ====================
export interface Campaign {
    _id?: string;
    mestre: string; // Discord ID do mestre
    nome: string;
    descricao: string;

    membros: {
        userId: string;
        personagem: string; // ID do personagem
        role: "Mestre" | "Jogador";
        adicionadoEm: Date;
    }[];

    configurações: {
        sistemaDeDados: "D20" | "D100";
        dificuldadeBase: "Fácil" | "Média" | "Difícil" | "Mortal";
        nivelXP: string;
    };

    progresso: {
        sessõesRealizadas: number;
        dataÚltimaSessão: Date;
        notasGerais: string;
    };

    criadoEm: Date;
    atualizadoEm: Date;
}

// ==================== SESSION LOG ====================
export interface SessionLog {
    _id?: string;
    campaignId: string;
    número: number;
    data: Date;

    resumo: string;
    notas: string;

    roleplay: {
        descrição: string;
        momentosImportantes: string[];
    };

    combates: {
        inimigos: string[];
        resultado: "Vitória" | "Derrota" | "Fuga";
        danos: Record<string, number>; // userId -> dano recebido
    }[];

    recompensas: {
        xp: number;
        ouro: number;
        itens: string[];
    };

    criadoEm: Date;
    atualizadoEm: Date;
}
