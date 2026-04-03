# Job Portal

A full-stack job portal application with a React (Vite) frontend and an Express API.

## Live site

**Production:** [https://job-portal-project-pink.vercel.app/](https://job-portal-project-pink.vercel.app/)

## Local development

From the repository root:

```bash
npm install
cd client && npm install --legacy-peer-deps && cd ..
```

Run the API (Express):

```bash
npm run server
```

In another terminal, run the Vite dev server:

```bash
cd client && npm run dev
```

Configure environment variables using `server/.env` (see your team’s private template for required keys).

## Production build

```bash
npm run build
```

This builds the client and copies the output to the root `dist/` folder for deployment.

## Tech stack

- **Frontend:** React, Vite, Tailwind CSS  
- **Backend:** Node.js, Express, MongoDB (Mongoose), Clerk, Cloudinary  

## License

ISC
