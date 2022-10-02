FROM node:12
WORKDIR /SURENABOT-MD
COPY package*.json ./
RUN npm install
COPY . .
CMD ["node", "index.js"]
