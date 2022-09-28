FROM node:12
RUN apt-get update && apt-get upgrade -y && \
    apt-get install -y nodejs \
    npm
RUN apt-get update && \
    apt-get install -y \
    ffmpeg \
    imagemagick \
    webp && \
    apt-get upgrade -y && \
    rm -rf /var/lib/apt/lists/*
COPY package.json .
RUN rm package-lock.json
RUN npm i
CMD ["node", "index.js"]
