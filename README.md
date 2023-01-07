## Getting Started

Populate `.env.*` files, and remove the `.example` extension

```bash
(Windows) npm install -g npm@7.15.1
npm install
npm run dev
```

Visit [http://localhost:3000/passport](http://localhost:3000/passport) on your browser.

To bypass authentication locally:

1. Remove `<UserProvider>` from `/pages/_app.tsx`
2. Remove not operator (`!`) from `!user?.isAdmin` in `/pages/index.tsx`
