# Ecossistema Comercial — Record

Ferramenta interna do setor comercial da Record para **inteligência de mercado e
estratégia de vendas**. Reúne, em um portal só, os módulos do dia a dia comercial.

**Stack:** HTML/CSS/JS (visual) · **Vercel** (Front End) · **Supabase** (Back End)

---

## 🧩 Módulos

| Módulo | O que faz |
|--------|-----------|
| 🏠 **Portal** | Tela inicial com visão geral e acesso a tudo |
| 📊 **Dashboard** | KPIs, metas vs. realizado, funil e vendas por mês |
| 👥 **Clientes & Leads (CRM)** | Cadastro, busca e status das contas |
| 🫧 **Funil de Vendas** | Pipeline kanban por estágio |
| 📄 **Propostas** | Criação e acompanhamento de propostas |
| 🏢 **Catálogo de Imóveis** | Empreendimentos e unidades à venda |
| 🧭 **Inteligência de Mercado** | Indicadores econômicos e cenário |
| 🏆 **Equipe & Metas** | Ranking e metas dos vendedores |
| 📅 **Agenda** | Compromissos e prazos |

---

## 📁 Estrutura

```
ecossistema-comercial/
├── index.html            ← Portal central
├── css/sistema.css       ← design system (cores no topo, em :root)
├── js/
│   ├── sistema.js        ← menu lateral, tema, carregar dados, formatadores
│   ├── supabase.js       ← configuração do Back End (colar 2 chaves)
│   └── dados-exemplo.js  ← dados fictícios (usados até ligar o Supabase)
├── modulos/              ← uma página por módulo
├── supabase/schema.sql   ← cria todas as tabelas do comercial
└── vercel.json
```

---

## ▶️ Rodar no computador

```bash
cd ecossistema-comercial
python3 -m http.server 8000
```
Abra <http://localhost:8000>. Já funciona com **dados de exemplo**.

---

## 🗄️ Ligar o Back End (Supabase)

1. Crie um projeto em <https://supabase.com>.
2. **SQL Editor** → cole `supabase/schema.sql` → **Run** (cria as tabelas, já com
   segurança RLS para a equipe logada).
3. **Authentication → Users**: crie os logins da equipe.
4. **Project Settings → API**: copie a **URL** e a **anon key** e cole em
   `js/supabase.js`.

Pronto: o sistema passa a ler/gravar os dados reais. Enquanto não configurar,
ele mostra os dados de exemplo (com um aviso em cada tela).

> 🔒 A `anon key` é pública (pode ficar no front). **Nunca** use a `service_role key` aqui.
> Para um teste rápido sem login, há um bloco comentado no fim do `schema.sql`
> (libera acesso anônimo — não use com dados reais).

---

## 🔗 Fonte de vendas: CV CRM

A parte de **vendas/faturamento** e **clientes/leads** é puxada do **CV CRM**
(Construtor de Vendas). O front não fala direto com o CV (exporia o token); ele
fala com uma **ponte** no back-end que guarda o token com segurança.

- Camada no front: `js/cvcrm.js` (só a URL da ponte).
- Modelo da ponte pronto (Supabase Edge Function ou Vercel Function) e o passo a
  passo: **`integracoes/cvcrm/README.md`**.

Ordem das fontes de dados: **CV CRM → Supabase → dados de exemplo**. Enquanto a
ponte não é configurada, o sistema usa o exemplo (com aviso em cada tela).

## 🌐 Publicar na Vercel

- **Pelo site:** conecte o repositório, em **Root Directory** aponte para
  `ecossistema-comercial`, e clique em **Deploy**.
- **Pelo terminal:** `cd ecossistema-comercial && npx vercel --prod`

---

## 🎨 Personalizar

- **Cores e marca:** topo do `css/sistema.css`, bloco `:root` (tokens `--marca-*`).
- **Menu:** lista `MODULOS` no início do `js/sistema.js`.
- **Dados de teste:** `js/dados-exemplo.js`.

> Os nomes de empresas nos dados de exemplo são fictícios.
