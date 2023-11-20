module.exports = {
    content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
    theme: {},
    plugins: [
        require("@tailwindcss/container-queries"),
        require("@tailwindcss/forms"),
        require("daisyui"),
    ],
};
