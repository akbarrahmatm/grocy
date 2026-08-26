FROM composer:2 AS vendor

WORKDIR /app

COPY composer.json composer.lock ./

RUN composer install \
    --no-dev \
    --optimize-autoloader \
    --no-interaction \
    --prefer-dist \
    --no-scripts \
    --ignore-platform-reqs


FROM node:20-alpine AS node-builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

COPY --from=vendor /app/vendor ./vendor

RUN npm run build


FROM php:8.4-fpm

RUN apt-get update && apt-get install -y \
    git curl zip unzip \
    libonig-dev libxml2-dev libzip-dev libicu-dev \
    && docker-php-ext-install \
        pdo pdo_mysql mbstring xml intl zip opcache bcmath fileinfo exif \
    && docker-php-source delete \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

COPY composer.json composer.lock ./

RUN composer install \
    --no-dev \
    --optimize-autoloader \
    --no-interaction \
    --prefer-dist \
    --no-scripts

COPY . .

COPY --from=node-builder /app/public/build ./public/build

RUN chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

RUN echo "expose_php=Off" > /usr/local/etc/php/conf.d/security.ini

USER www-data

CMD ["php-fpm"]
