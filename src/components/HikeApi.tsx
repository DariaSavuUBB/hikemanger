import axios from 'axios';
import { baseUrl, getLogger, withLogs } from '../core';
import { HikeProps } from './HikeProps';

const itemUrl = `http://${baseUrl}/api/hike`;

export const getItems: () => Promise<HikeProps[]> = () => {
  return withLogs(axios.get(itemUrl), 'getItems');
}

export const createItem: (item: HikeProps) => Promise<HikeProps[]> = (item) => {
  return withLogs(axios.post(itemUrl, item), 'createItem');
}

export const updateItem: (item: HikeProps) => Promise<HikeProps[]> = (item) => {
  return withLogs(axios.put(`${itemUrl}/${item.id}`, item), 'updateItem');
}

export const deleteItem: (id: string) => Promise<void> = (id) => {
  console.log(id);
  return withLogs(axios.delete(`${itemUrl}/${id}`), 'deleteItem');
}

interface MessageData {
  type: string;
  payload: HikeProps;
}

const log = getLogger('ws');

export const newWebSocket = (onMessage: (data: MessageData) => void) => {
  const ws = new WebSocket(`ws://${baseUrl}`);
  ws.onopen = () => {
    log('web socket onopen');
  };
  ws.onclose = () => {
    log('web socket onclose');
  };
  ws.onerror = error => {
    log('web socket onerror', error);
  };
  ws.onmessage = messageEvent => {
    log('web socket onmessage');
    onMessage(JSON.parse(messageEvent.data));
  };
  return () => {
    ws.close();
  }
}
