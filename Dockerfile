FROM node:18-alpine

WORKDIR /app

COPY dist ./dist
COPY package*.json ./
COPY .env.production ./

RUN npm install --omit=dev

EXPOSE 1337

CMD ["node", "dist/src/main.js"]
