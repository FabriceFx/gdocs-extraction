# 📑 G-Docs Extraction & Synchronisation dans Sheets


[🇫🇷 Version Française](#-version-française) | [🇬🇧 English Version](#-english-version)

![License MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![Platform](https://img.shields.io/badge/Platform-Google%20Apps%20Script-green)
![Runtime](https://img.shields.io/badge/Google%20Apps%20Script-V8-green)
![Author](https://img.shields.io/badge/Auteur-Fabrice%20Faucheux-orange)

## 🇫🇷 Version Française


## 📖 Description

Ce projet est une solution automatisée pour Google Workspace permettant d'extraire le contenu textuel et les métadonnées de documents Google Docs directement vers un tableau Google Sheets.

Le script analyse une colonne d'URLs, récupère le titre et le corps du document, applique un horodatage précis et notifie l'administrateur par email en cas d'erreurs (URL invalide, problème de droits d'accès).

## ✨ Fonctionnalités clés

* **Extraction intelligente** : Récupère automatiquement le Titre et le Contenu texte des Google Docs.
* **Formatage automatique** : Applique le format `dd/MM/yyyy HH:mm` à la colonne date lors de la mise à jour.
* **Performance optimisée** : Utilise les opérations par lots (`getValues` / `setValues`) pour minimiser les appels API et le temps d'exécution.
* **Gestion d'erreurs robuste** : 
    * Inscription des erreurs directement dans la cellule (visibilité immédiate).
    * Système d'alerte par Email récapitulant les lignes problématiques en HTML.
* **Interface Utilisateur** : Menu personnalisé `Mon Utilitaire` intégré au Sheet.
* **Automatisation** : Fonction d'installation de déclencheurs (Triggers) horaires intégrée.

## 🛠️ Installation & configuration

### 1. Prérequis
* Un compte Google Workspace.
* Un Google Sheet avec une structure de colonnes spécifique (URL en entrée).

### 2. Mise en place du script
1.  Ouvrez votre Google Sheet.
2.  Allez dans **Extensions** > **Apps Script**.
3.  Copiez le contenu du fichier `Code.js` dans l'éditeur.
4.  Sauvegardez (`Ctrl + S`).

### 3. Configuration (`CONFIG`)
Modifiez l'objet `CONFIG` en haut du script pour qu'il corresponde à votre fichier :

```javascript
const CONFIG = {
  NOM_FEUILLE: 'Feuille 1',        // Nom exact de l'onglet
  COL_URL: 1,                      // Colonne A = 1, B = 2...
  LIGNE_DEPART: 2,                 // Évite d'écraser les en-têtes
  EMAIL_ALERTE: 'votre.email@gmail.com' // Email qui recevra les rapports d'erreur
};


---
## 🇬🇧 English Version

> English translation coming soon.

---
<p align="center"><a href="https://faucheux.bzh" target="_blank" style="color: inherit; text-decoration: none;">&lt;&gt; par Fabrice Faucheux</a></p>