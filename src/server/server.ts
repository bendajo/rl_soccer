const path = require('path');
const express = require('express');
const http = require('http');
const io = require('socket.io');

const defaultPort = 3000;
class App {
    server: any;
    io: any;
    port: number;
    clients: any = {};
    constructor(port: number) {
        this.port = port
        const app = express()
        app.use(express.static(path.join(__dirname, '../')))

        this.server = new http.Server(app)

        this.io = new io.Server(this.server)

        this.io.on('connection', (socket: any) => {
            console.log(socket.constructor.name)
            this.clients[socket.id] = {}
            console.log(this.clients)
            console.log('a user connected : ' + socket.id)
            socket.emit('id', socket.id)

            socket.on('disconnect', () => {
                console.log('socket disconnected : ' + socket.id)
                if (this.clients && this.clients[socket.id]) {
                    console.log('deleting ' + socket.id)
                    delete this.clients[socket.id]
                    this.io.emit('removeClient', socket.id)
                }
            })

            socket.on('update', (message: any) => {
                console.log(message);
                // console.log(socket.id);
                // if (this.clients[socket.id]) {
                //
                // }
                socket.emit("asdf", message);
            })
        })

        setInterval(() => {
            this.io.emit('clients', this.clients)
        }, 50)
    }

    Start() {
        this.server.listen(this.port, () => {
            console.log(`Server listening on port ${this.port}.`)
        })
    }
}

new App(defaultPort).Start()