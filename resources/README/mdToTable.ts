/* eslint-disable @typescript-eslint/prefer-regexp-exec */

import fse from 'fs-extra';


export async function convertMdToMdTable(path: string): Promise<string> {
  const fileContent = (await fse.readFile(path)).toString();

  // Match everything between ### and (___ or end of string)
  const matches = [...fileContent.matchAll(/###.+?(?=(___)|$)/sg)]; // s flag is . matches newline


  if (!matches.length) {
    throw new Error('No matches!');
  }

  // let i = 0;

  const properties: {
    name?: string;
    type?: string;
    /** undefined means it's required. */
    defaultVal?: string;
    description?: string;
  }[] = [];

  for (const match of matches) {
    // console.log(`Match #${i++}`);

    const content = match[0];
    // console.log(content);

    const name = content.match(/### (.+)?/)?.[1];
    const hasOptionalTag: boolean = !!content.match(/• `Optional`/);
    const defaultVal = content.match(/\*\*`default`\*\* (.+)/)?.[1] || (hasOptionalTag ? 'undefined' : undefined);
    const type = content.match(/• .+?: (.+)/)?.[1];
    // It's after the type and before the (default or end or EOS)
    //
    const description = content.match(/•.+?\n([\s\S]+?)(?=(\*\*`default`\*\*)|$)/)?.[1].trim();
    // console.log(name, defaultVal, hasOptionalTag, type);
    properties.push({
      name, defaultVal, type, description
    });
    // console.log();
  }

  let resultString =
  `| Property | Type | Default | Description
  | --- | --- | --- | ---\n`;

  function ensureWrappingBackticks(value: string): string {
    return (value[0] === '`' ? value : `\`${value}\``);
  }

  // The type already includes wrapping backticks
  for (const prop of properties) {
    // Remove existing backticks (that sometimes are weirdly placed) and wrap it all with backticks
    const type = ensureWrappingBackticks((prop.type ?? '?').replace(/`/g, ''));
    const defaultVal = prop.defaultVal ? `${ensureWrappingBackticks(prop.defaultVal)}` : '**required**';
    // Replace new lines with <br/> tag
    const description = prop.description ? prop.description.replace(/\n/g, '<br/>')
      : '-'; // '-' instead of a blank/undefined description
    // Ensuring backtick because my [x: string | number, y: string | number] wasn't backticked by some reason.
    resultString += `| **${prop.name}** | ${type} | ${defaultVal} | ${description}\n`;
  }

  return resultString;
}