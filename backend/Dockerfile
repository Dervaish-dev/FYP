# Use Node.js 18 Alpine for a lightweight image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --only=production

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on (adjust if different)
EXPOSE 5000

# Command to run the application
CMD ["npm", "start"]