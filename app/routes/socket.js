module.exports = function (app) {
    var io = require('socket.io')(app);
    
    io.on('connection', function (socket) {
      socket.on('tick', function (data, next) {
        console.log(data);
        next({
           angle: data.angle + 30 
        });
      });
    });

    return;
};
