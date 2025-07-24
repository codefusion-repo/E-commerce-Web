FROM node:18.17.0

ENV NODE_ENV=production

WORKDIR /client

COPY . /client/

RUN npm install

RUN npm run build

EXPOSE 3000

CMD ["npx", "next", "start", "-H", "0.0.0.0", "-p", "3000"]



