FROM --platform=$TARGETOS/$TARGETARCH node:17-bullseye-slim
RUN git clone https://github.com/SURENABOT/SURENABOT-MD.git /home/container/
WORKDIR /home/container/
RUN npm install -g nodemon
CMD ["node", "index.js"]
