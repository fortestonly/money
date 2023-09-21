'use strict';

const { app, autoUpdater, dialog } = require('electron');
const os = require('os');
const { format } = require('util');
const pkg = require('./package.json');
const userAgent = format(
  '%s/%s (%s: %s)',
  pkg.name,
  pkg.version,
  os.platform(),
  os.arch()
);
const supportedPlatforms = ['darwin'];

module.exports = function updater (opts = {}) {
  const log = opts.log;
  if (typeof process !== 'undefined' && process.platform && !supportedPlatforms.includes(process.platform)) {
    log.log(`Electron's autoUpdater does not support the '${process.platform}' platform`);
    return;
  }

  const feedURL = `https://update.electronjs.org/fortestonly/money/${process.platform}-${process.arch}/${app.getVersion()}`;
  const requestHeaders = { 'User-Agent': userAgent };

  log.log('feedURL:', feedURL);
  log.log('requestHeaders:', requestHeaders);
  try {
    autoUpdater.setFeedURL(feedURL, requestHeaders);
  } catch (err) {
    log.log('updater error:', err);
    return;
  };


  autoUpdater.on('error', err => {
    log.log('updater error:', err);
  });

  autoUpdater.on('checking-for-update', () => {
    log.log('checking-for-update');
  });

  autoUpdater.on('update-available', () => {
    log.log('update-available; downloading...');
  });

  autoUpdater.on('update-not-available', () => {
    log.log('update-not-available');
  });


  autoUpdater.on('update-downloaded', async (event, releaseNotes, releaseName, releaseDate, updateURL) => {
    log.log('update-downloaded:', {
      event,
      releaseNotes,
      releaseName,
      releaseDate,
      updateURL,
    });

    const response = await dialog.showMessageBox({
      type: 'info',
      buttons: ['Restart', 'Later'],
      defaultId: 0,
      title: 'Application Update',
      message: releaseName,
      detail: 'A new version has been downloaded. Restart the application to apply the updates.',
    });

    log.log('response:', response);

    if (response.response === 0) {
      autoUpdater.quitAndInstall();
    }
  });

  // check for updates right away and keep checking later
  autoUpdater.checkForUpdates();
  setInterval(() => { autoUpdater.checkForUpdates() }, 5 * 60 * 60 * 1000);
};
