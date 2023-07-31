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
  darkMode: ['[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        disabled: `rgba(var(--disabled-color))`,
        grey: {
          DEFAULT: withOpactity(`--grey-color`),
        },
        "tooltip-light": {
          DEFAULT: withOpactity(`--tooltip-light-color`),
        },
        "tooltip-dark": {
          DEFAULT: withOpactity(`--tooltip-dark-color`),
        },
        accent: {
          DEFAULT: withOpactity(`--accent-color`),
          bg: withOpactity(`--accent-color-bg`),
          border: withOpactity(`--accent-color-border`),
        },
        background: {
          DEFAULT: withOpactity(`--bg-color`),
        },
        foreground: {
          DEFAULT: withOpactity(`--fg-color`),
        },
        success: {
          DEFAULT: withOpactity(`--success-color`),
          bg: withOpactity(`--success-color-bg`),
          border: withOpactity(`--success-color-border`),
        },
        attention: {
          DEFAULT: withOpactity(`--attention-color`),
          bg: withOpactity(`--attention-color-bg`),
          border: withOpactity(`--attention-color-border`),
        },
        danger: {
          DEFAULT: withOpactity(`--danger-color`),
          bg: withOpactity(`--danger-color-bg`),
          border: withOpactity(`--danger-color-border`),
        },
        severe: {
          DEFAULT: withOpactity(`--severe-color`),
          bg: withOpactity(`--severe-color-bg`),
          border: withOpactity(`--severe-color-border`),
        },
        open: {
          DEFAULT: withOpactity(`--open-color`),
          bg: withOpactity(`--open-color-bg`),
          border: withOpactity(`--open-color-border`),
        },
        closed: {
          DEFAULT: withOpactity(`--closed-color`),
          bg: withOpactity(`--closed-color-bg`),
          border: withOpactity(`--closed-color-border`),
        },
        done: {
          DEFAULT: withOpactity(`--done-color`),
          bg: withOpactity(`--done-color-bg`),
          border: withOpactity(`--done-color-border`),
        },
        neutral: {
          DEFAULT: withOpactity(`--neutral-color`),
        },
        subtle: {
          DEFAULT: withOpactity(`--subtle-color`),
        },
        header: {
          DEFAULT: withOpactity(`--header-color`),
        },
        ghost: {
          DEFAULT: withOpactity(`--ghost-color`),
        },
        backdrop: {
          DEFAULT: withOpactity(`--backdrop-color`),
        },
      },
      boxShadow: {
        inset: "0px 0px 0px 3px inset",
        subtle: "rgba(31, 35, 40, 0.1) 0px 1px 0px",
      },
    },
  },
  plugins: [],
};
