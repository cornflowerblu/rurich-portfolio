# base node image
FROM node:16-bullseye-slim as base

# set for base and all layer that inherit from it
ENV NODE_ENV production

# Install openssl for Prisma
RUN apt-get update && apt-get install -y openssl sqlite3

# Install all node_modules, including dev dependencies
FROM base as deps

WORKDIR /rurich

ADD package.json package-lock.json ./
RUN npm install --production=false

# Setup production node_modules
FROM base as production-deps

WORKDIR /rurich

COPY --from=deps /rurich/node_modules /rurich/node_modules
ADD package.json package-lock.json ./
RUN npm prune --production

# Build the app
FROM base as build

WORKDIR /rurich

COPY --from=deps /rurich/node_modules /rurich/node_modules

ADD prisma .
RUN npx prisma generate

ADD . .
RUN npm run build

# Finally, build the production image with minimal footprint
FROM base

ENV DATABASE_URL=file:/data/sqlite.db
ENV PORT="8080"
ENV NODE_ENV="production"

# add shortcut for connecting to database CLI
RUN echo "#!/bin/sh\nset -x\nsqlite3 \$DATABASE_URL" > /usr/local/bin/database-cli && chmod +x /usr/local/bin/database-cli

WORKDIR /rurich

COPY --from=production-deps /rurich/node_modules /rurich/node_modules
COPY --from=build /rurich/node_modules/.prisma /rurich/node_modules/.prisma

COPY --from=build /rurich/build /rurich/build
COPY --from=build /rurich/public /rurich/public
ADD . .

CMD ["npm", "start"]
