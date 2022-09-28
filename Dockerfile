FROM node:12
RUN git clone https://github.com/SURENABOT/SURENABOT-MD.git
COPY package.json .
CMD ["node", "index.js"]
