export {};

declare module 'ws' {
  export interface Server {
    broadcast(msg: string): void;
  }
}
