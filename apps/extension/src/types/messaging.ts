export enum MessageType {
  GET_USER_DATA = "GET_USER_DATA",
  SAVE_DATA = "SAVE_DATA",
  NOTIFY_USER = "NOTIFY_USER",
  PURGE_VAULT = "PURGE_VAULT",
  UPDATE_SETTINGS = "UPDATE_SETTINGS",
}

export interface MessagePayloads {
  [MessageType.GET_USER_DATA]: { userId: string };
  [MessageType.SAVE_DATA]: { key: string; value: any };
  [MessageType.NOTIFY_USER]: { title: string; message: string; type: 'info' | 'warning' | 'error' };
  [MessageType.PURGE_VAULT]: { confirm: boolean };
  [MessageType.UPDATE_SETTINGS]: { settings: Record<string, any> };
}

export interface ChromeMessage<T extends MessageType = MessageType> {
  type: T;
  payload: MessagePayloads[T];
  source: 'content' | 'background' | 'popup' | 'sidepanel';
}

export interface MessageResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}
