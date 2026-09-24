FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

ENV NODE_ENV=production
ENV PORT=4000

EXPOSE 4000

# Create the tables and demo data (idempotent), then start the API.
CMD ["sh", "-c", "node src/init-db.js && node src/server.js"]
