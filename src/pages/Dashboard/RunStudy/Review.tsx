import * as React from 'react';

import { MeterGroup } from '@nav/shared/models/meter';


/** ============================ Types ===================================== */
type ReviewProps = {
  meterGroups: MeterGroup[] | null;
};

/** ============================ Components ================================ */
const Review: React.FC<ReviewProps> = () => {
  return (
    <div>review</div>
  );
};

/** ============================ Exports =================================== */
export default Review;
