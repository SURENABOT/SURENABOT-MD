FROM        node:lts-buster

LABEL       author="SURENABOT" maintainer="surenawabot@gmail.com"

RUN         apt-get update && \
  apt-get install -y \
  ffmpeg \
  imagemagick \
  webp && \
  apt-get upgrade -y && \
  rm -rf /var/lib/apt/lists/*


USER        container
ENV         USER=container HOME=/home/container
WORKDIR     /home/container

COPY        ./entrypoint.sh /entrypoint.sh

RUN         npm install -g nodemon

COPY        package.json .

RUN	     npm install

COPY        ./entrypoint.sh /entrypoint.sh

CMD         [ "/bin/bash", "/entrypoint.sh" ]

COPY        . .

CMD         nodemon -x "node index.js --server || touch main.js --server" -e  "js, html, sh, py"
