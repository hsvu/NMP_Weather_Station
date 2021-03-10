FROM node:12

ENV NODE_ENV=production

WORKDIR /app

COPY package.json .
COPY package-lock.json .

RUN npm install && \
    npm run build

EXPOSE 8000

CMD [ "node", "." ]