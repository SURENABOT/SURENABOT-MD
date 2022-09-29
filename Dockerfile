FROM node:12
RUN git clone https://github.com/SURENABOT/SURENABOT-MD.git
WORKDIR /SURENABOT-MD
RUN npm install
RUn node .
CMD ["node", "index.js"]
