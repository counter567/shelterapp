const fs = require('fs');
const {parseArgs} = require('node:util');

const args = process.argv;

const options = {
  major: {
    type: 'boolean',
  },
  minor: {
    type: 'boolean'
  }
};

const {
  values
} = parseArgs({ args, options, allowPositionals: true });

let data = fs.readFileSync('./shelterapp/shelterapp.php').toString();

data = data.replace(/Version: (\d+\.\d+\.\d+)/, (match, version) => {
  const newVersion = version.split('.');
  console.log('Bump version from', newVersion.join('.'));
  if(values.major) {
    newVersion[0] = parseInt(newVersion[0]) + 1;
    newVersion[1] = 0;
    newVersion[2] = 0;
  } else 
  if(values.minor) {
    newVersion[1] = parseInt(newVersion[1]) + 1;
    newVersion[2] = 0;
  } else {
    newVersion[2] = parseInt(newVersion[2]) + 1;
  }
  console.log('Bump version to', newVersion.join('.'));
  return `Version: ${newVersion.join('.')}`;
});

fs.writeFileSync('./shelterapp/shelterapp.php', data);