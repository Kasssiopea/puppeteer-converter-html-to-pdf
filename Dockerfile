FROM registry.git.in.np.gov.ua/other/nodejs/oracle/20-ol8-clean:main

RUN npx --yes @puppeteer/browsers install chrome@126.0.6478.126
RUN dnf install -y nss libdrm atk at-spi2-atk cups-libs libXcomposite libXdamage libxkbcommon libXrandr mesa-libgbm pango alsa-lib
RUN dnf update nss -y
RUN rm -rf /var/cache/dnf

WORKDIR /app

COPY package*.json /app/
RUN npm ci
RUN node /app/node_modules/puppeteer/install.mjs

# COPY .env.prod /app/.env.prod
COPY app.js /app/app.js

EXPOSE 3000

CMD ["npm", "start"]

# =================
# Set the working directory inside the container
# WORKDIR /app

# # Copy package.json and package-lock.json to the working directory
# COPY package*.json ./

# # Install the application dependencies
# RUN npm install

# # Copy the rest of the application code to the working directory
# COPY . .

# # Expose the port the app runs on
# EXPOSE 3000

# # Command to run the application
# CMD ["npm", "start"]
