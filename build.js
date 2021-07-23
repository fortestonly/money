const { execSync } = require('child_process');

function shell(command, options) {
  console.log(`Executing: ${chalk.green(command)}`);
  const defaultOptions = { stdio: [0, 1, 2] };
  execSync(command, Object.assign(defaultOptions, options));
}

shell('npm run publish');
