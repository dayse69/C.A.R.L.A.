/* ═══════════════════════════════════════════════════════════════ */
/* CARLA Dashboard - Script de Controle */
/* ═══════════════════════════════════════════════════════════════ */

let allFichas = [];
let currentFicha = null;

// ═══════════════════════════════════════════════════════════════
// INICIALIZAÇÃO
// ═══════════════════════════════════════════════════════════════

document.addEventListener("DOMContentLoaded", () => {
    console.log("[Dashboard] Iniciando...");
    loadFichas();
    setupEventListeners();
    checkDatabaseConnection();
    setupIAEvent();
});

// ═══════════════════════════════════════════════════════════════
// EVENT LISTENERS
// ═══════════════════════════════════════════════════════════════

function setupEventListeners() {
    document.getElementById("btn-refresh")?.addEventListener("click", loadFichas);
    document.getElementById("search-input")?.addEventListener("input", filterFichas);
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeModal();
    });
}

function setupIAEvent() {
    document.getElementById("btn-ia")?.addEventListener("click", async () => {
        const prompt = document.getElementById("ia-input").value;
        if (!prompt.trim()) return alert("Digite uma pergunta para a IA.");
        await perguntarIA(prompt);
    });
}

async function perguntarIA(prompt) {
    try {
        const res = await fetch("http://127.0.0.1:5000/api/ia", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt })
        });
        const data = await res.json();
        alert("Resposta da IA: " + data.response);
    } catch (err) {
        alert("Erro ao consultar IA: " + err);
    }
}
}

// ═══════════════════════════════════════════════════════════════
// CARREGAMENTO DE FICHAS
// ═══════════════════════════════════════════════════════════════

async function loadFichas() {
    console.log("[Dashboard] Carregando fichas...");
    const listContainer = document.getElementById("fichas-list");
    listContainer.innerHTML = '<div class="loading">⏳ Carregando fichas...</div>';

    try {
        const response = await fetch("/api/fichas");

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        allFichas = Array.isArray(data) ? data : data.fichas || [];

        console.log(`[Dashboard] ${allFichas.length} fichas carregadas`);
        renderFichas(allFichas);
        updateDatabaseStatus(true);
    } catch (error) {
        console.error("[Dashboard] Erro ao carregar fichas:", error);
        listContainer.innerHTML = `
            <div class="empty">
                <div class="empty-icon">⚠️</div>
                <h3>Erro ao conectar com o servidor</h3>
                <p>${error.message}</p>
                <button class="btn btn-primary" onclick="loadFichas()" style="margin-top: 16px;">🔄 Tentar novamente</button>
            </div>
        `;
        updateDatabaseStatus(false);
    }
}

function renderFichas(fichas) {
    const listContainer = document.getElementById("fichas-list");

    if (!fichas || fichas.length === 0) {
        listContainer.innerHTML = `
            <div class="empty">
                <div class="empty-icon">📜</div>
                <h3>Nenhuma ficha criada</h3>
                <p>Crie uma ficha no Discord usando <code>/ficha criar</code></p>
            </div>
        `;
        return;
    }

    listContainer.innerHTML = fichas.map((ficha) => criarCartaFicha(ficha)).join("");

    // Adicionar event listeners aos cards
    document.querySelectorAll(".ficha-card").forEach((card) => {
        card.addEventListener("click", (e) => {
            const fichaId = card.dataset.fichaId;
            const ficha = allFichas.find((f) => f._id === fichaId);
            if (ficha) openModalDetail(ficha);
        });
    });
}

function criarCartaFicha(ficha) {
    const nome = ficha.nome || "Sem Nome";
    const raca = ficha.raca || "Desconhecida";
    const classe = ficha.classe || "Desconhecida";
    const nivel = ficha.nivelTotal || ficha.nivel || 0;
    const pvAtual = ficha.recursos?.pv?.atual ?? ficha.saude?.pv ?? 0;
    const pvMax = ficha.recursos?.pv?.maximo ?? ficha.saude?.pvMaximo ?? 1;
    const pmAtual = ficha.recursos?.pm?.atual ?? ficha.saude?.pm ?? 0;
    const pmMax = ficha.recursos?.pm?.maximo ?? ficha.saude?.pmMaximo ?? 1;
    const defesa = ficha.recursos?.defesa ?? 10;
    const experiencia = ficha.ressonancia?.total ?? 0;

    // Primeiro caractere do nome para avatar
    const iniciais = nome
        .split(" ")
        .map((p) => p[0])
        .join("")
        .substring(0, 2)
        .toUpperCase();

    return `
        <div class="ficha-card" data-ficha-id="${ficha._id}">
            <div class="ficha-header">
                <div class="ficha-avatar">${iniciais}</div>
                <div class="ficha-info">
                    <h3>${escapeHtml(nome)}</h3>
                    <p>${escapeHtml(raca)} • ${escapeHtml(classe)}</p>
                </div>
            </div>
            <div class="ficha-stats">
                <div class="stat-item">
                    <div class="stat-label">Nível</div>
                    <div class="stat-value">${nivel}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">PV</div>
                    <div class="stat-value">${pvAtual}/${pvMax}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">PM</div>
                    <div class="stat-value">${pmAtual}/${pmMax}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">Defesa</div>
                    <div class="stat-value">${defesa}</div>
                </div>
            </div>
            <div style="font-size: 0.8em; color: var(--carla-text-muted); margin-top: 8px; padding-top: 8px; border-top: 1px solid var(--carla-border);">
                💎 ${experiencia} XP
            </div>
        </div>
    `;
}

// ═══════════════════════════════════════════════════════════════
// FILTRO DE FICHAS
// ═══════════════════════════════════════════════════════════════

function filterFichas() {
    const searchTerm = document.getElementById("search-input")?.value?.toLowerCase() || "";

    if (!searchTerm) {
        renderFichas(allFichas);
        return;
    }

    const filtered = allFichas.filter((ficha) => {
        const nome = (ficha.nome || "").toLowerCase();
        const raca = (ficha.raca || "").toLowerCase();
        const classe = (ficha.classe || "").toLowerCase();

        return (
            nome.includes(searchTerm) || raca.includes(searchTerm) || classe.includes(searchTerm)
        );
    });

    renderFichas(filtered);
}

// ═══════════════════════════════════════════════════════════════
// MODAL DE DETALHES
// ═══════════════════════════════════════════════════════════════

function openModalDetail(ficha) {
    console.log("[Dashboard] Abrindo modal para:", ficha.nome);
    currentFicha = ficha;

    const modalTitle = document.getElementById("modal-title");
    const modalBody = document.getElementById("modal-body");

    modalTitle.textContent = `✦ ${escapeHtml(ficha.nome)} ✦`;

    // Criar abas
    const nivelTotal = ficha.nivelTotal || ficha.nivel || 0;
    const pvAtual = ficha.recursos?.pv?.atual ?? ficha.saude?.pv ?? 0;
    const pvMaximo = ficha.recursos?.pv?.maximo ?? ficha.saude?.pvMaximo ?? 0;
    const pmAtual = ficha.recursos?.pm?.atual ?? ficha.saude?.pm ?? 0;
    const pmMaximo = ficha.recursos?.pm?.maximo ?? ficha.saude?.pmMaximo ?? 0;
    const defesa = ficha.recursos?.defesa ?? 10;
    const deslocamento = ficha.recursos?.deslocamento ?? 9;

    modalBody.innerHTML = `
        <div style="display: flex; gap: 8px; margin-bottom: 16px; border-bottom: 2px solid var(--carla-border); flex-wrap: wrap;">
            <button class="tab-btn active" data-tab="info" onclick="switchTab(event, 'info')">ℹ️ Info</button>
            <button class="tab-btn" data-tab="atributos" onclick="switchTab(event, 'atributos')">💪 Atributos</button>
            <button class="tab-btn" data-tab="pericias" onclick="switchTab(event, 'pericias')">📊 Perícias</button>
            <button class="tab-btn" data-tab="equipamento" onclick="switchTab(event, 'equipamento')">⚔️ Equipamento</button>
            <button class="tab-btn" data-tab="talentos" onclick="switchTab(event, 'talentos')">🌟 Talentos</button>
            <button class="tab-btn" data-tab="habilidades" onclick="switchTab(event, 'habilidades')">🎯 Habilidades</button>
            <button class="tab-btn" data-tab="poderes" onclick="switchTab(event, 'poderes')">✨ Poderes</button>
            <button class="tab-btn" data-tab="magias" onclick="switchTab(event, 'magias')">🔮 Magias</button>
            <button class="tab-btn" data-tab="inventario" onclick="switchTab(event, 'inventario')">🎒 Inventário</button>
        </div>

        <!-- ABA: INFO -->
        <div class="tab-content active" id="tab-info">
            <div class="form-group">
                <label>Nome</label>
                <input type="text" id="field-nome" value="${escapeHtml(ficha.nome || "")}" />
            </div>

            <div class="form-group">
                <label>Raça</label>
                <input type="text" id="field-raca" value="${escapeHtml(ficha.raca || "")}" />
            </div>

            <div class="form-group">
                <label>Classe</label>
                <input type="text" id="field-classe" value="${escapeHtml(ficha.classe || "")}" />
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px;">
                <div class="form-group">
                    <label>Nível</label>
                    <input type="number" id="field-nivel" value="${nivelTotal}" min="1" max="20" />
                </div>
                <div class="form-group">
                    <label>Defesa</label>
                    <input type="number" id="field-defesa" value="${defesa}" />
                </div>
                <div class="form-group">
                    <label>Deslocamento</label>
                    <input type="number" id="field-deslocamento" value="${deslocamento}" />
                </div>
            </div>

            <h4 style="color: var(--carla-primary); margin-top: 16px; margin-bottom: 12px;">⟡ Saúde</h4>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                <div class="form-group">
                    <label>PV Atual / Máximo</label>
                    <div style="display: flex; gap: 8px;">
                        <input type="number" id="field-pv" value="${pvAtual}" style="flex: 1;" />
                        <input type="number" id="field-pvMax" value="${pvMaximo}" style="flex: 1;" />
                    </div>
                </div>
                <div class="form-group">
                    <label>PM Atual / Máximo</label>
                    <div style="display: flex; gap: 8px;">
                        <input type="number" id="field-pm" value="${pmAtual}" style="flex: 1;" />
                        <input type="number" id="field-pmMax" value="${pmMaximo}" style="flex: 1;" />
                    </div>
                </div>
            </div>

            <h4 style="color: var(--carla-primary); margin-top: 16px; margin-bottom: 12px;">⟡ História</h4>

            <div class="form-group">
                <label>Aparência</label>
                <textarea id="field-aparencia" style="min-height: 60px;">${escapeHtml(ficha.historia?.aparencia || "")}</textarea>
            </div>

            <div class="form-group">
                <label>Anotações</label>
                <textarea id="field-anotacoes" style="min-height: 60px;">${escapeHtml(ficha.historia?.anotacoes || "")}</textarea>
            </div>
        </div>

        <!-- ABA: ATRIBUTOS -->
        <div class="tab-content" id="tab-atributos">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                ${["FOR", "DES", "CON", "INT", "SAB", "CAR"]
                    .map(
                        (attr) => `
                    <div class="form-group">
                        <label>${attr}</label>
                        <input type="number" id="field-attr-${attr}" value="${ficha.atributos?.[attr] || 10}" min="1" max="20" />
                    </div>
                `
                    )
                    .join("")}
            </div>
            <div style="background: rgba(139, 0, 255, 0.1); padding: 12px; border-radius: 6px; margin-top: 16px; font-size: 0.85em;">
                <strong>Resistências:</strong><br>
                <small>
                    Fortitude: ${ficha.recursos?.resistencias?.fortitude || 0} | 
                    Reflexos: ${ficha.recursos?.resistencias?.reflexos || 0} | 
                    Vontade: ${ficha.recursos?.resistencias?.vontade || 0}
                </small>
            </div>
        </div>

        <!-- ABA: PERÍCIAS -->
        <div class="tab-content" id="tab-pericias">
            <div style="max-height: 300px; overflow-y: auto; background: var(--carla-dark); padding: 12px; border-radius: 6px;">
                ${
                    Object.keys(ficha.pericias || {}).length > 0
                        ? Object.entries(ficha.pericias || {})
                              .map(
                                  ([nome, valor]) => `
                        <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid var(--carla-border);">
                            <span>${escapeHtml(nome)}</span>
                            <strong style="color: var(--carla-primary);">${valor}</strong>
                        </div>
                    `
                              )
                              .join("")
                        : '<p style="color: var(--carla-text-muted); text-align: center;">Nenhuma perícia registrada</p>'
                }
            </div>
        </div>

        <!-- ABA: PODERES -->
        <div class="tab-content" id="tab-poderes">
            <div style="max-height: 300px; overflow-y: auto;">
                ${
                    (ficha.poderes || []).length > 0
                        ? (ficha.poderes || [])
                              .map(
                                  (poder, i) => `
                        <div style="background: var(--carla-dark); padding: 12px; border-radius: 6px; margin-bottom: 8px; border-left: 3px solid var(--carla-primary);">
                            <strong style="color: var(--carla-primary);">${escapeHtml(typeof poder === "string" ? poder : poder.nome || "Poder")}</strong>
                            ${typeof poder === "object" && poder.descricao ? `<p style="font-size: 0.85em; color: var(--carla-text-muted); margin-top: 4px;">${escapeHtml(poder.descricao)}</p>` : ""}
                        </div>
                    `
                              )
                              .join("")
                        : '<p style="color: var(--carla-text-muted); text-align: center;">Nenhum poder registrado</p>'
                }
            </div>
        </div>

        <!-- ABA: EQUIPAMENTO -->
        <div class="tab-content" id="tab-equipamento">
            <h4 style="color: var(--carla-primary); margin-bottom: 12px;">⚔️ Armas</h4>
            <div style="max-height: 200px; overflow-y: auto;">
                ${
                    (ficha.armas || []).length > 0
                        ? (ficha.armas || [])
                              .map(
                                  (arma, i) => `
                        <div style="background: var(--carla-dark); padding: 12px; border-radius: 6px; margin-bottom: 8px;">
                            <strong style="color: var(--carla-primary);">${escapeHtml(typeof arma === "string" ? arma : arma.nome || "Arma")}</strong>
                            ${typeof arma === "object" ? `<p style="font-size: 0.85em; color: var(--carla-text-muted); margin-top: 4px;">Ataque: ${arma.ataque || "+0"} | Dano: ${arma.dano || "1d6"} | Crítico: ${arma.critico || "20/x2"}</p>` : ""}
                        </div>
                    `
                              )
                              .join("")
                        : '<p style="color: var(--carla-text-muted); text-align: center;">Nenhuma arma registrada</p>'
                }
            </div>
            
            <h4 style="color: var(--carla-primary); margin-top: 16px; margin-bottom: 12px;">🛡️ Armadura e Escudo</h4>
            <div>
                ${
                    ficha.armadura && ficha.armadura.nome
                        ? `<div style="background: var(--carla-dark); padding: 12px; border-radius: 6px; margin-bottom: 8px;">
                            <strong style="color: var(--carla-primary);">${escapeHtml(ficha.armadura.nome)}</strong>
                            <p style="font-size: 0.85em; color: var(--carla-text-muted); margin-top: 4px;">Defesa: +${ficha.armadura.defesa || 0} | Penalidade: ${ficha.armadura.penalidade || 0}</p>
                        </div>`
                        : '<p style="color: var(--carla-text-muted); text-align: center;">Nenhuma armadura equipada</p>'
                }
                ${
                    ficha.escudo && ficha.escudo.nome
                        ? `<div style="background: var(--carla-dark); padding: 12px; border-radius: 6px;">
                            <strong style="color: var(--carla-primary);">${escapeHtml(ficha.escudo.nome)}</strong>
                            <p style="font-size: 0.85em; color: var(--carla-text-muted); margin-top: 4px;">Defesa: +${ficha.escudo.defesa || 0}</p>
                        </div>`
                        : '<p style="color: var(--carla-text-muted); text-align: center;">Nenhum escudo equipado</p>'
                }
            </div>
        </div>

        <!-- ABA: TALENTOS -->
        <div class="tab-content" id="tab-talentos">
            <div style="max-height: 300px; overflow-y: auto;">
                ${
                    (ficha.talentos || []).length > 0
                        ? (ficha.talentos || [])
                              .map(
                                  (talento, i) => `
                        <div style="background: var(--carla-dark); padding: 12px; border-radius: 6px; margin-bottom: 8px; border-left: 3px solid gold;">
                            <strong style="color: gold;">${escapeHtml(typeof talento === "string" ? talento : talento.nome || "Talento")}</strong>
                            ${typeof talento === "object" && talento.descricao ? `<p style="font-size: 0.85em; color: var(--carla-text-muted); margin-top: 4px;">${escapeHtml(talento.descricao)}</p>` : ""}
                            ${typeof talento === "object" && talento.origem ? `<p style="font-size: 0.75em; color: var(--carla-accent); margin-top: 4px;">Origem: ${escapeHtml(talento.origem)}</p>` : ""}
                        </div>
                    `
                              )
                              .join("")
                        : '<p style="color: var(--carla-text-muted); text-align: center;">Nenhum talento registrado</p>'
                }
            </div>
        </div>

        <!-- ABA: HABILIDADES -->
        <div class="tab-content" id="tab-habilidades">
            <div style="max-height: 300px; overflow-y: auto;">
                ${
                    (ficha.habilidades || []).length > 0
                        ? (ficha.habilidades || [])
                              .map(
                                  (habilidade, i) => `
                        <div style="background: var(--carla-dark); padding: 12px; border-radius: 6px; margin-bottom: 8px; border-left: 3px solid #00d4ff;">
                            <strong style="color: #00d4ff;">${escapeHtml(typeof habilidade === "string" ? habilidade : habilidade.nome || "Habilidade")}</strong>
                            ${typeof habilidade === "object" && habilidade.descricao ? `<p style="font-size: 0.85em; color: var(--carla-text-muted); margin-top: 4px;">${escapeHtml(habilidade.descricao)}</p>` : ""}
                            ${typeof habilidade === "object" && habilidade.tipo ? `<p style="font-size: 0.75em; color: var(--carla-accent); margin-top: 4px;">Tipo: ${escapeHtml(habilidade.tipo)}</p>` : ""}
                        </div>
                    `
                              )
                              .join("")
                        : '<p style="color: var(--carla-text-muted); text-align: center;">Nenhuma habilidade especial registrada</p>'
                }
            </div>
        </div>

        <!-- ABA: PODERES -->
        <div class="tab-content" id="tab-poderes">
            <div style="max-height: 300px; overflow-y: auto;">
                ${
                    (ficha.poderes || []).length > 0
                        ? (ficha.poderes || [])
                              .map(
                                  (poder, i) => `
                        <div style="background: var(--carla-dark); padding: 12px; border-radius: 6px; margin-bottom: 8px; border-left: 3px solid var(--carla-primary);">
                            <strong style="color: var(--carla-primary);">${escapeHtml(typeof poder === "string" ? poder : poder.nome || "Poder")}</strong>
                            ${typeof poder === "object" && poder.descricao ? `<p style="font-size: 0.85em; color: var(--carla-text-muted); margin-top: 4px;">${escapeHtml(poder.descricao)}</p>` : ""}
                        </div>
                    `
                              )
                              .join("")
                        : '<p style="color: var(--carla-text-muted); text-align: center;">Nenhum poder registrado</p>'
                }
            </div>
        </div>

        <!-- ABA: MAGIAS -->
        <div class="tab-content" id="tab-magias">
            <div style="max-height: 300px; overflow-y: auto;">
                ${
                    (ficha.magias || []).length > 0
                        ? (ficha.magias || [])
                              .map(
                                  (magia, i) => `
                        <div style="background: var(--carla-dark); padding: 12px; border-radius: 6px; margin-bottom: 8px; border-left: 3px solid var(--carla-accent);">
                            <strong style="color: var(--carla-accent);">${escapeHtml(typeof magia === "string" ? magia : magia.nome || "Magia")}</strong>
                            ${typeof magia === "object" && magia.circulo ? `<p style="font-size: 0.85em; color: var(--carla-text-muted); margin-top: 4px;">Círculo ${magia.circulo} - ${magia.escola || "Desconhecida"}</p>` : ""}
                        </div>
                    `
                              )
                              .join("")
                        : '<p style="color: var(--carla-text-muted); text-align: center;">Nenhuma magia registrada</p>'
                }
            </div>
        </div>

        <!-- ABA: INVENTÁRIO -->
        <div class="tab-content" id="tab-inventario">
            <h4 style="color: var(--carla-primary); margin-bottom: 12px;">💰 Dinheiro</h4>
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-bottom: 16px;">
                <div style="background: var(--carla-dark); padding: 12px; border-radius: 6px; text-align: center;">
                    <strong style="color: gold;">TO</strong>
                    <p style="font-size: 1.2em; margin-top: 4px;">${ficha.dinheiro?.TO || 0}</p>
                </div>
                <div style="background: var(--carla-dark); padding: 12px; border-radius: 6px; text-align: center;">
                    <strong style="color: silver;">TP</strong>
                    <p style="font-size: 1.2em; margin-top: 4px;">${ficha.dinheiro?.TP || 0}</p>
                </div>
                <div style="background: var(--carla-dark); padding: 12px; border-radius: 6px; text-align: center;">
                    <strong style="color: #cd7f32;">TC</strong>
                    <p style="font-size: 1.2em; margin-top: 4px;">${ficha.dinheiro?.TC || 0}</p>
                </div>
            </div>
            
            <h4 style="color: var(--carla-primary); margin-bottom: 12px;">🎒 Itens</h4>
            <div style="max-height: 200px; overflow-y: auto;">
                ${
                    (ficha.inventario || []).length > 0
                        ? (ficha.inventario || [])
                              .map(
                                  (item, i) => `
                        <div style="background: var(--carla-dark); padding: 12px; border-radius: 6px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <strong style="color: var(--carla-primary);">${escapeHtml(typeof item === "string" ? item : item.nome || "Item")}</strong>
                                ${typeof item === "object" && item.descricao ? `<p style="font-size: 0.85em; color: var(--carla-text-muted); margin-top: 4px;">${escapeHtml(item.descricao)}</p>` : ""}
                            </div>
                            ${typeof item === "object" && item.quantidade ? `<span style="color: var(--carla-accent); font-weight: bold;">x${item.quantidade}</span>` : ""}
                        </div>
                    `
                              )
                              .join("")
                        : '<p style="color: var(--carla-text-muted); text-align: center;">Nenhum item no inventário</p>'
                }
            </div>
        </div>

        <div style="background: rgba(139, 0, 255, 0.1); padding: 12px; border-radius: 6px; margin-top: 16px; font-size: 0.85em; color: var(--carla-text-muted);">
            <strong>ID:</strong> ${escapeHtml(ficha._id)}<br>
            <strong>Criada:</strong> ${new Date(ficha.criadoEm).toLocaleString("pt-BR")}<br>
            <strong>Atualizada:</strong> ${new Date(ficha.atualizadoEm).toLocaleString("pt-BR")}
        </div>
    `;

    document.getElementById("modal-detail").classList.add("open");
}

function closeModal() {
    document.getElementById("modal-detail").classList.remove("open");
    currentFicha = null;
}

function switchTab(event, tabName) {
    event.preventDefault();

    // Remover active de todos
    document.querySelectorAll(".tab-btn").forEach((btn) => btn.classList.remove("active"));
    document.querySelectorAll(".tab-content").forEach((tab) => tab.classList.remove("active"));

    // Adicionar active ao clicado
    event.target.classList.add("active");
    document.getElementById(`tab-${tabName}`).classList.add("active");
}

async function saveChanges() {
    if (!currentFicha) return;

    console.log("[Dashboard] Salvando alterações para:", currentFicha.nome);

    // Coletar dados dos atributos
    const atributos = {};
    ["FOR", "DES", "CON", "INT", "SAB", "CAR"].forEach((attr) => {
        const val = document.getElementById(`field-attr-${attr}`)?.value;
        if (val) atributos[attr] = parseInt(val);
    });

    const updated = {
        nome: document.getElementById("field-nome")?.value || currentFicha.nome,
        raca: document.getElementById("field-raca")?.value || currentFicha.raca,
        classe: document.getElementById("field-classe")?.value || currentFicha.classe,
        nivelTotal: parseInt(document.getElementById("field-nivel")?.value) || 0,
        atributos: Object.keys(atributos).length > 0 ? atributos : currentFicha.atributos,
        recursos: {
            ...currentFicha.recursos,
            pv: {
                atual: parseInt(document.getElementById("field-pv")?.value) || 0,
                maximo: parseInt(document.getElementById("field-pvMax")?.value) || 0,
                temporario: currentFicha.recursos?.pv?.temporario || 0,
            },
            pm: {
                atual: parseInt(document.getElementById("field-pm")?.value) || 0,
                maximo: parseInt(document.getElementById("field-pmMax")?.value) || 0,
            },
            defesa: parseInt(document.getElementById("field-defesa")?.value) || 10,
            deslocamento: parseInt(document.getElementById("field-deslocamento")?.value) || 9,
        },
        historia: {
            aparencia: document.getElementById("field-aparencia")?.value || "",
            anotacoes: document.getElementById("field-anotacoes")?.value || "",
        },
    };

    try {
        const response = await fetch(`/api/fichas/${currentFicha._id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(updated),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || `HTTP ${response.status}`);
        }

        console.log("[Dashboard] Ficha atualizada com sucesso");
        closeModal();
        loadFichas(); // Recarregar lista
    } catch (error) {
        console.error("[Dashboard] Erro ao salvar:", error);
        alert(`❌ Erro ao salvar: ${error.message}`);
    }
}

async function deleteCharacter() {
    if (!currentFicha) {
        console.error("[Dashboard] Erro: currentFicha é null ou undefined");
        alert("❌ Erro: Nenhuma ficha selecionada");
        return;
    }

    if (!currentFicha._id) {
        console.error("[Dashboard] Erro: currentFicha._id não encontrado", currentFicha);
        alert("❌ Erro: ID da ficha não encontrado");
        return;
    }

    const confirmDelete = confirm(
        `⚠️ Tem certeza que deseja deletar "${currentFicha.nome}"?\n\nEsta ação não pode ser desfeita.`
    );

    if (!confirmDelete) return;

    console.log("[Dashboard] Deletando ficha:", {
        nome: currentFicha.nome,
        _id: currentFicha._id,
    });

    try {
        const url = `/api/fichas/${currentFicha._id}`;
        console.log("[Dashboard] DELETE URL:", url);

        const response = await fetch(url, {
            method: "DELETE",
        });

        console.log("[Dashboard] Response status:", response.status);

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || `HTTP ${response.status}`);
        }

        const result = await response.json();
        console.log("[Dashboard] Ficha deletada com sucesso:", result);

        alert("✅ Ficha deletada com sucesso!");
        closeModal();
        loadFichas(); // Recarregar lista
    } catch (error) {
        console.error("[Dashboard] Erro ao deletar:", error);
        alert(`❌ Erro ao deletar: ${error.message}`);
    }
}

// ═══════════════════════════════════════════════════════════════
// VERIFICAÇÃO DE CONEXÃO
// ═══════════════════════════════════════════════════════════════

async function checkDatabaseConnection() {
    try {
        const response = await fetch("/api/fichas");
        if (response.ok) {
            updateDatabaseStatus(true);
        } else {
            updateDatabaseStatus(false);
        }
    } catch {
        updateDatabaseStatus(false);
    }
}

function updateDatabaseStatus(connected) {
    const statusEl = document.getElementById("status-db");
    if (statusEl) {
        if (connected) {
            statusEl.textContent = "🟢 Conectado ao MongoDB";
            statusEl.classList.add("connected");
        } else {
            statusEl.textContent = "🔴 Desconectado";
            statusEl.classList.remove("connected");
        }
    }
}

// ═══════════════════════════════════════════════════════════════
// UTILITÁRIOS
// ═══════════════════════════════════════════════════════════════

function escapeHtml(unsafe) {
    if (!unsafe) return "";
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

console.log("[Dashboard] Script carregado com sucesso");
