# README

# Boutik Hub

This directory contains assets that will be served by the file server.

## Deployment

This project is deployed on Render.com. To set up the deployment:

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Use the following settings:
   - Name: boutik-file-server
   - Root Directory: file-server
   - Environment: Node
   - Build Command: `npm ci`
   - Start Command: `npm start -- --port $PORT --root ../hub`

4. Get your Render API key and service ID
5. Add the following secrets to your GitHub repository:
   - RENDER_API_KEY: Your Render API key
   - RENDER_SERVICE_ID: Your Render service ID

The server will automatically deploy when you push to the main branch.
