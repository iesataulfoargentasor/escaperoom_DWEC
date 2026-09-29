export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };
export type Test = { args: Json[]; expected: Json };
export type Room = {
  id: string; nombre: string; concepto: string; historia: string; enunciado: string;
  plantilla: string; fnName: string; pruebas: Test[]; pista: string; clave: string;
};
export type Result = { pass: boolean; got: string; error?: string };
export type Progress = {
  version: 2; current: number; codes: Record<string, string>; solved: string[];
  hints: string[]; attempts: Record<string, number>; startedAt: number | null; finishedAt: number | null;
};
