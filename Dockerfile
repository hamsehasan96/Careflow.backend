FROM node:20-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Set environment variables
ENV NODE_ENV=production

# Expose port
EXPOSE 3000

# Run migrations and start the server
CMD ["npm", "run", "start:prod"]
