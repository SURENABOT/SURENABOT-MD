FROM node:12
RUN git clone https://github.com/SURENABOT/SURENABOT-MD.git
RUN cd SURENABOT-MD
RUN npm i
COPY package.json .
CMD ["node", "index.js"]
