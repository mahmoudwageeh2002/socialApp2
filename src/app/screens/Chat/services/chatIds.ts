// src/services/chatIds.ts
export const dmChatId = (userIdA: string, userIdB: string) =>
  [userIdA, userIdB].sort().join('_');
