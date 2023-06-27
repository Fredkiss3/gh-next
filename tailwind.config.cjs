/**
 *
 * @param {string} variableName
 */
function withOpactity(variableName) {
  return ({ opacityValue = 1 }) => {
    return `rgba(var(${variableName}), ${opacityValue})`;
  };
}

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        accent: withOpactity(`--accent-color`),
        success: withOpactity(`--success-color`),
        attention: withOpactity(`--attention-color`),
        danger: withOpactity(`--danger-color`),
        severe: withOpactity(`--severe-color`),
        open: withOpactity(`--open-color`),
        closed: withOpactity(`--closed-color`),
        done: withOpactity(`--done-color`),
        neutral: withOpactity(`--neutral-color`),
        subtle: withOpactity(`--subtle-color`),
        "accent-light": withOpactity(`--accent-color-light`),
        "success-light": withOpactity(`--success-color-light`),
        "attention-light": withOpactity(`--attention-color-light`),
        "danger-light": withOpactity(`--danger-color-light`),
        "severe-light": withOpactity(`--severe-color-light`),
        "open-light": withOpactity(`--open-color-light`),
        "closed-light": withOpactity(`--closed-color-light`),
        "done-light": withOpactity(`--done-color-light`),
      },
      boxShadow: {
        inset: "0px 0px 0px 3px inset",
        subtle: "rgba(31, 35, 40, 0.1) 0px 1px 0px",
      },
    },
  },
  plugins: [],
};
