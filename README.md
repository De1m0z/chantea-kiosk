# Cheen Tea Kiosk

Full-stack kiosk and POS project for Cheen Tea.

## Project Parts

- `cheentea-frontend/` - Next.js kiosk, cart, cashier, kitchen, loyalty, and admin interface.
- `cheentea-api/` - Laravel API for products, categories, orders, customers, loyalty, uploads, and voice ordering.
- `docker-compose.yml` - local multi-service setup for development.

## Public Online Demo

The public GitHub Pages version uses sample data only:

https://de1m0z.github.io/chantea-kiosk/

The demo does not connect to the real Laravel API, database, uploads, payment systems, or admin services. It runs in the browser and stores temporary sample changes in local storage.

## Local Development

Frontend:

```bash
cd cheentea-frontend
npm install
npm run dev
```

API:

```bash
cd cheentea-api
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve
```
