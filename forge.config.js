'use strict';

const pkg = require('./package.json');

const DISTRIBUTION = process.env.DISTRIBUTION;

if (!['mac', 'mas', 'win', 'appx', 'snap'].includes(DISTRIBUTION)) {
  throw new Error(`Please specify valid distribution, provided: '${DISTRIBUTION}'`)
}

module.exports = {
  packagerConfig: {
    asar: true,
    icon: 'resources/icon',
    executableName: ['win'].includes(DISTRIBUTION) ? pkg.productName : pkg.name,
    ignore: [
      /README.md/i,
      /HISTORY.md/i,
      /CHANGELOG.md/i,
      '^/(?!main.js|preload.js|renderer.js|updater.js|index.html|package.json|resources|node_modules)',
      ['win', 'snap'].includes(DISTRIBUTION) ? '^/resources/(?!icon_64x64.png)' : '^/resources',
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
      } : {}),
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
      config: {
        // App ID
        name: 'com.piggy.bank',
        setupExe: `${pkg.productName} Setup.exe`,
        setupIcon: 'resources/icon.ico',
        certificateFile: 'resources/certificate.pfx',
        certificatePassword:  process.env.CERTIFICATE_WIN_PASSWORD,
        //remoteReleases: 'https://github.com/fortestonly/money',
      },
    },
    BUILD_PLATFORM === 'appx' && {
      name: '@electron-forge/maker-appx',
      config: {
        packageName: 'MoneyApp',
        publisher: 'Money',
        devCert: 'resources/certificate.pfx',
        certPass: process.env.CERTIFICATE_WIN_PASSWORD,
        //assets: 'resources/appx',
        //manifest: 'resources/appxmanifest.xml',
        makePri: true,
        verbose: true,
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
    {
      name: './support/snap',
      config: {
        linux: {
          icon: 'resources/icon.icns',
        },
        snap: {
          summary: pkg.description,
          category: 'Office;Finance',
          publish: {
            provider: 'snapStore',
            channels: ['edge', 'stable'],
          },
        },
        publish: 'always',
      },
    }
  ].filter(item => !!item),
  publishers: [
    ...(['mac', 'win'].includes(DISTRIBUTION) ? [{
      name: '@mahnunchik/publisher-github',
      config: {
        repository: {
          owner: 'fortestonly',
          name: 'money'
        },
        draft: true,
        override: true,
      },
    }] : []),
    /*{
      name: '@mahnunchik/publisher-gcs',
      config: {
        bucket: 'coinspace-travis-ci',
        public: false,
      },
    },*/
  ],
};
