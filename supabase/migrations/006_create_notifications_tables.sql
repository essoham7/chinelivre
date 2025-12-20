-- Table des notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('info', 'promotion', 'urgent', 'update')),
  priority VARCHAR(20) NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
  status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'archived')),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_notifications_type ON notifications(type);

-- Table des utilisateurs publics (extension du modèle auth.users)
CREATE TABLE public_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  subscription_type VARCHAR(50) DEFAULT 'free' CHECK (subscription_type IN ('free', 'premium', 'enterprise')),
  total_spent DECIMAL(10,2) DEFAULT 0,
  location VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_public_users_subscription ON public_users(subscription_type);
CREATE INDEX idx_public_users_created_at ON public_users(created_at);

-- Table des notifications utilisateur (liaison many-to-many)
CREATE TABLE user_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id UUID NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public_users(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'deleted')),
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(notification_id, user_id)
);

CREATE INDEX idx_user_notifications_user ON user_notifications(user_id);
CREATE INDEX idx_user_notifications_status ON user_notifications(status);
CREATE INDEX idx_user_notifications_created ON user_notifications(created_at DESC);

-- Politiques de sécurité RLS (Row Level Security)

-- Politiques pour la table notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Les admins peuvent tout faire
CREATE POLICY "Admins peuvent tout faire sur notifications" ON notifications
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Les utilisateurs authentifiés peuvent voir les notifications envoyées
CREATE POLICY "Users peuvent voir les notifications envoyées" ON notifications
  FOR SELECT USING (status = 'sent');

-- Politiques pour user_notifications
ALTER TABLE user_notifications ENABLE ROW LEVEL SECURITY;

-- Les utilisateurs peuvent voir leurs notifications
CREATE POLICY "Users peuvent voir leurs notifications" ON user_notifications
  FOR SELECT USING (auth.uid() = user_id);

-- Les utilisateurs peuvent mettre à jour le statut de leurs notifications
CREATE POLICY "Users peuvent marquer comme lu" ON user_notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Politiques pour public_users
ALTER TABLE public_users ENABLE ROW LEVEL SECURITY;

-- Les utilisateurs peuvent voir leur propre profil
CREATE POLICY "Users peuvent voir leur profil" ON public_users
  FOR SELECT USING (auth.uid() = id);

-- Les admins peuvent voir tous les utilisateurs
CREATE POLICY "Admins peuvent voir tous les utilisateurs" ON public_users
  FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

-- Grant permissions
GRANT SELECT ON notifications TO anon;
GRANT ALL ON notifications TO authenticated;
GRANT SELECT ON user_notifications TO authenticated;
GRANT INSERT ON user_notifications TO authenticated;
GRANT SELECT ON public_users TO authenticated;
GRANT INSERT ON public_users TO authenticated;
GRANT UPDATE ON public_users TO authenticated;