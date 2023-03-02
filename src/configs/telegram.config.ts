import * as LocalSession from 'telegraf-session-local';
import { ConfigService } from '@nestjs/config';

const sessions = new LocalSession({ database: 'session.db.json' });

export const getTeleramConfig = async (configService: ConfigService) => ({
  middlewares: [sessions.middleware()],
  token: configService.get<string>('TELEGRAM_BOT_TOKEN'),
});
