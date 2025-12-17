/**
 * Carregador de compêndio do Tormenta 20
 * Importa dados de classes, raças, magias do JSON
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { loadImportedCategory } from "./channelImporterService.js";
import { lazyLoader } from "./lazyCompendiumLoader.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

interface Class {
    id: string;
    name: string;
    description: string;
    primaryAttribute: string;
    pv: number;
    pm: number;
    initialSkills: string;
}

interface Race {
    id: string;
    name: string;
    description: string;
    attributeModifiers: Record<string, any>;
    abilities: string[];
    commonClasses: string[];
}

interface Compendium {
    classes: Class[];
    races: Race[];
}

interface AcervoClasse {
    id?: string;
    nome?: string;
    name?: string;
}

interface AcervoRace {
    id?: string;
    nome?: string;
    name?: string;
}

let compendiumCache: Compendium | null = null;
let acervoCache: { races: AcervoRace[]; classes: AcervoClasse[] } | null = null;
let cacheInitialized = false;
let cacheInitTime = 0;

/**
 * Carrega os dados do compêndio do JSON
 */
export function loadCompendium(): Compendium {
    if (compendiumCache) {
        return compendiumCache;
    }

    const startTime = performance.now();
    // Resolve caminho relativo à raiz do projeto (dois níveis acima de build/services)
    const projectRoot = path.resolve(__dirname, "../..");
    const classesPath = path.join(projectRoot, "data/compendium/classes.json");
    const racesPath = path.join(projectRoot, "data/compendium/races.json");

    try {
        const classesData = JSON.parse(fs.readFileSync(classesPath, "utf-8"));
        const racesData = JSON.parse(fs.readFileSync(racesPath, "utf-8"));

        compendiumCache = {
            classes: classesData.classes || [],
            races: racesData.races || [],
        };

        const loadTime = (performance.now() - startTime).toFixed(2);
        console.log(`[Cache] Compendium carregado em ${loadTime}ms`);

        return compendiumCache;
    } catch (error) {
        console.error("Erro ao carregar compêndio:", error);
        return {
            classes: [],
            races: [],
        };
    }
}

function loadAcervo(): { races: AcervoRace[]; classes: AcervoClasse[] } {
    if (acervoCache) return acervoCache;

    const startTime = performance.now();

    try {
        // Usar lazy loader otimizado
        const classes = lazyLoader.getClasses();
        const races = lazyLoader.getRacas();

        acervoCache = {
            races: races,
            classes: classes,
        };

        const loadTime = (performance.now() - startTime).toFixed(2);
        const totalSize = acervoCache.classes.length + acervoCache.races.length;
        console.log(`[Cache] Acervo carregado em ${loadTime}ms (${totalSize} entidades)`);

        return acervoCache;
    } catch (error) {
        console.error("Erro ao carregar acervo do golem:", error);
        acervoCache = { races: [], classes: [] };
        return acervoCache;
    }
}

function normalizeName(entry: { nome?: string; name?: string }): string {
    return (entry?.nome || entry?.name || "").toString();
}

function matchesEntry(
    entry: { nome?: string; name?: string; id?: string },
    query: string
): boolean {
    const lowered = query.toLowerCase();
    return (
        normalizeName(entry).toLowerCase() === lowered || (entry.id || "").toLowerCase() === lowered
    );
}

/**
 * Obtém todas as classes disponíveis
 */
export function getAllClasses(): Class[] {
    const compendium = loadCompendium();
    return compendium.classes;
}

export function getAllClassesExtended(): (Class | AcervoClasse)[] {
    const base = getAllClasses();
    const acervo = loadAcervo().classes;
    return [...base, ...acervo];
}

/**
 * Obtém todas as raças disponíveis
 */
export function getAllRaces(): Race[] {
    const compendium = loadCompendium();
    return compendium.races;
}

export function getAllRacesExtended(): (Race | AcervoRace)[] {
    const base = getAllRaces();
    const acervo = loadAcervo().races;
    return [...base, ...acervo];
}

/**
 * Obtém uma classe pelo ID ou nome
 */
export function getClassByIdOrName(idOrName: string): Class | undefined {
    const classes = getAllClasses();
    const lowercase = idOrName.toLowerCase();

    return classes.find((c) => c.id === lowercase || c.name.toLowerCase() === lowercase);
}

function getAcervoClassByIdOrName(idOrName: string): AcervoClasse | undefined {
    const classes = loadAcervo().classes;
    const lowercase = idOrName.toLowerCase();
    return classes.find((c) => matchesEntry(c, lowercase));
}

/**
 * Obtém uma raça pelo ID ou nome
 */
export function getRaceByIdOrName(idOrName: string): Race | undefined {
    const races = getAllRaces();
    const lowercase = idOrName.toLowerCase();

    return races.find((r) => r.id === lowercase || r.name.toLowerCase() === lowercase);
}

function getAcervoRaceByIdOrName(idOrName: string): AcervoRace | undefined {
    const races = loadAcervo().races;
    const lowercase = idOrName.toLowerCase();
    return races.find((r) => matchesEntry(r, lowercase));
}

/**
 * Valida se uma classe existe
 */
export function isValidClass(className: string): boolean {
    return (
        getClassByIdOrName(className) !== undefined ||
        getAcervoClassByIdOrName(className) !== undefined
    );
}

/**
 * Valida se uma raça existe
 */
export function isValidRace(raceName: string): boolean {
    return (
        getRaceByIdOrName(raceName) !== undefined || getAcervoRaceByIdOrName(raceName) !== undefined
    );
}

/**
 * Obtém lista de nomes de classes em formato legível
 */
export function getClassNames(): string[] {
    const names = getAllClassesExtended().map((c: any) => normalizeName(c));
    return Array.from(new Set(names.filter(Boolean)));
}

/**
 * Obtém lista de nomes de raças em formato legível
 */
export function getRaceNames(): string[] {
    const names = getAllRacesExtended().map((r: any) => normalizeName(r));
    return Array.from(new Set(names.filter(Boolean)));
}

/**
 * Limpa o cache (útil para testes ou recarregar dados)
 */
export function clearCompendiumCache(): void {
    compendiumCache = null;
    acervoCache = null;
    cacheInitialized = false;
}

/**
 * Pré-carrega todo o compêndio em memória (deve ser chamado na inicialização)
 * Melhora ~80% de performance em operações subsequentes
 */
export async function warmUpCache(): Promise<void> {
    if (cacheInitialized) {
        console.log("[Cache] Cache já foi aquecido, pulando...");
        return;
    }

    const startTime = performance.now();
    console.log("[Cache] Iniciando aquecimento de cache...");

    try {
        // Carrega compendium principal
        loadCompendium();
        // Pré-carrega apenas classes e raças (usado com mais frequência)
        lazyLoader.preload("classes", "racas");
        // Pré-processa nomes para buscas rápidas
        getClassNames();
        getRaceNames();

        cacheInitialized = true;
        cacheInitTime = performance.now() - startTime;

        console.log(`[Cache] ✅ Aquecimento completo em ${cacheInitTime.toFixed(2)}ms`);
        console.log(`[Cache] ${getAllClassesExtended().length} classes na memória`);
        console.log(`[Cache] ${getAllRacesExtended().length} raças na memória`);
    } catch (error) {
        console.error("[Cache] ❌ Erro durante aquecimento:", error);
    }
}

/**
 * Carrega uma categoria importada dinamicamente (ex: biblioteca_esquecimento)
 */
export function getImportedCategory(categoryName: string): any[] {
    return loadImportedCategory(categoryName);
}

/**
 * Lista todas as categorias disponíveis (raças, classes, + importadas)
 */
export function getAvailableCategories(): string[] {
    const projectRoot = path.resolve(__dirname, "../..");
    const acervoDir = path.join(projectRoot, "data/compendium");

    const categories = ["racas", "classes"];

    try {
        if (fs.existsSync(acervoDir)) {
            const files = fs.readdirSync(acervoDir);
            const imported = files
                .filter((f) => f.startsWith("compendium_") && f.endsWith(".json"))
                .map((f) => f.replace(/^compendium_/, "").replace(/\.json$/, ""));
            categories.push(...imported);
        }
    } catch (err) {
        console.warn("[Compendium] Erro ao listar categorias importadas:", err);
    }

    return [...new Set(categories)];
}

/**
 * Retorna informações sobre o estado do cache
 */
export function getCacheStats() {
    const lazyStats = lazyLoader.getStats();
    return {
        initialized: cacheInitialized,
        initTimeMs: cacheInitTime,
        totalClasses: getAllClassesExtended().length,
        totalRaces: getAllRacesExtended().length,
        compendiumCached: compendiumCache !== null,
        acervoCached: acervoCache !== null,
        lazyLoader: lazyStats,
    };
}
