FROM node:16-alpine3.11 as base

ENV HOST 0.0.0.0

WORKDIR /usr/app/game
COPY package.json .

FROM base AS dependencies
WORKDIR /usr/app/game
RUN npm set progress=false && \
    npm config set depth 0 && \
    npm install --only=production

FROM base as release
COPY --from=dependencies /usr/app/game/node_modules /usr/app/game/node_modules

CMD ["npm", "run", "dev"]