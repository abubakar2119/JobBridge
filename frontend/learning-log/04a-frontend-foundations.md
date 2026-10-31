# Frontend Foundations — Quick Quiz

## 1. Why does this project keep Next.js and Express as separate applications?

Next.js handles the frontend, pages, UI, and frontend API route handlers. Express handles the backend API and business logic. Keeping them separate makes the code easier to organize, maintain, and develop independently.

## 2. When should a page be a Server Component rather than a Client Component?

A page should use a Server Component when it mainly fetches data, renders content, or accesses server-side resources without needing browser interactions. A Client Component is needed for features such as `useState`, `useEffect`, event handlers, and interactive UI.

## 3. Why do browser mutations pass through a Next.js route handler?

A Next.js route handler acts as a secure server-side layer between the browser and Express. It can read `httpOnly` cookies, attach authentication headers, validate requests, and forward mutations to the backend without exposing tokens to browser JavaScript.

## 4. Why are `httpOnly` cookies safer than localStorage for tokens?

JavaScript running in the browser cannot directly read `httpOnly` cookies, which reduces the risk of token theft through cross-site scripting (XSS). Tokens in `localStorage` can be accessed by JavaScript. Cookies still require appropriate security settings and protection against CSRF where applicable.

## 5. Name the loading, empty, and error state for one page you built.

Example — **Admin Companies page:**

- **Loading state:** Display a loading message or skeleton while company data is being fetched.
- **Empty state:** Display “No companies found” when the request succeeds but returns no companies.
- **Error state:** Display a clear error message if the request fails, with an option to retry.

*Note: Adjust these examples to match the states actually implemented in your page.*