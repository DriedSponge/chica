FROM node:18-bookworm
RUN apt-get update
RUN apt-get install -y build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev libvips libvips-tools
COPY . .

RUN yarn install
RUN yarn add sharp --ignore-engines

ENTRYPOINT ["yarn","run","start"]
