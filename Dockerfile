FROM node:18-alpine AS builder

# Create and change to the app directory.
WORKDIR /usr/src/app

# Copy application dependency manifests to the container image.
# A wildcard is used to ensure both package.json AND package-lock.json are copied.
COPY package*.json ./

# Install production dependencies.
RUN npm install --only=production

# Copy local code to the container image.
COPY . .

# Use a second stage to reduce the final image size.
FROM node:18-alpine

# Create and change to the app directory.
WORKDIR /usr/src/app

# Copy only the necessary files from the build stage.
COPY --from=builder /usr/src/app .

# Expose the port the app runs on.
EXPOSE 3000

# Run the web service on container startup.
CMD [ "node", "index.js" ]
