const mongoose = require('mongoose');
const Document = require('./Document');

mongoose.connect("mongodb://0.0.0.0:27017/collaborate_doc")
    .then(() => {
        console.log("mongodb connected");
    })
    .catch((err) => {
        console.log(err);
    });

const io = require('socket.io')(3001, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST'],
    },
});

const defaultValue = '';

// ... (previous imports)

io.on('connection', (socket) => {
  socket.on('get-document', async (documentId) => {
      const document = await findOrCreateDocument(documentId);
      socket.join(documentId);
      socket.emit('load-document', document.data);

      socket.on('send-changes', (delta) => {
          socket.broadcast.to(documentId).emit('receive-changes', delta);
      });

      socket.on('save-document', async (data) => {
          try {
              // Update the document in the database with the new data
              await Document.findByIdAndUpdate(documentId, { data: data });
              console.log("Document saved:", data);
          } catch (err) {
              console.error("Error saving document:", err);
          }
      });
  });

  // Handle reloading by sending the document data again
  socket.on('reload-document', async (documentId) => {
      const document = await findOrCreateDocument(documentId);
      socket.join(documentId);
      socket.emit('load-document', document.data);
  });
});

// ... (remaining code)

async function findOrCreateDocument(id) {
    if (id == null) return;

    const document = await Document.findById(id);
    if (document) return document;
    return await Document.create({ _id: id, data: defaultValue });
}
