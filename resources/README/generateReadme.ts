import { readFile, writeFile } from 'fs-extra';
import Handlebars from 'handlebars';
import path from 'path';
import { convertMdToMdTable } from './mdToTable';



const packagePath = path.join(__dirname, '..', '..');
const docsPath = path.join(packagePath, 'docs');



// Have your typedoc on watch, and have a ts-node-dev including the docs and README.hbs to run this.
async function run() {

  // console.log('Compiling Handlebars with the docs data...');
  const readmeHbsContent = (await readFile(path.join(__dirname, 'README.hbs'))).toString();

  const template = Handlebars.compile(readmeHbsContent, {noEscape: true});

  let result = template({
    // TODO make them parallel. only one expression now so no problems.
    shadowProperties: await convertMdToMdTable(path.join(docsPath, 'interfaces', 'shadowi.md'))
  });

  // Later found out if this is typedoc or typedoc-plugin-md fault.
  result = result.replace('StyleProp<ViewStyle\\>', 'StyleProp<ViewStyle>')

  await writeFile(path.join(packagePath, 'README.md'), result);

  console.log('README.md successfully generated!');
}


run();
