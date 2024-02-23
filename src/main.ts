// Importation des modules nécessaires à l'application
import { NestFactory } from '@nestjs/core'; // Crée l'instance de l'application NestJS
import { AppModule } from './app.module'; // Module racine de l'application
import * as cors from 'cors'; // Middleware pour activer la politique CORS
import { ValidationPipe } from '@nestjs/common'; // Pipe pour valider les données des requêtes entrantes
import * as express from 'express'; // Framework Express pour la gestion des requêtes HTTP
import { join } from 'path'; // Fonction pour créer des chemins de fichiers

// Fonction principale pour démarrer l'application NestJS
async function bootstrap() {
  const app = await NestFactory.create(AppModule); // Crée une nouvelle application NestJS en utilisant AppModule comme module de base

  // Configuration et activation de CORS pour permettre les requêtes cross-origin
  app.enableCors({
    origin: 'http://localhost:5173', // Spécifie les origines autorisées à envoyer des requêtes
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'], // Méthodes HTTP autorisées
    allowedHeaders: 'Content-Type, Accept, Authorization',  // En-têtes autorisées dans les requêtes cross-origin
    credentials: true,
  });

  // Configuration globale de ValidationPipe pour valider automatiquement les données des requêtes
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Exclut les champs qui ne sont pas présents dans le DTO
    transform: true, // Transforme l'objet de la requête en instance de classe DTO
  }));

  // Configuration du serveur pour servir les fichiers statiques depuis un dossier spécifique
  app.use('/uploads', express.static(join(__dirname, '../../uploads')));

  // Écoute les requêtes entrantes sur le port 3000
  await app.listen(3000);
}

// Exécution de la fonction bootstrap pour lancer l'application
bootstrap();
