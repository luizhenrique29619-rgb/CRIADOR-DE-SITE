# Ponte de integração — CV CRM

A parte de **vendas/faturamento** e **clientes/leads** vem do **CV CRM**
(Construtor de Vendas). Como o front é um site estático, ele **não pode** chamar
a API do CV direto do navegador — isso exporia o token e esbarra em CORS.

Por isso usamos uma **ponte** no back-end: uma função pequena que guarda o token
do CV com segurança, busca os dados lá e devolve prontos para o Dashboard.

```
  Navegador (nosso front)                Ponte (back-end)              CV CRM
  ───────────────────────   fetch   ───────────────────────  API   ───────────
  js/cvcrm.js  ───────────────────▶  Edge Function / Vercel ─────▶  api do CV
     (só a URL da ponte)              (guarda CVCRM_TOKEN)           (email+token)
  ◀───────────────  JSON pronto  ◀───────────────────────────────
```

## Como ligar (resumo)

1. **Consiga o acesso à API no CV CRM:** no painel do CV, gere o **token** de
   integração e anote o **e-mail** vinculado e a **URL** da sua conta
   (algo como `https://SUACONTA.cvcrm.com.br`).
   > Confira os nomes dos endpoints na ajuda oficial: <https://ajuda.cvcrm.com.br>
2. **Publique a ponte** (escolha uma):
   - **Supabase Edge Function** → use `supabase-edge-function.ts`
   - **Vercel Function** → use `vercel-function.js`
3. **Guarde os segredos na ponte** (nunca no front):
   `CVCRM_URL`, `CVCRM_EMAIL`, `CVCRM_TOKEN`.
4. **Aponte o front para a ponte:** em `js/cvcrm.js`, preencha as URLs em
   `CVCRM.pontes.vendas` e `CVCRM.pontes.clientes` (e `CVCRM.chave` se a ponte
   exigir uma chave pública para ser chamada).

Pronto: o Dashboard e o CRM passam a mostrar os dados reais do CV CRM. Enquanto
não ligar, tudo continua funcionando com dados de exemplo.

## O que a ponte devolve

O front espera um **array JSON** em cada recurso:

- **`vendas`** → `[{ "mes": "Jan", "valor": 410000 }, ...]` (agregado por mês)
- **`clientes`** → `[{ "nome": "...", "segmento": "...", "contato": "...",
  "telefone": "...", "status": "Ativo", "responsavel": "...", "valor_mes": 0 }, ...]`

Os arquivos de exemplo já trazem o `fetch` ao CV, a montagem desse formato e os
cabeçalhos de CORS. **Ajuste os nomes dos endpoints e dos campos** conforme a
resposta real da sua conta no CV CRM (estão marcados com `// AJUSTE`).

## Segurança

- O `CVCRM_TOKEN` fica **só na ponte** (variável de ambiente), nunca no front.
- No `js/cvcrm.js` vai apenas a **URL da ponte** e, opcionalmente, uma chave
  pública para chamar a ponte (ex.: a anon key do Supabase).
- A ponte deve liberar CORS só para o domínio do seu site (ajuste `ORIGEM`).
