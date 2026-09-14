// biome-ignore lint: drizzle-orm ships only .d.cts, we need this shim
declare module 'drizzle-orm' {
  export function eq(...args: any[]): any;
  export function and(...args: any[]): any;
  export function desc(...args: any[]): any;
  export function sql(...args: any[]): any;
  export const like: any;
  export const ilike: any;
  export const or: any;
  export const inArray: any;
}

declare module 'drizzle-orm/neon-http' {
  export function neon(url: string): any;
  export function drizzle(...args: any[]): any;
}

declare module 'drizzle-orm/pg-core' {
  export function pgTable(...args: any[]): any;
  export function serial(...args: any[]): any;
  export function varchar(...args: any[]): any;
  export function integer(...args: any[]): any;
  export function decimal(...args: any[]): any;
  export function timestamp(...args: any[]): any;
  export function text(...args: any[]): any;
  export function pgEnum(...args: any[]): any;
}
