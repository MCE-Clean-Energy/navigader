import * as React from 'react';
import MuiPaper from '@material-ui/core/Paper';

/** ============================ Types ===================================== */
type Elevation =
  | 0
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 16
  | 17
  | 18
  | 19
  | 20
  | 21
  | 22
  | 23
  | 24;
export type PaperProps = {
  className?: string;
  elevation?: Elevation;
};

/** ============================ Components ================================ */
export const Paper: React.FC<PaperProps> = (props) => <MuiPaper {...props} />;
