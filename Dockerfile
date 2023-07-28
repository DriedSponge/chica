FROM node:19
RUN apt-get update
RUN apt-get install -y build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev
COPY . .

RUN yarn install

ENTRYPOINT ["yarn","run","start"]
