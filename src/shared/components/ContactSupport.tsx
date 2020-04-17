import * as React from 'react';


/** ============================ Constants ================================= */
const SUPPORT_EMAIL = 'support@navigader.com';

/** ============================ Components ================================ */
export const ContactSupport: React.FC = props => (
  <a href={`mailto:${SUPPORT_EMAIL}`}>
    {props.children || 'contact support'}
  </a>
);
