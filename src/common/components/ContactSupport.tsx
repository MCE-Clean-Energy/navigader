import _ from 'lodash';
import * as React from 'react';

import { SUPPORT_EMAIL } from 'navigader/util';
import { Link } from './Link';

/** ============================ Components ================================ */
export const ContactSupport: React.FC = (props) => {
  const wrapper = _.isUndefined(SUPPORT_EMAIL) ? (
    <div />
  ) : (
    <Link.NewTab to={`mailto:${SUPPORT_EMAIL}`} />
  );

  return React.cloneElement(wrapper, undefined, props.children || 'contact support');
};
