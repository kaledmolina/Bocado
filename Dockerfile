# Stage 1: Build frontend assets
FROM node:20 AS frontend-builder
WORKDIR /app

# Copy package configurations and install dependencies
COPY package*.json tsconfig.json vite.config.js tailwind.config.js postcss.config.js ./
RUN npm install --legacy-peer-deps

# Copy resources and compile assets
COPY resources ./resources
RUN npm run build

# Stage 2: Serve the application using PHP-Apache
FROM php:8.3-apache

# Install system dependencies and PHP extensions
RUN apt-get update && apt-get install -y \
    libsqlite3-dev \
    sqlite3 \
    libzip-dev \
    zip \
    unzip \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install gd pdo pdo_sqlite pdo_mysql bcmath zip \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Configure Apache DocumentRoot to point to Laravel's public directory
RUN sed -ri -e 's!/var/www/html!/var/www/html/public!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/!/var/www/html/public!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

# Enable Apache mod_rewrite
RUN a2enmod rewrite

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www/html

# Copy project files
COPY . .

# Copy compiled assets from Stage 1
COPY --from=frontend-builder /app/public/build ./public/build

# Install PHP dependencies
RUN composer install --no-dev --optimize-autoloader --no-interaction

# Create fallback database folder and sqlite file
RUN mkdir -p database && touch database/database.sqlite

# Set folder permissions for storage, cache and database
RUN chown -R www-data:www-data /var/www/html/storage \
    && chown -R www-data:www-data /var/www/html/bootstrap/cache \
    && chown -R www-data:www-data /var/www/html/database

# Make entrypoint script executable
RUN chmod +x /var/www/html/docker-entrypoint.sh

# Expose port 80
EXPOSE 80

# Configure container entrypoint
ENTRYPOINT ["/var/www/html/docker-entrypoint.sh"]
