import { Server } from "socket.io"

let connections = {}
let messages = {}
let timeOnline = {}
let meetingCreators = {}

export const connectToSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
            allowedHeaders: ["*"],
            credentials: true
        }
    });

    io.on("connection", (socket) => {
        console.log("SOMETHING CONNECTED: " + socket.id);

        socket.on("join-call", (path) => {

            if (connections[path] === undefined) {
                connections[path] = []
            }
            connections[path].push(socket.id)

            timeOnline[socket.id] = new Date();

            for (let a = 0; a < connections[path].length; a++) {
                io.to(connections[path][a]).emit("user-joined", socket.id, connections[path])
            }

            if (messages[path] !== undefined) {
                for (let a = 0; a < messages[path].length; ++a) {
                    io.to(socket.id).emit("chat-message", messages[path][a]['data'],
                        messages[path][a]['sender'], messages[path][a]['socket-id-sender'])
                }
            }
        });

        // Add the end-meeting handler
        // Make sure this handler is properly implemented
        socket.on("end-meeting", (path) => {
            console.log(`Meeting ended by host: ${path}`);
            
            if (connections[path]) {
                // Notify all participants that the meeting is ending
                for (let a = 0; a < connections[path].length; a++) {
                    io.to(connections[path][a]).emit("meeting-ended", path);
                }
            }
        });

        socket.on("signal", (toId, message) => {
            io.to(toId).emit("signal", socket.id, message);
        })

        socket.on("chat-message", (data, sender) => {

            const [matchingRoom, found] = Object.entries(connections)
                .reduce(([room, isFound], [roomKey, roomValue]) => {


                    if (!isFound && roomValue.includes(socket.id)) {
                        return [roomKey, true];
                    }

                    return [room, isFound];

                }, ['', false]);

            if (found === true) {
                if (messages[matchingRoom] === undefined) {
                    messages[matchingRoom] = []
                }

                messages[matchingRoom].push({ 'sender': sender, "data": data, "socket-id-sender": socket.id })
                console.log("message", matchingRoom, ":", sender, data)

                connections[matchingRoom].forEach((elem) => {
                    io.to(elem).emit("chat-message", data, sender, socket.id)
                })
            }

        })

        // Add the end-meeting handler inside the connection event
        socket.on("end-meeting", (path) => {
            // Check if the socket is the creator
            if (meetingCreators[path] === socket.id) {
                if (connections[path]) {
                    // Notify all participants that the meeting is ending
                    for (let a = 0; a < connections[path].length; a++) {
                        io.to(connections[path][a]).emit("meeting-ended");
                    }
                    
                    // Clear connections for this meeting
                    connections[path] = [];
                    delete meetingCreators[path];
                }
            }
        });

        socket.on("disconnect", () => {
            // Remove creator reference if the creator disconnects
            for (let path in meetingCreators) {
                if (meetingCreators[path] === socket.id) {
                    delete meetingCreators[path];
                }
            }

            var diffTime = Math.abs(timeOnline[socket.id] - new Date())

            var key

            for (const [k, v] of JSON.parse(JSON.stringify(Object.entries(connections)))) {

                for (let a = 0; a < v.length; ++a) {
                    if (v[a] === socket.id) {
                        key = k

                        for (let a = 0; a < connections[key].length; ++a) {
                            io.to(connections[key][a]).emit('user-left', socket.id)
                        }

                        var index = connections[key].indexOf(socket.id)

                        connections[key].splice(index, 1)


                        if (connections[key].length === 0) {
                            delete connections[key]
                        }
                    }
                }
            }
        })
    })


    return io;
}
