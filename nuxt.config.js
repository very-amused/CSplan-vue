const isDev = process.env.NODE_ENV === 'development';
export default {
  mode: 'spa',
  /*
  ** Hosting configuration
  */
  server: {
    port: 3030
  },
  /*
  ** Headers of the page
  */
  head: {
    title: 'CSplan',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' }
    ],
    link: [
      { rel: 'icon', href: '/img/logo/profile.png' },
      // MDI CDN
      { rel: 'stylesheet', href: 'https://materialdesignicons.com/cdn/4.5.95/css/materialdesignicons.min.css' }
    ]
  },
  /*
  ** Customize the progress-bar color
  */
  loading: { color: '#fff' },
  /*
  ** Global CSS
  */
  css: [
    { src: '~/assets/scss/buefy.scss', lang: 'scss' }
  ],
  /*
  ** Plugins to load before mounting the App
  */
  plugins: [
    { src: '~/plugins/buefy' },
    { src: '~/plugins/dexie', mode: 'client' },
    { src: '~/plugins/user', mode: 'client' }
  ],
  /*
  ** Nuxt.js dev-modules
  */
  buildModules: [
    // Doc: https://github.com/nuxt-community/eslint-module
    '@nuxtjs/eslint-module'
  ],
  /*
  ** Nuxt.js modules
  */
  modules: [
    // Doc: https://axios.nuxtjs.org/usage
    '@nuxtjs/axios',
    '@nuxtjs/proxy',
    'nuxt-compress'
  ],
  /*
  ** Axios module configuration
  ** See https://axios.nuxtjs.org/options
  */
  axios: !isDev ? {
    baseUrl: 'https://api.csplan.co'
  }
    // Disable baseURL in development
    : {},
  /*
  ** Proxy module configuration
  ** See https://github.com/nuxt-community/proxy-module
  */
  proxy: isDev ? {
    '/v0': 'http://localhost:3000'
  }
    // Disable proxy in production
    : {},
  /*
  ** Build configuration
  */
  build: {
    /*
    ** You can extend webpack config here
    */
    extend (config, ctx) {
      if (process.env.NODE_ENV === 'development') {
        config.devtool = '#source-map'; // Create full sourcemaps
      }
    }
  }
};
