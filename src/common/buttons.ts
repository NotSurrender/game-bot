import { Markup } from 'telegraf';
import { ConfirmAction } from './actions';

export const confirmButtons = Markup.keyboard(
  [
    Markup.button.callback(ConfirmAction.NO, 'no'),
    Markup.button.callback(ConfirmAction.YES, 'yes'),
  ],
  { columns: 2 },
);
