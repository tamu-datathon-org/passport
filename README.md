## Getting Started

Populate `.env.*` files, and remove the `.example` extension

```bash
npm install
npm run dev
```

Visit [http://localhost:3000/passport](http://localhost:3000/passport) on your browser.

To bypass authenticaiton locally:

1. Remove `<UserProvider>` from `/pages/_app.tsx`
2. Remove not operator (`!`) from `!user?.isAdmin` in `/pages/index.tsx`
