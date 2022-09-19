FROM        node:lts-buster

LABEL       author="SURENABOT" maintainer="surenawabot@gmail.com"

RUN         apt update && apt upgrade
            apt install git -y
            apt install nodejs -y
            apt install ffmpeg -y
            apt install imagemagick -y
            git clone https://github.com/surenabot/surenabot-md
            cd wabot-aq
            npm install
            npm update


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
