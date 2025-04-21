# Use the official Node.js v21.5.0 image as the base image
FROM node:21.5.0

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy the package.json and package-lock.json to the container
COPY package*.json ./

# Install the dependencies
RUN npm install

# Copy the rest of the application code to the container
COPY . .

# Expose the port that the app will run on
EXPOSE 8000

# Define the command to run the app using npm run start
CMD ["npm", "run", "start"]
