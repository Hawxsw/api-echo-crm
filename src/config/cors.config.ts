export const createCorsConfig = () => ({
  origin: process.env.CORS_ORIGIN?.split(',') || '*',
  credentials: true,
});

