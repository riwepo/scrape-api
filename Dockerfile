# Start from Puppeteer's official image
FROM ghcr.io/puppeteer/puppeteer:21.5.2

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy your app code
COPY . .

# Optional: expose your Express port
EXPOSE 3000

# Default command
CMD ["node", "index.js"]