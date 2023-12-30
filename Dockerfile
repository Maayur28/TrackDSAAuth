# Use an official Node.js runtime as a base image
FROM node:21-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

ARG CAPTCHA_SECRET_KEY
ARG CIPHER_TOKEN
ARG email
ARG password
ARG TOKEN_SECRET
ARG MONGODB_URI
ARG MY_EMAIL

ENV CAPTCHA_SECRET_KEY=$CAPTCHA_SECRET_KEY
ENV CIPHER_TOKEN=$CIPHER_TOKEN
ENV email=$email
ENV password=$password
ENV TOKEN_SECRET=$TOKEN_SECRET
ENV MONGODB_URI=$MONGODB_URI
ENV MY_EMAIL=$MY_EMAIL

RUN echo "The ENV variable CAPTCHA_SECRET_KEY value is $CAPTCHA_SECRET_KEY"
RUN echo "The ENV variable CIPHER_TOKEN value is $CIPHER_TOKEN"
RUN echo "The ENV variable email value is $email"
RUN echo "The ENV variable password value is $password"
RUN echo "The ENV variable TOKEN_SECRET value is $TOKEN_SECRET"
RUN echo "The ENV variable MONGODB_URI value is $MONGODB_URI"
RUN echo "The ENV variable MY_EMAIL value is $MY_EMAIL"

# Install the application dependencies
RUN npm install

# Copy the application code to the working directory
COPY . .

# Expose the port the app runs on
EXPOSE 8080

# Define the command to run your application
CMD [ "node", "index.js" ]
