import { SceneSessionData } from 'telegraf/typings/scenes';

export type ChatType = 'group' | 'supergroup' | 'private' | 'channel';

export interface SceneSessionType<T> extends SceneSessionData {
  type: T;
}
