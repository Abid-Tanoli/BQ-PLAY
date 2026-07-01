FROM node:22-alpine AS build

WORKDIR /workspace/User

COPY User/package*.json ./
RUN npm ci

COPY User ./
COPY Shared ../Shared

ARG VITE_API_URL
ARG VITE_SOCKET_URL
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_SOCKET_URL=$VITE_SOCKET_URL

RUN npm run build && test -s dist/index.html

FROM node:22-alpine AS production

RUN npm install --global serve@14.2.4

WORKDIR /app
COPY --from=build /workspace/User/dist ./dist
RUN test -s dist/index.html

ENV PORT=3000
EXPOSE 3000

CMD ["sh", "-c", "serve -s dist -l tcp://0.0.0.0:${PORT:-3000}"]
