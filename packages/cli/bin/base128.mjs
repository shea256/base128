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
  DEFAULT_ALPHABET, MATH_ALPHABET,
  BinaryEncoder, BinaryDecoder, createAlphabet, encode, decode, encodeInteger, decodeInteger, wrap, unwrap,
} from '../../js/dist/index.js';

const HELP=`Base128 CLI — optional middle-dot envelopes, exact Unicode alphabet

Usage:
  base128 encode [input-file] [-o output-file] [--alphabet-file FILE]
  base128 decode [input-file] [-o output-file] [--alphabet-file FILE]
  base128 integer encode DECIMAL [--alphabet-file FILE]
  base128 integer decode ENCODED [--alphabet-file FILE]
  base128 --help

If input-file is omitted, read stdin. If -o is omitted, write stdout.
Binary output uses raw bytes; encoded output is UTF-8 without a trailing newline.
--prefix adds/requires b128·<header>· before the payload.
--checksum adds/requires a middle dot and a five-symbol CRC-32 suffix.
Combine --prefix and --checksum for both. Wrapped file operations buffer input.
A prefix supplies its alphabet unless --alphabet or --alphabet-file explicitly constrains it.
--alphabet compact|math selects a built-in preset (default: compact).
--accept-aliases accepts both built-in symbol forms on decode, including mixed input.
--alphabet and --alphabet-file cannot be combined.
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
  let preset;
  let acceptAliases=false;
  let prefix=false, checksum=false;
  for (let i=0;i<args.length;i++) {
    const arg=args[i];
    if (arg==='-o'||arg==='--output') {
      if (outputPath || !args[i+1]) throw new Error('Expected one output path after -o');
      outputPath=args[++i];
    } else if (arg==='--alphabet-file') {
      if (alphabetFile || !args[i+1]) throw new Error('Expected one path after --alphabet-file');
      alphabetFile=args[++i];
    } else if (arg==='--alphabet') {
      if (preset || !['compact','math'].includes(args[i+1])) throw new Error('Expected compact or math after --alphabet');
      preset=args[++i];
    } else if (arg==='--prefix') {
      prefix=true;
    } else if (arg==='--checksum') {
      checksum=true;
    } else if (arg==='--accept-aliases') {
      acceptAliases=true;
    } else if (arg==='--help'||arg==='-h') {
      process.stdout.write(HELP);
      return null;
    } else if (arg.startsWith('-') && arg!=='-') {
      throw new Error(`Unknown option: ${arg}`);
    } else {
      positional.push(arg);
    }
  }
  if (preset && alphabetFile) throw new Error('--alphabet and --alphabet-file cannot be combined');
  return {positional,outputPath,alphabetFile,preset,acceptAliases,prefix,checksum};
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

async function binaryCommand(kind,inputPath,outputPath,alphabet,acceptAliases,options) {
  const input= inputPath && inputPath!=='-' ? createReadStream(inputPath) : process.stdin;
  await withOutput(outputPath,async output=>{
    if (options.prefix || options.checksum) {
      const chunks=[];
      for await (const chunk of input) chunks.push(chunk);
      const bytes=Buffer.concat(chunks);
      const envelopeOptions={mode:'binary',prefix:options.prefix,checksum:options.checksum,acceptAliases};
      if (kind==='encode') {
        const wrapped=wrap(encode(bytes,{alphabet}),{...envelopeOptions,alphabet});
        await streamWrite(output,Buffer.from(wrapped,'utf8'));
      } else {
        const text=new TextDecoder('utf-8',{fatal:true}).decode(bytes);
        const selected=options.preset || options.alphabetFile ? alphabet : undefined;
        const result=unwrap(text,{...envelopeOptions,alphabet:selected});
        await streamWrite(output,decode(result.payload,{alphabet:result.alphabet,acceptAliases}));
      }
      return;
    }
    if (kind==='encode') {
      const encoder = new BinaryEncoder({alphabet});
      for await (const bytes of input) {
        await streamWrite(output,Buffer.from(encoder.write(bytes),'utf8'));
      }
      await streamWrite(output,Buffer.from(encoder.finish(),'utf8'));
    } else {
      const decoder = new BinaryDecoder({alphabet,acceptAliases});
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
  const {acceptAliases}=options;
  if (acceptAliases && (subcommand || command)!=='decode') throw new Error('--accept-aliases is only valid for decode');
  let alphabet=options.preset==='math' ? MATH_ALPHABET : DEFAULT_ALPHABET;
  if (options.alphabetFile) {
    alphabet=createAlphabet(await readFile(options.alphabetFile,'utf8'));
  }
  if (command==='integer') {
    if (options.positional.length!==1) throw new Error('Expected exactly one integer argument');
    const value=options.positional[0];
    const envelopeOptions={mode:'integer',prefix:options.prefix,checksum:options.checksum,acceptAliases};
    let output;
    if (subcommand==='encode') {
      output=encodeInteger(BigInt(value),{alphabet});
      if (options.prefix || options.checksum) output=wrap(output,{...envelopeOptions,alphabet});
    } else {
      const selected=options.preset || options.alphabetFile ? alphabet : undefined;
      const result=options.prefix || options.checksum ? unwrap(value,{...envelopeOptions,alphabet:selected}) : {payload:value,alphabet};
      output=String(decodeInteger(result.payload,{alphabet:result.alphabet,acceptAliases}));
    }
    await withOutput(options.outputPath,async sink=>streamWrite(sink,Buffer.from(output,'utf8')));
  } else {
    if (options.positional.length>1) throw new Error('Expected at most one input file');
    await binaryCommand(command, options.positional[0], options.outputPath, alphabet, acceptAliases, options);
  }
}

main(process.argv.slice(2)).catch(error=>{
  process.stderr.write(`base128: ${error.message}\n`);
  process.exitCode=1;
});
