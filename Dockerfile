FROM node:12
RUN pkg install ffmpeg
RUN pkg install nodejs-lts
RUN npm i
COPY package.json .
CMD ["node", "index.js"]
