import {
  initSocket as sharedInit,
  getSocket as sharedGet,
  disconnectSocket as sharedDisconnect,
  isSocketConnected as sharedIsConnected,
  emitSocket as sharedEmit,
  joinMatchRoom as sharedJoin,
  leaveMatchRoom as sharedLeave,
} from "../../../Shared/services/socket.js";

const NS = "admin";

export const getSocket = () => sharedGet(NS);

export const initSocket = () => sharedInit(NS);

export const disconnectSocket = () => sharedDisconnect(NS);

export const isSocketConnected = () => sharedIsConnected(NS);

export const emitSocket = (event, data) => sharedEmit(event, data, NS);

export const joinMatchRoom = (matchId) => sharedJoin(matchId, NS);

export const leaveMatchRoom = (matchId) => sharedLeave(matchId, NS);

if (import.meta.hot) {
  import.meta.hot.dispose(() => {});
}

export default { initSocket, getSocket, disconnectSocket, isSocketConnected, emitSocket, joinMatchRoom, leaveMatchRoom };
