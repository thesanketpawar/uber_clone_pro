# Must start with FROM!
FROM node:18-alpine AS build

WORKDIR /app

# Accept build arguments passed from Jenkins
ARG VITE_BASE_URL
ENV VITE_BASE_URL=$VITE_BASE_URL

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Serving with Nginx
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
