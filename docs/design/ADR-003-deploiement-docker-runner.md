# ADR-003 — Déploiement Docker dans le runner CI

**Statut** : Accepted | **Date** : 17 juin 2026 | **Owner** : Anonyme

## Contexte

Aucun serveur de production n'est disponible. Un déploiement vers un hébergeur externe introduit des secrets supplémentaires et une dépendance externe.

## Options envisagées

| Option                   | Avantages                                  | Inconvénients                               |
| ------------------------ | ------------------------------------------ | ------------------------------------------- |
| Docker dans le runner CI | Autonome, image réelle testée, zéro secret | Pas d'URL publique                          |
| Render.com               | URL publique, déploiement réel             | Dépendance externe, secrets à configurer    |
| Docker Hub seul          | Simple                                     | Pas un déploiement — uniquement du stockage |

## Décision

Le job DEPLOY démarre l'image de production dans le runner GitHub Actions avec les vraies variables d'environnement et valide un healthcheck HTTP sur `GET /health`. Un bloc commenté dans le YAML permet de basculer vers Render.com en décommentant 3 lignes.

## Conséquences

Pipeline entièrement autonome, zéro secret externe requis. Aucune URL publique exposée.
