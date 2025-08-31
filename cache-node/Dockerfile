FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Install TypeScript and build tools
RUN npm install --save-dev typescript ts-node

# Expose port
EXPOSE 3001

# Set environment variables
ENV NODE_ENV=production

# Start the application using ts-node
CMD ["npx", "ts-node", "src/index.ts"]