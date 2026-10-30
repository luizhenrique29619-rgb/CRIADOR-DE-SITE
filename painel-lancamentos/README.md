# Painel de Lançamentos · RECORD EMPREENDIMENTOS

Painel dinâmico do **checklist de lançamento** imobiliário, para o time
comercial. Substitui o Excel por um site organizado, com **login por
pessoa**, **edição controlada** (sem risco de bagunçar dados por acidente) e
um **modo apresentação** para mostrar a quem não faz parte do time.

Feito na mesma pilha do repositório: **HTML + CSS + JS** (front), **Supabase**
(banco + login + segurança) e **Vercel** (publicação).

---

## 🗂️ Arquivos

```
painel-lancamentos/
├── index.html         ← tela de login / criar conta
├── app.html           ← o painel (dashboard + checklist + admin)
├── apresentacao.html  ← modo apresentação (somente leitura, link público)
├── css/painel.css     ← aparência (cores no topo, bloco :root)
├── js/
│   ├── config.js      ← endereço e chave pública do Supabase
│   ├── app.js         ← lógica do painel e do checklist
│   └── apresentacao.js← lógica do modo apresentação
└── vercel.json
```

## 👤 Perfis de acesso

| Perfil | O que pode fazer |
|--------|------------------|
| **Administrador** | Cria lançamentos, gerencia pessoas (perfis), compartilha a apresentação e edita o checklist |
| **Editor** | Edita o checklist (status, prazo real, observação) |
| **Visualizador** | Só acompanha o painel (não edita nada) |

> 🔒 A permissão é garantida pelo banco (Row Level Security). Um Visualizador
> **não consegue** editar, mesmo mexendo no navegador. O primeiro
> administrador é o e-mail cadastrado como *bootstrap* no banco.

## 🚀 Como funciona

1. Cada pessoa entra em `index.html` com e-mail e senha.
2. No `app.html`, escolhe o **lançamento** no topo e navega entre **Painel**
   (indicadores) e **Checklist** (as 259 ações por fase).
3. Um admin cria um novo lançamento informando o **D0** (data-alvo); as 259
   ações nascem prontas, com **todos os prazos recalculados** a partir do D0.
4. Em **Compartilhar**, o admin ativa um link de **apresentação** só-leitura.

## 🗄️ Banco (Supabase)

Projeto: `painel-comercial-record`. Tabelas: `profiles`, `empreendimentos`,
`playbook_acoes` (259 ações-modelo) e `acoes` (o checklist de cada
lançamento). As datas usam o campo `marco` (meses em relação ao D0).

### Liberar acesso sem confirmação de e-mail (opcional)
Para o time entrar na hora, no painel do Supabase vá em **Authentication →
Providers → Email** e desligue **"Confirm email"**. Com isso, criar conta já
dá acesso imediato.

## 🌐 Publicação (Vercel)

Publique apontando o **Root Directory** para `painel-lancamentos`.
A chave usada no front é a **anon key** (pública, protegida pela RLS).
