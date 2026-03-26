(() => {
  if (window.__taigaHelperLoaded) return;
  window.__taigaHelperLoaded = true;

  // -------- util --------
  const throttle = (fn, ms) => {
    let running = false,
      pending = false;
    return (...args) => {
      if (running) {
        pending = true;
        return;
      }
      running = true;
      fn(...args);
      setTimeout(() => {
        running = false;
        if (pending) {
          pending = false;
          fn(...args);
        }
      }, ms);
    };
  };

  const waitForElement = (selector, timeout = 15000) =>
    new Promise((resolve, reject) => {
      const el = document.querySelector(selector);
      if (el) return resolve(el);
      const obs = new MutationObserver(() => {
        const el2 = document.querySelector(selector);
        if (el2) {
          obs.disconnect();
          resolve(el2);
        }
      });
      obs.observe(document.documentElement, { childList: true, subtree: true });
      if (timeout)
        setTimeout(() => {
          obs.disconnect();
          reject(new Error("waitForElement timeout"));
        }, timeout);
    });

  // -------- helpers de descrição --------
  async function inserirNaDescricao(html) {
    const container = document.querySelector("tg-item-wysiwyg");
    if (!container) return;

    let editor = container.querySelector(".ck-editor__editable");
    if (!editor) {
      // Se não estiver em modo de edição, tenta clicar para editar
      const display = container.querySelector(".wysiwyg");
      if (display) {
        display.click();
        try {
          editor = await waitForElement("tg-item-wysiwyg .ck-editor__editable", 5000);
        } catch (e) {
          console.error("Editor não apareceu");
          return;
        }
      }
    }

    if (editor) {
      editor.focus();
      // Move o cursor para o final
      const range = document.createRange();
      range.selectNodeContents(editor);
      range.collapse(false);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);

      // Insere o HTML
      document.execCommand("insertHTML", false, html);
      
      // Dispara eventos para o Angular notar a mudança
      editor.dispatchEvent(new Event("input", { bubbles: true }));
      editor.dispatchEvent(new Event("change", { bubbles: true }));
    }
  }

  // -------- suas funções (tags) --------
  function getCustomFieldTags() {
    const camposDesejados = ["produto", "projeto", "stack", "prioridade"];
    const atributos = [...document.querySelectorAll(".custom-attribute")];
    const tags = [];
    atributos.forEach((attr) => {
      const labelEl = attr.querySelector(".custom-field-name");
      const valorEl = attr.querySelector(".custom-field-value p, .custom-field-value select");
      if (labelEl && valorEl) {
        const tagLabel = labelEl.textContent.trim().toLowerCase();
        const tagValor = valorEl.textContent.trim().toLowerCase();
        if (camposDesejados.includes(tagLabel)) tags.push(tagValor);
      }
    });
    return tags;
  }

  async function adicionarTag(tag) {
    const botaoAdicionar = document.querySelector(".tags-container button");
    if (botaoAdicionar) botaoAdicionar.click();
    await new Promise((r) => setTimeout(r, 300));
    const inputTag = document.querySelector(".tags-container input");
    if (inputTag) {
      inputTag.value = tag;
      inputTag.dispatchEvent(new Event("input", { bubbles: true }));
      await new Promise((r) => setTimeout(r, 200));
      const sugestoes = [...document.querySelectorAll(".tags-dropdown-option")];
      const item = sugestoes.find(
        (s) => s.textContent.trim().toLowerCase() === tag.toLowerCase(),
      );
      if (item) item.click();
      else {
        const botaoSalvar = document.querySelector(
          'tg-svg[svg-icon="icon-save"]',
        );
        if (botaoSalvar) botaoSalvar.click();
      }
    }
  }

  function adicionarBotaoGlobal() {
    if (document.querySelector("#helper-taiga-container")) return;
    const container = document.querySelector(".custom-fields-header");
    if (!container) return;

    const mainWrapper = document.createElement("div");
    mainWrapper.id = "helper-taiga-container";
    mainWrapper.style.display = "flex";
    mainWrapper.style.flexDirection = "column";
    mainWrapper.style.gap = "8px";
    mainWrapper.style.padding = "10px";
    mainWrapper.style.background = "#f9f9f9";
    mainWrapper.style.border = "1px solid #ddd";
    mainWrapper.style.marginTop = "10px";
    mainWrapper.style.borderRadius = "4px";

    const row1 = document.createElement("div");
    row1.style.display = "flex";
    row1.style.alignItems = "center";
    row1.style.gap = "10px";

    // Botão Incluir Tags
    const btnTags = document.createElement("button");
    btnTags.id = "btn-incluir-tags";
    btnTags.innerText = "Incluir tags";
    btnTags.className = "btn-small";
    btnTags.style.background = "#e3e3e3";
    btnTags.style.cursor = "pointer";

    const feedback = document.createElement("span");
    feedback.id = "feedback-incluir-tags";
    feedback.style.color = "green";
    feedback.style.fontSize = "12px";
    feedback.style.display = "none";
    feedback.textContent = "✔ Tags adicionadas!";

    btnTags.onclick = async () => {
      btnTags.disabled = true;
      feedback.style.display = "none";
      const tags = getCustomFieldTags();
      for (const tag of tags) await adicionarTag(tag);
      feedback.style.display = "inline";
      btnTags.disabled = false;
    };

    // Botão Não é Desenvolvimento
    const btnNaoDev = document.createElement("button");
    btnNaoDev.innerText = "Não é Desenvolvimento";
    btnNaoDev.className = "btn-small";
    btnNaoDev.style.background = "#ffcccc";
    btnNaoDev.style.cursor = "pointer";
    btnNaoDev.onclick = () => {
      inserirNaDescricao("<hr><p> @#@#</p>");
    };

    row1.appendChild(btnTags);
    row1.appendChild(btnNaoDev);
    row1.appendChild(feedback);

    // Campo Retorno ao Cliente
    const row2 = document.createElement("div");
    row2.style.display = "flex";
    row2.style.alignItems = "center";
    row2.style.gap = "10px";

    const labelRetorno = document.createElement("span");
    labelRetorno.innerText = "Retorno ao Cliente:";
    labelRetorno.style.fontSize = "12px";
    labelRetorno.style.fontWeight = "bold";

    const inputRetorno = document.createElement("input");
    inputRetorno.type = "text";
    inputRetorno.placeholder = "Digite o retorno...";
    inputRetorno.style.flex = "1";
    inputRetorno.style.padding = "4px";
    inputRetorno.style.fontSize = "12px";

    const btnInserirRetorno = document.createElement("button");
    btnInserirRetorno.innerText = "Inserir";
    btnInserirRetorno.className = "btn-small";
    btnInserirRetorno.style.background = "#ccffcc";
    btnInserirRetorno.style.cursor = "pointer";
    btnInserirRetorno.onclick = () => {
      const texto = inputRetorno.value.trim();
      if (texto) {
        inserirNaDescricao(`<p> @#$ ${texto}</p>`);
        inputRetorno.value = "";
      }
    };

    inputRetorno.onkeydown = (e) => {
      if (e.key === "Enter") {
        btnInserirRetorno.click();
      }
    };

    row2.appendChild(labelRetorno);
    row2.appendChild(inputRetorno);
    row2.appendChild(btnInserirRetorno);

    mainWrapper.appendChild(row1);
    mainWrapper.appendChild(row2);

    container.parentElement.insertBefore(mainWrapper, container.nextSibling);
  }

  // instala o botão quando os campos aparecerem (throttled)
  const scheduleTagCheck = throttle(() => {
    if (document.querySelector(".custom-attribute")) adicionarBotaoGlobal();
  }, 300);
  const tagObserver = new MutationObserver(scheduleTagCheck);
  tagObserver.observe(document.body, { childList: true, subtree: true });
  if (document.readyState !== "loading") scheduleTagCheck();
  else document.addEventListener("DOMContentLoaded", scheduleTagCheck);

  // -------- contador de issues --------
  const STATUS_KEYS_ORDER = [
    "Novo",
    "Em análise",
    "Pronto para iniciar",
    "Em andamento",
    "Pronto para teste",
    "Alterações solicitadas",
    "Precisa de informação",
    "Adiado",
    "Rejeitado",
    "Reprovado",
    "Concluído",
  ];

  const state = {
    panel: null,
    table: null,
    lastHash: "",
    tableObserver: null,
  };

  const ensureStyles = () => {
    if (document.getElementById("taiga-issue-counter-style")) return;
    const style = document.createElement("style");
    style.id = "taiga-issue-counter-style";
    style.textContent = `
      .taiga-issue-counter {
        display: flex; flex-wrap: wrap; gap: 6px; align-items: center;
        margin: 8px 0 10px; font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; font-size: 12px;
      }
      .taiga-issue-counter .chip {
        display: inline-flex; align-items: center; gap: 6px;
        border: 1px solid rgba(0,0,0,0.1); padding: 4px 8px; border-radius: 999px;
        background: rgba(0,0,0,0.04); white-space: nowrap;
      }
      .taiga-issue-counter .chip .dot { width: 8px; height: 8px; border-radius: 50%; background: currentColor; opacity: .9; }
      .taiga-issue-counter .chip.total { font-weight: 600; border-color: rgba(0,0,0,0.15); background: rgba(0,0,0,0.06); }
      .taiga-issue-counter .spacer { flex: 0 0 100%; height: 0; }
      .btn-small { padding: 4px 8px; border: 1px solid #ccc; border-radius: 3px; font-size: 12px; }
    `;
    document.head.appendChild(style);
  };

  function findIssuesTable() {
    return document.querySelector("section.issues-table");
  }

  function visible(el) {
    return el && el.offsetParent !== null && !el.classList.contains("ng-hide");
  }

  function getIssueRows(table) {
    return Array.from(table.querySelectorAll(".row.table-main")).filter(
      visible,
    );
  }

  function readStatus(row) {
    const el = row.querySelector(".issue-status .issue-status-bind");
    if (!el) return "Desconhecido";
    return (
      el.getAttribute("title") ||
      el.textContent ||
      "Desconhecido"
    ).trim();
  }

  function computeCounts(rows) {
    const counts = new Map();
    let total = 0;
    for (const r of rows) {
      total += 1;
      const st = readStatus(r);
      counts.set(st, (counts.get(st) || 0) + 1);
    }
    return { total, counts };
  }

  function ensureCounterPanel(table) {
    if (state.panel && state.panel.isConnected) return state.panel;

    const parent = table.parentNode;
    const existing = parent.querySelectorAll(".taiga-issue-counter");
    if (existing.length > 0) {
      state.panel = existing[0];
      for (let i = 1; i < existing.length; i++) existing[i].remove();
      if (state.panel.nextSibling !== table) {
        parent.insertBefore(state.panel, table);
      }
      return state.panel;
    }

    ensureStyles();
    const panel = document.createElement("div");
    panel.className = "taiga-issue-counter";
    parent.insertBefore(panel, table);
    state.panel = panel;
    return panel;
  }

  function statusColor(status) {
    const map = {
      Novo: "#9aa0a6",
      "Em análise": "#8ab4f8",
      "Pronto para iniciar": "#d353d1",
      "Em andamento": "#40a8e4",
      "Pronto para teste": "#fbbc04",
      "Alterações solicitadas": "#a142f4",
      "Precisa de informação": "#f29900",
      Adiado: "#80868b",
      Rejeitado: "#ea4335",
      Reprovado: "#b31412",
      Concluído: "#a8e440",
    };
    return map[status] || "#607d8b";
  }

  function makeHash(data) {
    const parts = [`T${data.total}`];
    const ordered = [...data.counts.entries()].sort((a, b) =>
      a[0].localeCompare(b[0]),
    );
    for (const [k, v] of ordered) parts.push(`${k}:${v}`);
    return parts.join("|");
  }

  function renderCounter(data) {
    const panel = ensureCounterPanel(state.table);
    const hash = makeHash(data);
    if (hash === state.lastHash) return;
    state.lastHash = hash;

    const { total, counts } = data;
    panel.innerHTML = "";

    const totalChip = document.createElement("span");
    totalChip.className = "chip total";
    totalChip.textContent = `Total: ${total}`;
    panel.appendChild(totalChip);

    const spacer = document.createElement("span");
    spacer.className = "spacer";
    panel.appendChild(spacer);

    const known = STATUS_KEYS_ORDER.filter((k) => counts.has(k));
    const unknown = Array.from(counts.keys())
      .filter((k) => !STATUS_KEYS_ORDER.includes(k))
      .sort();

    for (const key of [...known, ...unknown]) {
      const chip = document.createElement("span");
      chip.className = "chip";
      chip.title = key;
      const dot = document.createElement("span");
      dot.className = "dot";
      chip.style.color = statusColor(key);
      chip.appendChild(dot);
      const label = document.createElement("span");
      label.textContent = `${key}: ${counts.get(key)}`;
      chip.appendChild(label);
      panel.appendChild(chip);
    }
  }

  const updateIssueCounter = throttle(() => {
    try {
      if (!state.table || !state.table.isConnected) return;
      const rows = getIssueRows(state.table);
      renderCounter(computeCounts(rows));
    } catch (e) {}
  }, 250);

  function attachTableObserver(table) {
    if (state.tableObserver) state.tableObserver.disconnect();
    state.table = table;
    state.lastHash = "";
    updateIssueCounter();

    state.tableObserver = new MutationObserver(updateIssueCounter);
    state.tableObserver.observe(table, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class", "style", "title"],
    });

    window.addEventListener("resize", updateIssueCounter, { passive: true });

    const showTags = document.getElementById("show-tags");
    if (showTags) {
      showTags.addEventListener(
        "click",
        () => setTimeout(updateIssueCounter, 0),
        { passive: true },
      );
    }
  }

  async function bootCounter() {
    try {
      const table = await waitForElement("section.issues-table", 15000);
      attachTableObserver(table);
    } catch (_) {}
  }

  // -------- link para Mission Control --------
  function adicionarLinkMissionControl() {
    if (document.querySelector("#mission-control-link")) return;

    const projectsDropdown = document.querySelector(
      "[tg-dropdown-project-list]",
    );
    if (!projectsDropdown) return;

    const navLeft = projectsDropdown.parentElement;
    if (!navLeft) return;

    const wrapper = document.createElement("div");
    wrapper.className = "topnav-dropdown-wrapper";
    wrapper.id = "mission-control-wrapper";

    const link = document.createElement("a");
    link.id = "mission-control-link";
    link.href = "https://mission-control-coral-nine.vercel.app/";
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.title = "Mission Control";
    link.className = "dropdown-project-list-projects";
    link.style.cssText = `
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 0 15px;
      height: 100%;
      color: #999;
      text-decoration: none;
      font-size: 14px;
      transition: color 0.2s;
    `;

    const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    icon.setAttribute("class", "icon");
    icon.setAttribute("width", "18");
    icon.setAttribute("height", "18");
    icon.setAttribute("viewBox", "0 0 24 24");
    icon.setAttribute("fill", "none");
    icon.setAttribute("stroke", "currentColor");
    icon.setAttribute("stroke-width", "2");
    icon.style.cssText = "fill: none; stroke: currentColor;";

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute(
      "d",
      "M4.5 16.5c-1.5 1.5-2 5-.5 5.5s4-1 5.5-2.5L21 8c1-1 2-5 2-7s-6 1-7 2L4.5 16.5zM8.5 8.5l7 7M12 15l5 5",
    );
    icon.appendChild(path);

    const text = document.createElement("span");
    text.textContent = "Mission Control";

    link.appendChild(icon);
    link.appendChild(text);
    wrapper.appendChild(link);

    link.addEventListener("mouseenter", () => {
      link.style.color = "#fff";
    });

    link.addEventListener("mouseleave", () => {
      link.style.color = "#999";
    });

    projectsDropdown.insertAdjacentElement("afterend", wrapper);
  }

  const scheduleMissionControlCheck = throttle(() => {
    if (document.querySelector("[tg-dropdown-project-list]")) {
      adicionarLinkMissionControl();
    }
  }, 300);

  const missionControlObserver = new MutationObserver(
    scheduleMissionControlCheck,
  );
  missionControlObserver.observe(document.body, {
    childList: true,
    subtree: true,
  });

  let lastUrl = location.href;
  setInterval(() => {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      if (state.tableObserver) state.tableObserver.disconnect();
      state.tableObserver = null;
      state.table = null;
      state.panel = null;
      state.lastHash = "";
      bootCounter();
      scheduleTagCheck();
      scheduleMissionControlCheck();
    }
  }, 1200);

  if (document.readyState !== "loading") {
    scheduleTagCheck();
    bootCounter();
    scheduleMissionControlCheck();
  } else {
    document.addEventListener("DOMContentLoaded", () => {
      scheduleTagCheck();
      bootCounter();
      scheduleMissionControlCheck();
    });
  }
})();
