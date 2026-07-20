FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 4000
CMD ["node", "server.js"]  # or "npm", "start" depending on your package.json
