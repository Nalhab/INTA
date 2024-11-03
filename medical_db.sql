-- Créer la base de données si elle n'existe pas déjà
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_database WHERE datname = 'medical_db') THEN
        CREATE DATABASE medical_db;
    END IF;
END $$;

-- Basculer vers la base de données 'medical_db'
\connect medical_db;

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
    IF EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'infirmier') THEN
        DROP ROLE infirmier;
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
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'infirmier') THEN
        CREATE ROLE infirmier;
    END IF;
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'secretaire') THEN
        CREATE ROLE secretaire;
    END IF;
END $$;

-- 6. Création des utilisateurs
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_user WHERE usename = 'admin_sys') THEN
        CREATE USER admin_sys WITH PASSWORD 'admin123' IN ROLE admin_medical;
    END IF;
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_user WHERE usename = 'dr_dupont') THEN
        CREATE USER dr_dupont WITH PASSWORD 'med123' IN ROLE medecin;
    END IF;
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_user WHERE usename = 'inf_martin') THEN
        CREATE USER inf_martin WITH PASSWORD 'inf123' IN ROLE infirmier;
    END IF;
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_user WHERE usename = 'sec_dubois') THEN
        CREATE USER sec_dubois WITH PASSWORD 'sec123' IN ROLE secretaire;
    END IF;
END $$;

-- 7. Attribution des droits aux rôles (Pas besoin de condition IF NOT EXISTS)
GRANT SELECT, INSERT, UPDATE ON Patient TO medecin;
GRANT SELECT, INSERT, UPDATE ON DossierPatient TO medecin;
GRANT SELECT, INSERT ON CompteRendu TO medecin;
GRANT SELECT ON DonneesDM TO medecin;
GRANT SELECT ON DispositifMedical TO medecin;
GRANT SELECT ON Alerte TO medecin;

GRANT SELECT ON Patient TO infirmier;
GRANT SELECT ON DossierPatient TO infirmier;
GRANT SELECT, INSERT ON DonneesDM TO infirmier;
GRANT SELECT ON DispositifMedical TO infirmier;
GRANT SELECT, INSERT ON Alerte TO infirmier;

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
CREATE POLICY IF NOT EXISTS medecin_patient_access ON Patient
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

CREATE POLICY IF NOT EXISTS medecin_donnees_access ON DonneesDM
    FOR SELECT
    TO medecin
    USING (
        dispositif_id IN (
            SELECT dm.id
            FROM DispositifMedical dm
            JOIN Patient p ON p.id = dm.patient_id
            JOIN DossierPatient dp ON dp.patient_id = p.id
            JOIN CompteRendu cr ON cr.dossier_id = dp.id
            JOIN ProfessionnelSante ps ON ps.id = cr.professionnel_id
            WHERE ps.id = CAST(current_user AS integer)
        )
    );

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
CREATE VIEW IF NOT EXISTS vue_patient_base AS
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

