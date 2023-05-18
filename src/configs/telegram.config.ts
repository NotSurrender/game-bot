import * as LocalSession from 'telegraf-session-local';
import { ConfigService } from '@nestjs/config';
import { chatTypeMiddleware } from 'src/common/chat-type.middleware';
import { ChatType } from 'src/common/constants';

const sessions = new LocalSession({ database: 'session.db.json' });

export const getTeleramConfig = async (configService: ConfigService) => ({
  middlewares: [sessions.middleware(), chatTypeMiddleware(ChatType.GROUP)],
  token: configService.get<string>('TELEGRAM_BOT_TOKEN'),
});
