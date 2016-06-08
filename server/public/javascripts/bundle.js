(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var vsSprite = require('./vs-sprite.js');
var vsMath = require('./vs-math.js');

window.preload = function() {
    console.log(Object.keys(vsMath));
    console.log(Object.keys(vsSprite));
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
    console.log(Object.keys(vsMath));
    console.log(Object.keys(vsSprite));
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

},{"./vs-math.js":2,"./vs-sprite.js":4}],2:[function(require,module,exports){
module.exports.closestVirtualPoint = function(basePoint, relativePoint) {
    // if x diff of x values is less than game.width then 
    // both points are in the same x hemisphere
    var xDiff = basePoint.x - relativePoint.x;
    var sameXHemisphere = Math.abs(xDiff) > game.width;
    // same for y hemisphere
    var yDiff = basePoint.y - relativePoint.y;
    var sameYHemisphere = yDiff > game.height;
    
    // if both are the same then they are in the same 
    // quadrant and the closest path is the direct path
    if (sameXHemisphere && sameYHemisphere) {
        return relativePoint;
    }
    
    var points = [];
    
    // if only one hemisphere is shared
    var yDirection = Math.sign(yDiff);
    var adjustedY = yDirection * game.height + relativePoint.y;
    var xDirection = Math.sign(xDiff);
    var adjustedX = xDirection * game.width + relativePoint.x;
    if (!sameYHemisphere) {
        points.push(new Phaser.Point(relativePoint.x, adjustedY));
    }
    
    if (!sameXHemisphere) {
        points.push(new Phaser.Point(adjustedX, relativePoint.y));
    }
    
    if (!sameXHemisphere && !sameYHemisphere) {
        points.push(new Phaser.Point(adjustedX, adjustedY));
    }
    
    var closestPoint = relativePoint;
    var closestDistance = Phaser.Math.distance(basePoint.x, basePoint.y, relativePoint.x, relativePoint.y);
    points.forEach(function(point) {
        var distance = Phaser.Math.distance(basePoint.x, basePoint.y, point.x, point.y);
        if (distance < closestDistance) {
            closestDistance = distance;
            closestPoint = point;
        }
    });
    
    return closestPoint;
}

},{}],3:[function(require,module,exports){
module.exports.moveForward = function(sprite, speed) {
 game.physics.arcade.accelerationFromRotation(sprite.rotation - (Math.PI/2), speed, sprite.body.acceleration);
}

var maxAngularAcceleration = 0.5;
var maxAngularVelocity = 10;
module.exports.setNextAngle = function(sprite, desiredAngle) {
    currentAngle = sprite.angle;
    currentAngularVelocity = sprite.angularVelocity || 0;
    
    angleError = Math.abs(desiredAngle - currentAngle);
    var relativeVelocity = desiredAngle < currentAngle ? -1 : 1;
    if (angleError > 180) {
        relativeVelocity = relativeVelocity * -1;
        angleError = Math.abs(angleError - 360);
    }
    
    // Base Case: angleError is within angular acceleration
    if (angleError <= Math.max(maxAngularAcceleration, 2)) {
        sprite.angularVelocity = relativeVelocity * angleError;
        sprite.angle = desiredAngle;
        console.log('setting angle to: '+ desiredAngle);
        return;
    }
    
    console.log('------------------------------');
    console.log('current angle: ' + currentAngle);
    console.log('desired angle: ' + desiredAngle);
    console.log('angle error: ' + angleError);
    
    // Choose some new velocity within range of current
    // velocity such that 
    // (angleError - VInRange) >= stopping distance
    // stopping distance is equal to
    // (VInRange / 2) * (VInRange/maxAngularAcceleration - 1);
    // http://www.wolframalpha.com/input/?i=solve+for+x+:+%5B%2F%2Fmath:y-x+%3E%3D+(x+%2F+2)+*+(x%2Fz+-+1)%2F%2F%5D
    bestVelocity = 0.5 * Math.sqrt(8*angleError*maxAngularAcceleration + maxAngularAcceleration^2) - (maxAngularAcceleration/2);
    console.log('best: ' + bestVelocity);
    
    tickMaxVelocity = Math.min(relativeVelocity * currentAngularVelocity + maxAngularAcceleration, maxAngularVelocity);
    console.log('tick max: ' + tickMaxVelocity);
    
    achieveableVelocity = relativeVelocity * Math.min(tickMaxVelocity, bestVelocity);
    console.log('achieveable: ' + achieveableVelocity);
    
    sprite.angularVelocity = achieveableVelocity;
    sprite.angle = currentAngle + achieveableVelocity;
}
},{}],4:[function(require,module,exports){
var vsPhysics = require('./vs-sprite-physics.js');

module.exports.setupSprite = function(game, name) {
    ship = game.add.sprite(200, 200, 'thor', 1);
    ship.name = name;
    ship.animations.add('moving', [0,1,2,3], 8, true);
    ship.animations.add('stopped', [0]);
    ship.animations.play('stopped');
    ship.anchor.setTo(0.5);
    game.physics.arcade.enable(ship);
    ship.body.drag.set(50);
    ship.body.maxVelocity.set(500);
    
    funcNames = Object.keys(vsPhysics);
    funcNames.forEach(function(funcName) {
        ship[funcName] = vsPhysics[funcName];
    });
    
    return ship;
}
},{"./vs-sprite-physics.js":3}]},{},[1]);
