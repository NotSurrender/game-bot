import { SceneSessionType } from 'src/app.interfaces';

import { MemberEnterAction, MemberMenuAction } from './member.constants';

export type AdminSceneSessionType = SceneSessionType<
  MemberEnterAction & MemberMenuAction
>;
