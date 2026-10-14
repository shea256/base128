#!/usr/bin/env node
/** Dependency-free, streaming Base128 CLI. */
import {createReadStream, createWriteStream} from 'node:fs';
import {readFile, rename, unlink} from 'node:fs/promises';
import {randomUUID} from 'node:crypto';
import {once} from 'node:events';
import {finished} from 'node:stream/promises';
import {TextDecoder} from 'node:util';
import {resolve, dirname, basename, join} from 'node:path';
import {
  BinaryEncoder, BinaryDecoder, createAlphabet, encodeInteger, decodeInteger,
} from '../../js/dist/index.js';

const HELP=`Base128 CLI — no prefix, no padding character, exact Unicode alphabet

Usage:
  base128 encode [input-file] [-o output-file] [--alphabet-file FILE]
  base128 decode [input-file] [-o output-file] [--alphabet-file FILE]
  base128 integer encode DECIMAL [--alphabet-file FILE]
  base128 integer decode ENCODED [--alphabet-file FILE]
  base128 --help

If input-file is omitted, read stdin. If -o is omitted, write stdout.
Binary output uses raw bytes; encoded output is UTF-8 without a trailing newline.
--alphabet-file contains exactly 128 Unicode code points (no terminating newline).
Text: printf 'hello' | base128 encode
Integer: base128 integer encode 1000
File: base128 encode image.png -o image.b128
Decode: base128 decode image.b128 -o restored.png
`;

function parseOptions(args) {
  const positional=[];
  let outputPath;
  let alphabetFile;
  for (let i=0;i<args.length;i++) {
    const arg=args[i];
    if (arg==='-o'||arg==='--output') {
      if (outputPath || !args[i+1]) throw new Error('Expected one output path after -o');
      outputPath=args[++i];
    } else if (arg==='--alphabet-file') {
      if (alphabetFile || !args[i+1]) throw new Error('Expected one path after --alphabet-file');
      alphabetFile=args[++i];
    } else if (arg==='--help'||arg==='-h') {
      process.stdout.write(HELP);
      return null;
    } else if (arg.startsWith('-') && arg!=='-') {
      throw new Error(`Unknown option: ${arg}`);
    } else {
      positional.push(arg);
    }
  }
  return {positional,outputPath,alphabetFile};
}

async function streamWrite(stream,data) {
  if (data.length === 0) return;
  if (!stream.write(data)) await once(stream,'drain');
}

async function withOutput(outputPath,action) {
  if (!outputPath || outputPath==='-') {
    await action(process.stdout);
    return;
  }
  // Transactional for on-disk output: invalid decode never overwrites the target.
  const target=resolve(outputPath);
  const temporary=join(dirname(target),`.${basename(target)}.${process.pid}.${randomUUID()}.tmp`);
  const out=createWriteStream(temporary,{flags:'wx'});
  try {
    await action(out);
    out.end();
    await finished(out);
    await rename(temporary,target);
  } catch(err) {
    out.destroy();
    try { await unlink(temporary); } catch {}
    throw err;
  }
}

async function binaryCommand(kind,inputPath,outputPath,alphabet) {
  const input= inputPath && inputPath!=='-' ? createReadStream(inputPath) : process.stdin;
  await withOutput(outputPath,async output=>{
    if (kind==='encode') {
      const encoder = new BinaryEncoder({alphabet});
      for await (const bytes of input) {
        await streamWrite(output,Buffer.from(encoder.write(bytes),'utf8'));
      }
      await streamWrite(output,Buffer.from(encoder.finish(),'utf8'));
    } else {
      const decoder = new BinaryDecoder({alphabet});
      const utf8 = new TextDecoder('utf-8',{fatal:true});
      for await (const bytes of input) {
        const text=utf8.decode(bytes,{stream:true});
        await streamWrite(output,decoder.write(text));
      }
      await streamWrite(output,decoder.write(utf8.decode()));
      decoder.finish();
    }
  });
}

async function main(argv) {
  if (!argv.length || argv[0]==='--help'||argv[0]==='-h') {
    process.stdout.write(HELP); return;
  }
  const command=argv[0];
  let subcommand=null;
  const args=argv.slice(1);
  if (command==='integer') {
    subcommand=args.shift();
    if (!['encode','decode'].includes(subcommand)) throw new Error('Expected integer encode or integer decode');
  } else if (!['encode','decode'].includes(command)) {
    throw new Error(`Unknown command: ${command}`);
  }
  const options=parseOptions(args);
  if (!options) return;
  let alphabet;
  if (options.alphabetFile) {
    alphabet=createAlphabet(await readFile(options.alphabetFile,'utf8'));
  }
  if (command==='integer') {
    if (options.positional.length!==1) throw new Error('Expected exactly one integer argument');
    const value=options.positional[0];
    const output=subcommand==='encode'
      ? encodeInteger(BigInt(value),{alphabet})
      : String(decodeInteger(value,{alphabet}));
    await withOutput(options.outputPath,async sink=>streamWrite(sink,Buffer.from(output,'utf8')));
  } else {
    if (options.positional.length>1) throw new Error('Expected at most one input file');
    await binaryCommand(command, options.positional[0], options.outputPath, alphabet);
  }
}

main(process.argv.slice(2)).catch(error=>{
  process.stderr.write(`base128: ${error.message}\n`);
  process.exitCode=1;
});
