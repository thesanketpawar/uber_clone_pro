# Build Stage
FROM node:18-alpine AS build
WORKDIR /app

ARG VITE_BASE_URL
ENV VITE_BASE_URL=$VITE_BASE_URL

COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Nginx Stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
# Copy your custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
