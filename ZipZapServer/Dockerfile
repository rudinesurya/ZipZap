# Use official Node.js image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Build the NestJS application using npx
RUN npx nest build

# Expose the port your app runs on
EXPOSE 8080

# Command to run the server
CMD ["node", "dist/main"]
