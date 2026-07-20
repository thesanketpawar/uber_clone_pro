# Stage 1: Build stage
FROM node:18-alpine AS build

WORKDIR /app

# 1. Receive ARG from docker build command
ARG VITE_BASE_URL

# 2. Set as ENV so npm run build can read it
ENV VITE_BASE_URL=$VITE_BASE_URL

COPY package*.json ./
RUN npm install

COPY . .

# 3. Build step MUST happen AFTER ARG and ENV declaration
RUN npm run build

# Stage 2: Serve stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
