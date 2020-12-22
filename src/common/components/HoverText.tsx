import _ from 'lodash';
import * as React from 'react';

import { makeStylesHook } from 'navigader/styles';
import { AlertType } from 'navigader/types';

import { Alert } from './Alert';
import { Popover } from './Popover';

/** ============================ Types ===================================== */
type HoverTextProps = { text?: string; type?: AlertType };

/** ============================ Styles ==================================== */
const useStyles = makeStylesHook(
  (theme) => ({
    hoverText: {
      'cursor': 'default',
      'textDecoration': `underline dotted ${theme.palette.primary.main}`,

      '&:hover': {
        color: theme.palette.primary.main,
      },
    },
  }),
  'NavigaderHoverText'
);

/** ============================ Components ================================ */
export const HoverText: React.FC<HoverTextProps> = (props) => {
  const { children, text, type } = props;
  const classes = useStyles();

  // If no hover text was provided, just render the children unmodified
  if (!text) return <span>{children}</span>;

  // Wrap the text in an Alert if a `type` prop was given
  const [TextWrapper, padding] = _.isUndefined(type)
    ? [<div />, 2]
    : [<Alert type={type} />, undefined];

  // Otherwise wrap the children within a Popover and render them with some textDecoration
  return (
    <Popover HoverComponent={React.cloneElement(TextWrapper, { children: text })} padding={padding}>
      <div className={classes.hoverText}>{children}</div>
    </Popover>
  );
};
