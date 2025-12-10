/** @type {import('tailwindcss').Config} */
module.exports = {
  // CRITICAL: This 'content' array tells Tailwind which files to scan
  // to find the utility classes you are using (e.g., 'flex', 'p-4').
  // If this is wrong, Tailwind generates an empty CSS file.
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}