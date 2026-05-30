const userSocketMap = new Map(); // or a plain object

function getUserSocketId(userId) {
  return userSocketMap.get(userId);
}

function setUserSocketId(userId, socketId) {
  userSocketMap.set(userId, socketId);
}

module.exports = {
  getUserSocketId,
  setUserSocketId,
};
