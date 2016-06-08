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