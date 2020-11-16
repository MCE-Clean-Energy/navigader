import deepEqual from 'fast-deep-equal';
import _ from 'lodash';

import * as api from 'navigader/api';
import store, { slices } from 'navigader/store';
import { IdType, MeterGroup, PaginationQueryParams, Scenario, Without } from 'navigader/types';
import { filterClause } from '../../api';

/** ============================ Types ===================================== */
type MeterGroupsQueryParams = Without<api.MeterGroupsQueryParams, PaginationQueryParams>;
type UncleanMeterGroupQueryParams = MeterGroupsQueryParams & Partial<PaginationQueryParams>;
type IdSet = Set<IdType>;

/** ============================ Map Utils ================================= */
/**
 * Wrapper around the `Map` class. This provides customized equality checking for the object keys
 */
class MeterGroupQueryMap extends Map<MeterGroupsQueryParams, IdSet> {
  /**
   * Removes pagination fields from the query params (if present). These fields are not relevant
   * for polling, and will be provided by the `Poller` class.
   *
   * @param {MeterGroupsQueryParams} queryParams: the parameters that were used to fetch the meters
   *   from the server initially, possibly including pagination fields.
   */
  clean(queryParams: UncleanMeterGroupQueryParams): MeterGroupsQueryParams {
    return _.omit(queryParams, 'page', 'pageSize');
  }

  /**
   * Returns the `IdSet` associated with a group of query parameters, or `undefined` if not found
   *
   * @param {MeterGroupsQueryParams} queryParams: the group of parameters to index the Map with
   */
  get(queryParams: UncleanMeterGroupQueryParams): IdSet | undefined {
    for (let [params, idSet] of this.entries()) {
      if (deepEqual(this.clean(queryParams), params)) {
        return idSet;
      }
    }
  }

  /**
   * Returns `true` if there is an existing entry in the map with the exact same query parameters
   *
   * @param {MeterGroupsQueryParams} queryParams: object of meter group query parameters
   */
  has(queryParams: UncleanMeterGroupQueryParams): boolean {
    for (let params of this.keys()) {
      if (deepEqual(this.clean(queryParams), params)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Adds a set of IDs to the map. If there is already an entry in the map for the given query
   * params, the IDs will be added to that set; otherwise, a new set will be made
   * @param queryParams
   * @param ids
   */
  add(queryParams: UncleanMeterGroupQueryParams, ids: IdType[]) {
    const existingSet = this.get(queryParams);
    if (existingSet) {
      ids.forEach((id) => existingSet.add(id));
    } else {
      this.set(this.clean(queryParams), new Set([...ids]));
    }
  }

  /**
   * Removes an ID from any query parameter sets that include it. If the set is subsequently empty,
   * it too is deleted
   *
   * @param {IdType} id: the ID of the meter group that we wish to stop querying for
   */
  remove(id: IdType) {
    for (let [params, idSet] of this.entries()) {
      if (!idSet.has(id)) continue;

      // Remove the ID from the set. If there are no IDs left in the set, remove it
      idSet.delete(id);
      if (idSet.size === 0) {
        this.delete(params);
      }
    }
  }
}

/** ============================ Polling =================================== */
class Poller {
  private pollInterval: number;
  private pollingIds = {
    meterGroups: new MeterGroupQueryMap(),
    scenarios: new Set<IdType>(),
  };

  public constructor(interval: number) {
    this.pollInterval = window.setInterval(this.poll.bind(this), interval);
  }

  public addMeterGroups(models: MeterGroup[], options?: api.MeterGroupsQueryParams) {
    // Filter for unfinished meter groups
    const unfinished = _.filter(models, (s) => !s.progress.is_complete);
    if (unfinished.length === 0) return;

    const modelIds = _.map(unfinished, 'id');
    const optionsKey = options || {};
    this.pollingIds.meterGroups.add(optionsKey, modelIds);
  }

  public addScenarios(models: Scenario[]) {
    const unfinished = _.filter(models, (s) => !s.progress.is_complete);
    unfinished.forEach(({ id }) => this.pollingIds.scenarios.add(id));
  }

  /**
   * Clears out any IDs that are currently being polled for. This is useful when the user logs out
   * and is no longer permitted to access the resources
   */
  public reset() {
    this.pollingIds = {
      meterGroups: new MeterGroupQueryMap(),
      scenarios: new Set(),
    };
  }

  /**
   * The actual polling method. This method is called on each polling interval, and will make a
   * request for each of the possible model types that have IDs to poll for.
   */
  private async poll() {
    this.pollMeterGroups();
    this.pollScenarios();
  }

  private pollMeterGroups() {
    const queries = [...this.pollingIds.meterGroups.entries()];
    if (queries.length === 0) return;

    queries.forEach(async ([queryOptions, meterGroupIdSet]) => {
      const meterGroups = (
        await api.getMeterGroups({
          ...queryOptions,
          filter: {
            ...queryOptions.filter,
            id: filterClause.in([...meterGroupIdSet.values()]),
          },
          page: 0,
          pageSize: 100,
        })
      ).data;

      // Remove finished meterGroups
      meterGroups.forEach((meterGroup) => {
        if (meterGroup.progress.is_complete) {
          this.pollingIds.meterGroups.remove(meterGroup.id);
        }
      });

      // Update the store
      store.dispatch(slices.models.updateModels(meterGroups));
    });
  }

  private async pollScenarios() {
    const scenarioIds = [...this.pollingIds.scenarios.values()] as IdType[];
    if (scenarioIds.length === 0) return;

    const scenarios = (
      await api.getScenarios({
        filter: { id: filterClause.in(scenarioIds) },
        include: 'report_summary',
        page: 0,
        pageSize: 100,
      })
    ).data;

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

export const polling = new Poller(10000);
