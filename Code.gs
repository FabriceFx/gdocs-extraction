/**
 * --- CONFIGURATION ---
 * Adaptez ces constantes à la structure de votre fichier.
 */
const CONFIG = {
  NOM_FEUILLE: 'Feuille 1',        // Nom exact de l'onglet
  COL_URL: 1,                      // Colonne contenant les URLs (1 = A)
  LIGNE_DEPART: 2,                 // Première ligne de données (après les en-têtes)
  EMAIL_ALERTE: 'votre.email@gmail.com' // ✉️ Votre email pour les alertes
};

/**
 * Fonction principale (Automatisée).
 * Scanne les URLs, extrait Titre + Contenu, ajoute la Date et formate la colonne.
 * Utilise des opérations par lots pour optimiser les performances.
 * * @author Fabrice Faucheux
 */
function traitementAutomatiqueDesDocs() {
  const classeur = SpreadsheetApp.getActiveSpreadsheet();
  const feuille = classeur.getSheetByName(CONFIG.NOM_FEUILLE);

  if (!feuille) {
    console.error(`Erreur critique : L'onglet "${CONFIG.NOM_FEUILLE}" est introuvable.`);
    return;
  }

  // 1. Définition de la plage de lecture
  const derniereLigne = feuille.getLastRow();
  if (derniereLigne < CONFIG.LIGNE_DEPART) return; 

  const nombreLignes = derniereLigne - CONFIG.LIGNE_DEPART + 1;
  
  // Lecture : URL + Titre + Contenu + Date
  const plageDonnees = feuille.getRange(CONFIG.LIGNE_DEPART, CONFIG.COL_URL, nombreLignes, 4);
  const valeurs = plageDonnees.getValues();
  
  const motifId = /docs\.google\.com\/document\/d\/([a-zA-Z0-9_-]+)/;
  
  let modificationsEffectuees = false;
  const rapportErreurs = []; 

  // 2. Traitement des données
  const nouvellesValeurs = valeurs.map((ligne, index) => {
    const url = ligne[0];
    const titreActuel = ligne[1];
    const contenuActuel = ligne[2];
    const dateActuelle = ligne[3];
    const numeroLigneReelle = index + CONFIG.LIGNE_DEPART;

    // Si tout est déjà rempli, on conserve l'existant (y compris l'ancienne date)
    if (!url || (titreActuel !== "" && contenuActuel !== "" && dateActuelle !== "")) {
      return [titreActuel, contenuActuel, dateActuelle];
    }

    const dateDuJour = new Date();

    try {
      if (typeof url !== 'string') throw new Error("Format de cellule invalide");

      const correspondance = url.match(motifId);
      
      if (correspondance && correspondance[1]) {
        const idDocument = correspondance[1];
        
        const doc = DocumentApp.openById(idDocument);
        const titreDoc = doc.getName();
        let texteBrut = doc.getBody().getText();

        // Troncature pour éviter de dépasser la limite de cellule (50k caractères)
        if (texteBrut.length > 49000) {
          texteBrut = texteBrut.substring(0, 49000) + "... [Tronqué]";
        }

        modificationsEffectuees = true;
        return [titreDoc, texteBrut, dateDuJour];

      } else {
        throw new Error("URL non reconnue");
      }

    } catch (e) {
      console.error(`Erreur Ligne ${numeroLigneReelle}: ${e.message}`);
      rapportErreurs.push({ ligne: numeroLigneReelle, url: url, erreur: e.message });
      modificationsEffectuees = true;
      return ["⚠️ ERREUR", `Détails : ${e.message}`, dateDuJour];
    }
  });

  // 3. Écriture et Formatage
  if (modificationsEffectuees) {
    // Définition de la plage cible (3 colonnes de large : Titre, Contenu, Date)
    const plageCible = feuille.getRange(CONFIG.LIGNE_DEPART, CONFIG.COL_URL + 1, nombreLignes, 3);
    
    // Écriture des valeurs
    plageCible.setValues(nouvellesValeurs);

    // --- FORMATAGE AUTOMATIQUE ---
    // On cible uniquement la 3ème colonne de notre plage cible (la colonne Date)
    const plageDateSeule = plageCible.offset(0, 2, nombreLignes, 1);
    
    // Application du format "Jour/Mois/Année Heure:Minute"
    plageDateSeule.setNumberFormat("dd/MM/yyyy HH:mm");

    console.log("Données mises à jour et formatage appliqué.");
  }

  // 4. Alertes Email
  if (rapportErreurs.length > 0) {
    envoyerEmailAlerte(rapportErreurs, classeur.getName(), classeur.getUrl());
  }
}

/**
 * Envoie un email récapitulatif en cas d'erreurs.
 * @param {Array} erreurs - Liste des objets d'erreur
 * @param {string} nomFichier - Nom du Spreadsheet
 * @param {string} urlFichier - URL du Spreadsheet
 */
function envoyerEmailAlerte(erreurs, nomFichier, urlFichier) {
  const sujet = `⚠️ Alerte Script : ${erreurs.length} Erreur(s) sur "${nomFichier}"`;
  let corpsHtml = `
    <h3 style="color: #d32f2f;">Rapport d'exécution</h3>
    <p>Fichier : <a href="${urlFichier}">${nomFichier}</a></p>
    <table style="border-collapse: collapse; width: 100%; border: 1px solid #ddd;">
      <tr style="background-color: #f2f2f2;">
        <th style="padding: 8px;">Ligne</th><th style="padding: 8px;">Erreur</th><th style="padding: 8px;">URL</th>
      </tr>`;

  erreurs.forEach(err => {
    corpsHtml += `<tr>
      <td style="text-align: center; border: 1px solid #ddd;">${err.ligne}</td>
      <td style="color: #d32f2f; border: 1px solid #ddd;">${err.erreur}</td>
      <td style="border: 1px solid #ddd;">${err.url}</td>
    </tr>`;
  });
  corpsHtml += `</table>`;

  MailApp.sendEmail({ to: CONFIG.EMAIL_ALERTE, subject: sujet, htmlBody: corpsHtml });
}

/**
 * --- CONFIGURATION DU DÉCLENCHEUR ---
 * Installe un trigger horaire pour l'automatisation.
 */
function configurerAutomatisation() {
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(t => ScriptApp.deleteTrigger(t));

  ScriptApp.newTrigger('traitementAutomatiqueDesDocs')
    .timeBased()
    .everyHours(1)
    .create();

  SpreadsheetApp.getUi().alert("✅ Automatisation activée avec formatage de date !");
}

/** * Menu contextuel pour l'interface utilisateur 
 */
function onOpen() {
  SpreadsheetApp.getUi().createMenu('Mon Utilitaire')
    .addItem('⚡ Lancer manuellement', 'traitementAutomatiqueDesDocs')
    .addSeparator()
    .addItem('⚙️ Activer surveillance', 'configurerAutomatisation')
    .addToUi();
}
