import {
  initSocket as sharedInit,
  getSocket as sharedGet,
  joinMatchRoom as sharedJoin,
  leaveMatchRoom as sharedLeave,
  disconnectSocket as sharedDisconnect,
} from "../../../Shared/services/socket.js";

const NS = "user";

export function getSocket() {
  return sharedGet(NS);
}

export function initSocket() {
  return sharedInit(NS);
}

export function joinMatchRoom(matchId) {
  return sharedJoin(matchId, NS);
}

export function leaveMatchRoom(matchId) {
  return sharedLeave(matchId, NS);
}

export function disconnectSocket() {
  return sharedDisconnect(NS);
}

export default {
  initSocket,
  getSocket,
  joinMatchRoom,
  leaveMatchRoom,
  disconnectSocket,
};
