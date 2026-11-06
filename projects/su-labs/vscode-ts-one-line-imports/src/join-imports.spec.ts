// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { joinImports } from './join-imports.ts';

describe('joinImports', () => {
  it('joins a multi-line import and drops its trailing comma', async () => {
    const code = "import {\n  a,\n  b,\n} from 'x';\n";
    expect(await joinImports(code, 'typescript', 'a.ts')).toBe("import { a, b } from 'x';\n");
  });

  it('joins every kind of import', async () => {
    const code = [
      "import type {\n  A,\n  B\n} from 'types';",
      "import def, {\n  c,\n  type D,\n} from 'mixed';",
      "import data from './data.json' with {\n  type: 'json'\n};",
      "import {\n} from 'empty';",
      '',
    ].join('\n');
    expect(await joinImports(code, 'typescript', 'a.ts')).toBe(
      [
        "import type { A, B } from 'types';",
        "import def, { c, type D } from 'mixed';",
        "import data from './data.json' with { type: 'json' };",
        "import {} from 'empty';",
        '',
      ].join('\n')
    );
  });

  it('leaves the rest of the code exactly as it is', async () => {
    const code = "import {\n  a,\n} from 'x';\nconst   messy = {\n      b:1 }\nexport {\n  messy,\n};\n";
    expect(await joinImports(code, 'typescript', 'a.ts')).toBe(
      "import { a } from 'x';\nconst   messy = {\n      b:1 }\nexport {\n  messy,\n};\n"
    );
  });

  it('keeps imports with comments as they are, so a // comment cannot swallow code', async () => {
    const code = "import {\n  a, // why\n  b,\n} from 'x';\nimport {\n  /* note */ c,\n} from 'y';\n";
    expect(await joinImports(code, 'typescript', 'a.ts')).toBeNull();
  });

  it('does not mistake // in a module path for a comment', async () => {
    const code = "import {\n  a,\n} from 'https://cdn.example/x.js';\n";
    expect(await joinImports(code, 'babel', 'a.js')).toBe("import { a } from 'https://cdn.example/x.js';\n");
  });

  it('joins imports with Windows line endings', async () => {
    const code = "import {\r\n  a,\r\n  b,\r\n} from 'x';\r\nconst y = 1;\r\n";
    expect(await joinImports(code, 'typescript', 'a.ts')).toBe("import { a, b } from 'x';\r\nconst y = 1;\r\n");
  });

  it('keeps the offsets right when several imports change', async () => {
    const code = "import {\n  a,\n} from 'a';\nimport b from 'b';\nimport {\n  c,\n  d,\n} from 'c';\n";
    expect(await joinImports(code, 'typescript', 'a.ts')).toBe(
      "import { a } from 'a';\nimport b from 'b';\nimport { c, d } from 'c';\n"
    );
  });

  it('returns null when every import is already on one line', async () => {
    expect(await joinImports("import { a } from 'x';\nimport 'side-effect';\n", 'typescript', 'a.ts')).toBeNull();
  });

  it('parses JSX in .tsx and .jsx files', async () => {
    const code = "import {\n  a,\n} from 'x';\nconst view = <div>{a}</div>;\n";
    expect(await joinImports(code, 'typescript', 'a.tsx')).toBe("import { a } from 'x';\nconst view = <div>{a}</div>;\n");
    expect(await joinImports(code, 'babel', 'a.jsx')).toBe("import { a } from 'x';\nconst view = <div>{a}</div>;\n");
  });

  it('works for unsaved documents, which have no file name', async () => {
    expect(await joinImports("import {\n  a,\n} from 'x';\n", 'typescript')).toBe("import { a } from 'x';\n");
  });

  it('throws on code it cannot parse, so the caller leaves the file alone', async () => {
    await expect(joinImports("import { a from 'x';\n", 'typescript', 'a.ts')).rejects.toThrow();
  });
});
