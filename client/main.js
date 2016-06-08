'use strict';

var vsSprite = require('./vs-sprite.js');
var vsMath = require('./vs-math.js');

window.preload = function() {
    game.load.spritesheet('thor', '/assets/images/Thor.png', 32, 32);
}

var ship1;
var ship2;
window.create = function() {
    game.time.advancedTiming = true
    game.enableStep();
    game.time.desiredFps = 30;
    game.physics.startSystem(Phaser.Physics.ARCADE);
    ship1 = vsSprite.setupSprite(game, 'Thor');
}

var desiredAngle = 0;
var closestPoint = {x:0, y:0};
var response = null;
window.update = function() {
    console.log('+++start tick+++');
    if (game.input.mousePointer.isDown) {
        console.log('Pointer Down');
        closestPoint = vsMath.closestVirtualPoint(ship1.position, game.input.mousePointer.position);
        console.log(closestPoint);
        desiredAngle =  Math.floor(Phaser.Math.radToDeg(Phaser.Math.angleBetweenPoints(ship1.position, closestPoint))) + 90; //sprite image is rotated 90 degrees... need better fix for this
        if (desiredAngle > 180) {
            desiredAngle = desiredAngle - 360;
        }
        
        ship1.moveForward(ship1, 50);
        ship1.animations.play('moving');
    } else {
        ship1.body.acceleration.set(0);
        ship1.animations.play('stopped');
    }
    
    socket.emit('tick', { 
        opponentPosition: [closestPoint.x, closestPoint.y],
        angle: desiredAngle
    }, function (res) {
        console.log('Response:');
        console.log(res);
        response = res;
        game.step();
    });
    
    if (response != null) {
        desiredAngle = response.angle;
    }
    ship1.setNextAngle(ship1, desiredAngle);
    game.world.wrap(ship1);
    console.log('FPS: ' + game.time.fps);
    console.log('elaspsed MS: ' + game.time.elapsedMS);
}
