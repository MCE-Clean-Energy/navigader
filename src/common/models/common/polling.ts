import * as api from 'navigader/api';
import store, { slices } from 'navigader/store';
import { DataTypeParams, DynamicRestParams, IdType, MeterGroup, Scenario } from 'navigader/types';
import { filterClause } from 'navigader/util';
import _ from 'navigader/util/lodash';


/** ============================ Types ===================================== */
type MeterGroupsQueryParams = DynamicRestParams & DataTypeParams;

/** ============================ Polling =================================== */
class Poller {
  private pollInterval: number;
  private pollingIds = {
    meterGroups: new Map<MeterGroupsQueryParams, Set<IdType>>(),
    scenarios: new Set<IdType>()
  };

  public constructor (interval: number) {
    this.pollInterval = window.setInterval(this.poll.bind(this), interval);
  }

  public addMeterGroups (models: MeterGroup[], options?: MeterGroupsQueryParams) {
    const modelIds = _.map(models, 'id');
    const optionsKey = options || {};
    if (this.pollingIds.meterGroups.has(optionsKey)) {
      modelIds.forEach(id => this.pollingIds.meterGroups.get(optionsKey)!.add(id));
    } else {
      this.pollingIds.meterGroups.set(optionsKey, new Set([...modelIds]));
    }
  }

  public addScenarios (models: Scenario[]) {
    models.forEach((model) => {
      this.pollingIds.scenarios.add(model.id);
    });
  }

  /**
   * Clears out any IDs that are currently being polled for. This is useful when the user logs out
   * and is no longer permitted to access the resources
   */
  public reset () {
    this.pollingIds = {
      meterGroups: new Map(),
      scenarios: new Set()
    };
  }

  /**
   * The actual polling method. This method is called on each polling interval, and will make a
   * request for each of the possible model types that have IDs to poll for.
   */
  private async poll () {
    this.pollMeterGroups();
    this.pollScenarios();
  }

  private pollMeterGroups () {
    const queries = [...this.pollingIds.meterGroups.entries()];
    if (queries.length === 0) return;

    queries.forEach(async ([queryOptions, meterGroupIdSet]) => {
      const meterGroups = (await api.getMeterGroups({
        ...queryOptions,
        filter: {
          ...queryOptions.filter,
          id: filterClause.in([...meterGroupIdSet.values()])
        },
        page: 1,
        page_size: 100
      })).data;

      // Remove finished meterGroups
      meterGroups.forEach((meterGroup) => {
        if (meterGroup.progress.is_complete) {
          meterGroupIdSet.delete(meterGroup.id);
        }
      });

      // Update the store
      store.dispatch(slices.models.updateModels(meterGroups));
    });
  }

  private async pollScenarios () {
    const scenarioIds = [...this.pollingIds.scenarios.values()] as IdType[];
    if (scenarioIds.length === 0) return;

    const scenarios = (await api.getScenarios({
      filter: { id: filterClause.in(scenarioIds) },
      include: 'report_summary',
      page: 1,
      page_size: 100
    })).data;

    // Remove finished scenarios
    scenarios.forEach((scenario) => {
      if (scenario.progress.is_complete) {
        this.pollingIds.scenarios.delete(scenario.id);
      }
    });

    // Update the store
    store.dispatch(slices.models.updateModels(scenarios));
  }
}

export const poller = new Poller(10000);
