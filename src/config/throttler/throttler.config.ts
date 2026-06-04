import { registerAs } from '@nestjs/config';

export const THROTTLER_CONFIG = 'throttler';

export default registerAs(THROTTLER_CONFIG, () => ({
  // use env instead of config service because registerAs runs before dependencies container is initialized
  ttl: parseInt(process.env.THROTTLE_TTL_MS ?? '1000', 10),
  limit: parseInt(process.env.THROTTLE_LIMIT ?? '60', 10),
}));
