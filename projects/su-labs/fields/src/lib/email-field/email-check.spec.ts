import { describe, expect, it } from 'vitest';
import { suCheckEmail } from './email-check';

describe('suCheckEmail', () => {
  it('accepts a normal address, trimmed', () => {
    expect(suCheckEmail('  ana@example.org ')).toEqual({ valid: true, problem: null, suggestion: null });
    expect(suCheckEmail('josé.núñez@correo.es').valid).toBe(true);
  });

  it('finds the first problem', () => {
    expect(suCheckEmail('').problem).toBe('empty');
    expect(suCheckEmail('ana @example.org').problem).toBe('spaces');
    expect(suCheckEmail('ana.example.org').problem).toBe('at');
    expect(suCheckEmail('ana@@example.org').problem).toBe('at');
    expect(suCheckEmail('@example.org').problem).toBe('name');
    expect(suCheckEmail('ana@').problem).toBe('domain');
    expect(suCheckEmail('ana@example').problem).toBe('dot');
    expect(suCheckEmail('ana@example..org').problem).toBe('dot');
    expect(suCheckEmail('ana@example.o').problem).toBe('ending');
    expect(suCheckEmail('ana@example.c0m').problem).toBe('ending');
  });

  it('suggests a common domain for a likely typo', () => {
    expect(suCheckEmail('jo@gmial.com')).toEqual({ valid: true, problem: null, suggestion: 'jo@gmail.com' });
    expect(suCheckEmail('jo@hotmal.com').suggestion).toBe('jo@hotmail.com');
    expect(suCheckEmail('jo@gmailcom')).toEqual({ valid: false, problem: 'dot', suggestion: 'jo@gmail.com' });
    expect(suCheckEmail('Jo@GMAIL.CON').suggestion).toBe('Jo@gmail.com');
  });

  it('suggests nothing for a common domain, a distant one, or a broken address', () => {
    expect(suCheckEmail('jo@gmail.com').suggestion).toBeNull();
    expect(suCheckEmail('jo@my-company.com').suggestion).toBeNull();
    expect(suCheckEmail('@gmial.com').suggestion).toBeNull();
  });

  it('uses the domains given', () => {
    expect(suCheckEmail('jo@acme.cmo', ['acme.com']).suggestion).toBe('jo@acme.com');
  });
});
