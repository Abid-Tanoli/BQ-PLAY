// Field Position Mapping Service
// Converts click coordinates (x, y) to cricket fielding zones
// and generates contextual commentary based on position + runs

class FieldPositionMapper {
  constructor() {
    // Field zones defined as regions on a 100x100 grid
    // Origin (0,0) = top-left, (100,100) = bottom-right
    // Batsman faces from bottom to top (50,100 -> 50,0)
    this.fieldZones = [
      // OFF SIDE (right side for right-handed batsman)
      { name: 'first slip', xMin: 65, xMax: 85, yMin: 25, yMax: 45, angle: 105 },
      { name: 'second slip', xMin: 75, xMax: 95, yMin: 30, yMax: 50, angle: 110 },
      { name: 'third slip', xMin: 80, xMax: 100, yMin: 35, yMax: 55, angle: 115 },
      { name: 'gully', xMin: 55, xMax: 75, yMin: 20, yMax: 40, angle: 95 },
      { name: 'point', xMin: 45, xMax: 70, yMin: 15, yMax: 35, angle: 85 },
      { name: 'backward point', xMin: 40, xMax: 65, yMin: 10, yMax: 30, angle: 75 },
      { name: 'cover', xMin: 30, xMax: 55, yMin: 10, yMax: 30, angle: 55 },
      { name: 'extra cover', xMin: 20, xMax: 45, yMin: 5, yMax: 25, angle: 45 },
      { name: 'deep cover', xMin: 25, xMax: 55, yMin: 0, yMax: 20, angle: 50 },
      { name: 'deep point', xMin: 45, xMax: 75, yMin: 0, yMax: 18, angle: 80 },
      { name: 'long off', xMin: 10, xMax: 40, yMin: 0, yMax: 15, angle: 20 },
      { name: 'third man', xMin: 75, xMax: 100, yMin: 35, yMax: 60, angle: 130 },
      { name: 'fine leg', xMin: 70, xMax: 100, yMin: 55, yMax: 75, angle: 150 },
      { name: 'deep fine leg', xMin: 75, xMax: 100, yMin: 45, yMax: 70, angle: 145 },

      // ON SIDE (left side for right-handed batsman)
      { name: 'mid wicket', xMin: 30, xMax: 60, yMin: 55, yMax: 80, angle: -65 },
      { name: 'square leg', xMin: 50, xMax: 75, yMin: 65, yMax: 85, angle: -90 },
      { name: 'backward square leg', xMin: 55, xMax: 80, yMin: 60, yMax: 85, angle: -100 },
      { name: 'mid on', xMin: 15, xMax: 40, yMin: 55, yMax: 75, angle: -20 },
      { name: 'deep mid wicket', xMin: 35, xMax: 65, yMin: 80, yMax: 100, angle: -70 },
      { name: 'deep square leg', xMin: 50, xMax: 80, yMin: 80, yMax: 100, angle: -85 },
      { name: 'long on', xMin: 10, xMax: 35, yMin: 75, yMax: 100, angle: -15 },

      // STRAIGHT
      { name: 'bowler', xMin: 40, xMax: 60, yMin: 40, yMax: 60, angle: 0 },
      { name: 'mid off', xMin: 20, xMax: 45, yMin: 25, yMax: 45, angle: 15 },
      { name: 'long on', xMin: 10, xMax: 35, yMin: 75, yMax: 100, angle: -15 },
      { name: 'long off', xMin: 10, xMax: 40, yMin: 0, yMax: 15, angle: 20 },

      // WIDE regions
      { name: 'wide third man', xMin: 85, xMax: 100, yMin: 20, yMax: 50, angle: 140 },
      { name: 'wide fine leg', xMin: 80, xMax: 100, yMin: 60, yMax: 90, angle: 160 },
    ];

    // Distance zones
    this.distanceZones = {
      infield: { maxDist: 40 },    // 0-40% from batsman
      ring: { minDist: 40, maxDist: 65 },  // 40-65%
      deep: { minDist: 65 }        // 65%+
    };
  }

  // Convert click coordinates (x, y on 100x100 grid) to fielding zone
  getZoneFromCoordinates(x, y) {
    // Normalize coordinates
    const normX = Math.max(0, Math.min(100, x));
    const normY = Math.max(0, Math.min(100, y));

    // Find matching zone
    for (const zone of this.fieldZones) {
      if (normX >= zone.xMin && normX <= zone.xMax && normY >= zone.yMin && normY <= zone.yMax) {
        return {
          name: zone.name,
          angle: zone.angle,
          distance: this.calculateDistanceFromCenter(normX, normY),
          x: normX,
          y: normY
        };
      }
    }

    // Default: find closest zone
    return this.findClosestZone(normX, normY);
  }

  // Calculate distance from batsman position (center-bottom: 50, 85)
  calculateDistanceFromCenter(x, y) {
    const batsmanX = 50;
    const batsmanY = 85;
    const dx = x - batsmanX;
    const dy = y - batsmanY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  // Find closest fielding zone
  findClosestZone(x, y) {
    let closestZone = null;
    let minDistance = Infinity;

    for (const zone of this.fieldZones) {
      const centerX = (zone.xMin + zone.xMax) / 2;
      const centerY = (zone.yMin + zone.yMax) / 2;
      const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);

      if (distance < minDistance) {
        minDistance = distance;
        closestZone = zone;
      }
    }

    return {
      name: closestZone.name,
      angle: closestZone.angle,
      distance: this.calculateDistanceFromCenter(x, y),
      x,
      y
    };
  }

  // Get distance category (infield, ring, deep)
  getDistanceCategory(distance) {
    if (distance <= this.distanceZones.infield.maxDist) return 'infield';
    if (distance <= this.distanceZones.ring.maxDist) return 'ring';
    return 'deep';
  }

  // Generate shot description based on zone and runs
  generateShotDescription(zone, runs, isWicket = false) {
    const distanceCat = this.getDistanceCategory(zone.distance);
    const zoneName = zone.name.toLowerCase();

    if (isWicket) {
      return this.generateWicketDescription(zoneName, distanceCat);
    }

    // Shot type based on zone
    const shotTypes = {
      'cover': 'drive through covers',
      'extra cover': 'drive through extra cover',
      'deep cover': 'lofted drive over cover',
      'point': 'cut past point',
      'backward point': 'late cut past backward point',
      'deep point': 'cut over backward point',
      'mid wicket': 'flick through mid wicket',
      'deep mid wicket': 'pull over mid wicket',
      'square leg': 'glance past square leg',
      'deep square leg': 'pull over square leg',
      'third man': 'guided past third man',
      'fine leg': 'glance past fine leg',
      'deep fine leg': 'scoop over fine leg',
      'long on': 'lofted over long on',
      'long off': 'lofted over long off',
      'mid off': 'driven to mid off',
      'mid on': 'worked to mid on',
      'bowler': 'straight back to bowler',
      'first slip': 'edge to slip',
      'second slip': 'edge to slip',
      'third slip': 'edge to slip',
      'gully': 'edge to gully',
    };

    const shotType = shotTypes[zoneName] || `shot to ${zoneName}`;

    if (runs === 0) {
      return `dot ball - ${shotType}, no run`;
    } else if (runs === 1) {
      return `single - ${shotType}`;
    } else if (runs === 2) {
      return `two runs - ${shotType}, good running`;
    } else if (runs === 3) {
      return `three runs - ${shotType}, excellent running`;
    } else if (runs === 4) {
      if (distanceCat === 'deep') {
        return `FOUR! ${shotType.replace(/to|past|over/g, 'and over')} for a boundary!`;
      }
      return `FOUR! Beautiful ${shotType}, races away to the fence!`;
    } else if (runs === 6) {
      return `SIX! MASSIVE! ${shotType.replace(/to|past/g, 'and over')} for a maximum!`;
    }

    return `${runs} runs - ${shotType}`;
  }

  // Generate wicket description
  generateWicketDescription(zoneName, distanceCat) {
    const wicketDescriptions = {
      'first slip': 'edged and taken at first slip!',
      'second slip': 'thick edge flies to second slip, caught!',
      'third slip': 'edges behind to third slip, gone!',
      'gully': 'edged to gully, sharp catch!',
      'cover': 'drives straight to cover, caught!',
      'mid wicket': 'pulls it straight to mid wicket, caught!',
      'mid on': 'skies it to mid on, simple catch!',
      'mid off': 'lobs to mid off, caught!',
      'long on': 'holed out to long on!',
      'long off': 'holes out to long off!',
      'deep mid wicket': 'deep mid wicket takes it on the boundary!',
      'deep square leg': 'caught at deep square leg!',
      'bowler': 'straight back to the bowler, caught!',
    };

    return wicketDescriptions[zoneName] || `caught at ${zoneName}!`;
  }

  // Generate full commentary based on field position
  generateFieldCommentary(bowlerName, batsmanName, runs, zone, isWicket = false, wicketType = '') {
    const shotDesc = this.generateShotDescription(zone, runs, isWicket);
    const distanceCat = this.getDistanceCategory(zone.distance);

    if (isWicket) {
      return `WICKET! ${batsmanName} ${shotDesc} ${bowlerName} strikes!`;
    }

    // Add distance context
    let context = '';
    if (distanceCat === 'infield') {
      context = 'fielder quickly collects';
    } else if (distanceCat === 'ring') {
      context = 'fielder chases it down';
    } else {
      context = 'no fielder in range';
    }

    return `${shotDesc} ${context}`;
  }
}

export default new FieldPositionMapper();
