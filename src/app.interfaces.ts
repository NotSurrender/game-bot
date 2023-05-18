import { SceneSessionData } from 'telegraf/typings/scenes';

export interface SceneSessionType<T> extends SceneSessionData {
  type: T;
}
