FROM node:20-alpine as base
ENV NODE_ENV=production
WORKDIR /app
COPY package*.json .
RUN npm ci 

FROM base as dev
ENV NODE_ENV=development
RUN npm ci
ENV PATH ./node_modules/.bin:$PATH

FROM dev as build
COPY . .
RUN tsc

FROM base as prod
COPY --from=build /app .
EXPOSE 80
CMD ["node", "dist/server/index.js", "-p", "80"]
