const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const config = require('../config/config');

class WebSocketManager {
  constructor(server) {
    this.io = socketIo(server, {
      cors: {
        origin: process.env.NODE_ENV === 'production' 
          ? ['https://yourdomain.com'] 
          : ['http://localhost:3000', 'http://localhost:3001'],
        credentials: true
      }
    });

    this.connectedUsers = new Map(); // userId -> socketId
    this.setupMiddleware();
    this.setupEventHandlers();
  }

  // 设置中间件
  setupMiddleware() {
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.query.token;
        
        if (!token) {
          return next(new Error('Authentication error: Token missing'));
        }

        // 验证JWT令牌
        const decoded = jwt.verify(token, config.jwt.secret);
        socket.userId = decoded.userId;
        next();
      } catch (error) {
        next(new Error('Authentication error: Invalid token'));
      }
    });
  }

  // 设置事件处理器
  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`用户 ${socket.userId} 已连接，Socket ID: ${socket.id}`);
      
      // 保存用户连接信息
      this.connectedUsers.set(socket.userId, socket.id);

      // 心跳检测
      socket.on('heartbeat', (data) => {
        socket.emit('heartbeat_response', {
          timestamp: Date.now(),
          message: 'pong'
        });
      });

      // 断开连接处理
      socket.on('disconnect', () => {
        console.log(`用户 ${socket.userId} 已断开连接`);
        this.connectedUsers.delete(socket.userId);
      });

      // 错误处理
      socket.on('error', (error) => {
        console.error(`Socket 错误: ${error.message}`);
      });
    });
  }

  // 向特定用户发送消息
  sendToUser(userId, event, data) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.io.to(socketId).emit(event, data);
      return true;
    }
    return false;
  }

  // 向所有用户广播消息
  broadcastToAll(event, data) {
    this.io.emit(event, data);
  }

  // 向多个用户发送消息
  sendToUsers(userIds, event, data) {
    const sentCount = userIds.reduce((count, userId) => {
      return count + (this.sendToUser(userId, event, data) ? 1 : 0);
    }, 0);
    return sentCount;
  }

  // 发送红包检测通知
  sendRedPacketNotification(userId, redPacketInfo) {
    return this.sendToUser(userId, 'redpacket_detected', {
      id: redPacketInfo.id,
      app: redPacketInfo.app,
      groupName: redPacketInfo.groupName,
      sender: redPacketInfo.sender,
      amount: redPacketInfo.amount,
      message: redPacketInfo.message,
      timestamp: Date.now()
    });
  }

  // 发送抢红包结果
  sendGrabResult(userId, result) {
    return this.sendToUser(userId, 'grab_result', {
      redPacketId: result.redPacketId,
      success: result.success,
      amount: result.amount,
      responseTime: result.responseTime,
      rank: result.rank,
      timestamp: Date.now()
    });
  }

  // 发送状态更新
  sendStatusUpdate(userId, status) {
    return this.sendToUser(userId, 'status_update', {
      type: status.type,
      data: status.data,
      timestamp: Date.now()
    });
  }

  // 发送系统通知
  sendSystemNotification(userId, notification) {
    return this.sendToUser(userId, 'system_notification', {
      type: notification.type,
      title: notification.title,
      message: notification.message,
      timestamp: Date.now()
    });
  }

  // 获取连接统计
  getConnectionStats() {
    return {
      totalConnections: this.io.engine.clientsCount,
      connectedUsers: this.connectedUsers.size,
      userList: Array.from(this.connectedUsers.keys())
    };
  }

  // 断开用户连接
  disconnectUser(userId) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.io.sockets.sockets.get(socketId)?.disconnect();
      this.connectedUsers.delete(userId);
      return true;
    }
    return false;
  }
}

module.exports = WebSocketManager;
