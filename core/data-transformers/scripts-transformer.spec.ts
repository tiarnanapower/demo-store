import { describe, expect, it, vi } from 'vitest';

import { scriptsTransformer } from './scripts-transformer';

type ScriptNode = Parameters<typeof scriptsTransformer>[0];

const buildScripts = (
  nodes: Array<{ entityId: number; scriptTag?: string; src?: string; typename?: string }>,
) => {
  const edges = nodes.map((n) => ({
    node: {
      __typename: n.typename ?? 'InlineScript',
      entityId: n.entityId,
      consentCategory: 'ESSENTIAL',
      visibility: 'ALL_PAGES',
      location: 'HEAD',
      integrityHashes: [],
      ...(n.scriptTag === undefined ? {} : { scriptTag: n.scriptTag }),
      ...(n.src === undefined ? {} : { src: n.src }),
    },
  }));

  // The fragment result type is generated from the GraphQL schema; building a faithful literal
  // here would add nothing to what these tests actually exercise.
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return { edges } as unknown as ScriptNode;
};

describe('scriptsTransformer', () => {
  it('keeps an ordinary inline script', () => {
    const result = scriptsTransformer(
      buildScripts([{ entityId: 1, scriptTag: '<script>console.log("hi");</script>' }]),
    );

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ id: 1, textContent: 'console.log("hi");' });
  });

  it('drops a script containing an unrendered Stencil block helper', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    // The real B2B Edition Stencil script that throws
    // "Private field '#if' must be declared in an enclosing class" on Catalyst.
    const stencilScript = `<script>
      var b2bHideBodyStyle = document.createElement('style');
      {{#if customer.id}}
        {{#contains page_type "account"}}
        b2bHideBodyStyle.innerHTML = 'body { display: none !important }';
        {{/contains}}
      {{/if}}
    </script>`;

    const result = scriptsTransformer(buildScripts([{ entityId: 42, scriptTag: stencilScript }]));

    expect(result).toHaveLength(0);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('42'));

    warn.mockRestore();
  });

  it('keeps a script that only mentions handlebars inside a string', () => {
    // A client-side Mustache template is valid JS and must not be dropped.
    const result = scriptsTransformer(
      buildScripts([{ entityId: 7, scriptTag: '<script>var t = "{{name}}";</script>' }]),
    );

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ id: 7 });
  });

  it('keeps src scripts untouched', () => {
    const result = scriptsTransformer(
      buildScripts([{ entityId: 9, typename: 'SrcScript', src: 'https://example.com/a.js' }]),
    );

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ id: 9, src: 'https://example.com/a.js' });
  });

  it('drops only the broken script and keeps the rest of the batch', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    const result = scriptsTransformer(
      buildScripts([
        { entityId: 1, scriptTag: '<script>console.log(1);</script>' },
        { entityId: 2, scriptTag: '<script>{{#if x}}a(){{/if}}</script>' },
        { entityId: 3, scriptTag: '<script>console.log(3);</script>' },
      ]),
    );

    expect(result.map((s) => s.id)).toEqual([1, 3]);

    warn.mockRestore();
  });
});
