# waizeur

#  Application Météo – Villes Françaises

Cette application permet d'afficher la météo actuelle d'une ville française. Elle propose également une **fonction d'autocomplétion** pour rechercher facilement une commune.

## Fonctionnalités

-  Recherche d'une ville française avec autocomplétion  
-  Affichage de la météo actuelle (température, humidité, conditions)  
-  Design responsive et simple d'utilisation

##  APIs utilisées

### 1. API Météo – OpenWeatherMap

- **Documentation :** [https://openweathermap.org/current](https://openweathermap.org/current)  
- Fournit les **données météo actuelles** d’une ville : température, météo, pression, humidité, etc.  
- Nécessite une **clé API** (gratuite via inscription).  
- Exemple d’appel :  

-  Paramètres utilisés :
- `q` : nom de la ville
- `appid` : votre clé API
- `units=metric` : température en °C
- `lang=fr` : données en français

### 2. API des villes françaises – geo.api.gouv.fr

- **Documentation :** [https://geo.api.gouv.fr/decoupage-administratif/communes](https://geo.api.gouv.fr/decoupage-administratif/communes)  
- Fournit la liste des **communes françaises** : nom, code postal, code INSEE, population, coordonnées, etc.  
- Utilisée pour l’**autocomplétion** lors de la recherche d’une ville.  
- Exemple d’appel :  

-  Paramètres utilisés :
- `nom` : nom partiel de la commune
- `boost=population` : trie les résultats par population décroissante
- `limit=5` : limite le nombre de résultats retournés