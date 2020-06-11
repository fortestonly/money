
const pkg = require('./package.json');

const DISTRIBUTION = process.env.DISTRIBUTION;

if (!['mac', 'mas'].includes(DISTRIBUTION)) {
  throw new Error(`Please specify valid distribution, provided: '${DISTRIBUTION}'`)
}

module.exports = {
  packagerConfig: {
    asar: true,
    icon: 'resources/icon',
    appBundleId: 'com.piggy.bank',
    appCategoryType: 'public.app-category.finance',
    osxSign: {
      'gatekeeper-assess': false,
    },
    osxNotarize: (DISTRIBUTION === 'mac' && process.env.APPLE_ID && process.env.APPLE_PASSWORD) ? {
      appBundleId: 'com.piggy.bank',
      appleId: process.env.APPLE_ID,
      appleIdPassword: process.env.APPLE_PASSWORD,
    } : undefined,
  },
  makers: [
    {
      name: '@electron-forge/maker-zip',
      platforms: [
        'darwin',
      ],
    },
    {
      name: '@electron-forge/maker-dmg',
      config: {
        name: pkg.productName,
        title: `${pkg.productName} ${pkg.version}`,
        icon: 'resources/icon.icns',
        background: 'resources/background.tiff',
        contents: (opts) => {
          return [{
            x: 130, y: 220, type: 'file', path: opts.appPath,
          }, {
            x: 410, y: 220, type: 'link', path: '/Applications',
          }];
        },
        additionalDMGOptions: {
          window: {
            position: {
              x: 400,
              y: 100,
            },
            size: {
              width: 540,
              height: 380,
            },
          },
        },
      },
    },
  ],
  publishers: [
    {
      name: '@electron-forge/publisher-github',
      config: {
        repository: {
          owner: 'fortestonly',
          name: 'money'
        },
        draft: true,
      },
    },
    /*{
      name: '@electron-forge/publisher-gcs',
      config: {
        bucket: 'coinspace-travis-ci',
        public: false,
      },
    },*/
  ],
};