# ─────────────────────────────────────────────────────────────────────────────
# Stage 1 — builder
# Installe toutes les dépendances (y compris dev) et compile le TypeScript.
# Cette image est également utilisée dans le CI pour exécuter les tests.
# ─────────────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copier les manifestes en premier pour tirer parti du cache Docker
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ─────────────────────────────────────────────────────────────────────────────
# Stage 2 — production
# Image légère : uniquement le dist/ compilé + dépendances de production.
# Aucune source TypeScript ni outil de dev embarqués.
# ─────────────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

# Dépendances de production uniquement
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copier uniquement le build compilé depuis le stage builder
COPY --from=builder /app/dist ./dist

EXPOSE 3000

# Healthcheck natif Docker (complémentaire au healthcheck Render)
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["node", "dist/main"]
