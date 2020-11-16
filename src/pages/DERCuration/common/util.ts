import _ from 'lodash';
import * as React from 'react';
import { Dispatch } from 'redux';

import * as api from 'navigader/api';
import { slices } from 'navigader/store';
import {
  DERConfiguration,
  DERStrategy,
  ErrorArrayObject,
  ErrorObject,
  Maybe,
  TableRef,
} from 'navigader/types';
import { hooks, omitFalsey, printWarning } from 'navigader/util';

/** ============================ Types ===================================== */
export type DialogProps<DERObject extends DERConfiguration | DERStrategy> = {
  closeDialog: () => void;
  tableRef: TableRef<DERObject>;
  open: boolean;
};

export type DialogState<Fields> = Partial<Fields> & {
  creating: boolean;
  errors: ErrorObject<Fields>;
};

/** ============================ Context =================================== */
type DialogContextType<Fields> = {
  setState: hooks.PartialSetStateFn<DialogState<Fields>>;
  state: DialogState<Fields>;
};

export const DialogContext = React.createContext<DialogContextType<any>>({
  setState: () => {},
  state: { creating: false, errors: {} },
});

/** ============================ Helpers =================================== */
/**
 * Converts a string representing a number into a number, returning `undefined` if given the
 * empty string
 *
 * @param {string} str: the string to parse into a number
 */
export function parseNumberStr(str: string): Maybe<number> {
  return str === '' ? undefined : +str;
}

/**
 * Serializes a number into a string, returning the empty string if the number is undefined
 *
 * @param {number|undefined} n: the number to serialize
 */
export function serializeNumber(n: Maybe<number>) {
  return _.isUndefined(n) ? '' : n.toString();
}

/**
 * Attempts to create a DER configuration/strategy, adding the new object to the store if
 * successful. If the request fails outright, opens the snackbar with an error message. If the
 * request succeeds, opens the snackbar with a success message. Returns `true` if the DER object was
 * successfully created, `false` otherwise.
 *
 * @param {Function} createFn: the API method to call with the parameters
 * @param {object} params: the request parameters. This should include all
 *   fields required to create the DER object.
 * @param {PartialSetStateFn} setState: a function for updating component state
 * @param {Dispatch} dispatch: the redux dispatch function (required for adding to the store/opening
 *   the snackbar)
 */
async function createDER<T>(
  createFn: (args: T) => Promise<Response>,
  params: T,
  setState: hooks.PartialSetStateFn<DialogState<any>>,
  dispatch: Dispatch<any>
): Promise<boolean> {
  setState({ creating: true });
  let response: Response;
  try {
    response = await createFn(params);
    setState({ creating: false });
  } catch (e) {
    // If something goes wrong, print a warning and open a snackbar.
    printWarning(e);
    setState({ creating: false });
    dispatch(
      slices.ui.setMessage({
        msg: 'Something went wrong. Please try again or contact support.',
        type: 'error',
      })
    );
    return false;
  }

  // If the request failed, log the error types
  if (!response.ok) {
    const errors: ErrorArrayObject = await response.json();
    setState({ errors: _.mapValues(omitFalsey(errors), (e) => e[0]) });
    return false;
  }

  // Otherwise add the new DER object to the store, print a snackbar success message and return
  const derObject: DERStrategy | DERConfiguration = await response.json();
  dispatch(slices.models.updateModel(derObject));
  dispatch(slices.ui.setMessage({ type: 'success', msg: 'DER successfully created' }));
  return true;
}

export function createDERConfiguration(
  params: api.CreateDERConfigurationParams,
  setState: hooks.PartialSetStateFn<DialogState<any>>,
  dispatch: Dispatch<any>
) {
  return createDER(api.createDERConfiguration, params, setState, dispatch);
}

export function createDERStrategy(
  params: api.CreateDERStrategyParams,
  setState: hooks.PartialSetStateFn<DialogState<any>>,
  dispatch: Dispatch<any>
) {
  return createDER(api.createDERStrategy, params, setState, dispatch);
}
