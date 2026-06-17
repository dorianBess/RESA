#!/usr/bin/env bash
# Script de déploiement manuel sur Render
# Usage : RENDER_DEPLOY_HOOK_URL=<url> RENDER_APP_URL=<url> ./scripts/deploy.sh
set -euo pipefail

# ─── Variables requises ───────────────────────────────────────────────────────
RENDER_DEPLOY_HOOK_URL="${RENDER_DEPLOY_HOOK_URL:?La variable RENDER_DEPLOY_HOOK_URL est requise}"
RENDER_APP_URL="${RENDER_APP_URL:?La variable RENDER_APP_URL est requise}"

# ─── Configuration du healthcheck ────────────────────────────────────────────
MAX_ATTEMPTS=5
WAIT_SECONDS=15
HEALTH_ENDPOINT="/health"

# ─────────────────────────────────────────────────────────────────────────────
echo "======================================================"
echo "  Déploiement Résa sur Render"
echo "======================================================"
echo ""

# Récupérer les SHAs pour le rollback
CURRENT_SHA=$(git rev-parse HEAD 2>/dev/null || echo "inconnu")
PREVIOUS_SHA=$(git rev-parse HEAD~1 2>/dev/null || echo "inconnu")

echo "Commit actuel    : $CURRENT_SHA"
echo "Commit précédent : $PREVIOUS_SHA"
echo ""

# ─── Étape 1 : Appel du webhook Render ───────────────────────────────────────
echo "1/3 — Déclenchement du webhook Render..."

HTTP_STATUS=$(curl --silent --output /dev/null --write-out "%{http_code}" \
  --max-time 15 \
  -X POST "$RENDER_DEPLOY_HOOK_URL")

if [ "$HTTP_STATUS" -ne 200 ]; then
  echo "ERREUR : Le webhook a retourné HTTP $HTTP_STATUS (attendu 200)"
  exit 1
fi

echo "Webhook déclenché avec succès (HTTP $HTTP_STATUS)"
echo ""

# ─── Étape 2 : Healthcheck en boucle ─────────────────────────────────────────
echo "2/3 — Vérification du healthcheck ($MAX_ATTEMPTS tentatives, ${WAIT_SECONDS}s d'intervalle)..."
echo ""

ATTEMPT=0
DEPLOYED=false
HEALTH_URL="${RENDER_APP_URL}${HEALTH_ENDPOINT}"

while [ "$ATTEMPT" -lt "$MAX_ATTEMPTS" ]; do
  ATTEMPT=$((ATTEMPT + 1))
  echo "Tentative $ATTEMPT/$MAX_ATTEMPTS — $(date '+%H:%M:%S')"

  STATUS=$(curl --silent --output /dev/null --write-out "%{http_code}" \
    --max-time 10 \
    "$HEALTH_URL" 2>/dev/null || echo "000")

  if [ "$STATUS" -eq 200 ]; then
    DEPLOYED=true
    break
  fi

  echo "  → HTTP $STATUS — service pas encore disponible..."

  if [ "$ATTEMPT" -lt "$MAX_ATTEMPTS" ]; then
    echo "  → Nouvelle tentative dans ${WAIT_SECONDS}s..."
    sleep "$WAIT_SECONDS"
  fi
done

echo ""

# ─── Étape 3 : Résultat final ─────────────────────────────────────────────────
if [ "$DEPLOYED" = true ]; then
  echo "======================================================"
  echo "  Déploiement réussi !"
  echo "  Application disponible sur : $RENDER_APP_URL"
  echo "======================================================"
  exit 0
fi

# ─── Échec : instructions de rollback ────────────────────────────────────────
echo "======================================================"
echo "  Déploiement échoué !"
echo "  Le healthcheck n'a pas répondu après $MAX_ATTEMPTS tentatives."
echo "======================================================"
echo ""
echo "3/3 — Instructions de rollback :"
echo ""
echo "  Commit précédent : $PREVIOUS_SHA"
echo ""
echo "  Option 1 — Revert propre (conserve l'historique Git) :"
echo "    git revert $CURRENT_SHA"
echo "    git push origin main"
echo ""
echo "  Option 2 — Reset forcé (DANGER — réécrit l'historique) :"
echo "    git reset --hard $PREVIOUS_SHA"
echo "    git push --force-with-lease origin main"
echo ""
echo "  Consultez les logs Render : https://dashboard.render.com"
exit 1
