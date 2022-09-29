FROM node:12
RUN git clone https://github.com/SURENABOT/SURENABOT-MD.git
RUN node .
CMD ["node", "index.js"]
