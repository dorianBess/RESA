# Résumé du backoffice front

## Objectif

Le backoffice a été ajouté dans `apps/backoffice` comme une application React autonome
pour le parcours hébergeur du MVP.

Le périmètre couvert est :

- connexion
- vue dashboard
- création et liste des logements
- blocage manuel d'une période pour un logement
- consultation des réservations
- récupération du code d'intégration du widget

## Choix techniques

- React avec Vite
- Material UI
- structure simple : `pages`, `components`, `services`, `theme`
- données mockées pour rester utilisable sans back-end branché

## Ce qui a été implémenté

- `src/App.tsx`
  - gère la session locale
  - charge les données mockées
  - pilote la navigation interne
- `src/pages/LoginPage.tsx`
  - écran de connexion
- `src/pages/DashboardPage.tsx`
  - indicateurs rapides
- `src/pages/LogementsPage.tsx`
  - formulaire de création et liste des logements
  - formulaire de blocage de période
  - liste des périodes bloquées
- `src/pages/ReservationsPage.tsx`
  - tableau des réservations
- `src/pages/WidgetPage.tsx`
  - affiche la configuration du widget
  - fournit le code d'embed

## Composants

- `AppShell`
  - barre haute et navigation
- `SectionCard`
  - conteneur de section réutilisable
- `LogementForm`
  - saisie minimale d'un logement
- `BlockedPeriodForm`
  - sélection d'un logement, d'une période et d'un motif
- `BlockedPeriodsTable`
  - affichage des périodes bloquées
- `ReservationTable`
  - tableau des réservations
- `WidgetCodeBox`
  - affichage et copie du code widget

## Limites actuelles

- pas de vrai routage
- pas de JWT réel
- pas de branchement API NestJS
- pas d'édition détaillée des logements
- pas de gestion des blocages de dates ni des tarifs saisonniers

## Suite logique

1. brancher l'auth réelle
2. relier logements, réservations et widget aux endpoints NestJS
3. ajouter les écrans de détail et les actions de gestion
