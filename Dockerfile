FROM node:12
RUN git clone https://github.com/SURENABOT/SURENABOT-MD.git
RUN npm i
CMD ["node", "index.js"]
