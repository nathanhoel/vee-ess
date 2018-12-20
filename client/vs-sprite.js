var vsPhysics = require('./vs-sprite-physics.js');

function Sprite(game) {
    this.game = game;
}
module.exports = Sprite;

Sprite.prototype.setupSprite = function(name, x, y) {
    ship = this.game.add.sprite(x, y, 'thor', 1);
    ship.name = name;
    ship.animations.add('moving', [0,1,2,3], 8, true);
    ship.animations.add('stopped', [0]);
    ship.animations.play('stopped');
    ship.anchor.setTo(0.5);
    this.game.physics.arcade.enable(ship);
    ship.body.drag.set(50);
    ship.body.maxVelocity.set(500);
    
    funcNames = Object.keys(vsPhysics);
    funcNames.forEach(function(funcName) {
        ship[funcName] = vsPhysics[funcName];
    });
    
    return ship;
};
