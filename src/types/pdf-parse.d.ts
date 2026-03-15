declare module 'pdf-parse' {
  export class PDFParse {
    constructor(options: { data: Buffer });
    getText(): Promise<{ text: string }>;
    getInfo(): Promise<{ info: { Title?: string; Author?: string }; total: number }>;
    destroy(): Promise<void>;
  }
}
