// types/global.d.ts - Global TypeScript Declarations
import { MongoClient } from 'mongodb';
import mongoose from 'mongoose';

declare global {
  // Global MongoDB connection for development
  var _mongo: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };

  // Window extensions for browser environment
  interface Window {
    // Claude AI completion API
    claude: {
      complete: (prompt: string) => Promise<string>;
    };
    
    // File system API for artifacts
    fs: {
      readFile: (filename: string, options?: { encoding?: string }) => Promise<Uint8Array | string>;
    };
    
    // Analytics tracking
    gtag?: (command: string, targetId: string, config?: any) => void;
    
    // Stripe for payments
    Stripe?: any;
  }

  // Environment variables
  namespace NodeJS {
    interface ProcessEnv {
      // Database
      MONGODB_URI: string;
      DATABASE_URL: string;
      
      // Authentication
      NEXTAUTH_SECRET: string;
      NEXTAUTH_URL: string;
      
      // AI Providers
      OPENAI_API_KEY: string;
      ANTHROPIC_API_KEY: string;
      GOOGLE_API_KEY: string;
      
      // Email
      SENDGRID_API_KEY?: string;
      MAILGUN_API_KEY?: string;
      MAILGUN_DOMAIN?: string;
      
      // Security
      ENCRYPTION_KEY: string;
      JWT_SECRET: string;
      
      // File Storage
      GRIDFS_BUCKET_NAME?: string;
      UPLOAD_MAX_SIZE?: string;
      
      // Rate Limiting
      REDIS_URL?: string;
      
      // Analytics
      GOOGLE_ANALYTICS_ID?: string;
      
      // Monitoring
      SENTRY_DSN?: string;
      
      // Payment
      STRIPE_SECRET_KEY?: string;
      STRIPE_PUBLISHABLE_KEY?: string;
      STRIPE_WEBHOOK_SECRET?: string;
      
      // Development
      NODE_ENV: 'development' | 'production' | 'test';
      PORT?: string;
    }
  }
}

// Module declarations for packages without types
declare module 'gridfs-stream' {
  import { Db } from 'mongodb';
  import mongoose from 'mongoose';
  
  interface GridFSBucket {
    openUploadStream(filename: string, options?: any): any;
    openDownloadStream(id: any): any;
    delete(id: any): Promise<void>;
    find(filter?: any): any;
  }
  
  function Grid(db: Db, mongo: typeof mongoose): GridFSBucket;
  export = Grid;
}

declare module 'mammoth' {
  interface ConvertToHtmlResult {
    value: string;
    messages: any[];
  }
  
  export function convertToHtml(input: { buffer: Buffer }): Promise<ConvertToHtmlResult>;
}

declare module 'papaparse' {
  interface ParseResult<T> {
    data: T[];
    errors: any[];
    meta: {
      delimiter: string;
      linebreak: string;
      aborted: boolean;
      truncated: boolean;
      cursor: number;
      fields?: string[];
    };
  }

  interface ParseConfig {
    delimiter?: string;
    newline?: string;
    quoteChar?: string;
    escapeChar?: string;
    header?: boolean;
    transformHeader?: (header: string) => string;
    dynamicTyping?: boolean;
    preview?: number;
    encoding?: string;
    worker?: boolean;
    comments?: boolean | string;
    step?: (results: ParseResult<any>, parser: any) => void;
    complete?: (results: ParseResult<any>) => void;
    error?: (error: any) => void;
    download?: boolean;
    downloadRequestHeaders?: { [key: string]: string };
    skipEmptyLines?: boolean | 'greedy';
    chunk?: (results: ParseResult<any>, parser: any) => void;
    fastMode?: boolean;
    beforeFirstChunk?: (chunk: string) => string | void;
    withCredentials?: boolean;
    transform?: (value: string, field: string | number) => any;
    delimitersToGuess?: string[];
  }

  export function parse<T = any>(input: string | File, config?: ParseConfig): ParseResult<T>;
}
