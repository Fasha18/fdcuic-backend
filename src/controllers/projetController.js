const {Projet, AppelAProjet, User} = require('../models/index');

// Soumettre un projet

const soumettreProjet = async (req, res) => {
    try {
        const { titre, description, appel_id} = req.body;

        // Vérifier si l'appel existe et est ouvert
        const appel = await AppelAProjet.findByPk(appel_id);
        if (!appel) {
            return res.status(404).json({ message: 'Appel à projets introuvable.' });
        }

        // Vérifier si l'appel est ouvert
        if (appel.statut !== 'ouvert') {
            return res.status(400).json({ message: ' Cet appel à projets est clôturé.' });
        }

        // Vérifier qu'un PDF a été uploadé
        if (!req.file) {
            return res.status(400).json({ message: 'Le dossier PDF est obligatoire.' });
        }

        const projet = await Projet.create({
            titre,
            description,
            appel_id,
            user_id: req.user.id,
            fichier_pdf: req.file.filename,
            statut: 'en_attente',
        });

        return res.status(201).json({message: 'Projet soumis avec succès !', projet});


    } catch (error) {
        return res.status(500).json({message: 'Erreur serveur.', error: error.message});
    }
};



// Mes projets (Candidat connecté)

const mesProjets = async (req, res) => {
    try {
        const projets = await Projet.findAll({
            where: { user_id: req.user.id },
            include: [{ model: AppelAProjet, as: 'appel' }],
            order: [['date_soumission', 'DESC']],
        });
        return res.status(200).json({projets});
    } catch (error) {
        return res.status(500).json({message: 'Erreur serveur.', error: error.message});
    }
};

// Détails d'un projet

const detailProjet = async (req, res) => {
    try {
        const projet = await Projet.findByPk(req.params.id, {
            include: [
                { model: AppelAProjet, as: 'appel' },
                { model: User, as: 'candidat', attributes: ['id', 'nom', 'prenom', 'email'] },
            ],
        });

        if (!projet) {
            return res.status(404).json({ message: 'Projet introuvable.' });
        }
        return res.status(200).json({projet});
    } catch (error) {
        return res.status(500).json({message: 'Erreur serveur.', error: error.message});
    }
};

// Lister tous les projets (Admin)

const listerTousProjets = async (req, res) => {
    try {
        const projets = await Projet.findAll({
            include: [
                { model: AppelAProjet, as: 'appel' },
                { model: User, as: 'candidat', attributes: ['id', 'nom', 'prenom', 'email'] },
            ],
            order: [['date_soumission', 'DESC']],
        });
        return res.status(200).json({projets});
    } catch (error) {
        return res.status(500).json({message: 'Erreur serveur.', error: error.message});
    }
};

//changer le statut d'un projet(Admin)
 const changerStatut = async (req, res) => {
    try {
        const {status} = req.body;
        const projet = await Projet.findByPk(req.params.id);

        if (!projet) {
            return res.status(404).json({message: 'Projet introuvable.'});
        }

        const statutValides = ["en_attente", "approuve", "rejete"];
        if (!statutValides.includes(status)) {
            return res.status(400).json({message: 'Statut invalide.'});
        }

        await projet.update({ statut: status });

        return res.status(200).json({
            message: `Statut mis à jour avec succès : ${status}`,
            projet,
        });
         
    } catch (error) {
        return res.status(500).json({message: 'Erreur serveur.', error: error.message});
    }
 };

module.exports = {
  soumettreProjet,
  mesProjets,
  detailProjet,
  listerTousProjets,
  changerStatut,
};

