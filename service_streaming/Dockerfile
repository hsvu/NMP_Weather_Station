FROM node:12

ENV NODE_ENV=production

WORKDIR /app

COPY ./common/build ./common/build
COPY ["service_streaming/package.json", "service_streaming/package-lock.json*", "./service_streaming/"]
COPY ./service_streaming/build ./service_streaming/build

WORKDIR /app/service_streaming

RUN npm ci --only=production

EXPOSE 8000

CMD [ "node", "." ]