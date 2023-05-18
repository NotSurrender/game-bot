import { SceneSessionType } from 'src/app.interfaces';

import { MemberEnterAction, MemberMenuAction } from './members.constants';

export type AdminSceneSessionType = SceneSessionType<
  MemberEnterAction & MemberMenuAction
>;
