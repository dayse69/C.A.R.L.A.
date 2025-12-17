/\*\*

- ESTRUTURA COMPLETA DE FICHA T20 - BASEADA NOS PDFs OFICIAIS
-
- Esta estrutura representa todos os campos presentes nas fichas T20 editáveis
- encontradas na pasta data/import/Fichas/
  \*/

export interface FichaT20Completa {
// ═══════════════════════════════════════════════════════════════
// INFORMAÇÕES BÁSICAS
// ═══════════════════════════════════════════════════════════════
nome: string;
jogador?: string;
raca: string;
classe: string;
nivel: number;
origem?: string;
divindade?: string;

    // Características físicas
    idade?: number;
    altura?: string;
    peso?: string;
    tamanho?: string; // Minúsculo, Pequeno, Médio, Grande, Enorme, Colossal
    deslocamento: number;
    idiomas?: string[];

    // ═══════════════════════════════════════════════════════════════
    // ATRIBUTOS
    // ═══════════════════════════════════════════════════════════════
    atributos: {
        FOR: number;  // Força
        DES: number;  // Destreza
        CON: number;  // Constituição
        INT: number;  // Inteligência
        SAB: number;  // Sabedoria
        CAR: number;  // Carisma
    };

    // Modificadores são calculados automaticamente: (valor - 10) / 2

    // ═══════════════════════════════════════════════════════════════
    // PONTOS E RECURSOS
    // ═══════════════════════════════════════════════════════════════
    recursos: {
        // Pontos de Vida
        pv: number;           // PV máximos
        pvAtual: number;      // PV atuais
        pvTemp?: number;      // PV temporários

        // Pontos de Mana
        pm: number;           // PM máximos
        pmAtual: number;      // PM atuais

        // Defesa
        defesa: number;       // Defesa total
        ca?: number;          // Classe de Armadura (alternativo)

        // Resistências
        fortitude: number;    // Resistência de Fortitude (CON)
        reflexos: number;     // Resistência de Reflexos (DES)
        vontade: number;      // Resistência de Vontade (SAB)

        // Combate
        iniciativa: number;   // Modificador de iniciativa
    };

    // ═══════════════════════════════════════════════════════════════
    // PERÍCIAS
    // ═══════════════════════════════════════════════════════════════
    pericias: {
        // Formato: { treinado: boolean, bonus: number, atributo: string }
        acrobacia?: { treinado: boolean; bonus: number; };
        adestramento?: { treinado: boolean; bonus: number; };
        atletismo?: { treinado: boolean; bonus: number; };
        atuacao?: { treinado: boolean; bonus: number; };
        cavalgar?: { treinado: boolean; bonus: number; };
        conhecimento?: { treinado: boolean; bonus: number; };
        cura?: { treinado: boolean; bonus: number; };
        diplomacia?: { treinado: boolean; bonus: number; };
        enganacao?: { treinado: boolean; bonus: number; };
        furtividade?: { treinado: boolean; bonus: number; };
        guerra?: { treinado: boolean; bonus: number; };
        iniciativa?: { treinado: boolean; bonus: number; };
        intimidacao?: { treinado: boolean; bonus: number; };
        intuicao?: { treinado: boolean; bonus: number; };
        investigacao?: { treinado: boolean; bonus: number; };
        jogatina?: { treinado: boolean; bonus: number; };
        ladinagem?: { treinado: boolean; bonus: number; };
        luta?: { treinado: boolean; bonus: number; };
        misticismo?: { treinado: boolean; bonus: number; };
        nobreza?: { treinado: boolean; bonus: number; };
        oficio?: { treinado: boolean; bonus: number; };
        percepcao?: { treinado: boolean; bonus: number; };
        pilotagem?: { treinado: boolean; bonus: number; };
        pontaria?: { treinado: boolean; bonus: number; };
        religiao?: { treinado: boolean; bonus: number; };
        sobrevivencia?: { treinado: boolean; bonus: number; };
        // Adicione mais conforme necessário
    };

    // ═══════════════════════════════════════════════════════════════
    // TALENTOS
    // ═══════════════════════════════════════════════════════════════
    talentos?: Array<{
        nome: string;
        descricao?: string;
        prerequisitos?: string;
        origem?: string; // "classe", "raça", "geral"
    }>;

    // ═══════════════════════════════════════════════════════════════
    // HABILIDADES ESPECIAIS
    // ═══════════════════════════════════════════════════════════════
    habilidades?: Array<{
        nome: string;
        descricao: string;
        tipo: string; // "classe", "raça", "origem", "divindade", "item"
        usos?: number; // Usos por dia (se aplicável)
        usosAtuais?: number;
    }>;

    // ═══════════════════════════════════════════════════════════════
    // EQUIPAMENTO - ARMAS
    // ═══════════════════════════════════════════════════════════════
    armas?: Array<{
        nome: string;
        tipo: string; // "corpo-a-corpo", "distância"
        categoria: string; // "simples", "marcial", "exótica"
        ataque: number; // Bônus de ataque total
        dano: string; // Ex: "1d8+2"
        critico: string; // Ex: "19-20/x2"
        alcance?: string; // Para armas de distância
        tipoDano: string; // "cortante", "perfurante", "contundente"
        especial?: string;
        peso?: number;
        equipada: boolean;
    }>;

    // ═══════════════════════════════════════════════════════════════
    // EQUIPAMENTO - ARMADURA
    // ═══════════════════════════════════════════════════════════════
    armadura?: {
        nome: string;
        tipo: string; // "leve", "pesada"
        defesa: number; // Bônus de defesa
        penalidade: number; // Penalidade de armadura
        deslocamentoReduzido?: number;
        peso?: number;
        equipada: boolean;
    };

    escudo?: {
        nome: string;
        defesa: number;
        penalidade?: number;
        peso?: number;
        equipado: boolean;
    };

    // ═══════════════════════════════════════════════════════════════
    // EQUIPAMENTO - ACESSÓRIOS
    // ═══════════════════════════════════════════════════════════════
    acessorios?: Array<{
        nome: string;
        tipo: string; // "anel", "amuleto", "cinto", "botas", "luvas", etc.
        bonus?: string; // Ex: "+1 em testes de Furtividade"
        descricao?: string;
        equipado: boolean;
    }>;

    // ═══════════════════════════════════════════════════════════════
    // MAGIAS
    // ═══════════════════════════════════════════════════════════════
    magias?: Array<{
        nome: string;
        circulo: number; // 1 a 5
        escola: string; // "abjuração", "adivinhação", "convocação", etc.
        execucao: string; // "padrão", "movimento", "completa", "livre"
        alcance: string; // "pessoal", "toque", "curto", "médio", "longo"
        alvo?: string;
        duracao: string;
        resistencia?: string; // "Vontade anula", "Fortitude reduz à metade", etc.
        descricao: string;
        preparada?: boolean; // Para magos
        usos?: number; // Usos por dia
    }>;

    // Espaços de magia por círculo
    espacosMagia?: {
        circulo1: { total: number; usados: number; };
        circulo2: { total: number; usados: number; };
        circulo3: { total: number; usados: number; };
        circulo4: { total: number; usados: number; };
        circulo5: { total: number; usados: number; };
    };

    // ═══════════════════════════════════════════════════════════════
    // PODERES (mantido por compatibilidade)
    // ═══════════════════════════════════════════════════════════════
    poderes?: Array<{
        nome: string;
        descricao: string;
        tipo?: string;
        custo?: string; // Custo em PM
    }>;

    // ═══════════════════════════════════════════════════════════════
    // INVENTÁRIO
    // ═══════════════════════════════════════════════════════════════
    inventario?: Array<{
        nome: string;
        quantidade: number;
        peso: number; // Peso unitário
        descricao?: string;
        categoria?: string; // "equipamento", "consumível", "tesouro"
    }>;

    // Dinheiro
    dinheiro?: {
        TO: number; // Tibares de Ouro
        TP: number; // Tibares de Prata
        TC: number; // Tibares de Cobre
    };

    // Carga
    carga?: {
        leve: number;    // Limite de carga leve
        media: number;   // Limite de carga média
        pesada: number;  // Limite de carga pesada
        atual: number;   // Carga atual
    };

    // ═══════════════════════════════════════════════════════════════
    // HISTÓRIA E PERSONALIDADE
    // ═══════════════════════════════════════════════════════════════
    historia: {
        aparencia?: string;
        personalidade?: string;
        historia?: string; // Background
        objetivos?: string;
        medos?: string;
        ideais?: string;
        defeitos?: string;
        vinculos?: string;
        anotacoes?: string;
    };

    // ═══════════════════════════════════════════════════════════════
    // EXPERIÊNCIA
    // ═══════════════════════════════════════════════════════════════
    experiencia?: {
        atual: number;
        proximo: number; // XP necessário para próximo nível
    };

    // ═══════════════════════════════════════════════════════════════
    // METADADOS (mantido do sistema atual)
    // ═══════════════════════════════════════════════════════════════
    userId: string;
    usuarioId?: string; // Compatibilidade
    guildId?: string;
    channelId?: string;
    messageId?: string;
    ativo: boolean;
    criadoEm: Date;
    atualizadoEm: Date;

}
