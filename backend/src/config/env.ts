export const config = {
  jwtSecret: process.env.JWT_SECRET || 'dev_secret_change_me',
  openAiApiKey: process.env.OPENAI_API_KEY || '',
  databaseUrl: process.env.DATABASE_URL || '',
  foodDbApiKey: process.env.FOOD_DB_API_KEY || '',
  baseUrl: process.env.BASE_URL || 'http://localhost:4000',
};

export function assertEnv() {
  const missing: string[] = [];
  if (!config.jwtSecret) missing.push('JWT_SECRET');
  if (!config.databaseUrl) missing.push('DATABASE_URL');
  if (missing.length) {
    // eslint-disable-next-line no-console
    console.warn(`Missing env vars: ${missing.join(', ')}`);
  }
}

