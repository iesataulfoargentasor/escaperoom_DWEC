import { describe, expect, it } from 'vitest';
import { fresh, load, parseProgress, save, validate } from '../src/persistence';
import { equal } from '../src/engine/compare';

describe('Progreso validado', () => {
  it('round-trip conserva códigos y progreso', () => {
    const p = fresh(); p.codes.sala1 = 'function energiaMedia() { return 1; }';
    p.startedAt = Date.now(); p.solved = ['sala1']; p.current = 1;
    expect(parseProgress(JSON.stringify(p))).toEqual({ ...p, attempts: Object.fromEntries(Array.from({length:6}, (_, i) => [`sala${i+1}`,0])) });
  });
  it.each([null, {}, {version:7}, {...fresh(), solved:['sala2']}, {...fresh(), current:99}, {...fresh(), codes:{sala1:3}}, {...fresh(), attempts:{sala1:-1}}, {...fresh(), hints:['unknown']}, {...fresh(), startedAt:-4}, {...fresh(), finishedAt:Date.now()}])('rechaza datos inválidos %#', value => {
    expect(() => validate(value)).toThrow();
  });
  it('limita el tamaño antes de interpretar JSON', () => expect(() => parseProgress(' '.repeat(1000001))).toThrow('grande'));
  it('soporta localStorage bloqueado', () => {
    expect(save({setItem(){throw new Error();}},fresh())).toBe(false);
    expect(load({getItem(){throw new Error();}}).notice).not.toBe('');
  });
  it('recupera borradores antiguos sin afirmar que pasan las pruebas nuevas', () => {
    const result = load({getItem(key){return key.endsWith('v1') ? JSON.stringify({codigos:{sala1:'mi código'},resueltas:['sala1']}) : null;}});
    expect(result.progress.codes.sala1).toBe('mi código'); expect(result.progress.solved).toEqual([]);
  });
  it('guardado corrupto produce aviso y sesión válida', () => expect(load({getItem(){return '{';}}).progress).toEqual(fresh()));
});
describe('Comparación de valores', () => {
  it('no convierte tipos ni ignora el orden de arrays', () => {
    expect(equal(1,'1')).toBe(false); expect(equal([1,2],[2,1])).toBe(false);
    expect(equal({a:1,b:[2]}, {b:[2],a:1})).toBe(true);
    expect(equal(null,{})).toBe(false); expect(equal([],{})).toBe(false);
    expect(equal(1,1.00000000001)).toBe(false);
  });
});
