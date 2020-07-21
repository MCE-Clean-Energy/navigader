import * as React from 'react';

import { SUPPORT_EMAIL } from 'navigader/util';


/** ============================ Components ================================ */
export const ContactSupport: React.FC = props => (
  <a href={`mailto:${SUPPORT_EMAIL}`}>
    {props.children || 'contact support'}
  </a>
);
