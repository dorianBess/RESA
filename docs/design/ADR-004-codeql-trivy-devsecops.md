# ADR-004 — CodeQL + Trivy pour la couverture DevSecOps

**Statut** : Accepted | **Date** : 17 juin 2026 | **Owner** : Anonyme

## Contexte

La couverture DevSecOps doit couvrir le code source (SAST), l'image Docker (container scanning) et les secrets. Aucun outil unique ne couvre les trois périmètres sans compte externe.

## Options envisagées

| Option          | SAST | Container scan | Secret scan | Compte externe |
| --------------- | ---- | -------------- | ----------- | -------------- |
| SonarQube Cloud | Oui  | Non            | Non         | Oui            |
| CodeQL seul     | Oui  | Non            | Non         | Non            |
| Trivy seul      | Non  | Oui            | Oui         | Non            |
| CodeQL + Trivy  | Oui  | Oui            | Oui         | Non            |

## Décision

CodeQL (SAST TypeScript, queries `security-and-quality`) + Trivy (container scanning + secret detection, v0.71.1) dans le même job QUALITY. Les deux publient en SARIF dans Security > Code scanning alerts. Dependabot complète le dispositif pour la surveillance continue.

## Conséquences

Couverture DevSecOps complète sans compte externe. `continue-on-error: true` activé sur Trivy et npm audit pour les CVE non corrigeables immédiatement.
