import { readFile, writeFile } from 'fs-extra';
import Handlebars from 'handlebars';
import path from 'path';
import execa from 'execa';
import { convertMdToMdTable } from './mdToTable';



const packagePath = path.join(__dirname, '..', '..');
const docsPath = path.join(packagePath, 'docs');


async function generateDocsFun({stdio}: {stdio: "inherit" | "pipe" | "ignore"}) {
  await execa('npx', ['typedoc'], { cwd: packagePath, stdio });
}


async function run({generateDocs}: {generateDocs: boolean}) {

  if (generateDocs) {
    console.log('Executing TypeDoc...');
    await generateDocsFun({stdio: 'inherit'});
  }

  console.log('Compiling Handlebars with the docs data...');
  const readmeHbsContent = (await readFile(path.join(__dirname, 'README.hbs'))).toString();

  const template = Handlebars.compile(readmeHbsContent, {noEscape: true});

  // const expressions = ( Promise.all([
  // ]))

  const result = template({
    // TODO make them parallel. only one expression now so no problems.
    shadowProperties: await convertMdToMdTable(path.join(docsPath, 'interfaces', 'shadowi.md'))
  });

  await writeFile(path.join(packagePath, 'README.md'), result);

  console.log('README.md successfully generated!');
}


run({generateDocs: true});
