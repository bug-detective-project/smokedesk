import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { portsProblems } from '@bug-detective/catalog/contract';
import { describe, expect, it } from 'vitest';

const root = join(import.meta.dirname, '..');
const read = (file: string): string => readFileSync(join(root, file), 'utf8');

describe('the services of the project', () => {
  it('are declared here exactly as in services.json of main, which its CI uses', () => {
    const declared = JSON.parse(read('package.json')).bugDetective.project.services;
    // main is a branch of the same repository; in a clone without a local main, origin/main.
    const show = (ref: string): string => execFileSync('git', ['show', `${ref}:services.json`], { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
    let onMain: string;
    try {
      onMain = show('main');
    } catch {
      onMain = show('origin/main');
    }

    expect(JSON.parse(onMain)).toEqual(declared);
  });
});

describe('the ports of the project', () => {
  it('are a valid declaration, which does not repeat a variable of the services', () => {
    const { ports, services } = JSON.parse(read('package.json')).bugDetective.project;

    expect(portsProblems({ ports, services })).toEqual([]);
    expect(Object.keys(ports)).toEqual(['client', 'api', 'audit']);
  });
});

describe('the QA CLI', () => {
  it('resets both databases before Gate 2', () => {
    expect(read('run.ts')).toContain("['run', 'db:reset']");
  });

  it('refuses to run without the addresses of the databases, in the language asked', () => {
    const run = (lang: string): string => {
      try {
        execFileSync(process.execPath, ['run.ts', '--ticket', '1', '--workspace', '.', '--package', 'tickets', '--lang', lang], {
          cwd: root,
          encoding: 'utf8',
          env: { PATH: process.env.PATH },
          stdio: ['ignore', 'pipe', 'pipe'],
        });
        return 'no error';
      } catch (error) {
        return `${(error as { status: number }).status} ${(error as { stderr: string }).stderr}`;
      }
    };

    expect(run('en')).toMatch(/^2 NOTES_DATABASE_URL, AUDIT_DATABASE_URL, MYSQL_HOST, MYSQL_TCP_PORT are not set/);
    expect(run('pt')).toMatch(/^2 NOTES_DATABASE_URL, AUDIT_DATABASE_URL, MYSQL_HOST, MYSQL_TCP_PORT não estão definidas/);
  });
});
