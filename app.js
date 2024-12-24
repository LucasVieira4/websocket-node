import express from 'express';
import mongoose from 'mongoose';
import { WebSocketServer, WebSocket } from 'ws';
import Post from './models/post.js';


const app = express();
const port = process.env.PORT || 3000;
const uri = "mongodb+srv://lukinhavieira456:ZSItx5eoyluFmT2x@websocket.9ajzt.mongodb.net/node-js-database?retryWrites=true&w=majority&appName=websocket";

let webSocketServer;

// Connect to database
mongoose.connect(uri)
  .then((result) =>  {
    const server = app.listen(port, () => {
        setupWebSocketServer(server); // Start WebSocket server
    });
  })
  .catch((err) => console.log(err))


// Configure express
app.use(express.urlencoded({ extended: true }));
app.use(express.static('static'));
app.set('view engine', 'ejs');


// Routes
app.get('/', (req, res) => { // display the index
    res.render('index');
});

app.get('/posts', (req, res) => { // returns a json object with all the posts data
    Post.find().sort({ createdAt: -1 })
    .then((result) => {
        res.json(result);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch posts' });
    });
});

app.post('/posts', async (req, res) => { // handle the submition and add the post to the database
    try {
        const post = new Post(req.body);
        const result = await post.save();
        if (webSocketServer) 
            await broadcastMessage(webSocketServer, result, { isPost: true });
        res.status(201).redirect('/');
    } catch (error){
        res.status(500).redirect('/');
    }
});


function setupWebSocketServer(server) {

    webSocketServer = new WebSocketServer({ noServer : true });

    server.on('upgrade', (req, socket, head) => {
        // Error caught when http server is handling
        socket.on('error', () => onSocketError('Pre'));

        webSocketServer.handleUpgrade(req, socket, head, (ws) => {
            webSocketServer.emit('connection', ws, req);
        });

    });

    webSocketServer.on('connection', (ws, req) => {
        // Error caught when wb server is handling
        ws.on('error', () => onSocketError('Post'));

        ws.on('message', async (msg, isBinary) => {
            await broadcastMessage(webSocketServer, msg, { isBinary })
        });

    });
}



async function broadcastMessage(wss, content, options = { isPost: false }) {
    try {
        // Get all connected clients that are ready to receive messages
        const activeClients = [...wss.clients].filter(
            client => client.readyState === WebSocket.OPEN
        );

        // If post, send this regular message, else, send message
        const messageToSend = options.isPost 
        ? JSON.stringify({ message: 'New post added!', post: content })
        : content;

        activeClients.forEach(client => {
            client.send(messageToSend, { binary: options.isBinary });
        });

    } catch (error) {
        throw error;
    }
}


// Debug function
function onSocketError (location) {
    console.log(`Error ${location} on Socket connection`);
}
