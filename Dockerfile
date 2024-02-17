# Use the latest Node.js image as base image
FROM node:20

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install the application dependencies
RUN npm install

# Copy the source code to the working directory
COPY . .

# Expose the port that the app will run on
EXPOSE 3000

# Start the application
CMD ["npm", "run", "start:dev"]
