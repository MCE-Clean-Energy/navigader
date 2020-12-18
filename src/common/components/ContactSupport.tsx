import * as React from 'react';

import { SUPPORT_EMAIL } from 'navigader/util';
import { Link } from './Link';

/** ============================ Components ================================ */
export const ContactSupport: React.FC = (props) => (
  <Link to={`mailto:${SUPPORT_EMAIL}`} useAnchor>
    {props.children || 'contact support'}
  </Link>
);
