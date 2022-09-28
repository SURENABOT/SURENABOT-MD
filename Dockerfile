FROM node:12
RUN pkg update && upgrade -y
RUN apt update && upgrade -y
RUN pkg install ffmpeg
RUN pkg install nodejs-lts
RUN npm i
COPY package.json .
CMD ["node", "index.js"]
