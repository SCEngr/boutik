const FileServer = require('../lib/server');
const http = require('http');

async function testServer() {
    // Start server
    const server = new FileServer({
        port: 9989,
        rootDir: process.cwd()
    });
    
    await server.start();
    console.log('Server started for testing');

    // Test file structure endpoint
    const structureResponse = await makeRequest('http://localhost:9989/');
    console.log('File structure:', JSON.stringify(structureResponse, null, 2));

    // Stop server
    server.stop();
    console.log('Server stopped');
}

function makeRequest(url) {
    return new Promise((resolve, reject) => {
        http.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(e);
                }
            });
        }).on('error', reject);
    });
}

testServer().catch(console.error);
