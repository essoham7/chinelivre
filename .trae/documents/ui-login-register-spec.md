# Spécification UI - Pages Login & Register

## Vue d'ensemble

Redesign complet des interfaces de connexion et d'inscription avec un focus sur l'expérience utilisateur moderne, l'accessibilité et la validation en temps réel.

## 1. Design Moderne

### Palette de couleurs

* **Couleur primaire**: `#3B82F6` (bleu moderne)

* **Couleur secondaire**: `#10B981` (vert succès)

* **Couleur d'erreur**: `#EF4444`

* **Texte principal**: `#1F2937`

* **Texte secondaire**: `#6B7280`

* **Fond**: `#FFFFFF` avec `#F9FAFB` pour les sections

### Style visuel

* **Boutons**: Coins arrondis (8px), ombre portée subtile

* **Inputs**: Bordures arrondies (6px), focus avec bordure colorée

* **Typographie**: Inter ou system-ui, tailles 14-16px pour les labels, 16px pour les inputs

* **Animations**: Transitions fluides (200-300ms) sur les interactions

## 2. Layout Responsive

### Desktop (>768px)

* Container centré avec max-width 400px

* Espacement généreux (24-32px entre éléments)

* Formulaire en colonne unique

### Mobile (<768px)

* Full-width avec padding 16px

* Boutons tactiles (min-height 44px)

* Texte adaptatif (14-16px)

## 3. Composants améliorés

### Formulaire de connexion

```
[Logo/Brand]
[Titre: "Connexion"]
[Champ Email - avec icône enveloppe]
[Champ Mot de passe - avec toggle visibility]
[Case à cocher "Se souvenir de moi"]
[Bouton "Se connecter" - états loading]
[Lien "Mot de passe oublié?"]
[Séparateur "ou"]
[Boutons sociaux (Google, GitHub)]
[Texte: "Pas encore de compte? S'inscrire"]
```

### Formulaire d'inscription

```
[Logo/Brand]
[Titre: "Créer un compte"]
[Champ Nom complet]
[Champ Email - validation en temps réel]
[Champ Mot de passe - avec indicateur de force]
[Champ Confirmation mot de passe]
[Case à cocher "Accepter les conditions"]
[Bouton "S'inscrire" - états loading]
[Texte: "Déjà un compte? Se connecter"]
```

## 4. Validation & Feedback

### Validation en temps réel

* **Email**: Format validation avec icône ✓/✗

* **Mot de passe**: Force indicator avec critères visuels

  * Minimum 8 caractères

  * Majuscule + minuscule

  * Chiffre

  * Caractère spécial

* **Confirmation**: Match validation instantanée

### États d'erreur

* Messages d'erreur contextuels sous chaque champ

* Bordures rouges sur les champs invalides

* Icônes d'erreur visibles

* Animation shake sur erreur de soumission

### États de succès

* Bordures vertes sur validation

* Icône de validation ✓

* Message de confirmation clair

## 5. Accessibilité

### Navigation clavier

* Tab order logique

* Focus visible avec outline contrasté

* Submit possible via Enter

### Screen readers

* Labels aria appropriés

* Messages d'erreur annoncés

* Landmarks ARIA pour structure

### Contraste & lisibilité

* Ratio contraste minimum 4.5:1

* Taille de police minimum 14px

* Espacement suffisant pour cibles tactiles

## 6. Interactions avancées

### Toggle mot de passe

* Icône œil/œil barré

* Toggle accessible via clic ou touche Espace

* État persistant pendant la session

### Soumission du formulaire

* État loading avec spinner

* Désactivation des champs pendant soumission

* Message d'erreur global si échec

* Redirection automatique en cas de succès

### Récupération mot de passe

* Modal ou page dédiée

* Champ email pré-rempli si disponible

* Instructions claires envoyées par email

## 7. Performance & UX

### Optimisations

* Debounce sur la validation (300ms)

* Lazy loading des icônes

* Animations CSS uniquement (pas de JS lourd)

* Feedback immédiat sans flash de contenu

### États de chargement

* Skeleton screens pour les états initiaux

* Spinners discrets mais visibles

* Messages de progression clairs

## 8. Tests & Qualité

### Tests nécessaires

* Validation cross-browser (Chrome, Firefox, Safari, Edge)

* Tests responsive sur devices réels

* Tests d'accessibilité (axe-core)

* Tests de performance (Lighthouse > 90)

### Critères d'acceptation

* [ ] Formulaires fonctionnels sans JavaScript

* [ ] Validation côté client et serveur

* [ ] Support complet clavier

* [ ] Messages d'erreur compréhensibles

* [ ] Temps de chargement < 2 secondes

* [ ] Score Lighthouse > 90

