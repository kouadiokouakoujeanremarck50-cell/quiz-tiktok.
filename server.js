const express = require('express');
const http = require('http');
const { Server } = require('ws');
const { WebcastPushConnection } = require('tiktok-live-connector');

const app = express();
app.use(express.static('public')); // Dossier contenant le fichier index.html

const server = http.createServer(app);
const wss = new Server({ server });

// ⚠️ Remplacez par votre vrai nom d'utilisateur TikTok (sans le @)
const TIKTOK_USERNAME = 'votre_pseudo_tiktok';

let tiktokConnection = new WebcastPushConnection(TIKTOK_USERNAME);

// Connexion au Live TikTok
tiktokConnection.connect().then(state => {
    console.log(`Connecté avec succès au Live TikTok !`);
}).catch(err => {
    console.error('Erreur de connexion au Live :', err);
});

// Transfert des commentaires TikTok vers le WebSocket
tiktokConnection.on('chat', data => {
    const username = data.uniqueId;
    const comment = data.comment;

    wss.clients.forEach(client => {
        if (client.readyState === 1) { // Open
            client.send(JSON.stringify({ user: username, comment: comment }));
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Serveur en ligne sur le port ${PORT}`);
});
