import * as api from 'navigader/api';
import { Scenario } from 'navigader/models/scenario';
import store, { slices } from 'navigader/store';
import { IdType } from 'navigader/types';
import { printWarning } from 'navigader/util';


/** ============================ Types ===================================== */
type PollableObject = Scenario;

/** ============================ Polling =================================== */
class Poller {
  private pollingIds = {
    scenario: new Set()
  };

  private pollInterval: number;

  constructor (interval: number) {
    this.pollInterval = window.setInterval(this.poll.bind(this), interval);
  }

  pollFor (models: PollableObject[]) {
    models.forEach((model) => {
      switch (model.object_type) {
        case 'SingleScenarioStudy':
          this.pollingIds.scenario.add(model.id);
          return;
        default:
          printWarning(`Polling module received un-pollable object of type ${model.object_type}`);
      }
    });
  }

  /**
   * The actual polling method. This method is called on each polling interval, and will make a
   * request for each of the possible model types that have IDs to poll for.
   */
  private async poll () {
    this.pollScenarios();
  }

  private async pollScenarios () {
    const scenarios = [...this.pollingIds.scenario.values()] as IdType[];
    if (scenarios.length === 0) return;

    const response = await api.getScenarios({
      filter: { id: api.util.in_(scenarios) },
      include: 'report_summary',
      page: 1,
      page_size: 100
    });

    // Remove finished scenarios
    response.data.forEach((scenario) => {
      if (scenario.progress.is_complete) {
        this.pollingIds.scenario.delete(scenario.id);
      }
    });

    // Update the store
    store.dispatch(slices.models.updateModels(response.data));
  }
}

export const poller = new Poller(10000);
