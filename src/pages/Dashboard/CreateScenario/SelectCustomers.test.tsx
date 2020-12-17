import _ from 'lodash';
import * as React from 'react';
import { cleanup, fireEvent, screen } from '@testing-library/react';

import store, { slices } from 'navigader/store';
import { asyncForEach, fixtures, renderContextDependentComponent } from 'navigader/util/testing';
import { SelectCustomers } from './SelectCustomers';
import { makeDataProps, makeState } from './testing';

describe('"Select Customers" page', () => {
  const originFile1 = fixtures.makeOriginFile({
    id: '1',
    meter_count: 20,
    name: 'My meters',
  });

  const originFile2 = fixtures.makeOriginFile({
    id: '2',
    meter_count: 322,
    name: 'Residential customers',
  });

  const scenario1 = fixtures.makeScenario({
    id: '1',
    meter_count: 10,
    meter_group: originFile1,
    name: 'My scenario',
    progress: {
      is_complete: true,
      percent_complete: 100,
    },
  });

  const scenario2 = fixtures.makeScenario({
    id: '2',
    meter_count: 55,
    meter_group: originFile2,
    name: 'Resi customers w/ solar',
    progress: {
      is_complete: true,
      percent_complete: 100,
    },
  });

  const originFiles = [originFile1, originFile2];
  const scenarios = [scenario1, scenario2];

  // Seed the store with the models prior to test execution
  beforeEach(() => {
    // Add models to the store
    store.dispatch(slices.models.updateModels([...originFiles, ...scenarios]));
  });

  it('Proper number of chips are rendered', async () => {
    renderContextDependentComponent(
      <SelectCustomers
        {...makeDataProps({ originFiles, scenarios })}
        state={makeState()}
        updateState={() => {}}
      />
    );

    // Check the number of meter group chips
    const meterGroupChips = await screen.findAllByTestId('meter-group-chip');
    expect(meterGroupChips.length).toEqual(4);

    // Should have the names of the meter groups and scenarios
    expect(meterGroupChips[0].textContent).toEqual(originFile1.name);
    expect(meterGroupChips[1].textContent).toEqual(originFile2.name);
    expect(meterGroupChips[2].textContent).toEqual(scenario1.name);
    expect(meterGroupChips[3].textContent).toEqual(scenario2.name);
  });

  it('Selecting a meter group/scenario triggers callback', async () => {
    const updateStateMock = jest.fn();
    renderContextDependentComponent(
      <SelectCustomers
        {...makeDataProps({ originFiles, scenarios })}
        state={makeState()}
        updateState={updateStateMock}
      />
    );

    // Click some meter groups
    const meterGroupChips = await screen.findAllByTestId('meter-group-chip');

    fireEvent.click(meterGroupChips[0]);
    expect(updateStateMock).toHaveBeenCalledTimes(1);
    expect(updateStateMock.mock.calls[0][0]).toMatchObject({
      originFileSelections: [originFile1.id],
    });

    fireEvent.click(meterGroupChips[1]);
    expect(updateStateMock).toHaveBeenCalledTimes(2);
    expect(updateStateMock.mock.calls[1][0]).toMatchObject({
      originFileSelections: [originFile2.id],
    });

    // Click some scenarios
    fireEvent.click(meterGroupChips[2]);
    expect(updateStateMock).toHaveBeenCalledTimes(3);
    expect(updateStateMock.mock.calls[2][0]).toMatchObject({ scenarioSelections: [scenario1.id] });

    fireEvent.click(meterGroupChips[3]);
    expect(updateStateMock).toHaveBeenCalledTimes(4);
    expect(updateStateMock.mock.calls[3][0]).toMatchObject({ scenarioSelections: [scenario2.id] });
  });

  it('Renders the meter count', async () => {
    // All combinations of two meter groups
    const meterGroupCombinations = [[], [originFile1], [originFile2], [originFile1, originFile2]];

    // All combinations of two scenarios
    const scenarioCombinations = [[], [scenario1], [scenario2], [scenario1, scenario2]];

    await asyncForEach(meterGroupCombinations, async (selectedMeterGroups) => {
      renderContextDependentComponent(
        <SelectCustomers
          {...makeDataProps({ originFiles, scenarios })}
          state={makeState({ originFileSelections: _.map(selectedMeterGroups, 'id') })}
          updateState={() => {}}
        />
      );

      const expectedNumMeters = selectedMeterGroups.reduce(
        (numMetersPrev, curMeterGroup) => numMetersPrev + curMeterGroup.meter_count,
        0
      );

      const numMetersDiv = await screen.findAllByText(/Number of meters:/);
      expect(numMetersDiv[0].textContent).toEqual(`Number of meters: ${expectedNumMeters}`);
      await cleanup();
    });

    await asyncForEach(scenarioCombinations, async (selectedScenarios) => {
      renderContextDependentComponent(
        <SelectCustomers
          {...makeDataProps({ originFiles, scenarios })}
          state={makeState({ scenarioSelections: _.map(selectedScenarios, 'id') })}
          updateState={() => {}}
        />
      );

      const expectedNumMeters = selectedScenarios.reduce(
        (numMetersPrev, curMeterGroup) => numMetersPrev + curMeterGroup.meter_count,
        0
      );

      const numMetersDiv = await screen.findAllByText(/Number of meters:/);
      expect(numMetersDiv[1].textContent).toEqual(`Number of meters: ${expectedNumMeters}`);
      await cleanup();
    });
  });
});
