# 🧩 Taiga Tagger

Extensão leve para navegador que adiciona um botão **"Incluir tags"** à interface do Taiga. Ao ser clicado, a extensão insere automaticamente tags baseadas nos campos personalizados de uma User Story ou Issue.

---

## 📦 Como usar:

### 1. No Google Chrome:

- Acesse `chrome://extensions/`
- Ative o **Modo de desenvolvedor**
- Clique em **"Carregar sem compactação"**
- Selecione a pasta onde estão os dois arquivos

### 2. No Mozilla Firefox:

- Acesse `about:debugging#/runtime/this-firefox`
- Clique em **"Carregar Temporariamente um Add-on"**
- Escolha o arquivo `manifest.json`

---

## ✅ O que ela faz:

- Ao abrir/criar uma User Story ou Issue no Taiga, espera alguns segundos após o carregamento.
- Lê os campos personalizados: `produto`, `complexidade`, `stack`, `projeto`, `tipo`, `urgência`.
- Adiciona um botão **"Incluir tags"** na seção de "Campos Personalizados".
- Quando clicado, insere as tags no formato `campo:valor` automaticamente no sistema.
