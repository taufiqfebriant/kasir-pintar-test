FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install

COPY . .

RUN chmod +x /app/scripts/wait-for-it.sh

EXPOSE 3000

CMD ["/bin/sh", "-c", "/app/scripts/wait-for-it.sh mysql-db:${MYSQL_PORT} -- /app/scripts/wait-for-it.sh elasticsearch:${ELASTICSEARCH_PORT} -- npm run dev"]
