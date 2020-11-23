import { BaseCSSProperties, CreateCSSProperties } from '@material-ui/core/styles/withStyles';

import { AlignItemsValue, FlexDirection, JustifyContentValue, WrapValue } from './components';

/** ============================ Lodash overrides ========================== */
declare module 'lodash/index' {
  interface LoDashStatic {
    // If an input object is a mapping from string type S1 to another string type S2, then the
    // inversion is guaranteed to be a mapping from S2 to S1
    invert<S1 extends string, S2 extends string>(object: Record<S1, S2>): Record<S2, S1>;
  }
}

/** ============================ MUI overrides ============================= */
type FlexArgs = Partial<{
  direction: FlexDirection;
  wrap: WrapValue;
  justify: JustifyContentValue;
  align: AlignItemsValue;
}>;

type BorderArgs = Partial<{
  width: number;
  color: string;
  radius: number;
}>;

declare module '@material-ui/core/styles/createMixins' {
  type TransitionBounds = [any, any];
  interface Mixins {
    border: (args: BorderArgs) => CreateCSSProperties;
    flex: (args: FlexArgs) => CreateCSSProperties;

    transition: (
      property: string,
      activated: boolean,
      bounds: TransitionBounds
    ) => BaseCSSProperties;
  }
}
