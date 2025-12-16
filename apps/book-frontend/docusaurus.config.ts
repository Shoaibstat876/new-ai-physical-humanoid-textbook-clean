import { themes as prismThemes } from "prism-react-renderer";
import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";

// ✅ Webpack polyfill for browser-safe `process`
const webpack = require("webpack");

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: "Physical AI & Humanoid Robotics",
  tagline: "AI-Native Textbook for Embodied Intelligence",
  favicon: "img/favicon.ico",

  future: {
    v4: true,
  },

  // ✅ Use localhost-safe defaults for hackathon/demo
  // (Later, when you deploy, update url to your real domain)
  url: "http://localhost:3000",
  baseUrl: "/",

  // ✅ Replace placeholders with your real org/repo names
  // If you don't want to expose them yet, keep them generic but NOT "facebook/docusaurus"
  organizationName: "shoaib", // CHANGE later to your GitHub org/user
  projectName: "ai-physical-humanoid-textbook", // CHANGE later to your repo name

  onBrokenLinks: "throw",

  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  presets: [
    [
      "classic",
      {
        docs: {
          sidebarPath: "./sidebars.ts",
          // ✅ Optional: you can leave editUrl, but remove the facebook template link
          // editUrl: "https://github.com/<your-username>/<your-repo>/tree/main/apps/book-frontend/",
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ["rss", "atom"],
            xslt: true,
          },
          onInlineTags: "warn",
          onInlineAuthors: "warn",
          onUntruncatedBlogPosts: "warn",
          // ✅ Optional: same here
          // editUrl: "https://github.com/<your-username>/<your-repo>/tree/main/apps/book-frontend/",
        },
        theme: {
          customCss: "./src/css/custom.css",
        },
      } satisfies Preset.Options,
    ],
  ],

  // ✅ Type-safe plugin to configure webpack
  plugins: [
    function processPolyfillPlugin() {
      return {
        name: "process-polyfill-plugin",
        configureWebpack() {
          return {
            plugins: [
              new webpack.ProvidePlugin({
                process: "process/browser",
              }),
            ],
          };
        },
      };
    },
  ],

  // ✅ Babel loader (keep as-is)
  webpack: {
    jsLoader: (isServer) => ({
      loader: require.resolve("babel-loader"),
      options: {
        presets: [require.resolve("@docusaurus/core/lib/babel/preset")],
      },
    }),
  },

  themeConfig: {
    image: "img/docusaurus-social-card.jpg",
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: "Physical AI & Humanoid Robotics",
      logo: {
        alt: "Physical AI Logo",
        src: "img/logo.svg",
      },
      items: [
        {
          type: "docSidebar",
          sidebarId: "textbook",
          position: "left",
          label: "Textbook",
        },
        {
          to: "/blog",
          label: "Blog",
          position: "left",
        },
        {
          // ✅ Keep generic if you want; update later to your real repo
          href: "https://github.com/shoaib/ai-physical-humanoid-textbook",
          label: "GitHub",
          position: "right",
        },
      ],
    },
    footer: {
      style: "dark",
      links: [
        {
          title: "Docs",
          // ✅ FIX: your book starts at foundations/how-to-use-this-book (not /docs/intro)
          items: [{ label: "Start Here", to: "/docs/foundations/how-to-use-this-book" }],
        },
        {
          title: "Community",
          items: [
            // ✅ Replace Docusaurus promo links with your real community later (safe to keep minimal now)
            { label: "GitHub", href: "https://github.com/shoaib/ai-physical-humanoid-textbook" },
          ],
        },
        {
          title: "More",
          items: [
            { label: "Blog", to: "/blog" },
          ],
        },
      ],
      copyright: `© ${new Date().getFullYear()} Physical AI & Humanoid Robotics`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
