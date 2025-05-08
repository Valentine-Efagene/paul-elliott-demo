export enum SocketChannel {
  EVENTS = "events",
  IDENTITY = "identity",
  NOTIFICATIONS = "notifications",
  MESSAGES = "messages",
  JOIN_ROOM = "join_room",
  LEAVE_ROOM = "leave_room",
  GROUP_MESSAGE = "group_message",
}

export enum EventQueueJobNames {
  SEND = 'SEND'
}

export enum EventQueueNames {
  NOTIFICATION = 'NOTIFICATION_EVENTS',
  MESSAGE = 'MESSAGE'
}