/**
 * Lazy Compendium Loader - Carrega dados sob demanda
 * Reduz uso de memória e melhora tempo de inicialização
 */

import fs from "fs";
import path from "path";

interface CompendiumCache {
    classes?: any[];
    racas?: any[];
    poderes?: any[];
    magias?: any[];
    itens?: any[];
    deuses?: any[];
}

interface LoadStats {
    category: string;
    loadTime: number;
    itemCount: number;
    cached: boolean;
}

class LazyCompendiumLoader {
    private cache: CompendiumCache = {};
    private splitDir: string;
    private fallbackDir: string;
    private useSplit: boolean;
    private stats: LoadStats[] = [];

    constructor() {
        this.splitDir = path.join(process.cwd(), "data/compendium/split");
        this.fallbackDir = path.join(process.cwd(), "data/compendium");
        this.useSplit = fs.existsSync(this.splitDir);

        if (this.useSplit) {
            console.log("[LazyLoader] ✅ Modo otimizado: carregamento sob demanda");
        } else {
            console.log("[LazyLoader] ⚠️ Modo legacy: arquivo único");
        }
    }

    /**
     * Carrega classes (sob demanda)
     */
    getClasses(): any[] {
        if (this.cache.classes) {
            return this.cache.classes;
        }

        const startTime = performance.now();

        if (this.useSplit) {
            // Carregar do arquivo split
            const filePath = path.join(this.splitDir, "classes.json");
            try {
                const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
                this.cache.classes = [
                    ...(data.classes || []),
                    ...(data.classes_alternativas || []),
                ];
            } catch (error) {
                logger.error("[LazyLoader] Erro ao carregar classes split:", error);
                this.cache.classes = [];
            }
        } else {
            // Carregar dos novos arquivos separados (classes-base.json e classes-variantes.json)
            try {
                const classesBasePath = path.join(this.fallbackDir, "classes-base.json");
                const variantesPath = path.join(this.fallbackDir, "classes-variantes.json");

                let classesBase: any[] = [];
                let variantes: any[] = [];

                // Carregar classes base
                if (fs.existsSync(classesBasePath)) {
                    const dataBase = JSON.parse(fs.readFileSync(classesBasePath, "utf-8"));
                    classesBase = dataBase.classes || [];
                }

                // Carregar variantes (classes alternativas)
                if (fs.existsSync(variantesPath)) {
                    const dataVariantes = JSON.parse(fs.readFileSync(variantesPath, "utf-8"));
                    variantes = dataVariantes.variantes || [];
                }

                this.cache.classes = [...classesBase, ...variantes];
            } catch (error) {
                logger.error("[LazyLoader] Erro ao carregar classes dos novos arquivos:", error);
                // Fallback para o arquivo antigo se houver erro
                try {
                    const filePath = path.join(this.fallbackDir, "acervo-do-golem.json");
                    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
                    this.cache.classes = data.classes || [];
                } catch (fallbackError) {
                    logger.error("[LazyLoader] Erro ao carregar classes legacy:", fallbackError);
                    this.cache.classes = [];
                }
            }
        }

        const loadTime = performance.now() - startTime;
        this.stats.push({
            category: "classes",
            loadTime,
            itemCount: this.cache.classes?.length || 0,
            cached: false,
        });

        console.log(
            `[LazyLoader] Classes carregadas: ${
                this.cache.classes?.length || 0
            } itens em ${loadTime.toFixed(2)}ms`
        );

        return this.cache.classes || [];
    }

    /**
     * Carrega raças (sob demanda)
     */
    getRacas(): any[] {
        if (this.cache.racas) {
            return this.cache.racas;
        }

        const startTime = performance.now();

        if (this.useSplit) {
            const filePath = path.join(this.splitDir, "racas.json");
            try {
                const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
                this.cache.racas = data.racas || [];
            } catch (error) {
                logger.error("[LazyLoader] Erro ao carregar raças split:", error);
                this.cache.racas = [];
            }
        } else {
            // Carregar do novo arquivo racas-base.json
            try {
                const racasBasePath = path.join(this.fallbackDir, "racas-base.json");

                if (fs.existsSync(racasBasePath)) {
                    const dataBase = JSON.parse(fs.readFileSync(racasBasePath, "utf-8"));
                    this.cache.racas = dataBase.racas || [];
                } else {
                    // Fallback: tentar races.json (formato antigo em inglês)
                    const racesPath = path.join(this.fallbackDir, "races.json");
                    if (fs.existsSync(racesPath)) {
                        const dataRaces = JSON.parse(fs.readFileSync(racesPath, "utf-8"));
                        this.cache.racas = dataRaces.races || [];
                    } else {
                        this.cache.racas = [];
                    }
                }
            } catch (error) {
                logger.error("[LazyLoader] Erro ao carregar raças:", error);
                this.cache.racas = [];
            }
        }

        const loadTime = performance.now() - startTime;
        this.stats.push({
            category: "racas",
            loadTime,
            itemCount: this.cache.racas?.length || 0,
            cached: false,
        });

        console.log(
            `[LazyLoader] Raças carregadas: ${
                this.cache.racas?.length || 0
            } itens em ${loadTime.toFixed(2)}ms`
        );

        return this.cache.racas || [];
    }

    /**
     * Carrega poderes (sob demanda)
     */
    getPoderes(): any[] {
        if (this.cache.poderes) {
            return this.cache.poderes;
        }

        const startTime = performance.now();

        if (this.useSplit) {
            const filePath = path.join(this.splitDir, "poderes.json");
            try {
                const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
                this.cache.poderes = data.poderes || [];
            } catch (error) {
                // Arquivo não existe ou vazio
                this.cache.poderes = [];
            }
        } else {
            const filePath = path.join(this.fallbackDir, "acervo-do-golem.json");
            try {
                const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
                this.cache.poderes = data.poderes || [];
            } catch (error) {
                this.cache.poderes = [];
            }
        }

        const loadTime = performance.now() - startTime;
        this.stats.push({
            category: "poderes",
            loadTime,
            itemCount: this.cache.poderes?.length || 0,
            cached: false,
        });

        return this.cache.poderes || [];
    }

    /**
     * Carrega magias (sob demanda)
     */
    getMagias(): any[] {
        if (this.cache.magias) {
            return this.cache.magias;
        }

        const startTime = performance.now();

        if (this.useSplit) {
            const filePath = path.join(this.splitDir, "magias.json");
            try {
                const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
                this.cache.magias = data.magias || [];
            } catch (error) {
                this.cache.magias = [];
            }
        } else {
            const filePath = path.join(this.fallbackDir, "acervo-do-golem.json");
            try {
                const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
                this.cache.magias = data.magias || [];
            } catch (error) {
                this.cache.magias = [];
            }
        }

        const loadTime = performance.now() - startTime;
        this.stats.push({
            category: "magias",
            loadTime,
            itemCount: this.cache.magias?.length || 0,
            cached: false,
        });

        return this.cache.magias || [];
    }

    /**
     * Carrega itens (sob demanda)
     */
    getItens(): any[] {
        if (this.cache.itens) {
            return this.cache.itens;
        }

        const startTime = performance.now();

        if (this.useSplit) {
            const filePath = path.join(this.splitDir, "itens.json");
            try {
                const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
                this.cache.itens = data.itens || [];
            } catch (error) {
                this.cache.itens = [];
            }
        } else {
            const filePath = path.join(this.fallbackDir, "acervo-do-golem.json");
            try {
                const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
                this.cache.itens = data.itens || [];
            } catch (error) {
                this.cache.itens = [];
            }
        }

        const loadTime = performance.now() - startTime;
        this.stats.push({
            category: "itens",
            loadTime,
            itemCount: this.cache.itens?.length || 0,
            cached: false,
        });

        return this.cache.itens || [];
    }

    /**
     * Pré-carrega categorias específicas
     */
    preload(...categories: string[]): void {
        console.log(`[LazyLoader] Pré-carregando: ${categories.join(", ")}`);
        const startTime = performance.now();

        for (const category of categories) {
            switch (category.toLowerCase()) {
                case "classes":
                    this.getClasses();
                    break;
                case "racas":
                case "raças":
                    this.getRacas();
                    break;
                case "poderes":
                    this.getPoderes();
                    break;
                case "magias":
                    this.getMagias();
                    break;
                case "itens":
                    this.getItens();
                    break;
            }
        }

        const totalTime = (performance.now() - startTime).toFixed(2);
        console.log(`[LazyLoader] ✅ Pré-carregamento completo em ${totalTime}ms`);
    }

    /**
     * Limpa cache
     */
    clearCache(category?: string): void {
        if (category) {
            delete this.cache[category as keyof CompendiumCache];
            console.log(`[LazyLoader] Cache de ${category} limpo`);
        } else {
            this.cache = {};
            console.log("[LazyLoader] Todo cache limpo");
        }
    }

    /**
     * Estatísticas de uso
     */
    getStats() {
        return {
            mode: this.useSplit ? "optimized" : "legacy",
            cached: Object.keys(this.cache),
            loads: this.stats,
            totalLoads: this.stats.length,
            avgLoadTime:
                this.stats.length > 0
                    ? (
                          this.stats.reduce((sum, s) => sum + s.loadTime, 0) / this.stats.length
                      ).toFixed(2)
                    : "0",
        };
    }
}

// Singleton
export const lazyLoader = new LazyCompendiumLoader();
