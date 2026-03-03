# Use latest stable Node (supports React 19 well)
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy dependency files first (better Docker cache)
COPY package.json package-lock.json ./

# Install dependencies (React 19 workaround)
RUN npm install --legacy-peer-deps

# Copy project files
COPY . .

# Build React app
RUN npm run build

# Install serve to run production build
RUN npm install -g serve

# Expose port
EXPOSE 3000

# Run app
CMD ["serve", "-s", "build", "-l", "3000"]
