FROM php:8.2-cli-alpine

# Install system dependencies and PHP extensions
RUN apk add --no-cache \
    git \
    curl \
    libpng-dev \
    oniguruma-dev \
    libxml2-dev \
    zip \
    unzip \
    redis

# Install PHP extensions
RUN docker-php-ext-install pdo pdo_mysql mbstring xml

# Install Redis extension
RUN apk add --no-cache --virtual .build-deps $PHPIZE_DEPS \
    && pecl install redis \
    && docker-php-ext-enable redis \
    && apk del .build-deps

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www/html

# Copy composer files
COPY composer.json composer.lock ./

# Install PHP dependencies
RUN composer install --no-dev --optimize-autoloader --no-interaction

# Copy application files
COPY . .

# Ensure .env file exists and has correct content
RUN if [ ! -f .env ]; then cp .env.example .env; fi

# Create storage directories and set permissions
RUN mkdir -p storage/logs storage/framework/cache storage/framework/sessions storage/framework/views \
    && chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html \
    && chmod -R 777 storage

# Expose port
EXPOSE 8000

# Start the application using PHP's built-in server with explicit working directory
WORKDIR /var/www/html
CMD ["php", "-S", "0.0.0.0:8000", "-t", "public", "public/index.php"]