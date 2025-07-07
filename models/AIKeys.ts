// models/AIKeys.ts - Secure AI API Key Management
import mongoose, { Schema, Document } from 'mongoose';
import crypto from 'crypto';

export interface IAIKeys extends Document {
  provider: 'openai' | 'anthropic' | 'google';
  keyName: string;
  encryptedKey: string;
  iv: string;
  isActive: boolean;
  usageCount: number;
  lastUsed?: Date;
  dailyLimit?: number;
  monthlyLimit?: number;
  dailyUsage: number;
  monthlyUsage: number;
  costTracking: {
    totalCost: number;
    monthlyCost: number;
    dailyCost: number;
  };
  metadata: {
    description?: string;
    environment: 'development' | 'staging' | 'production';
    priority: number;
  };
  createdAt: Date;
  updatedAt: Date;
  setApiKey(apiKey: string): void;
  getApiKey(): string;
  incrementUsage(cost?: number): void;
  resetDailyUsage(): void;
  resetMonthlyUsage(): void;
  isWithinLimits(): boolean;
}

const AIKeysSchema = new Schema<IAIKeys>({
  provider: {
    type: String,
    enum: ['openai', 'anthropic', 'google'],
    required: true,
  },
  keyName: {
    type: String,
    required: true,
    unique: true,
  },
  encryptedKey: {
    type: String,
    required: true,
  },
  iv: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  usageCount: {
    type: Number,
    default: 0,
  },
  lastUsed: Date,
  dailyLimit: Number,
  monthlyLimit: Number,
  dailyUsage: {
    type: Number,
    default: 0,
  },
  monthlyUsage: {
    type: Number,
    default: 0,
  },
  costTracking: {
    totalCost: {
      type: Number,
      default: 0,
    },
    monthlyCost: {
      type: Number,
      default: 0,
    },
    dailyCost: {
      type: Number,
      default: 0,
    },
  },
  metadata: {
    description: String,
    environment: {
      type: String,
      enum: ['development', 'staging', 'production'],
      default: 'production',
    },
    priority: {
      type: Number,
      default: 1,
    },
  },
}, {
  timestamps: true,
});

// Encryption methods
AIKeysSchema.methods.setApiKey = function(apiKey: string) {
  const algorithm = 'aes-256-gcm';
  const secretKey = process.env.ENCRYPTION_KEY || 'default-secret-key-change-in-production';
  const iv = crypto.randomBytes(16);
  
  const cipher = crypto.createCipher(algorithm, secretKey);
  let encrypted = cipher.update(apiKey, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  this.encryptedKey = encrypted;
  this.iv = iv.toString('hex');
};

AIKeysSchema.methods.getApiKey = function(): string {
  const algorithm = 'aes-256-gcm';
  const secretKey = process.env.ENCRYPTION_KEY || 'default-secret-key-change-in-production';
  
  const decipher = crypto.createDecipher(algorithm, secretKey);
  let decrypted = decipher.update(this.encryptedKey, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
};

AIKeysSchema.methods.incrementUsage = function(cost: number = 0) {
  this.usageCount += 1;
  this.dailyUsage += 1;
  this.monthlyUsage += 1;
  this.lastUsed = new Date();
  
  if (cost > 0) {
    this.costTracking.totalCost += cost;
    this.costTracking.dailyCost += cost;
    this.costTracking.monthlyCost += cost;
  }
};

AIKeysSchema.methods.resetDailyUsage = function() {
  this.dailyUsage = 0;
  this.costTracking.dailyCost = 0;
};

AIKeysSchema.methods.resetMonthlyUsage = function() {
  this.monthlyUsage = 0;
  this.costTracking.monthlyCost = 0;
};

AIKeysSchema.methods.isWithinLimits = function(): boolean {
  if (this.dailyLimit && this.dailyUsage >= this.dailyLimit) {
    return false;
  }
  if (this.monthlyLimit && this.monthlyUsage >= this.monthlyLimit) {
    return false;
  }
  return true;
};

// Indexes
AIKeysSchema.index({ provider: 1, isActive: 1 });
AIKeysSchema.index({ keyName: 1 }, { unique: true });
AIKeysSchema.index({ lastUsed: -1 });

export default mongoose.models.AIKeys || mongoose.model<IAIKeys>('AIKeys', AIKeysSchema);
