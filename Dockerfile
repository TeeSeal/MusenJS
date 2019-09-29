FROM node:lts-alpine

WORKDIR /usr/src/app
RUN apk add --update
RUN apk add python make g++ ffmpeg

COPY package.json yarn.lock ./
RUN yarn install --production

COPY . .
CMD ["yarn", "start"]
