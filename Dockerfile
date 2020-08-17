FROM node:alpine

WORKDIR /usr/src/app
RUN apk add --update
RUN apk add git

COPY package.json package-lock.json ./
RUN npm install --production

COPY . .
CMD ["npm", "start"]
