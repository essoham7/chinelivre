-- Table des colis
CREATE TABLE packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tracking_number VARCHAR(50) UNIQUE NOT NULL,
    client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    weight DECIMAL(10,2),
    volume DECIMAL(10,4),
    status VARCHAR(30) DEFAULT 'received_china' CHECK (status IN ('received_china', 'in_transit', 'arrived_africa', 'available_warehouse', 'picked_up')),
    received_china_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    estimated_arrival TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des photos de colis
CREATE TABLE package_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    package_id UUID REFERENCES packages(id) ON DELETE CASCADE,
    storage_path TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des messages (chat)
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    package_id UUID REFERENCES packages(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    sender_role VARCHAR(10) CHECK (sender_role IN ('admin', 'client')),
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    package_id UUID REFERENCES packages(id) ON DELETE CASCADE,
    type VARCHAR(30) CHECK (type IN ('package_created', 'status_updated', 'package_arrived', 'new_message')),
    title VARCHAR(100) NOT NULL,
    content TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour performances
CREATE INDEX idx_packages_client_id ON packages(client_id);
CREATE INDEX idx_packages_status ON packages(status);
CREATE INDEX idx_packages_tracking ON packages(tracking_number);
CREATE INDEX idx_package_photos_package_id ON package_photos(package_id);
CREATE INDEX idx_messages_package_id ON messages(package_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;

-- RLS Policies
-- Packages : les clients voient uniquement leurs colis, admin voit tout
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Clients voient leurs colis" ON packages FOR SELECT 
    USING (auth.uid() = client_id);
CREATE POLICY "Admin voit tous les colis" ON packages FOR SELECT 
    USING (EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin'));
CREATE POLICY "Admin peut créer des colis" ON packages FOR INSERT 
    WITH CHECK (EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin'));
CREATE POLICY "Admin peut modifier les colis" ON packages FOR UPDATE 
    USING (EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin'));

-- Messages : participants du colis peuvent voir les messages
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Voir messages du colis" ON messages FOR SELECT 
    USING (EXISTS (SELECT 1 FROM packages WHERE id = package_id AND (client_id = auth.uid() OR EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin'))));
CREATE POLICY "Envoyer messages" ON messages FOR INSERT 
    WITH CHECK (sender_id = auth.uid());

-- Notifications : utilisateurs voient leurs notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Voir ses notifications" ON notifications FOR SELECT 
    USING (auth.uid() = user_id);
CREATE POLICY "Marquer comme lu" ON notifications FOR UPDATE 
    USING (auth.uid() = user_id);

-- Package photos : même politique que packages
ALTER TABLE package_photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Voir photos du colis" ON package_photos FOR SELECT 
    USING (EXISTS (SELECT 1 FROM packages WHERE id = package_id AND (client_id = auth.uid() OR EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin'))));
CREATE POLICY "Admin peut gérer photos" ON package_photos FOR ALL 
    USING (EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin'));