# Build Stage
FROM node:latest AS build-env
WORKDIR /source
ARG ANGULAR_ENVIRONMENT
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN node_modules/.bin/ng build --configuration=production

# Run Stage
FROM nginx:latest
COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=build-env /source/dist/* /usr/share/nginx/html

EXPOSE 80