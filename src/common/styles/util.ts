import createStyles from '@material-ui/styles/createStyles';
import makeStyles from '@material-ui/styles/makeStyles';
import { ClassNameMap, StyleRules } from '@material-ui/styles/withStyles';

import { Theme } from './theme';

/** ============================ Styles Hook =============================== */
export function makeStylesHook<Props extends {} = {}, ClassKey extends string = string>(
  styles: (theme: Theme) => StyleRules<Props, ClassKey>,
  name: string
): (props?: Props) => ClassNameMap<ClassKey> {
  return makeStyles<Theme>(createStyles(styles), { name });
}
