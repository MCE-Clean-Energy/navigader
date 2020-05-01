import { userIsAuthenticated } from './models/user';
import { getDerConfigurations, getDerStrategies, connectToScenarioUpdates } from './api';
import store, { slices } from './store';


/**
 * Run once when the application is mounted
 */
export function initApplication () {
  // If the user isn't authenticated, don't bother with any of the following
  if (!userIsAuthenticated()) return;
  
  // Load DER configurations
  getDerConfigurations({ include: 'data', page: 1, page_size: 100 })
    .then((derConfigurations) => {
      store.dispatch(
        slices.models.updateModels(derConfigurations.data)
      );
    });

  // Load DER strategies
  getDerStrategies({ include: 'data', page: 1, page_size: 100 })
    .then((derStrategies) => {
      store.dispatch(
        slices.models.updateModels(derStrategies.data)
      );
    });

  // Set up WebSockets
  connectToScenarioUpdates();
}
