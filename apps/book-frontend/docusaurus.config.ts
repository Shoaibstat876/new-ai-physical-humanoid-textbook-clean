/**
 * Spec-Kit Trace
 * Feature: docs-site platform config (Docusaurus runtime configuration)
 * Spec: N/A
 * Plan: N/A
 * Tasks: N/A
 * Story: N/A
 * Task(s): N/A
 * Purpose: Configure the Docusaurus site (docs routing, theme, navbar/footer, prism highlighting).
 * Non-Goals: Feature logic (RAG, auth, personalization), backend connectivity configuration,
 *            or runtime secrets management.
 *
 * NOTE: If you introduce environment-specific behavior (deploy URLs, auth domains),
 * it should be captured as a real Spec-Kit feature + ADR (cluster decision: "Deployment + Runtime Config").
 */

import { themes as prismThemes } from "prism-react-renderer";
import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: "Physical AI & Humanoid Robotics",
  tagline: "AI-Native Textbook for Embodied Intelligence",
  favicon: "img/favicon.ico",

  future: {
    v4: true,
  },

  // Local dev URL (change later on deploy)
  url: "http://localhost:3000",
  baseUrl: "/",

  // GitHub repo info
  organizationName: "Shoaibstat876",
  projectName: "new-ai-physical-humanoid-textbook-clean",

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
          routeBasePath: "docs",
          sidebarPath: require.resolve("./sidebars.ts"),

          // Disable "Edit this page" in Docs
          editUrl: undefined,
        },

        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ["rss", "atom"],
            xslt: true,
          },

          // Disable "Edit this page" in Blog
          editUrl: undefined,

          onInlineTags: "warn",
          onInlineAuthors: "warn",
          onUntruncatedBlogPosts: "warn",
        },

        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },
      } satisfies Preset.Options,
    ],
  ],

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
          href: "https://github.com/Shoaibstat876/new-ai-physical-humanoid-textbook-clean",
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
          items: [
            {
              label: "Start Here",
              to: "/docs/intro",
            },
          ],
        },
        {
          title: "Community",
          items: [
            {
              label: "Stack Overflow",
              href: "https://stackoverflow.com/questions/tagged/docusaurus",
            },
            {
              label: "Discord",
              href: "https://discord.com",
            },
            {
              label: "X",
              href: "https://x.com/docusaurus",
            },
          ],
        },
        {
          title: "More",
          items: [
            {
              label: "Blog",
              to: "/blog",
            },
            {
              label: "GitHub Profile",
              href: "https://github.com/Shoaibstat876",
            },
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
