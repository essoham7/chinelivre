# ChineLivre - Application de Suivi de Colis Chine→Afrique

Application web complète pour la digitalisation du processus de livraison de colis de Chine vers l'Afrique. Les transitaires peuvent enregistrer les colis, notifier les clients automatiquement et permettre le suivi en temps réel jusqu'à la récupération.

## 🚀 Fonctionnalités

### Interface Administrateur (Transitaire)

- **Tableau de bord** : Vue d'ensemble des colis avec statistiques
- **Gestion des colis** : Création, modification, association aux clients
- **Chat temps réel** : Communication avec les clients par colis
- **Notifications automatiques** : Mise à jour des statuts
- **Upload de photos** : Documentation visuelle des colis

### Interface Client

- **Tableau de bord personnel** : Liste de ses colis avec statuts visuels
- **Détails complets** : Informations, photos, historique des statuts
- **Chat temps réel** : Communication directe avec le transitaire
- **Notifications push** : Alertes en temps réel sur les mises à jour

## 🛠️ Stack Technique

- **Frontend** : React 18 + TypeScript + TailwindCSS
- **Backend** : Supabase (Backend-as-a-Service)
- **Base de données** : PostgreSQL
- **Authentification** : Supabase Auth
- **Stockage** : Supabase Storage (photos)
- **Temps réel** : Supabase Realtime (chat & notifications)
- **État global** : Zustand
- **Build tool** : Vite

## 📦 Installation

### Prérequis

- Node.js 18+
- npm ou yarn
- Compte Supabase

### 1. Cloner le projet

```bash
git clone <repository-url>
cd ChineLivre
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configuration Supabase

#### Créer un projet Supabase

1. Rendez-vous sur [supabase.com](https://supabase.com)
2. Créez un nouveau projet
3. Copiez les informations de connexion (URL et clé anonyme)

#### Configuration de la base de données

1. Dans le dashboard Supabase, allez dans l'onglet **SQL Editor**
2. Exécutez le script SQL du fichier `supabase/migrations/001_create_tables.sql`
3. Activez les RLS (Row Level Security) sur toutes les tables

#### Configuration du stockage

1. Dans le dashboard Supabase, allez dans **Storage**
2. Créez un nouveau bucket nommé `package-photos`
3. Configurez les politiques d'accès pour permettre l'upload

### 4. Variables d'environnement

Créez un fichier `.env` à la racine du projet :

```env
VITE_SUPABASE_URL=votre-url-supabase
VITE_SUPABASE_ANON_KEY=votre-clé-anonyme
```

### 5. Lancer l'application

```bash
npm run dev
```

L'application sera accessible sur `http://localhost:5173`

## 🔧 Configuration Supabase

### Tables de base de données

#### packages

- `id` (UUID) - Identifiant unique
- `tracking_number` (VARCHAR) - Numéro de suivi
- `client_id` (UUID) - Référence à l'utilisateur client
- `content` (TEXT) - Description du contenu
- `weight` (DECIMAL) - Poids en kg
- `volume` (DECIMAL) - Volume en m³
- `status` (VARCHAR) - Statut du colis
- `received_china_at` (TIMESTAMP) - Date de réception en Chine
- `estimated_arrival` (TIMESTAMP) - Date estimée d'arrivée

#### package_photos

- `id` (UUID) - Identifiant unique
- `package_id` (UUID) - Référence au colis
- `storage_path` (TEXT) - Chemin dans le stockage
- `is_primary` (BOOLEAN) - Photo principale

#### messages

- `id` (UUID) - Identifiant unique
- `package_id` (UUID) - Référence au colis
- `sender_id` (UUID) - ID de l'expéditeur
- `sender_role` (VARCHAR) - Rôle de l'expéditeur (admin/client)
- `content` (TEXT) - Contenu du message
- `is_read` (BOOLEAN) - Statut de lecture

#### notifications

- `id` (UUID) - Identifiant unique
- `user_id` (UUID) - ID du destinataire
- `package_id` (UUID) - Référence au colis
- `type` (VARCHAR) - Type de notification
- `title` (VARCHAR) - Titre de la notification
- `content` (TEXT) - Contenu détaillé
- `is_read` (BOOLEAN) - Statut de lecture

### Politiques RLS (Row Level Security)

Les politiques de sécurité sont configurées pour :

- **Packages** : Les clients ne voient que leurs colis, les admins voient tout
- **Messages** : Seuls les participants au colis peuvent voir les messages
- **Notifications** : Les utilisateurs ne voient que leurs notifications
- **Photos** : Même accès que les packages

## 📱 Utilisation

### Pour les transitaires (Admin)

1. **Connexion** : Utilisez vos identifiants admin
2. **Créer un colis** : Cliquez sur "Nouveau colis" et remplissez le formulaire
3. **Associer un client** : Sélectionnez le client dans la liste déroulante
4. **Uploader des photos** : Ajoutez des photos du colis (optionnel)
5. **Mettre à jour le statut** : Modifiez le statut selon l'avancement
6. **Chatter** : Cliquez sur l'icône de chat pour communiquer avec le client

### Pour les clients

1. **Inscription** : Créez un compte client
2. **Connexion** : Accédez à votre tableau de bord
3. **Suivre vos colis** : Consultez la liste de vos colis
4. **Voir les détails** : Cliquez sur un colis pour plus d'informations
5. **Chat** : Utilisez le bouton "Contacter" pour discuter avec le transitaire
6. **Notifications** : Recevez des alertes en temps réel

## 🌐 Routes de l'application

| Route               | Description                  | Accès  |
| ------------------- | ---------------------------- | ------ |
| `/`                 | Page d'accueil (redirection) | Public |
| `/login`            | Connexion                    | Public |
| `/register`         | Inscription client           | Public |
| `/admin/dashboard`  | Dashboard administrateur     | Admin  |
| `/client/dashboard` | Dashboard client             | Client |
| `/unauthorized`     | Page d'erreur d'autorisation | Public |

## 🔒 Sécurité

- **Authentification** : JWT tokens avec Supabase Auth
- **Autorisation** : RLS policies sur toutes les tables
- **Chiffrement** : HTTPS/TLS pour toutes les communications
- **Validation** : Validation côté client et serveur

## 📊 Statuts des colis

- `received_china` - Reçu en Chine
- `in_transit` - En transit vers l'Afrique
- `arrived_africa` - Arrivé en Afrique
- `available_warehouse` - Disponible à l'entrepôt
- `picked_up` - Récupéré par le client

## 🚀 Déploiement

### Build de production

```bash
npm run build
```

### Déploiement sur Vercel

1. Connectez votre repository GitHub à Vercel
2. Configurez les variables d'environnement
3. Déployez automatiquement

### Déploiement sur Netlify

1. Connectez votre repository GitHub à Netlify
2. Configurez les variables d'environnement
3. Déployez

## 📝 Scripts npm

- `npm run dev` - Démarre le serveur de développement
- `npm run build` - Build pour la production
- `npm run preview` - Prévisualise le build de production
- `npm run check` - Vérifie TypeScript

## 🤝 Contribution

1. Fork le projet
2. Créez votre branche (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📞 Support

Pour toute question ou problème :

- Créez une issue sur GitHub
- Contactez l'équipe de développement

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🎯 Roadmap

### Phase 2 - Paiement

- Intégration Stripe/PayPal
- Gestion des devis et factures
- Paiement en ligne sécurisé

### Phase 3 - Tracking GPS

- Suivi GPS en temps réel
- Carte interactive
- Historique des positions

### Phase 4 - QR Code

- Génération de QR codes
- Scan mobile
- Application mobile dédiée

---

**ChineLivre** - Digitaliser la logistique Chine-Afrique, un colis à la fois.
