import * as React from 'react';

import { Card, Link, PageHeader, PrefetchedTable, Table, Typography } from 'navigader/components';
import { makeStylesHook } from 'navigader/styles';

/** ============================ Styles ==================================== */
const useStyles = makeStylesHook(
  (theme) => ({
    boldParagraph: {
      marginTop: theme.spacing(2),
    },
    secondColumn: {
      width: 200,
    },
    table: {
      marginTop: theme.spacing(2),
    },
  }),
  'Roadmap'
);

const useFirstColumnStyles = makeStylesHook(
  () => ({
    firstColumn: {
      borderRight: '1px solid rgba(224, 224, 224, 1)',
    },
  }),
  'RoadmapFirstColumn'
);

/** ============================ Components ================================ */
const Complete = () => (
  <Typography color="success" variant="body1">
    Complete!
  </Typography>
);
const FirstColumn: React.FC<{ rowSpan?: number }> = (props) => {
  const classes = useFirstColumnStyles();
  return <Table.Cell className={classes.firstColumn} {...props} />;
};

export const RoadmapPage: React.FC = () => {
  const classes = useStyles();
  return (
    <>
      <PageHeader title="Roadmap" />

      <Card raised>
        <Typography useDiv variant="body1">
          NavigaDER runs detailed analyses on the anticipated economic and environmental impacts of
          multiple DER customer program scenarios. By identifying the customers that would provide
          the highest grid and environmental benefits if enrolled in each simulated program
          scenario, NavigaDER enables CCAs to make informed decisions about which DER technologies
          to promote to which specific customers so as to optimize GHG and financial benefits.
        </Typography>

        <Typography className={classes.boldParagraph} emphasis="bold" useDiv variant="body1">
          The table below shows NavigaDER’s existing feature-sets as well as the roadmap for
          additional feature development. The software will be continually updated through Q3 2020
          to improve functionality and the user experience.
        </Typography>
      </Card>

      <div className={classes.table}>
        <PrefetchedTable data={[]} hover={false} raised title="Built Features">
          {() => (
            <>
              <Table.Head>
                <Table.Row>
                  <Table.Cell>Category</Table.Cell>
                  <Table.Cell className={classes.secondColumn}>Feature</Table.Cell>
                  <Table.Cell>Description</Table.Cell>
                  <Table.Cell>Status</Table.Cell>
                </Table.Row>
              </Table.Head>

              <Table.Body>
                <Table.Row>
                  <FirstColumn>DER Technology</FirstColumn>
                  <Table.Cell>Battery Energy Storage</Table.Cell>
                  <Table.Cell>
                    NavigaDER models multiple battery strategies that are available to the user for
                    selection when creating a DER program scenario
                  </Table.Cell>
                  <Table.Cell>
                    <Complete />
                  </Table.Cell>
                </Table.Row>
                <Table.Row>
                  <FirstColumn rowSpan={5}>Impact Calculations</FirstColumn>
                  <Table.Cell>CCA Revenue Impacts: NEM Payouts</Table.Cell>
                  <Table.Cell>
                    For each modeled DER program simulation, NavigaDER can determine which NEM
                    customers have the highest potential for battery assisted NEM payout reduction
                    by analyzing customer load profiles. The software will target the NEM customers
                    that have sufficient exports to charge batteries which can be subsequently
                    discharged against the customer's load during the target peak hours of the day
                    (4-9pm). The software will simulate battery energy storage systems to charge
                    from solar PV exports (reducing the CCA's NEM payouts), and discharge during the
                    peak hours, thereby helping reduce the customer's consumption of electricity
                    from the grid during the time when procurement and electricity demand for the
                    CCA is highest.
                  </Table.Cell>
                  <Table.Cell>
                    <Complete />
                  </Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell>
                    <div>CCA Revenue Impacts: Resource Adequacy (RA) Costs</div>
                    <div>(Strategic Load Reduction)</div>
                  </Table.Cell>
                  <Table.Cell>
                    For each modeled DER program simulation, NavigaDER calculates the current system
                    RA requirements, the monthly system peak load, and determines in which hours the
                    peaks occur. The software then targets customers with load during these hours,
                    and creates a battery cycling strategy that will target discharging during these
                    peak hours. In the simulation the batteries are applied to the targeted
                    customers, reducing the customer load at the time of the system peaks,
                    ultimately reducing the system and local RA requirements of the CCA.
                  </Table.Cell>
                  <Table.Cell>
                    <Complete />
                  </Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell>CCA Revenue Impacts: Generation-Side Bill Impacts</Table.Cell>
                  <Table.Cell>
                    For each modeled DER program simulation, NavigaDER can determine which DER
                    programs impact retail electricity sales. Any method that implements a battery
                    that allows a customer to purchase less electricity from the grid is reducing a
                    CCAs electricity sales. Alternatively, any method that implements EVSE or
                    fuel-switching (future feature sets) allows a customer to purchase more
                    electricity from the grid thereby increasing a CCA’s electricity sales.
                  </Table.Cell>
                  <Table.Cell>
                    <Complete />
                  </Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell>GHG Emissions Impacts</Table.Cell>
                  <Table.Cell>
                    For each modeled DER program simulation, NavigaDER quantifies GHG emission
                    impacts. The software applies the appropriate GHG values to the electricity
                    bought at every time of day before and after implementing the simulated DER
                    program, and then compares how GHG emissions have been impacted by the simulated
                    DER program implementation. The Clean Net Short (CNS) methodology is used in the
                    calculations, as is recommended by the California Public Utilities Commission.
                    The CNS method utilizes standard reference tables with multipliers for every
                    hour of a month to account for the grid GHG content. The reference tables
                    provide an estimate of the grid GHG content for any location in the state of
                    California, at any given hour of the day.
                  </Table.Cell>
                  <Table.Cell>
                    <Complete />
                  </Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell>Wholesale Procurement Costs</Table.Cell>
                  <Table.Cell>
                    For each modeled DER program simulation, NavigaDER will assess opportunities for
                    DER programs to reduce a CCA's procurement costs. Any method that implements a
                    battery that allows a customer to purchase less electricity from the grid is
                    simultaneously reducing the amount of energy a CCA has to procure, thus reducing
                    their procurement costs. Alternatively, any method that implements EVSE or
                    fuel-switching that allows a customer to purchase more electricity from the grid
                    is simultaneously increasing the amount of energy a CCA has to procure, thus
                    increasing their procurement costs.
                  </Table.Cell>
                  <Table.Cell>
                    <Complete />
                  </Table.Cell>
                </Table.Row>
              </Table.Body>
            </>
          )}
        </PrefetchedTable>
      </div>

      <div className={classes.table}>
        <PrefetchedTable data={[]} hover={false} raised title="Development of Additional Features">
          {() => (
            <>
              <Table.Head>
                <Table.Row>
                  <Table.Cell>Category</Table.Cell>
                  <Table.Cell className={classes.secondColumn}>Feature</Table.Cell>
                  <Table.Cell>Description</Table.Cell>
                </Table.Row>
              </Table.Head>

              <Table.Body>
                <Table.Row>
                  <FirstColumn rowSpan={1}>Impact Calculations</FirstColumn>
                  <Table.Cell>GHG Impacts from Fuel Switching</Table.Cell>
                  <Table.Cell>
                    For each modeled fuel-switching program simulation, NavigaDER quantifies avoided
                    GHG emission impacts. The software applies the appropriate GHG values to the gas
                    bought before and after implementing the simulated fuel-switching program, and
                    then compares how GHG emissions have been impacted by the simulated DER program
                    implementation.
                  </Table.Cell>
                </Table.Row>
                <Table.Row>
                  <FirstColumn rowSpan={3}>DER Technology</FirstColumn>
                  <Table.Cell>Electric Vehicle Supply Equipment (EVSE)</Table.Cell>
                  <Table.Cell>
                    Multiple EVSE strategies will be available to the user for selection when
                    creating a DER program scenarios
                  </Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell>Fuel-Switching via Heat Pumps and Heat Pump Water Heaters</Table.Cell>
                  <Table.Cell>
                    Multiple fuel-switching strategies will be available to the user for selection
                    when creating DER program scenarios
                  </Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell>Photovoltaic (PV)</Table.Cell>
                  <Table.Cell>
                    Multiple PV strategies will be available to the user for selection when creating
                    a DER program scenario (powered by NREL's&nbsp;
                    <Link.NewTab to="https://pvwatts.nrel.gov/" useAnchor>
                      PVWatts
                    </Link.NewTab>
                    ).
                  </Table.Cell>
                </Table.Row>
                <Table.Row>
                  <FirstColumn rowSpan={3}>User Interface Features</FirstColumn>
                  <Table.Cell>Scenario Comparison Feature Updates</Table.Cell>
                  <Table.Cell>
                    The Scenario Comparison view will be updated to show: impacts on a
                    customer-by-customer basis, the ability to filter customer participation, the
                    ability to select and deselect additional scenarios, and a number of other
                    updates.
                  </Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell>Exporting of Results</Table.Cell>
                  <Table.Cell>
                    The user will have the ability to export results to a CSV file.
                  </Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell>User Experience</Table.Cell>
                  <Table.Cell>
                    Ongoing updates will be made to enhance the user experience.
                  </Table.Cell>
                </Table.Row>
              </Table.Body>
            </>
          )}
        </PrefetchedTable>
      </div>
    </>
  );
};
