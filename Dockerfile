FROM node:lts-alpine

WORKDIR /usr/src/app
RUN apk add --update
RUN apk add git python make g++ ffmpeg

COPY package.json package-lock.json ./
RUN npm install --production

COPY . .
CMD ["npm", "start"]
