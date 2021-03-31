FROM node:alpine

WORKDIR /app

COPY ./package.json ./
RUN npm install --only=prod
RUN npm install ts-node-dev
COPY . .

EXPOSE 6000

CMD [ "npm", "run", "start" ]