#!/bin/bash
set -e

cd /var/www

# Create .env from example if it doesn't exist
if [ ! -f .env ]; then
    cp .env.example .env 2>/dev/null || touch .env
fi

# Generate app key if not set
if [ -z "$APP_KEY" ]; then
    php artisan key:generate --force
fi

# Run migrations
php artisan migrate --force

# Seed database if empty (first run)
php artisan db:seed --force 2>/dev/null || true

# Cache config and routes
php artisan config:cache
php artisan route:cache

# Fix permissions
chown -R www-data:www-data storage bootstrap/cache

exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
