FROM node:16-alpine3.11 as base

ENV HOST 0.0.0.0

WORKDIR /usr/app/frontend
RUN chown node /usr/app/frontend
# COPY package.json .

# FROM base AS dependencies
# WORKDIR /usr/app/frontend
# RUN npm install

# FROM base as release
# COPY --from=dependencies /usr/app/frontend/node_modules /usr/app/frontend/node_modules

CMD ["npm", "run", "dockerdev"]