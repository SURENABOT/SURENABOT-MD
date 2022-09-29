FROM node:12
RUN git clone https://github.com/SURENABOT/SURENABOT-MD.git
WORKDIR /SURENABOT-MD
RUN npm i --save pkg.json
RUN npm install
RUN node .
CMD ["node", "index.js"]
