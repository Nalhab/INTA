-- 1. Création des tables de base
CREATE TABLE IF NOT EXISTS CabinetMedical (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    adresse VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS ProfessionnelSante (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    numeroRPPS VARCHAR(50) UNIQUE NOT NULL,
    cabinet_id INTEGER REFERENCES CabinetMedical(id)
);

CREATE TABLE IF NOT EXISTS Patient (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    dateNaissance DATE NOT NULL,
    numeroSecu VARCHAR(15) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS DossierPatient (
    id SERIAL PRIMARY KEY,
    dateCreation DATE NOT NULL DEFAULT CURRENT_DATE,
    patient_id INTEGER REFERENCES Patient(id)
);

CREATE TABLE IF NOT EXISTS DispositifMedical (
    id SERIAL PRIMARY KEY,
    type VARCHAR(100) NOT NULL,
    numeroSerie VARCHAR(50) UNIQUE NOT NULL,
    patient_id INTEGER REFERENCES Patient(id)
);

CREATE TABLE IF NOT EXISTS DonneesDM (
    id SERIAL PRIMARY KEY,
    dateMesure TIMESTAMP NOT NULL,
    tensionArterielle VARCHAR(20),
    rythmeCardiaque INTEGER,
    oxymetrie INTEGER,
    dispositif_id INTEGER REFERENCES DispositifMedical(id)
);

CREATE TABLE IF NOT EXISTS Alerte (
    id SERIAL PRIMARY KEY,
    dateCreation TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    type VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    niveauUrgence INTEGER NOT NULL CHECK (niveauUrgence BETWEEN 1 AND 5),
    patient_id INTEGER REFERENCES Patient(id)
);

CREATE TABLE IF NOT EXISTS CompteRendu (
    id SERIAL PRIMARY KEY,
    dateCreation TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    contenu TEXT NOT NULL,
    professionnel_id INTEGER REFERENCES ProfessionnelSante(id),
    dossier_id INTEGER REFERENCES DossierPatient(id)
);

-- 2. Création de la table de journalisation
CREATE TABLE IF NOT EXISTS journal_acces (
    id SERIAL PRIMARY KEY,
    utilisateur VARCHAR(50),
    action VARCHAR(50),
    table_name VARCHAR(50),
    date_acces TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Création de la fonction de journalisation
CREATE OR REPLACE FUNCTION log_acces()
RETURNS trigger AS $$
BEGIN
    INSERT INTO journal_acces (utilisateur, action, table_name)
    VALUES (current_user, TG_OP, TG_TABLE_NAME);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Suppression des rôles s'ils existent
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'admin_medical') THEN
        DROP ROLE admin_medical;
    END IF;
    IF EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'medecin') THEN
        DROP ROLE medecin;
    END IF;
    IF EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'secretaire') THEN
        DROP ROLE secretaire;
    END IF;
END $$;

-- 5. Création des rôles si non existants
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'admin_medical') THEN
        CREATE ROLE admin_medical;
    END IF;
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'medecin') THEN
        CREATE ROLE medecin;
    END IF;
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'secretaire') THEN
        CREATE ROLE secretaire;
    END IF;
END $$;

-- 6. Création d'un utilisateur test
INSERT INTO CabinetMedical (id, nom, adresse) VALUES (1, 'Cabinet Médical Central', '10 rue de la Santé Paris 75001');
INSERT INTO ProfessionnelSante (nom, prenom, type, numeroRPPS, cabinet_id) VALUES ('Dupont', 'Jean', 'Médecin Généraliste', 'RPPS123456', 1);
INSERT INTO ProfessionnelSante (nom, prenom, type, numeroRPPS, cabinet_id) VALUES ('Moreau', 'Alice', 'Cardiologue', 'RPPS654321', 1);
INSERT INTO Patient (nom, prenom, dateNaissance, numeroSecu) VALUES ('Martin', 'Paul', '1980-05-15', '123456789012345');
INSERT INTO Patient (nom, prenom, dateNaissance, numeroSecu) VALUES ('patient', 'patient', '1990-08-25', '987654322098765');
INSERT INTO Patient (nom, prenom, dateNaissance, numeroSecu) VALUES ('Durand', 'Sophie', '1990-08-25', '987654321098765');
INSERT INTO DossierPatient (patient_id) VALUES (1);
INSERT INTO DossierPatient (patient_id) VALUES (2);
INSERT INTO DispositifMedical (type, numeroSerie, patient_id) VALUES ('Tensiomètre', 'TM123456', 1);
INSERT INTO DispositifMedical (type, numeroSerie, patient_id) VALUES ('Oxymètre', 'OX654321', 2);
INSERT INTO DonneesDM (dateMesure, tensionArterielle, rythmeCardiaque, oxymetrie, dispositif_id) VALUES ('2023-01-01 10:00:00', '120/80', 70, 98, 1);
INSERT INTO DonneesDM (dateMesure, tensionArterielle, rythmeCardiaque, oxymetrie, dispositif_id) VALUES ('2023-01-02 11:00:00', '110/70', 65, 97, 2);
INSERT INTO Alerte (type, description, niveauUrgence, patient_id) VALUES ('Tension élevée', 'Tension artérielle élevée détectée', 3, 1);
INSERT INTO Alerte (type, description, niveauUrgence, patient_id) VALUES ('Oxymétrie basse', 'Niveau d oxygène dans le sang bas détecté', 4, 2);
INSERT INTO CompteRendu (contenu, professionnel_id, dossier_id) VALUES ('Patient en bonne santé générale.', 1, 1);
INSERT INTO CompteRendu (contenu, professionnel_id, dossier_id) VALUES ('Patient nécessite un suivi régulier.', 1, 2);

-- 7. Attribution des droits aux rôles (Pas besoin de condition IF NOT EXISTS)
GRANT SELECT, INSERT, UPDATE ON Patient TO medecin;
GRANT SELECT, INSERT, UPDATE ON DossierPatient TO medecin;
GRANT SELECT, INSERT ON CompteRendu TO medecin;
GRANT SELECT ON DonneesDM TO medecin;
GRANT SELECT ON DispositifMedical TO medecin;
GRANT SELECT ON Alerte TO medecin;

GRANT SELECT, INSERT ON Patient TO secretaire;
GRANT SELECT ON DossierPatient TO secretaire;
GRANT SELECT ON CabinetMedical TO secretaire;

-- 8. Activation de Row Level Security (Pas de IF NOT EXISTS pour RLS)
ALTER TABLE Patient ENABLE ROW LEVEL SECURITY;
ALTER TABLE DossierPatient ENABLE ROW LEVEL SECURITY;
ALTER TABLE CompteRendu ENABLE ROW LEVEL SECURITY;
ALTER TABLE DonneesDM ENABLE ROW LEVEL SECURITY;
ALTER TABLE Alerte ENABLE ROW LEVEL SECURITY;

-- 9. Création des politiques de sécurité
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'medecin_patient_access') THEN
        CREATE POLICY medecin_patient_access ON Patient
        FOR ALL
        TO medecin
        USING (
            id IN (
                SELECT p.id
                FROM Patient p
                JOIN DossierPatient dp ON dp.patient_id = p.id
                JOIN CompteRendu cr ON cr.dossier_id = dp.id
                JOIN ProfessionnelSante ps ON ps.id = cr.professionnel_id
                WHERE ps.id = CAST(current_user AS integer)
            )
        );
    END IF;
END $$;

-- 10. Création des triggers de journalisation
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'log_patient_acces') THEN
        CREATE TRIGGER log_patient_acces
            AFTER INSERT OR UPDATE OR DELETE ON Patient
            FOR EACH ROW
            EXECUTE FUNCTION log_acces();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'log_donnees_acces') THEN
        CREATE TRIGGER log_donnees_acces
            AFTER INSERT OR UPDATE OR DELETE ON DonneesDM
            FOR EACH ROW
            EXECUTE FUNCTION log_acces();
    END IF;
END $$;

-- 11. Création des vues sécurisées
DROP VIEW IF EXISTS vue_patient_base;
CREATE VIEW vue_patient_base AS
    SELECT id, nom, prenom, dateNaissance
    FROM Patient;

GRANT SELECT ON vue_patient_base TO secretaire;

-- 12. Insertion de données de test, seulement si le CabinetMedical est vide
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM CabinetMedical) THEN
        INSERT INTO CabinetMedical (nom, adresse) VALUES ('Cabinet Principal', '123 rue de la Santé, Paris');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM ProfessionnelSante WHERE numeroRPPS = '12345678') THEN
        INSERT INTO ProfessionnelSante (nom, prenom, type, numeroRPPS, cabinet_id) VALUES ('Dupont', 'Jean', 'Médecin', '12345678', 1);
    END IF;
END $$;
