FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci && npm cache clean --force
COPY . .
RUN npm run build
FROM nginx:alpine

COPY --from=build /app/build /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g",  "daemon off;"]
# Use the following command to build and run the Docker container:
# docker build -t todo-frontend .
# docker run -p 3000:3000 todo-frontend
# Ensure that the backend API URL in your frontend code is correctly set for your environment.