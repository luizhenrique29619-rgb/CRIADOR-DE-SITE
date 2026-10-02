#!/usr/bin/env bash
# =========================================================
# Cria um site novo copiando a pasta modelo-base/
# Uso:  ./novo-site.sh nome-do-site
# =========================================================
set -euo pipefail

NOME="${1:-}"

if [ -z "$NOME" ]; then
  echo "Uso: ./novo-site.sh nome-do-site"
  echo "Ex.: ./novo-site.sh oferta-black-friday"
  exit 1
fi

# diretório onde este script está (raiz do projeto)
RAIZ="$(cd "$(dirname "$0")" && pwd)"
MODELO="$RAIZ/modelo-base"
DESTINO="$RAIZ/sites/$NOME"

if [ ! -d "$MODELO" ]; then
  echo "Erro: pasta modelo-base/ não encontrada."
  exit 1
fi

if [ -e "$DESTINO" ]; then
  echo "Já existe um site chamado '$NOME' em sites/$NOME"
  exit 1
fi

cp -r "$MODELO" "$DESTINO"

echo "✅ Site criado em sites/$NOME"
echo ""
echo "Próximos passos:"
echo "  1. Edite sites/$NOME/index.html (textos) e css/style.css (cores)."
echo "  2. Para usar o Back End, preencha sites/$NOME/js/supabase.js."
echo "  3. Para ver no navegador:"
echo "       cd sites/$NOME && python3 -m http.server 8000"
