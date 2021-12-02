FROM node:alpine

WORKDIR /app

COPY ./user/package.json ./user/
COPY ./server-provisioning/package.json ./server/
COPY ./analytics/package.json ./analytics/

RUN npm install --prefix user
RUN npm install --prefix server
RUN npm install --prefix analytics


COPY ./user ./user
COPY ./server-provisioning ./server
COPY ./analytics ./analytics

RUN apk update
RUN apk add nginx

RUN apk --no-cache add gettext

COPY ./default.conf /etc/nginx/conf.d/default.conf.template

CMD envsubst '\$PORT' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'pid /tmp/nginx.pid; daemon off;' & npm run start --prefix user & npm run start --prefix server & npm run start --prefix analytics & wait -n
