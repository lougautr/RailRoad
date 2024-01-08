Auteurs : Lou-Anne Gautherie et Antonin Montagne
# Prérequis:

Avoir une base de données MongoDB
Changer les informations de connection de votre base de données dans la variable MONGODB_URI dans le fichier .env:
- Remplacez "myusername" par votre username
- Remplacez "mypassword" par votre mot de passe
- Remplacez le port "27017" par votre port
Démarrer votre base de données MongoDB

Pour utiliser des images avec les stations de train :
  - il faut mettre son image dans le répertoire img à la racine du projet.
  - préciser le lien de son image lors de la création de la station (img/nom_de_l_image)

# Lancement:

Se placer à la racine du projet
Lancer "npm run start"
