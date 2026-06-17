# ADR-002 — Dockerfile multi-stage

**Statut** : Accepted | **Date** : 17 juin 2026 | **Owner** : Anonyme

## Contexte

Le pipeline a besoin d'une image pour exécuter les tests (avec toutes les devDependencies) et d'une image pour la production (la plus légère et sécurisée possible).

## Options envisagées

| Option                 | Taille image prod | Sécurité                             | Complexité |
| ---------------------- | ----------------- | ------------------------------------ | ---------- |
| Image unique avec tout | ~500MB            | Faible (devDeps et sources exposées) | Simple     |
| Dockerfile multi-stage | ~200MB            | Bonne (devDeps et sources absentes)  | Modérée    |

## Décision

Dockerfile multi-stage : stage `builder` (installe tout, compile TypeScript) + stage `production` (Alpine propre, uniquement `dist/` + prod deps). L'image de production inclut un HEALTHCHECK natif Docker sur `GET /health`.

## Conséquences

Surface d'attaque réduite, image deux fois plus légère. En contrepartie, le job BUILD prend plus de temps car deux images sont construites.
