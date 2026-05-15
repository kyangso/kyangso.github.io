import { defineConfig, envField } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import icon from 'astro-icon';
import tailwindcss from '@tailwindcss/vite';
import i18nConfig from './src/config/i18n.config.ts';

const i18nEnabled =
  i18nConfig.enabled === true &&
  i18nConfig.locales.length > 1;

const astroI18nOptions = i18nEnabled
  ? {
      defaultLocale: i18nConfig.defaultLocale,
      locales: i18nConfig.locales,
      routing: {
        prefixDefaultLocale: false,
        redirectToDefaultLocale: false,
      },
    }
  : undefined;

export default defineConfig({
  output: 'static',

  site: 'https://kyangso.github.io',

  ...(astroI18nOptions
    ? { i18n: astroI18nOptions }
    : {}),

  build: {
    inlineStylesheets: 'always',
  },

  env: {
    schema: {
      SITE_URL: envField.string({
        context: 'server',
        access: 'public',
        optional: true,
      }),
    },
  },

  image: {
    layout: 'constrained',
  },

  integrations: [
    react(),
    mdx(),
    sitemap(),
    icon(),
  ],

  vite: {
    plugins: [tailwindcss()],
  },

  security: {
    checkOrigin: true,
  },

  markdown: {
    shikiConfig: {
      theme: 'github-dark',
      wrap: true,
    },
  },
});