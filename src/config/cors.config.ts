import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

export const createCorsConfig = (): CorsOptions => {
  const originEnv = process.env.CORS_ORIGIN;
    
  const allowedOrigins = originEnv 
    ? originEnv.split(',').map(o => o.trim())
    : [
        'http://localhost:3000',
        'http://localhost:5173',
        'http://localhost:4200',
        /\.onrender\.com$/,
      ];
  
  return {
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }

      const isAllowed = allowedOrigins.some((allowedOrigin) => {
        if (typeof allowedOrigin === 'string') {
          return allowedOrigin === origin;
        }
        return allowedOrigin.test(origin);
      });

      if (isAllowed) {
        callback(null, true);
      } else {
        console.warn(`CORS: Blocked origin ${origin}`);
        callback(null, false);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type', 
      'Authorization', 
      'Accept',
      'X-Requested-With',
      'X-CSRF-Token',
      'X-Api-Version',
    ],
    exposedHeaders: ['X-Total-Count', 'X-Page', 'X-Page-Size'],
    maxAge: 3600,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  };
};

