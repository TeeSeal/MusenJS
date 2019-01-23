FROM node:alpine

WORKDIR /usr/src/app

COPY package.json yarn.lock ./
RUN apk add --update \
  && apk add python make g++ ffmpeg \
  && yarn install --production

COPY . .
CMD ["yarn", "start"]
