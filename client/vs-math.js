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
