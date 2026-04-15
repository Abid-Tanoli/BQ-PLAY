// AI Commentary Generation Service
// Generates intelligent cricket commentary based on match events, field positions, and context

class AICommentaryService {
  constructor() {
    // Commentary templates organized by event type
    this.templates = {
      // Dot balls
      dot: {
        defensive: [
          "Good length delivery outside off, {batsman} gets right behind the line and defends solidly to {zone}",
          "{bowler} hits the corridor outside off, {batsman} has no shot and lets it through to the keeper",
          "Back of a length on off stump, {batsman} gets on his toes and blocks it out to {zone}",
          "On off stump, {batsman} presses forward and defends it back to {bowler}",
          "Short of length outside off, {batsman} cuts but finds the fielder at {zone}"
        ],
        beaten: [
          "What a delivery from {bowler}! Just past the outside edge of {batsman}, excellent ball",
          "{bowler} gets one to jag back off the seam, {batsman} beaten on the crease!",
          "Beaten! {bowler} pitches it up and moves it away from {batsman}"
        ],
        leaving: [
          "{batsman} shoulders arms to a delivery outside off from {bowler}",
          "Good carry to the keeper as {batsman} watches it through to {zone}"
        ]
      },

      // Singles
      single: {
        rotation: [
          "Quick single taken! {batsman} taps it to {zone} and they scamper through",
          "Worked away to {zone} for one, good running between the wickets",
          "Pushed into the gap at {zone}, {batsman} calls early and takes the single"
        ],
        placement: [
          "Nicely placed to {zone} by {batsman}, one run taken comfortably",
          "{batsman} guides it down to {zone} for a single"
        ]
      },

      // Twos and threes
      multiples: [
        "Two runs! {batsman} drives it to {zone}, good calling between the batsmen",
        "They push hard for the second! {batsman} sends it to {zone}, excellent running",
        "THREE RUNS! Brilliant placement to {zone} by {batsman}, great fitness on display",
        "{batsman} finds the gap at {zone}, they come back for two runs"
      ],

      // Fours
      four: {
        drive: [
          "FOUR! Glorious drive from {batsman}! Leans into it and sends it racing through {zone}",
          "FOUR! Overpitched and punished! {batsman} drives elegantly through {zone}",
          "FOUR! Classic drive from {batsman}! Rolls away through {zone} for a boundary"
        ],
        cut: [
          "FOUR! Short and wide! {batsman} cuts it away past {zone}",
          "FOUR! Late cut! {batsman} guides it beautifully through {zone}",
          "FOUR! Slashed over {zone}, no chance for the fielder"
        ],
        pull: [
          "FOUR! Short ball! {batsman} pulls it away through {zone}",
          "FOUR! Hooked away! {batsman} picks the gap at {zone} perfectly",
          "FOUR! Short and dispatched! Races away through {zone}"
        ],
        glance: [
          "FOUR! Glanced away! {batsman} picks up the boundary through {zone}",
          "FOUR! Fine touch! {batsman} guides it through {zone} for four",
          "FOUR! On the pads and worked away! Finds the gap at {zone}"
        ],
        lofted: [
          "FOUR! Lofted! {batsman} clears {zone} and it bounces over the rope",
          "FOUR! Sliced over {zone}! The fielder runs but can't stop it"
        ]
      },

      // Sixes
      six: {
        straight: [
          "SIX! MASSIVE! {batsman} launches it straight down the ground over {zone}!",
          "SIX! Clean strike! {batsman} sends it sailing over {zone} into the stands",
          "SIX! Incredible power! {batsman} launches it over {zone} for a maximum!"
        ],
        pull: [
          "SIX! Short ball punished! {batsman} hooks it over {zone} for six!",
          "SIX! Pulled away! {batsman} deposits it over {zone}!"
        ],
        slog: [
          "SIX! Slog-swept! {batsman} clears {zone} and it goes deep into the crowd",
          "SIX! Down the track! {batsman} launches it over {zone} for a huge six!"
        ]
      },

      // Wickets
      wicket: {
        bowled: [
          "BOWLED! {bowler} gets through the defense of {batsman}! The stumps are shattered!",
          "OUT! Timber! {bowler} produces a jaffa, {batsman} has no answer",
          "BOWLED HIM! Cleaned up! {bowler} strikes with a perfect delivery"
        ],
        caught: {
          slip: "CAUGHT! Edged and gone! {batsman} edges to {zone}, sharp catch!",
          gully: "CAUGHT! {batsman} edges one to {zone}, excellent reflexes from the fielder!",
          infield: "CAUGHT! {batsman} holes out to {zone}! End of a fine innings",
          deep: "CAUGHT! {batsman} lofts it to {zone}, the fielder runs in and takes it on the boundary!",
          generic: "CAUGHT! {batsman} skies it to {zone}, simple catch for the fielder!"
        },
        lbw: [
          "LBW! The finger goes up! {batsman} trapped plumb in front by {bowler}",
          "OUT! Dead in front! {batsman} has to walk back, {bowler} strikes",
          "PLUMB! That looked out! {bowler} gets the big wicket of {batsman}"
        ],
        runOut: [
          "RUN OUT! Direct hit! {batsman} is well short of the crease!",
          "OUT! Run out! Lightning quick throw from {zone}, {batsman} has to go",
          "RUN OUT! Mix-up between the wickets! {batsman} caught short"
        ],
        stumped: [
          "STUMPED! Quick as a flash! {batsman} beaten and out of his crease",
          "OUT! Stumped! {batsman} down the track and beaten by {bowler}"
        ]
      },

      // Extras
      wide: [
        "WIDE! {bowler} strays down the leg side",
        "WIDE! That's way outside the tramline from {bowler}",
        "WIDE! {bowler} loses his line and length"
      ],
      noBall: [
        "NO BALL! {bowler} oversteps, free hit coming up!",
        "NO BALL! Front foot over the crease from {bowler}",
        "NO BALL! {bowler} will have to bowl that again"
      ],
      bye: [
        "{runs} bye(s)! Keeper couldn't collect, {batsman} lets it through",
        "{runs} bye(s)! Ball runs away to {zone}"
      ],
      legBye: [
        "{runs} leg bye(s)! Off the pads and away to {zone}",
        "{runs} leg bye(s)! {batsman} tucks it off the body"
      ]
    };

    // Over summary templates
    this.overSummaries = {
      maiden: "Maiden over! {bowler} builds pressure with a perfect over",
      cheap: "{runs} runs from the over. {bowler} keeps it tight",
      expensive: "{runs} runs from the over. {bowler} under pressure",
      wicketOver: "WICKET OVER! {bowler} strikes to break the partnership",
      boundaryOver: "Boundary-heavy over! {runs} runs off {bowler}'s over"
    };
  }

  // Select random item from array
  getRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  // Replace placeholders in template
  fillTemplate(template, data) {
    return template.replace(/\{(\w+)\}/g, (match, key) => {
      return data[key] !== undefined ? data[key] : match;
    });
  }

  // Generate commentary for a ball
  generateBallCommentary({
    runs,
    isWide,
    isNoBall,
    isBye,
    isLegBye,
    isWicket,
    wicketType,
    batsmanName,
    bowlerName,
    zone,
    distanceCategory,
    overNumber,
    ballNumber,
    currentScore,
    currentWickets,
    matchContext
  }) {
    const firstLine = `${overNumber}.${ballNumber}${isNoBall ? 'nb' : ''}`;
    let commentary = '';

    // Handle wickets
    if (isWicket) {
      commentary = this.generateWicketCommentary(wicketType, {
        batsman: batsmanName,
        bowler: bowlerName,
        zone: zone || 'mid off',
        distance: distanceCategory
      });
      return `${firstLine} - ${commentary}`;
    }

    // Handle wides
    if (isWide) {
      let wideCommentary = this.getRandom(this.templates.wide);
      wideCommentary = this.fillTemplate(wideCommentary, { bowler: bowlerName });
      if (runs > 0) {
        wideCommentary += `. They run ${runs} additional ${runs === 1 ? 'run' : 'runs'}`;
      }
      return `${firstLine} - WIDE! ${wideCommentary}`;
    }

    // Handle no-balls
    if (isNoBall) {
      let nbCommentary = this.getRandom(this.templates.noBall);
      nbCommentary = this.fillTemplate(nbCommentary, { bowler: bowlerName });
      return `${firstLine} - NO BALL! ${nbCommentary}`;
    }

    // Handle byes
    if (isBye) {
      let byeCommentary = this.getRandom(this.templates.bye);
      byeCommentary = this.fillTemplate(byeCommentary, { runs, zone: zone || 'third man' });
      return `${firstLine} - ${byeCommentary}`;
    }

    // Handle leg-byes
    if (isLegBye) {
      let lbCommentary = this.getRandom(this.templates.legBye);
      lbCommentary = this.fillTemplate(lbCommentary, { runs, zone: zone || 'square leg' });
      return `${firstLine} - ${lbCommentary}`;
    }

    // Handle runs scored
    commentary = this.generateRunsCommentary(runs, {
      batsman: batsmanName,
      bowler: bowlerName,
      zone: zone || 'mid off',
      distance: distanceCategory || 'ring'
    });

    return `${firstLine} - ${commentary}`;
  }

  // Generate commentary for runs scored
  generateRunsCommentary(runs, context) {
    const { batsman, bowler, zone, distance } = context;
    const data = { batsman, bowler, zone: this.capitalizeFirst(zone), runs };

    if (runs === 0) {
      // Determine type of dot ball
      const dotType = this.getDotBallType(zone, distance);
      const templates = this.templates.dot[dotType] || this.templates.dot.defensive;
      return this.fillTemplate(this.getRandom(templates), data);
    }

    if (runs === 1) {
      const category = Math.random() > 0.5 ? 'rotation' : 'placement';
      return this.fillTemplate(this.getRandom(this.templates.single[category]), data);
    }

    if (runs === 2 || runs === 3) {
      return this.fillTemplate(this.getRandom(this.templates.multiples), data);
    }

    if (runs === 4) {
      const shotType = this.getShotType(zone, distance);
      return this.fillTemplate(this.getRandom(this.templates.four[shotType]), data);
    }

    if (runs === 6) {
      const shotType = this.getSixType(zone);
      return this.fillTemplate(this.getRandom(this.templates.six[shotType]), data);
    }

    // Fallback for unusual run values
    return `${runs} runs scored to ${this.capitalizeFirst(zone)}`;
  }

  // Generate wicket commentary
  generateWicketCommentary(wicketType, context) {
    const { batsman, bowler, zone, distance } = context;
    const data = { batsman, bowler, zone: this.capitalizeFirst(zone) };

    const wicketTemplates = this.templates.wicket;

    switch (wicketType) {
      case 'bowled':
        return this.fillTemplate(this.getRandom(wicketTemplates.bowled), data);

      case 'lbw':
        return this.fillTemplate(this.getRandom(wicketTemplates.lbw), data);

      case 'run out':
        return this.fillTemplate(this.getRandom(wicketTemplates.runOut), data);

      case 'stumped':
        return this.fillTemplate(this.getRandom(wicketTemplates.stumped), data);

      case 'caught':
        let catchType = 'generic';
        const zoneLower = zone.toLowerCase();

        if (zoneLower.includes('slip') || zoneLower.includes('gully')) {
          catchType = 'slip';
        } else if (zoneLower.includes('deep') || zoneLower.includes('long')) {
          catchType = 'deep';
        } else if (['cover', 'mid wicket', 'mid on', 'mid off'].includes(zoneLower)) {
          catchType = 'infield';
        }

        const catchTemplate = this.getRandom(wicketTemplates.caught[catchType] || wicketTemplates.caught.generic);
        return this.fillTemplate(catchTemplate, data);

      default:
        return `OUT! ${batsman} departs. ${bowler} gets the wicket.`;
    }
  }

  // Generate over summary
  generateOverSummary(overData) {
    const { runs, wickets, balls, bowlerName } = overData;
    const data = { runs, wickets, bowler: bowlerName };

    if (wickets > 0 && runs === 0) {
      return this.fillTemplate(this.overSummaries.wicketOver, data);
    }

    if (runs === 0 && balls.every(b => !b.isWide && !b.isNoBall)) {
      return this.fillTemplate(this.overSummaries.maiden, data);
    }

    if (runs <= 4) {
      return this.fillTemplate(this.overSummaries.cheap, data);
    }

    if (runs >= 14) {
      return this.fillTemplate(this.overSummaries.expensive, data);
    }

    if (runs >= 10) {
      return this.fillTemplate(this.overSummaries.boundaryOver, data);
    }

    return `${runs} run${runs !== 1 ? 's' : ''} and ${wickets} wicket${wickets !== 1 ? 's' : ''} from the over`;
  }

  // Determine dot ball type based on zone
  getDotBallType(zone, distance) {
    const zoneLower = zone.toLowerCase();

    if (zoneLower.includes('slip') || zoneLower.includes('gully')) {
      return 'beaten';
    }

    if (['bowler', 'mid on', 'mid off', 'cover'].includes(zoneLower)) {
      return 'defensive';
    }

    return 'leaving';
  }

  // Determine shot type for boundaries
  getShotType(zone, distance) {
    const zoneLower = zone.toLowerCase();

    if (zoneLower.includes('cover') || zoneLower.includes('extra cover')) {
      return 'drive';
    }

    if (zoneLower.includes('point') || zoneLower.includes('gully')) {
      return 'cut';
    }

    if (zoneLower.includes('mid wicket') || zoneLower.includes('square leg')) {
      return 'pull';
    }

    if (zoneLower.includes('fine leg') || zoneLower.includes('third man')) {
      return 'glance';
    }

    if (distance === 'deep' || distance === 'infield') {
      return 'lofted';
    }

    return 'drive';
  }

  // Determine six type
  getSixType(zone) {
    const zoneLower = zone.toLowerCase();

    if (zoneLower.includes('mid wicket') || zoneLower.includes('square leg')) {
      return 'pull';
    }

    if (['long on', 'long off', 'mid on', 'mid off'].includes(zoneLower)) {
      return 'straight';
    }

    return 'slog';
  }

  // Capitalize first letter
  capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // Generate match situation commentary
  generateMatchContext(matchState) {
    const { runs, wickets, overs, target, requiredRunRate } = matchState;

    if (target && requiredRunRate) {
      const remainingRuns = target - runs;
      const remainingBalls = (matchState.totalOvers * 6) - (overs * 6);

      if (remainingRuns <= 10 && remainingBalls <= 12) {
        return `Tense finish! ${remainingRuns} needed off ${remainingBalls} balls`;
      }

      if (requiredRunRate > 12) {
        return `Run rate climbing fast! ${requiredRunRate} required per over`;
      }

      if (wickets >= 7) {
        return `Lower order batting. ${10 - wickets} wickets left, ${remainingRuns} needed`;
      }
    }

    if (wickets >= 5 && overs < 10) {
      return `Batting team in trouble at ${runs}/${wickets}`;
    }

    if (runs / (overs || 1) > 10) {
      return `Explosive start! Run rate above 10 per over`;
    }

    return '';
  }
}

export default new AICommentaryService();
