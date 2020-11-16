import * as React from 'react';
import ContainerDimensions from 'react-container-dimensions';

import { makeStylesHook } from 'navigader/styles';

/** ============================ Types ===================================== */
type DERTabProps = {
  ConfigurationsTable: React.FC;
  StrategiesTable: React.FC<{ width: number }>;
};

/** ============================ Styles ==================================== */
const useStyles = makeStylesHook(
  (theme) => ({
    spacer: {
      height: theme.spacing(3),
    },
  }),
  'DERTab'
);

/** ============================ Components ================================ */
export const DERTab: React.FC<DERTabProps> = ({ ConfigurationsTable, StrategiesTable }) => {
  const classes = useStyles();
  return (
    <div>
      <ContainerDimensions>
        {({ width }) => (
          <>
            <ConfigurationsTable />
            <div className={classes.spacer} />
            <StrategiesTable width={width} />
          </>
        )}
      </ContainerDimensions>
    </div>
  );
};
