# Résumé du widget front

## Objectif

Le widget a été ajouté dans `apps/widget` comme une petite application React autonome,
prévue pour le parcours voyageur du MVP :

- consulter un logement
- choisir des dates
- vérifier la disponibilité
- voir le montant total
- envoyer une demande de réservation

Le paiement n'est pas intégré, conformément à la demande actuelle.

## Choix techniques

- React avec Vite pour garder une base légère
- Material UI pour l'interface
- thème dynamique construit à partir de la configuration du widget
- structure volontairement simple : `pages`, `components`, `services`, `theme`

## Ce qui a été implémenté

- `src/App.tsx`
  - charge le token du widget depuis l'URL
  - récupère la configuration du logement
  - applique un thème Material UI adapté
- `src/pages/BookingPage.tsx`
  - gère le tunnel de réservation en 3 étapes
  - calcul du nombre de nuits
  - calcul du total
  - vérification de disponibilité
  - envoi d'une demande de réservation
- `src/pages/ConfirmationPage.tsx`
  - affiche la référence et le statut retournés après création
- `src/components/WidgetCard.tsx`
  - habillage principal du widget
- `src/components/PriceSummary.tsx`
  - récapitulatif tarifaire
- `src/components/GuestForm.tsx`
  - formulaire voyageur
- `src/services/widget.ts`
  - récupération de la configuration du widget
- `src/services/reservations.ts`
  - vérification de disponibilité
  - création de réservation

## Comportement actuel

Le widget fonctionne avec deux modes :

- mode API si `VITE_API_BASE_URL` est défini
- mode fallback local si l'API n'est pas encore disponible

Le fallback local permet de maquetter et tester le parcours sans attendre la fin du back-end.

## Données attendues

Le widget manipule les informations suivantes :

- logement : nom, ville, capacité, description
- réservation : dates, nombre de personnes, coordonnées voyageur, notes
- tarification : tarif par nuit, total

## Limites actuelles

- pas de paiement
- pas de vrai calendrier avancé
- pas de photos
- pas de branchement confirmé sur les endpoints NestJS réels, car ils ne sont pas encore complètement exposés dans le repo

## Suite logique

La suite la plus propre est :

1. exposer les endpoints back nécessaires côté NestJS
2. brancher `fetchWidgetConfig`, `checkAvailability` et `createReservation` sur les routes finales
3. intégrer ensuite le code d'embed côté back-office
