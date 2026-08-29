import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'HandTrack3D',
  description: 'Webcam-based 3D hand tracking for the web',

  themeConfig: {
    logo: '/logo.svg',

    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'API Reference', link: '/api/core' },
      { text: 'Examples', link: '/examples/' },
      {
        text: 'v0.0.0',
        items: [
          { text: 'Changelog', link: 'https://github.com/yourusername/handtrack3d/releases' }
        ]
      }
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Introduction',
          items: [
            { text: 'What is HandTrack3D?', link: '/guide/what-is-handtrack3d' },
            { text: 'Getting Started', link: '/guide/getting-started' },
            { text: '5-Minute Quickstart', link: '/guide/quickstart' }
          ]
        },
        {
          text: 'Installation',
          items: [
            { text: '@handtrack3d/core', link: '/guide/install-core' },
            { text: '@handtrack3d/react', link: '/guide/install-react' },
            { text: '@handtrack3d/three', link: '/guide/install-three' }
          ]
        },
        {
          text: 'Core Concepts',
          items: [
            { text: 'Hand Detection', link: '/guide/hand-detection' },
            { text: 'Gesture Recognition', link: '/guide/gestures' },
            { text: '3D Interaction', link: '/guide/3d-interaction' }
          ]
        }
      ],
      '/api/': [
        {
          text: 'API Reference',
          items: [
            { text: '@handtrack3d/core', link: '/api/core' },
            { text: '@handtrack3d/react', link: '/api/react' },
            { text: '@handtrack3d/three', link: '/api/three' }
          ]
        }
      ],
      '/examples/': [
        {
          text: 'Examples',
          items: [
            { text: 'Overview', link: '/examples/' },
            { text: 'Basic Hand Tracking', link: '/examples/basic' },
            { text: 'React Integration', link: '/examples/react' },
            { text: '3D Object Manipulation', link: '/examples/three' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/yourusername/handtrack3d' }
    ],

    search: {
      provider: 'local'
    },

    editLink: {
      pattern: 'https://github.com/yourusername/handtrack3d/edit/main/apps/docs/:path',
      text: 'Edit this page on GitHub'
    },

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2026-present HandTrack3D Contributors'
    }
  },

  markdown: {
    theme: {
      light: 'github-light',
      dark: 'github-dark'
    },
    lineNumbers: true
  },

  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/logo.svg' }]
  ],

  ignoreDeadLinks: [
    // Ignore localhost URLs in development
    /^https?:\/\/localhost/,
    // Ignore example URLs that don't exist yet
    /\/examples\/visualization/
  ]
})
