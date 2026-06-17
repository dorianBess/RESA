# ADR-001 — Choix de GitHub Actions comme outil CI/CD

**Statut** : Accepted | **Date** : 17 juin 2026 | **Owner** : Anonyme

## Contexte

La solution Résa est hébergée sur GitHub. Un outil CI/CD est nécessaire pour automatiser les étapes de build, tests, analyse qualité et déploiement de l'API à chaque push.

## Options envisagées

| Option         | Avantages                                                                                | Inconvénients                                             |
| -------------- | ---------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| GitHub Actions | Natif GitHub, YAML versionné avec le code, `GITHUB_TOKEN` automatique, marketplace riche | Couplé à GitHub                                           |
| GitLab CI      | SAST intégré, runners auto-hébergés                                                      | Migration du repo nécessaire                              |
| Jenkins        | Flexibilité totale, plugins nombreux                                                     | Infrastructure à maintenir, courbe d'apprentissage élevée |

## Décision

GitHub Actions est retenu. Le `GITHUB_TOKEN` automatique permet d'accéder à GHCR, CodeQL et Trivy sans aucun secret à configurer manuellement. Le marketplace propose des actions prêtes à l'emploi pour chaque besoin du pipeline sans développement personnalisé.

## Conséquences

Pipeline entièrement versionné dans `.github/workflows/ci.yml`. Aucune infrastructure CI à maintenir. Une migration future vers GitLab CI nécessiterait une réécriture des fichiers YAML.
