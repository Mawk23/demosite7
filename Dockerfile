# Use official Node LTS image
FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm ci --only=production

# Bundle app source
COPY . .

# Copy wait-for-db script and make it executable
COPY wait-for-db.sh /usr/local/bin/wait-for-db.sh
RUN chmod +x /usr/local/bin/wait-for-db.sh

# Expose port
EXPOSE 3000

# Start the app
CMD ["sh", "-c", "wait-for-db.sh mongo 27017; npm run seed || true; npm start"]
