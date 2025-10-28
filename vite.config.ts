import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import ViteSitemap from 'vite-plugin-sitemap';
import { createHtmlPlugin } from 'vite-plugin-html';

const routes = [
  {path: '/', name: 'Home'},
  {path: '/about-us', name: 'About Us'},
  {path: '/services', name: 'Services'},
  {path: '/products', name: 'Products'},
  {path: '/contact-us', name: 'Contact Us'}
]
// https://vite.dev/config/
export default defineConfig({
  plugins: [
      react(),
      ViteSitemap({
        hostname: "https://clncambodia.com",
        dynamicRoutes: routes.map(r => r.path),
        generateRobotsTxt: false,
      }),
      createHtmlPlugin({
        minify: true,
        inject: {
          data: {
            title: 'CLN (CAMBODIA) CO., LTD.',
            description: 'CLN Cambodia logistics  is a registered company that established its own office in Cambodia in 2015. Currently, we have an office in Phnom Penh and collaborate with many shipping companies both locally and overseas.Our company is now 30 years of experience in handling import and export logistics, along with advanced information technology, we are dedicated to offering the best international and domestic logistics services and networks that enable our customers to make “All the Possible Moves” in their supply chains. We also comply with Cambodia’s labor laws and are committed to providing the best services to meet our customers’ expectations.',
          },
        },
      }),
  ],
  build:{
    rollupOptions:{
      output: {
        manualChunks:{
          react: ['react', 'react-dom', 'react-router-dom'],
        }
      },
    },
  },
});
