FROM node:16-alpine3.11 as base

WORKDIR /usr/app
RUN chown node /usr/app
COPY package.json .

FROM base AS dependencies
WORKDIR /usr/app
RUN npm set progress=false && \
    npm config set depth 0 && \
    npm install --only=production

FROM base as release
COPY --from=dependencies /usr/app/node_modules /usr/app/node_modules

CMD ["npm", "run", "dev"]