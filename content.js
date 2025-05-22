function getCustomFieldTags() {
  const camposDesejados = [
    "produto",
    "complexidade",
    "stack",
    "projeto",
    "tipo",
    "urgência",
  ];
  const atributos = [...document.querySelectorAll(".custom-attribute")];
  const tags = [];

  atributos.forEach((attr) => {
    const labelEl = attr.querySelector(".custom-field-name");
    const valorEl = attr.querySelector(".custom-field-value p");
    if (labelEl && valorEl) {
      const tagLabel = labelEl.textContent.trim().toLowerCase();
      const tagValor = valorEl.textContent.trim().toLowerCase();
      if (camposDesejados.includes(tagLabel)) {
        tags.push(`${tagLabel}:${tagValor}`);
      }
    }
  });

  return tags;
}

async function adicionarTag(tag) {
  const botaoAdicionar = document.querySelector(".tags-container button");
  if (botaoAdicionar) botaoAdicionar.click();
  await new Promise((resolve) => setTimeout(resolve, 300));

  const inputTag = document.querySelector(".tags-container input");
  if (inputTag) {
    inputTag.value = tag;
    inputTag.dispatchEvent(new Event("input", { bubbles: true }));
    await new Promise((resolve) => setTimeout(resolve, 200));
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
  if (document.querySelector("#btn-incluir-tags")) return;

  const container = document.querySelector(".custom-fields-header");
  if (!container) return;

  const botao = document.createElement("button");
  botao.id = "btn-incluir-tags";
  botao.innerText = "Incluir tags";
  botao.style.marginLeft = "12px";
  botao.style.padding = "4px 8px";
  botao.style.cursor = "pointer";
  botao.style.background = "#e3e3e3";

  const feedback = document.createElement("span");
  feedback.id = "feedback-incluir-tags";
  feedback.style.marginLeft = "8px";
  feedback.style.color = "green";
  feedback.style.fontSize = "12px";
  feedback.style.display = "none";
  feedback.textContent = "✔ Tags adicionadas!";

  botao.onclick = async () => {
    botao.disabled = true;
    feedback.style.display = "none";
    const tags = getCustomFieldTags();
    for (const tag of tags) {
      await adicionarTag(tag);
    }
    feedback.style.display = "inline";
    botao.disabled = false;
  };

  container.appendChild(botao);
  container.appendChild(feedback);
}

const observer = new MutationObserver(() => {
  const campoExiste = document.querySelector(".custom-attribute");
  if (campoExiste) adicionarBotaoGlobal();
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
});
