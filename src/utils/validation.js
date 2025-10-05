const Joi = require('joi');

// Environment validation schema
const envSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().port().default(3000),
  SUPABASE_URL: Joi.string().uri().required(),
  SUPABASE_ANON_KEY: Joi.string().required(),
  SUPABASE_SERVICE_ROLE_KEY: Joi.string().optional(),
  JWT_SECRET: Joi.string().min(32).required(),
  JWT_EXPIRES_IN: Joi.string().default('24h'),
  CORS_ORIGIN: Joi.string().default('http://localhost:3000'),
  RATE_LIMIT_WINDOW_MS: Joi.number().default(900000),
  RATE_LIMIT_MAX_REQUESTS: Joi.number().default(100)
});

const validateEnv = () => {
  const { error, value } = envSchema.validate(process.env, {
    allowUnknown: true,
    stripUnknown: false
  });

  if (error) {
    console.error('❌ Environment validation error:');
    error.details.forEach(detail => {
      console.error(`  - ${detail.message}`);
    });
    
    console.error('\n📝 Please check your .env file and ensure all required variables are set.');
    console.error('📋 Refer to .env.example for the complete list of required variables.');
    
    process.exit(1);
  }

  console.log('✅ Environment variables validated successfully');
  return value;
};

// Response formatting utilities
const successResponse = (res, data, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

const errorResponse = (res, message = 'Error', statusCode = 500, details = null) => {
  const response = {
    success: false,
    message
  };

  if (details) {
    response.details = details;
  }

  return res.status(statusCode).json(response);
};

// Pagination helper
const getPaginationData = (page, limit, total) => {
  const currentPage = parseInt(page) || 1;
  const itemsPerPage = parseInt(limit) || 10;
  const totalItems = parseInt(total) || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const offset = (currentPage - 1) * itemsPerPage;

  return {
    pagination: {
      currentPage,
      itemsPerPage,
      totalItems,
      totalPages,
      hasNext: currentPage < totalPages,
      hasPrev: currentPage > 1
    },
    offset
  };
};

// Async handler wrapper to eliminate try-catch blocks
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Generate random string for JWT secrets etc.
const generateRandomString = (length = 32) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  return result;
};

// Password strength validator
const validatePasswordStrength = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const issues = [];

  if (password.length < minLength) {
    issues.push(`Password must be at least ${minLength} characters long`);
  }
  if (!hasUpperCase) {
    issues.push('Password must contain at least one uppercase letter');
  }
  if (!hasLowerCase) {
    issues.push('Password must contain at least one lowercase letter');
  }
  if (!hasNumbers) {
    issues.push('Password must contain at least one number');
  }
  if (!hasSpecialChar) {
    issues.push('Password must contain at least one special character');
  }

  return {
    isStrong: issues.length === 0,
    issues
  };
};

module.exports = {
  validateEnv,
  successResponse,
  errorResponse,
  getPaginationData,
  asyncHandler,
  generateRandomString,
  validatePasswordStrength
};