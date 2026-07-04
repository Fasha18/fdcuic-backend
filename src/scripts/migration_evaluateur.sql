-- Migration : Ajout des colonnes d'évaluation au modèle appels_projets
-- À exécuter via Railway ou votre client PostgreSQL (psql / DBeaver / TablePlus)

-- 1. Modifier le type du champ statut (VARCHAR → permets les nouveaux statuts)
--    Note : si la colonne est déjà un VARCHAR ou TEXT, ignorer cette étape.
ALTER TABLE appels_projets
  ALTER COLUMN statut TYPE VARCHAR(50);

-- 2. Ajouter les nouvelles colonnes d'évaluation
ALTER TABLE appels_projets
  ADD COLUMN IF NOT EXISTS commentaire_conformite TEXT,
  ADD COLUMN IF NOT EXISTS commentaire_evaluation  TEXT,
  ADD COLUMN IF NOT EXISTS evalue_par              INTEGER REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS date_evaluation         TIMESTAMP WITH TIME ZONE;

-- 3. Vérification (optionnel)
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'appels_projets'
  AND column_name IN ('statut', 'commentaire_conformite', 'commentaire_evaluation', 'evalue_par', 'date_evaluation');
