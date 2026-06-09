# Cheen Tea Kiosk Frontend

Next.js frontend for the Cheen Tea kiosk, cashier, kitchen, loyalty, and admin workflows.

## Development

```bash
npm install
npm run dev
```

The normal app expects the Laravel API URL in `NEXT_PUBLIC_API_URL`.

## Public Demo Build

The GitHub Pages build runs with:

```bash
NEXT_PUBLIC_DEMO_MODE=true
NEXT_PUBLIC_BASE_PATH=/chantea-kiosk
npm run build
```

In demo mode, API calls use browser-only sample data. Visitors can try the kiosk, cart, order tracking, kitchen, cashier, loyalty, and admin screens without touching a real database or backend service.
