const { User, Notification } = require('../models/index');
const { envoyerEmailNotification } = require('./emailService');

const getMessage = (nouveauStatut, dossierInfo, prenom, nom) => {
  const typeDossier = dossierInfo.type; // 'appel' ou 'mobilite'
  let sujet = '';
  let contenuEmail = '';
  let contenuMessage = ''; // In-app notification

  if (typeDossier === 'appel') {
    switch (nouveauStatut) {
      case 'soumis':
        sujet = "✅ Votre dossier a bien été reçu — FDCUIC";
        contenuEmail = `Nous avons bien reçu votre dossier '<strong>${dossierInfo.nom_structure}</strong>' soumis dans le cadre de l'appel à projets '<strong>${dossierInfo.titre_appel}</strong>'.<br><br>Votre dossier est maintenant en attente d'examen par notre équipe.<br>Vous recevrez une notification dès que votre dossier sera pris en charge.<br><br>Cordialement,<br>L'équipe FDCUIC`;
        contenuMessage = `Votre dossier '${dossierInfo.nom_structure}' a bien été reçu.`;
        break;
      case 'en_examen':
        sujet = "🔍 Votre dossier est en cours d'examen — FDCUIC";
        contenuEmail = `Bonne nouvelle ! Votre dossier '<strong>${dossierInfo.nom_structure}</strong>' est actuellement en cours d'examen par notre équipe d'évaluateurs.<br><br>Cette étape peut prendre quelques jours. Nous vous tiendrons informé de la suite du processus.<br><br>Cordialement,<br>L'équipe FDCUIC`;
        contenuMessage = `Votre dossier '${dossierInfo.nom_structure}' est actuellement en cours d'examen.`;
        break;
      case 'accepte':
        sujet = "🎉 Félicitations ! Votre dossier a été accepté — FDCUIC";
        contenuEmail = `Nous avons le plaisir de vous informer que votre dossier '<strong>${dossierInfo.nom_structure}</strong>' a été accepté par le FDCUIC !<br><br>Notre équipe prendra contact avec vous prochainement pour les modalités de financement et les prochaines étapes.<br><br>Félicitations et bienvenue dans la famille FDCUIC !<br><br>Cordialement,<br>L'équipe FDCUIC`;
        contenuMessage = `Félicitations ! Votre dossier '${dossierInfo.nom_structure}' a été accepté.`;
        break;
      case 'rejete':
        sujet = "📋 Résultat de votre candidature — FDCUIC";
        contenuEmail = `Nous avons examiné attentivement votre dossier '<strong>${dossierInfo.nom_structure}</strong>' et nous regrettons de vous informer que votre candidature n'a pas été retenue cette fois-ci.<br><br>Nous vous encourageons à vous améliorer et à postuler lors des prochains appels à projets.<br><br>Cordialement,<br>L'équipe FDCUIC`;
        contenuMessage = `Nous regrettons de vous informer que votre dossier '${dossierInfo.nom_structure}' n'a pas été retenu.`;
        break;
    }
  } else if (typeDossier === 'mobilite') {
    switch (nouveauStatut) {
      case 'soumis':
        sujet = "✅ Votre candidature mobilité a été reçue — FDCUIC";
        contenuEmail = `Nous avons bien reçu votre candidature pour le Programme de Mobilité Internationale.<br><br>Structure : <strong>${dossierInfo.nom_structure}</strong><br>Destination : <strong>${dossierInfo.pays_destination}</strong><br>Période : <strong>${dossierInfo.date_depart}</strong> → <strong>${dossierInfo.date_arrivee}</strong><br><br>Votre dossier est en attente d'examen.<br><br>Cordialement,<br>L'équipe FDCUIC`;
        contenuMessage = `Votre candidature mobilité pour ${dossierInfo.pays_destination} a été reçue.`;
        break;
      case 'en_examen':
        sujet = "🔍 Votre candidature mobilité est en examen — FDCUIC";
        contenuEmail = `Votre candidature mobilité pour <strong>${dossierInfo.pays_destination}</strong> est actuellement examinée par notre équipe.<br><br>Nous vous contacterons très prochainement.<br><br>Cordialement,<br>L'équipe FDCUIC`;
        contenuMessage = `Votre candidature mobilité pour ${dossierInfo.pays_destination} est en cours d'examen.`;
        break;
      case 'accepte':
      case 'approuve':
        sujet = "🎉 Candidature mobilité acceptée — FDCUIC";
        contenuEmail = `Nous sommes ravis de vous informer que votre candidature pour le Programme de Mobilité Internationale a été acceptée !<br><br>Destination : <strong>${dossierInfo.pays_destination}</strong><br>Période : <strong>${dossierInfo.date_depart}</strong> → <strong>${dossierInfo.date_arrivee}</strong><br><br>Notre équipe vous contactera pour les détails pratiques.<br><br>Félicitations !<br><br>Cordialement,<br>L'équipe FDCUIC`;
        contenuMessage = `Félicitations ! Votre candidature mobilité pour ${dossierInfo.pays_destination} a été acceptée.`;
        break;
      case 'rejete':
        sujet = "📋 Résultat candidature mobilité — FDCUIC";
        contenuEmail = `Après examen de votre candidature pour le Programme de Mobilité Internationale, nous regrettons de vous informer qu'elle n'a pas été retenue.<br><br>Nous vous encourageons à repostuler lors des prochaines sessions.<br><br>Cordialement,<br>L'équipe FDCUIC`;
        contenuMessage = `Nous regrettons de vous informer que votre candidature mobilité n'a pas été retenue.`;
        break;
      case 'verse':
        sujet = "💰 Votre subvention a été versée — FDCUIC";
        contenuEmail = `Nous avons le plaisir de vous informer que votre subvention a été versée avec succès.<br><br>Cordialement,<br>L'équipe FDCUIC`;
        contenuMessage = `Votre subvention a été versée avec succès.`;
        break;
    }
  }

  return { sujet, contenuEmail, contenuMessage };
};

const envoyerNotificationStatut = async (userId, dossierInfo, nouveauStatut) => {
  try {
    const user = await User.findByPk(userId);
    if (!user) {
      console.error(`Utilisateur non trouvé avec l'ID ${userId}`);
      return;
    }

    const { sujet, contenuEmail, contenuMessage } = getMessage(nouveauStatut, dossierInfo, user.prenom, user.nom);

    if (!sujet) {
      // Aucun message défini pour ce statut, on ne fait rien
      return;
    }

    // 1. Créer la notification en base
    await Notification.create({
      user_id: userId,
      message: contenuMessage,
      type: 'in_app', // 'statut' n'est pas dans l'enum, 'in_app' est supporté
      lu: false,
    });

    // 2. Envoyer l'email en arrière-plan sans attendre la promesse pour ne pas bloquer (sauf qu'on peut l'attendre si on veut, ou la lancer sans await)
    // Ici on utilise await tel que demandé, mais on a un try-catch pour s'assurer de ne pas bloquer si ça échoue.
    envoyerEmailNotification(user.email, user.prenom, sujet, contenuEmail).catch(err => {
      console.error('Erreur lors de l\'envoi de l\'email de notification:', err.message);
    });

  } catch (error) {
    console.error('Erreur globale notificationService:', error.message);
  }
};

module.exports = {
  envoyerNotificationStatut
};
