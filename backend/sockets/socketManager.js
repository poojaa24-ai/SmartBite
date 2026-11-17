const initSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);

    // Join room for real-time order tracking
    socket.on('join:order', (orderId) => {
      socket.join(`order_${orderId}`);
      console.log(`[Socket.IO] Socket ${socket.id} joined order room: order_${orderId}`);
    });

    // Join room for seller kitchen
    socket.on('join:seller', (sellerId) => {
      socket.join(`seller_${sellerId}`);
      console.log(`[Socket.IO] Socket ${socket.id} joined seller room: seller_${sellerId}`);
    });

    // Join room for user private notifications
    socket.on('join:user', (userId) => {
      socket.join(`user_${userId}`);
    });

    // Join room for community group orders (FEATURE 4)
    socket.on('join:group', (groupCode) => {
      socket.join(`group_${groupCode}`);
      console.log(`[Socket.IO] Socket ${socket.id} joined group order: group_${groupCode}`);
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    });
  });
};

module.exports = initSocket;
