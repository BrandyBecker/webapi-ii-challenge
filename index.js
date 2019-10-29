const express = require('express');
const cors = require('cors');
const postsRouter = require('./posts/posts-router.js');

const server = express();

server.use(express.json());
server.use(cors())

server.get('/', (req, res) => {
    res.send(`
    <h2>Daily project API running</h2>
    `);
});

server.use('/api/posts', postsRouter)


const port = 3000;
server.listen(port, () => console.log(`\n=== ⭐  API on Port ${port} ⭐  ===\n`));
