import React, { useCallback, useEffect, useReducer } from 'react';
import PropTypes from 'prop-types';
import { getLogger } from '../core';
import { HikeProps } from './HikeProps';
import { createItem, getItems, newWebSocket, updateItem, deleteItem} from './HikeApi';

const log = getLogger('HikeProvider');

type SaveItemFn = (hike: HikeProps) => Promise<any>;
type DeleteItemFn = (id: string) => Promise<any>;

export interface ItemsState {
  hikes?: HikeProps[],
  fetching: boolean,
  fetchingError?: Error | null,
  saving: boolean,
  savingError?: Error | null,
  saveItem?: SaveItemFn,
  deleting: boolean,
  deletingError?: Error | null,
  toDeleteItem?: DeleteItemFn
}

interface ActionProps {
  type: string,
  payload?: any,
}

const initialState: ItemsState = {
  fetching: false,
  saving: false,
  deleting: false
};

const FETCH_ITEMS_STARTED = 'FETCH_ITEMS_STARTED';
const FETCH_ITEMS_SUCCEEDED = 'FETCH_ITEMS_SUCCEEDED';
const FETCH_ITEMS_FAILED = 'FETCH_ITEMS_FAILED';
const SAVE_ITEM_STARTED = 'SAVE_ITEM_STARTED';
const SAVE_ITEM_SUCCEEDED = 'SAVE_ITEM_SUCCEEDED';
const SAVE_ITEM_FAILED = 'SAVE_ITEM_FAILED';
const DELETE_ITEM_STARTED = 'DELETE_ITEM_STARTED';
const DELETE_ITEM_SUCCEEDED = 'DELETE_ITEM_SUCCEEDED';
const DELETE_ITEM_FAILED = 'DELETE_ITEM_FAILED';

const reducer: (state: ItemsState, action: ActionProps) => ItemsState =
  (state, { type, payload }) => {
    switch (type) {
      case FETCH_ITEMS_STARTED:
        return { ...state, fetching: true, fetchingError: null };
      case FETCH_ITEMS_SUCCEEDED:
        return { ...state, hikes: payload.items, fetching: false };
      case FETCH_ITEMS_FAILED:
        return { ...state, fetchingError: payload.error, fetching: false };
      case SAVE_ITEM_STARTED:
        return { ...state, savingError: null, saving: true };
      case DELETE_ITEM_STARTED:
        return { ...state, deleteingError: null, deleting: true };
      case DELETE_ITEM_FAILED:
        return { ...state, deletingError: payload.error, deleting: false };
      case DELETE_ITEM_SUCCEEDED:
        const remainingHikes = [...(state.hikes || [])].filter(it => it.id !== payload.id);
        return { ...state, hikes: remainingHikes, deleting: false };
      case SAVE_ITEM_SUCCEEDED:
        const items = [...(state.hikes || [])];
        const item = payload.item;
        const index = items.findIndex(it => it.id === item.id);
        if (index === -1) {
          items.splice(0, 0, item);
        } else {
          items[index] = item;
        }
        return { ...state, hikes: items, saving: false };
      case SAVE_ITEM_FAILED:
        return { ...state, savingError: payload.error, saving: false };
      default:
        return state;
    }
  };

export const ItemContext = React.createContext<ItemsState>(initialState);

interface ItemProviderProps {
  children: PropTypes.ReactNodeLike,
}

export const ItemProvider: React.FC<ItemProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { hikes, fetching, fetchingError, saving, savingError, deleting, deletingError } = state;
  useEffect(getItemsEffect, []);
  useEffect(wsEffect, []);
  const saveItem = useCallback<SaveItemFn>(saveItemCallback, []);
  const toDeleteItem = useCallback<DeleteItemFn>(deleteItemCallback, []);
  const value = { hikes, fetching, fetchingError, saving, savingError, saveItem, deleting, deletingError, toDeleteItem };
  log('returns');
  return (
    <ItemContext.Provider value={value}>
      {children}
    </ItemContext.Provider>
  );

  function getItemsEffect() {
    let canceled = false;
    fetchItems();

    return () => {
      canceled = true;
    }

    async function fetchItems() {
      try {
        log('fetchItems started');
        dispatch({ type: FETCH_ITEMS_STARTED });
        const items = await getItems();
        log('fetchItems succeeded');
        if (!canceled) {
          dispatch({ type: FETCH_ITEMS_SUCCEEDED, payload: { items } });
        }
      } catch (error) {
        log('fetchItems failed', error);
        dispatch({ type: FETCH_ITEMS_FAILED, payload: { error } });
      }
    }
  }

  async function saveItemCallback(item: HikeProps) {
    try {
      log('saveItem started');
      dispatch({ type: SAVE_ITEM_STARTED });
      const savedItem = await (item.id ? updateItem(item) : createItem(item));
      log('saveItem succeeded');
      dispatch({ type: SAVE_ITEM_SUCCEEDED, payload: { item: savedItem } });
    } catch (error) {
      log('saveItem failed');
      dispatch({ type: SAVE_ITEM_FAILED, payload: { error } });
    }
  }

  async function deleteItemCallback(id: string) {
    try {
      log('deleteItem started');
      dispatch({ type: DELETE_ITEM_STARTED });
      await (deleteItem(id));
      log('deleteItem succeeded');
      dispatch({ type: DELETE_ITEM_SUCCEEDED, payload: { id } });
    } catch (error) {
      log('deleteItem failed');
      dispatch({ type: DELETE_ITEM_FAILED, payload: { error } });
    }
  }

  function wsEffect() {
    let canceled = false;
    log('wsEffect - connecting');
    let closeWebSocket: () => void;
    closeWebSocket = newWebSocket(message => {
      if (canceled) {
        return;
      }
      const { type, payload: item } = message;
      log(`ws message, item ${type}`);
      if (type === 'created' || type === 'updated') {
        dispatch({ type: SAVE_ITEM_SUCCEEDED, payload: { item } });
      }
      if (type === 'deleted') {
        dispatch({ type: DELETE_ITEM_SUCCEEDED, payload: { item } });
      }
    });
    return () => {
      log('wsEffect - disconnecting');
      canceled = true;
      closeWebSocket?.();
    }
  }
};
