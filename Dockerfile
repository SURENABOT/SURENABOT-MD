FROM ubuntu:18.04
RUN apt-get update && \
  apt-get install -y \
  ffmpeg \
  imagemagick \
  webp && \
  apt-get install npm -y\
  apt-get upgrade -y && \
  rm -rf /var/lib/apt/lists/*
COPY package.json .
RUN npm install
CMD ["node", "index.js"]
