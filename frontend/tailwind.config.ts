import tailwindcssAnimate from "tailwindcss-animate"

export default {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx,vue}',
    './components/**/*.{ts,tsx,vue}',
    './app/**/*.{ts,tsx,vue}',
    './src/**/*.{ts,tsx,vue}',
  ],
  prefix: "",
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'hsl(211, 84%, 49%)',
          50: 'hsl(211, 84%, 95%)',
          100: 'hsl(211, 84%, 90%)',
          200: 'hsl(211, 84%, 80%)',
          300: 'hsl(211, 84%, 70%)',
          400: 'hsl(211, 84%, 60%)',
          500: 'hsl(211, 84%, 49%)',
          600: 'hsl(211, 84%, 40%)',
          700: 'hsl(211, 84%, 30%)',
          800: 'hsl(211, 84%, 20%)',
          900: 'hsl(211, 84%, 10%)',
          foreground: 'hsl(211, 3%, 98%)',
        },
        surface: {
          0: 'hsl(211, 3%, 98%)',
          1: 'hsl(211, 3%, 95%)',
          2: 'hsl(211, 10%, 93%)',
          3: 'hsl(211, 10%, 85%)',
          4: 'hsl(211, 10%, 74%)',
        },
        text: {
          DEFAULT: 'hsl(211, 29%, 24%)',
          emphasized: 'hsl(211, 85%, 5%)',
          subtle: 'hsl(211, 30%, 35%)',
          weaken: 'hsl(211, 15%, 60%)',
        },
        success: '#00ba68',
        destructive: '#c73413',
        border: 'hsl(211, 5%, 90%)',
        input: 'hsl(211, 5%, 90%)',
        ring: 'hsl(211, 84%, 49%)',
        background: 'hsl(211, 3%, 98%)',
        foreground: 'hsl(211, 29%, 24%)',
        secondary: {
          DEFAULT: 'hsl(211, 10%, 93%)',
          foreground: 'hsl(211, 29%, 24%)',
        },
        muted: {
          DEFAULT: 'hsl(211, 10%, 93%)',
          foreground: 'hsl(211, 15%, 60%)',
        },
        accent: {
          DEFAULT: 'hsl(211, 84%, 95%)',
          foreground: 'hsl(211, 29%, 24%)',
        },
        popover: {
          DEFAULT: 'hsl(211, 3%, 95%)',
          foreground: 'hsl(211, 29%, 24%)',
        },
        card: {
          DEFAULT: 'hsl(211, 3%, 95%)',
          foreground: 'hsl(211, 29%, 24%)',
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [tailwindcssAnimate],
} 