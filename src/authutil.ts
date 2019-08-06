import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as core from '@actions/core';
import * as github from '@actions/github';

export function configAuthentication(registryUrl: string) {
  // const npmrc: string = path.resolve(
  //   process.env['RUNNER_TEMP'] || process.cwd(),
  //   '.npmrc'
  // );
  const npmrc: string = path.resolve(process.cwd(), '.npmrc');

  writeRegistryToFile(registryUrl, npmrc);
}

function writeRegistryToFile(registryUrl: string, fileLocation: string) {
  let scope = core.getInput('scope');
  if (!scope && registryUrl.indexOf('npm.pkg.github.com') > -1) {
    scope = github.context.repo.owner;
  }
  if (scope && scope[0] != '@') {
    scope = '@' + scope;
  }

  core.debug(`Setting auth in ${fileLocation}`);
  let newContents: string = '';
  if (fs.existsSync(fileLocation)) {
    const curContents: string = fs.readFileSync(fileLocation, 'utf8');
    curContents.split(os.EOL).forEach((line: string) => {
      // Add current contents unless they are setting the registry
      if (!line.toLowerCase().startsWith('registry')) {
        newContents += line + os.EOL;
      }
    });
  }
  // Remove http: or https: from front of registry.
  const authString =
    registryUrl.replace(/(^\w+:|^)/, '') + ':_authToken=${NODE_AUTH_TOKEN}';
  const registryString = scope
    ? `${scope}:registry=${registryUrl}`
    : `registry=${registryUrl}`;
  newContents += `${registryString}${os.EOL}${authString}`;
  fs.writeFileSync(fileLocation, newContents);
  //   core.exportVariable('NPM_CONFIG_USERCONFIG', fileLocation);
  // Export empty node_auth_token so npm doesn't complain about not being able to find it
  // core.exportVariable('NODE_AUTH_TOKEN', 'XXXXX-XXXXX-XXXXX-XXXXX');
}
