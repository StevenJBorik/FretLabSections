# Stage 1: Node.js
FROM node:18 as node

# Stage 2: Python
FROM python:3.9

# Copy Node.js from the first stage
COPY --from=node /usr/local/bin/node /usr/local/bin/
COPY --from=node /usr/local/lib/node_modules /usr/local/lib/node_modules
RUN ln -s /usr/local/lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm

# Set working directory
WORKDIR /app

# Install system dependencies including SuiteSparse and other necessary libraries
RUN apt-get update && apt-get install -y \
    libatlas-base-dev \
    liblapack-dev \
    libblas-dev \
    libsuitesparse-dev \
    gfortran \
    pkg-config \
    libopenblas-dev

# Set environment variables for CVXOPT
ENV CVXOPT_SUITESPARSE_INC_DIR=/usr/include/suitesparse
ENV CVXOPT_SUITESPARSE_LIB_DIR=/usr/lib/aarch64-linux-gnu
ENV CVXOPT_BLAS_LIB_DIR=/usr/lib/aarch64-linux-gnu
ENV CVXOPT_LAPACK_LIB_DIR=/usr/lib/aarch64-linux-gnu
ENV CVXOPT_BUILD_GSL=0

# Copy node_modules
COPY node_modules ./node_modules

# Create a new virtual environment
RUN python -m venv /app/venv

# Activate the virtual environment
ENV PATH="/app/venv/bin:$PATH"

# Copy requirements.txt
COPY requirements.txt .

# Install Python dependencies
RUN pip install --upgrade pip && \
    pip install --no-binary=cvxopt cvxopt==1.3.2 && \
    pip install -r requirements.txt && \
    pip install msaf==0.1.80

# Verify versions
RUN node --version && npm --version && python --version && pip --version

# Copy the rest of the application
COPY . .

# Expose the port the app runs on
EXPOSE 4000

# Command to run the application
CMD ["node", "app.js"]