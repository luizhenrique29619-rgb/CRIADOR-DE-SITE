# CRIADOR DE SITES

Nosso espaço para criar sites. A ideia é simples e rápida:

| Camada | Ferramenta | Para quê |
|--------|-----------|----------|
| **Protótipo / visual** | **HTML + CSS + JS** | Mostrar como o site vai ficar |
| **Front End (hospedagem)** | **Vercel** | Publicar o site na internet |
| **Back End** | **Supabase** | Banco de dados, formulários, login |

Pensado para quem trabalha com **Inteligência de Mercado e Estratégia de
Vendas**: montar landing pages, páginas de oferta e sites institucionais,
já conectados a um banco de dados para capturar contatos e leads.

---

## 📁 Como está organizado

```
CRIADOR-DE-SITE/
├── modelo-base/          ← modelo (template) copiado para cada novo site
│   ├── index.html        ← estrutura e textos da página
│   ├── css/style.css     ← cores e aparência (cores ficam no topo)
│   ├── js/
│   │   ├── supabase.js   ← configuração do Back End (Supabase)
│   │   └── script.js     ← menu, rodapé e envio do formulário
│   ├── img/              ← imagens do site
│   ├── supabase/
│   │   └── schema.sql    ← cria a tabela de contatos no banco
│   └── vercel.json       ← configuração de publicação na Vercel
├── sites/                ← cada site criado vira uma pasta aqui dentro
├── novo-site.sh          ← cria um site novo copiando o modelo-base
└── README.md             ← este arquivo
```

---

## 🚀 1. Criar um site novo

No terminal, dentro da pasta do projeto:

```bash
./novo-site.sh nome-do-site
```

Isso cria `sites/nome-do-site/` com tudo pronto para editar.
Use nomes sem espaços nem acentos (ex.: `oferta-black-friday`).

Depois é só editar:
- **Textos** → `sites/nome-do-site/index.html`
- **Cores** → topo do `sites/nome-do-site/css/style.css` (bloco `:root`)

---

## 👀 2. Ver o site no computador

Dentro da pasta do site, rode um servidor local (faz o Supabase e o JS
funcionarem direito):

```bash
cd sites/nome-do-site
python3 -m http.server 8000
```

Abra <http://localhost:8000> no navegador.

---

## 🗄️ 3. Ligar o Back End (Supabase)

1. Crie uma conta e um projeto em <https://supabase.com>.
2. No painel, vá em **SQL Editor**, cole o conteúdo de
   `supabase/schema.sql` e clique em **Run** (cria a tabela `contatos`).
3. Vá em **Project Settings → API** e copie:
   - **Project URL**
   - **anon public key**
4. Cole esses dois valores em `js/supabase.js`.

Pronto: as mensagens do formulário passam a ser gravadas no banco.
Você lê os contatos recebidos no painel do Supabase, em **Table Editor →
contatos**.

> 🔒 **Segurança:** a `anon key` é pública e pode ficar no front-end.
> **Nunca** coloque a `service_role key` nos arquivos do site.

---

## 🌐 4. Publicar o Front End (Vercel)

**Opção A — pelo site da Vercel (mais fácil):**
1. Conecte este repositório em <https://vercel.com>.
2. Em **Root Directory**, aponte para a pasta do site
   (ex.: `sites/oferta-black-friday`).
3. Clique em **Deploy**. Pronto, site no ar.

**Opção B — pelo terminal (CLI):**
```bash
cd sites/nome-do-site
npx vercel          # publica uma prévia
npx vercel --prod   # publica em produção
```

---

## 🔁 Fluxo completo (resumo)

```
1. ./novo-site.sh meu-site      →  cria os arquivos (HTML)
2. editar index.html / style.css →  deixar do jeito que quer
3. configurar js/supabase.js     →  conectar o Back End
4. npx vercel --prod             →  colocar no ar (Front End)
```

---

## ✏️ Dicas rápidas

- As **cores** ficam todas no `:root` do `css/style.css`.
- Cada **seção** do `index.html` está comentada (hero, sobre, serviços, contato).
- O modelo funciona **mesmo sem Supabase**: o formulário só mostra o aviso de
  sucesso até você preencher o `js/supabase.js`.
