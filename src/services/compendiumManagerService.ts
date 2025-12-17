import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export interface CompendiumEntry {
    id?: string;
    nome: string;
    name?: string;
    description?: string;
    descricao?: string;
    [key: string]: any;
}

/**
 * Gerenciador CRUD para categorias do compêndio
 */
export class CompendiumManager {
    private projectRoot = path.resolve(__dirname, "../..");
    private acervoDir = path.join(this.projectRoot, "data/compendium");

    constructor() {
        if (!fs.existsSync(this.acervoDir)) {
            fs.mkdirSync(this.acervoDir, { recursive: true });
        }
    }

    /**
     * Obtém caminho do arquivo JSON de uma categoria
     */
    private getFilePath(categoria: string): string {
        const fileName = `compendium_${categoria.toLowerCase().replace(/\s+/g, "_")}.json`;
        return path.join(this.acervoDir, fileName);
    }

    /**
     * Carrega todas as entradas de uma categoria
     */
    loadCategory(categoria: string): CompendiumEntry[] {
        const filePath = this.getFilePath(categoria);
        try {
            if (fs.existsSync(filePath)) {
                const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
                return data.entradas || [];
            }
        } catch (err) {
            console.warn(`[CompendiumManager] Erro ao carregar ${categoria}:`, err);
        }
        return [];
    }

    /**
     * Salva entradas em uma categoria
     */
    private saveCategory(categoria: string, entries: CompendiumEntry[]): void {
        const filePath = this.getFilePath(categoria);
        const data = {
            categoria,
            versao: "1.0",
            atualizadoEm: new Date().toISOString(),
            total: entries.length,
            entradas: entries,
        };
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
        console.log(
            `[CompendiumManager] Categoria ${categoria} salva (${entries.length} entradas)`
        );
    }

    /**
     * Adiciona uma nova entrada
     */
    addEntry(categoria: string, entry: CompendiumEntry): CompendiumEntry {
        if (!entry.nome && !entry.name) {
            throw new Error("Entrada deve ter campo 'nome' ou 'name'");
        }

        const entries = this.loadCategory(categoria);
        const id = entry.id || entry.nome.toLowerCase().replace(/\s+/g, "_");

        // Verifica duplicata
        if (entries.some((e) => (e.id || e.nome).toLowerCase() === id.toLowerCase())) {
            throw new Error(`Entrada com ID '${id}' já existe`);
        }

        const newEntry = { ...entry, id };
        entries.push(newEntry);
        this.saveCategory(categoria, entries);

        return newEntry;
    }

    /**
     * Busca uma entrada por ID ou nome
     */
    findEntry(categoria: string, idOrName: string): CompendiumEntry | null {
        const entries = this.loadCategory(categoria);
        const search = idOrName.toLowerCase();

        return (
            entries.find(
                (e) =>
                    (e.id || "").toLowerCase() === search ||
                    (e.nome || e.name || "").toLowerCase() === search
            ) || null
        );
    }

    /**
     * Edita uma entrada existente
     */
    editEntry(
        categoria: string,
        idOrName: string,
        updates: Partial<CompendiumEntry>
    ): CompendiumEntry {
        const entries = this.loadCategory(categoria);
        const search = idOrName.toLowerCase();

        const index = entries.findIndex(
            (e) =>
                (e.id || "").toLowerCase() === search ||
                (e.nome || e.name || "").toLowerCase() === search
        );

        if (index === -1) {
            throw new Error(`Entrada '${idOrName}' não encontrada`);
        }

        entries[index] = { ...entries[index], ...updates };
        this.saveCategory(categoria, entries);

        return entries[index];
    }

    /**
     * Deleta uma entrada
     */
    deleteEntry(categoria: string, idOrName: string): boolean {
        const entries = this.loadCategory(categoria);
        const search = idOrName.toLowerCase();

        const index = entries.findIndex(
            (e) =>
                (e.id || "").toLowerCase() === search ||
                (e.nome || e.name || "").toLowerCase() === search
        );

        if (index === -1) {
            return false;
        }

        const deleted = entries.splice(index, 1);
        this.saveCategory(categoria, entries);

        console.log(`[CompendiumManager] Entrada deletada: ${deleted[0].nome} (${categoria})`);
        return true;
    }

    /**
     * Lista entradas com paginação
     */
    listEntries(categoria: string, page: number = 1, pageSize: number = 10) {
        const entries = this.loadCategory(categoria);
        const total = entries.length;
        const totalPages = Math.ceil(total / pageSize);

        if (page < 1 || page > totalPages) {
            return { entries: [], page, totalPages, total, categoria };
        }

        const start = (page - 1) * pageSize;
        const paged = entries.slice(start, start + pageSize);

        return { entries: paged, page, totalPages, total, categoria };
    }

    /**
     * Busca entradas por palavra-chave
     */
    searchEntries(categoria: string, keyword: string): CompendiumEntry[] {
        const entries = this.loadCategory(categoria);
        const search = keyword.toLowerCase();

        return entries.filter(
            (e) =>
                (e.nome || "").toLowerCase().includes(search) ||
                (e.name || "").toLowerCase().includes(search) ||
                (e.description || "").toLowerCase().includes(search) ||
                (e.descricao || "").toLowerCase().includes(search)
        );
    }

    /**
     * Obtém estatísticas
     */
    getStats(categoria: string) {
        const entries = this.loadCategory(categoria);
        return {
            categoria,
            total: entries.length,
            ultimaAtualizacao: new Date().toISOString(),
            entradas: entries.map((e) => e.nome || e.name),
        };
    }
}

// Instância singleton
export const compendiumManager = new CompendiumManager();
