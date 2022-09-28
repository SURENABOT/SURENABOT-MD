FROM node:12
RUN apt-get update && apt-get upgrade \
    apt-get install -y curl gnupg; \
    curl -sL https://deb.nodesource.com/setup_8.x | bash - \
    apt-get install -y nodejs \
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
