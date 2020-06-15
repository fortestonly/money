'use strict';

const pkg = require('./package.json');

const DISTRIBUTION = process.env.DISTRIBUTION;

if (!['mac', 'mas', 'win'].includes(DISTRIBUTION)) {
  throw new Error(`Please specify valid distribution, provided: '${DISTRIBUTION}'`)
}

module.exports = {
  packagerConfig: {
    asar: true,
    icon: 'resources/icon',
    ignore: [
      /README.md/i,
      /HISTORY.md/i,
      /CHANGELOG.md/i,
      '^/(?!main.js|preload.js|renderer.js|index.html|package.json|resources|node_modules)',
      DISTRIBUTION === 'win' ? '^/resources/(?!icon.png)' : '^/resources',
      '.travis.yml',
      '.editorconfig',
      '.gitignore',
    ],
    appBundleId: 'com.piggy.bank',
    appCategoryType: 'public.app-category.finance',
    osxSign: {
      'gatekeeper-assess': false,
      ...(DISTRIBUTION === 'mac'? {
        'hardened-runtime': true,
        entitlements: 'resources/entitlements.mac.plist',
        'entitlements-inherit': 'resources/entitlements.mac.plist',
      }: {}),
    },
    osxNotarize: (DISTRIBUTION === 'mac' && process.env.APPLE_ID && process.env.APPLE_PASSWORD) ? {
      appBundleId: 'com.piggy.bank',
      appleId: process.env.APPLE_ID,
      appleIdPassword: process.env.APPLE_PASSWORD,
    } : undefined,
  },
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: (arch) => {
        return {
          // App ID
          name: 'com.piggy.bank',
          setupExe: arch === 'x64'
           ? `${pkg.productName} ${pkg.version} Setup.exe`
           : `${pkg.productName} ${pkg.version} ${arch} Setup.exe`,
          setupIcon: 'resources/icon.ico',
          certificateFile: 'resources/certificate.pfx',
          certificatePassword:  process.env.CERTIFICATE_WIN_PASSWORD,
        };
      },
    },
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
      name: '@mahnunchik/publisher-github',
      config: {
        repository: {
          owner: 'fortestonly',
          name: 'money'
        },
        draft: true,
        override: true,
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
