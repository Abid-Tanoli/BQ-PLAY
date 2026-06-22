FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

FROM base AS dev
RUN npm install --include=dev
COPY . .
EXPOSE 5000
CMD ["npm", "run", "dev"]

FROM base AS production
COPY . .
EXPOSE 5000
CMD ["node", "src/index.js"]
