const { AppelAProjet } = require('../models');

// Créer un appel (Admin seulement)

const creerAppel = async (req, res) => {
    try {
        const { titre, description, type_projet, date_ouverture, date_cloture } = req.body;
        const appel = await AppelAProjet.create({
            titre,
            description,
            type_projet,
            date_debut: date_ouverture,
            date_fin: date_cloture,
            statut: 'ouvert',
        });
        return res.status(201).json({
      message: 'Appel à projets créé avec succès !',
      appel,
    });
    } catch (error) {
        return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
    }
};

// Lister tous les appels ouverts (Public)

const listerAppels = async (req, res) => {
    try {
        const appels = await AppelAProjet.findAll({
            where: { statut: 'ouvert' },
            order: [['date_debut', 'DESC']],
        });

        return res.status(200).json({appels});
    } catch (error) {
        return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
    }
};

// Lister TOUS les appels (Public — pour page candidat)

const listerTousAppels = async (req, res) => {
    try {
        const appels = await AppelAProjet.findAll({
            order: [['date_debut', 'DESC']],
        });

        return res.status(200).json({ appels });
    } catch (error) {
        return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
    }
};

// Détail d'un appel (Public)

const detailAppel = async (req, res) => {
    try {
        const appel = await AppelAProjet.findByPk(req.params.id);
        if (!appel) {
            return res.status(404).json({ message: 'Appel à projets introuvable.' });
        }
        return res.status(200).json({appel});
    } catch (error) {
        return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
    }
};

// Clôturer un appel (Admin seulement)

const cloturerAppel = async (req, res) => {
    try {
        const appel = await AppelAProjet.findByPk(req.params.id);
        if (!appel) {
            return res.status(404).json({ message: 'Appel à projets introuvable.' });
        }
        await appel.update({ statut: 'fermé' });
        
        return res.status(200).json({message: 'Appel à projets clôturé avec succès !', appel});
    } catch (error) {
        return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
    }
};

module.exports = { creerAppel, listerAppels, listerTousAppels, detailAppel, cloturerAppel };