// Jest setup file for Mintoons testing environment
import { jest } from '@jest/globals';
import '@testing-library/jest-dom';

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.NEXTAUTH_SECRET = 'test-secret-key';
process.env.NEXTAUTH_URL = 'http://localhost:3000';
process.env.MONGODB_URI = 'mongodb://localhost:27017/mintoons-test';
process.env.SMTP_HOST = 'localhost';
process.env.SMTP_PORT = '1025';
process.env.SMTP_USER = 'test@example.com';
process.env.SMTP_PASS = 'testpassword';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn()
  }),
  usePathname: () => '/test-path',
  useSearchParams: () => new URLSearchParams(),
  redirect: jest.fn()
}));

// Mock Next.js headers
jest.mock('next/headers', () => ({
  headers: () => new Map([
    ['user-agent', 'test-agent'],
    ['x-forwarded-for', '127.0.0.1']
  ]),
  cookies: () => ({
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn()
  })
}));

// Mock Next.js image component
jest.mock('next/image', () => {
  const MockedImage = ({ src, alt, ...props }) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} {...props} />;
  };
  MockedImage.displayName = 'MockedImage';
  return MockedImage;
});

// Mock Next.js link component
jest.mock('next/link', () => {
  const MockedLink = ({ children, href, ...props }) => {
    return <a href={href} {...props}>{children}</a>;
  };
  MockedLink.displayName = 'MockedLink';
  return MockedLink;
});

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn()
}));

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn()
}));

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn()
  }))
});

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};
Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock
});

// Mock URL.createObjectURL
Object.defineProperty(URL, 'createObjectURL', {
  writable: true,
  value: jest.fn().mockReturnValue('blob:mock-url')
});

Object.defineProperty(URL, 'revokeObjectURL', {
  writable: true,
  value: jest.fn()
});

// Mock File and FileReader
global.File = jest.fn().mockImplementation((chunks, filename, options) => ({
  name: filename,
  size: chunks.reduce((acc, chunk) => acc + chunk.length, 0),
  type: options?.type || 'text/plain',
  arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(8)),
  text: jest.fn().mockResolvedValue(chunks.join('')),
  stream: jest.fn()
}));

global.FileReader = jest.fn().mockImplementation(() => ({
  readAsText: jest.fn(),
  readAsDataURL: jest.fn(),
  readAsArrayBuffer: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  onload: null,
  onerror: null,
  result: null
}));

// Mock Clipboard API
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: jest.fn().mockResolvedValue(undefined),
    readText: jest.fn().mockResolvedValue('mocked clipboard text')
  }
});

// Mock geolocation API
Object.defineProperty(navigator, 'geolocation', {
  value: {
    getCurrentPosition: jest.fn().mockImplementation((success) => {
      success({
        coords: {
          latitude: 40.7128,
          longitude: -74.0060,
          accuracy: 100
        }
      });
    }),
    watchPosition: jest.fn(),
    clearWatch: jest.fn()
  }
});

// Mock Web Speech API
global.SpeechRecognition = jest.fn().mockImplementation(() => ({
  start: jest.fn(),
  stop: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  continuous: false,
  interimResults: false,
  lang: 'en-US'
}));

global.webkitSpeechRecognition = global.SpeechRecognition;

// Mock SpeechSynthesis API
global.speechSynthesis = {
  speak: jest.fn(),
  cancel: jest.fn(),
  pause: jest.fn(),
  resume: jest.fn(),
  getVoices: jest.fn().mockReturnValue([
    { name: 'Test Voice', lang: 'en-US', default: true }
  ]),
  onvoiceschanged: null
};

global.SpeechSynthesisUtterance = jest.fn().mockImplementation((text) => ({
  text,
  voice: null,
  volume: 1,
  rate: 1,
  pitch: 1,
  onstart: null,
  onend: null,
  onerror: null
}));

// Mock PDF generation libraries
jest.mock('jspdf', () => {
  return {
    jsPDF: jest.fn().mockImplementation(() => ({
      text: jest.fn(),
      setFontSize: jest.fn(),
      setFont: jest.fn(),
      addPage: jest.fn(),
      save: jest.fn(),
      output: jest.fn().mockReturnValue('mock-pdf-content')
    }))
  };
});

// Mock document generation libraries
jest.mock('docx', () => ({
  Document: jest.fn(),
  Paragraph: jest.fn(),
  TextRun: jest.fn(),
  Packer: {
    toBlob: jest.fn().mockResolvedValue(new Blob(['mock docx content']))
  }
}));

// Mock chart libraries
jest.mock('chart.js', () => ({
  Chart: jest.fn().mockImplementation(() => ({
    destroy: jest.fn(),
    update: jest.fn(),
    render: jest.fn()
  })),
  registerables: []
}));

// Mock audio context for text-to-speech
global.AudioContext = jest.fn().mockImplementation(() => ({
  createOscillator: jest.fn().mockReturnValue({
    connect: jest.fn(),
    start: jest.fn(),
    stop: jest.fn(),
    frequency: { value: 440 }
  }),
  createGain: jest.fn().mockReturnValue({
    connect: jest.fn(),
    gain: { value: 1 }
  }),
  destination: {},
  close: jest.fn()
}));

global.webkitAudioContext = global.AudioContext;

// Mock MongoDB for testing
jest.mock('mongodb', () => ({
  MongoClient: {
    connect: jest.fn().mockResolvedValue({
      db: jest.fn().mockReturnValue({
        collection: jest.fn().mockReturnValue({
          find: jest.fn().mockReturnValue({
            toArray: jest.fn().mockResolvedValue([])
          }),
          findOne: jest.fn().mockResolvedValue(null),
          insertOne: jest.fn().mockResolvedValue({ insertedId: 'mock-id' }),
          updateOne: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
          deleteOne: jest.fn().mockResolvedValue({ deletedCount: 1 })
        })
      }),
      close: jest.fn()
    })
  }
});

// Mock Mongoose
jest.mock('mongoose', () => ({
  connect: jest.fn().mockResolvedValue({}),
  connection: {
    readyState: 1,
    on: jest.fn(),
    once: jest.fn()
  },
  Schema: jest.fn().mockImplementation(() => ({
    add: jest.fn(),
    index: jest.fn(),
    pre: jest.fn(),
    post: jest.fn(),
    virtual: jest.fn().mockReturnValue({
      get: jest.fn()
    }),
    methods: {},
    statics: {}
  })),
  model: jest.fn(),
  Types: {
    ObjectId: jest.fn().mockImplementation((id) => ({
      toString: () => id || 'mock-object-id',
      equals: jest.fn()
    }))
  }
}));

// Mock bcryptjs
jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashed-password'),
  compare: jest.fn().mockResolvedValue(true),
  genSalt: jest.fn().mockResolvedValue('salt')
}));

// Mock jsonwebtoken
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('mock-jwt-token'),
  verify: jest.fn().mockReturnValue({ userId: 'mock-user-id' }),
  decode: jest.fn().mockReturnValue({ userId: 'mock-user-id' })
}));

// Mock crypto for password generation
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: jest.fn().mockReturnValue('mock-uuid'),
    randomBytes: jest.fn().mockReturnValue(Buffer.from('mock-random-bytes')),
    getRandomValues: jest.fn().mockImplementation((array) => {
      for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
      return array;
    })
  }
});

// Mock fetch globally
global.fetch = jest.fn();

// Set up console methods for testing
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeEach(() => {
  // Reset all mocks before each test
  jest.clearAllMocks();
  
  // Clear localStorage and sessionStorage
  localStorageMock.clear();
  sessionStorageMock.clear();
  
  // Reset fetch mock
  global.fetch.mockReset();
  
  // Suppress console errors/warnings unless testing error handling
  console.error = jest.fn();
  console.warn = jest.fn();
});

afterEach(() => {
  // Restore console methods
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});

// Global test utilities
global.testUtils = {
  // Create mock user session
  createMockSession: (role = 'student', overrides = {}) => ({
    data: {
      user: {
        id: 'mock-user-id',
        name: 'Test User',
        email: 'test@example.com',
        role,
        ...overrides
      }
    },
    status: 'authenticated'
  }),

  // Create mock story data
  createMockStory: (overrides = {}) => ({
    _id: 'mock-story-id',
    title: 'Test Story',
    content: 'This is a test story content.',
    author: {
      _id: 'mock-author-id',
      name: 'Test Author',
      role: 'student'
    },
    isPublished: true,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    genre: 'adventure',
    targetAge: '8-12',
    likes: [],
    views: 0,
    ...overrides
  }),

  // Create mock comment data
  createMockComment: (overrides = {}) => ({
    _id: 'mock-comment-id',
    content: 'This is a test comment.',
    author: {
      _id: 'mock-mentor-id',
      name: 'Test Mentor',
      role: 'mentor'
    },
    createdAt: new Date('2024-01-15'),
    likes: [],
    replies: [],
    ...overrides
  }),

  // Create mock achievement data
  createMockAchievement: (overrides = {}) => ({
    id: 'mock-achievement',
    title: 'Test Achievement',
    description: 'This is a test achievement.',
    category: 'writing',
    rarity: 'common',
    icon: 'Trophy',
    xpReward: 100,
    isUnlocked: true,
    unlockedAt: new Date('2024-01-15'),
    ...overrides
  }),

  // Wait for async operations
  waitFor: (ms = 0) => new Promise(resolve => setTimeout(resolve, ms)),

  // Mock API response
  mockApiResponse: (data, status = 200) => {
    global.fetch.mockResolvedValueOnce({
      ok: status >= 200 && status < 300,
      status,
      json: async () => data,
      text: async () => JSON.stringify(data)
    });
  },

  // Mock API error
  mockApiError: (message = 'API Error', status = 500) => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status,
      json: async () => ({ error: message }),
      text: async () => JSON.stringify({ error: message })
    });
  }
};

// Export for use in tests
export default global.testUtils;