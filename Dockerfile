# Use a more recent Node.js image that includes Python
FROM node:18-buster

# Set working directory
WORKDIR /app

# Copy package.json, package-lock.json (if available), and node_modules
COPY package*.json ./
COPY node_modules ./node_modules

# Copy Python virtual environment
COPY venv_py39/bin ./venv/bin
COPY venv_py39/include ./venv/include
COPY venv_py39/lib ./venv/lib
COPY venv_py39/msaf ./venv/msaf
COPY venv_py39/share ./venv/share

# Copy the rest of the application
COPY . .

# Set Python path to use the virtual environment
ENV PATH="/app/venv/bin:$PATH"

# Expose the port the app runs on
EXPOSE 4000

# Command to run the application
# CMD ["node", "app.js"]