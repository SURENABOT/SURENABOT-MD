FROM node:12
RUN git clone https://github.com/SURENABOT/SURENABOT-MD.git
WORKDIR /SURENABOT-MD
RUN yarn install
RUN node .
CMD ["node", "index.js"]
