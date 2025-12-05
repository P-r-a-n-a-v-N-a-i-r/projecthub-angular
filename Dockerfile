# Stage 1: Build Angular app
FROM node:22-alpine AS build
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source and build (uses "build": "ng build")
COPY . .
RUN npm run build:prod

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Remove default nginx site
RUN rm /etc/nginx/conf.d/default.conf

# Angular 17 output is usually dist/projecthub/browser
COPY --from=build /app/dist/projecthub/browser /usr/share/nginx/html

# Custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
