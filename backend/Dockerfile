FROM node:18-alpine

RUN apk add --no-cache curl
WORKDIR /app
COPY package*.json ./
RUN npm ci && npm cache clean --force

ENV PATH /app/node_modules/.bin:$PATH
COPY . .
# removed run npm test we don't test while building backend

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

RUN chown -R nodejs:nodejs /app
USER nodejs

EXPOSE 5000
CMD ["npm", "start"]
# Use the following command to build and run the Docker container:
# docker build -t todo-backend .
# docker run -p 5000:5000 todo-backend
# Ensure that the MongoDB URI in .env is correctly set for your environment.    