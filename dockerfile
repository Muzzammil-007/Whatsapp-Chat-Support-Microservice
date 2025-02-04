# Base image with Node.js
FROM node:16-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install --only=production

# Copy the rest of the application code
COPY . .

# Expose the port your gRPC server will use (replace 50051 with your actual port if it's different)
EXPOSE 50051

# Command to run your application
CMD ["npm", "start"]
