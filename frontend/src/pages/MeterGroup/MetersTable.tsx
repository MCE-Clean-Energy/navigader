import React, { useEffect, useState } from 'react';
import { createUseStyles } from 'react-jss';

import * as api from '@nav/shared/api';
import { Fade, Progress, Table, Typography } from '@nav/shared/components';
import { Meter, MeterGroup } from '@nav/shared/models/meter';
import { Theme } from '@nav/shared/styles';


/** ============================ Types ===================================== */
type MetersTableProps = {
  meterGroupId: MeterGroup['id'];
};

/** ============================ Styles ==================================== */
const useStyles = createUseStyles((theme: Theme) => ({
  header: {
    marginBottom: theme.spacing(2)
  },
  tableContainer: {
    maxHeight: 500
  }
}));

/** ============================ Components ================================ */
const MetersTable: React.FC<MetersTableProps> = ({ meterGroupId }) => {
  const [meters, setMeters] = useState<Meter[] | null>(null);
  const classes = useStyles();

  useEffect(() => {
    let didCancel = false;
    
    api.getMeters({
      meterGroupId,
      types: ['default']
    }).then((res) => {
      if (!didCancel) {
        setMeters(res)
      }
    });
    
    return () => {
      didCancel = true;
    };
  }, [meterGroupId]);
  
  // TODO: virtualize the table
  return (
    <div>
      <Typography className={classes.header} component="div" variant="h6">Meters</Typography>
      {
        meters ? (
          <Table
            aria-label="meter table"
            containerClassName={classes.tableContainer}
            raised
            stickyHeader
          >
            <Table.Head>
              <Table.Row>
                <Table.Cell>SA ID</Table.Cell>
                <Table.Cell>Rate Plan</Table.Cell>
              </Table.Row>
            </Table.Head>
            <Table.Body>
              {meters.map(meter =>
                <Table.Row key={meter.id}>
                  <Table.Cell useTh>{meter.metaData.saId}</Table.Cell>
                  <Table.Cell>{meter.metaData.ratePlan}</Table.Cell>
                </Table.Row>
              )}
            </Table.Body>
          </Table>
        ) : (
          <Fade in unmountOnExit>
            <Progress circular />
          </Fade>
        )
      }
    </div>
  );
};

/** ============================ Exports =================================== */
export default MetersTable;
