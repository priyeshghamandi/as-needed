export {};

declare global {
  interface Window {
    omelette?: {
      writeFile(path: string, data: string): Promise<void>;
    };
  }
}
