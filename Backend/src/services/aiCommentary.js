import fetch from "node-fetch";

// ─── LABEL MAPS ──────────────────────────────────────────────────

const LINE_LABELS = {
  wide_outside_off: "wide outside off",
  outside_off: "outside off",
  off_stump: "on off stump",
  middle_stump: "on middle stump",
  leg_stump: "on leg stump",
  outside_leg: "outside leg",
  wide_outside_leg: "wide down leg",
};
const LENGTH_LABELS = {
  full_toss: "Full toss",
  yorker: "Yorker",
  full: "Full",
  good_length: "Good length",
  hard_length: "Hard length",
  short: "Short",
  bouncer: "Bouncer",
};
const MOVEMENT_LABELS = {
  inswing: "swinging in",
  outswing: "swinging away",
  "off-cutter": "cutting back off the seam",
  "leg-cutter": "cutting away",
  "seam-movement": "moving off the seam",
  googly: "turning in (googly)",
  "leg-spin": "turning away",
  "off-spin": "turning in",
  doosra: "going the other way (doosra)",
  flipper: "skidding through (flipper)",
};
const RUN_OUTCOME = {
  0: "no run",
  1: "1 run",
  2: "2 runs",
  3: "3 runs",
  4: "FOUR!",
  6: "SIX!",
};
const WICKET_WORDS = {
  bowled: "BOWLED HIM! The stumps are shattered!",
  caught: "CAUGHT! Straight to the fielder!",
  lbw: "LBW! Struck in front, given out!",
  "run-out": "RUN OUT! Direct hit!",
  stumped: "STUMPED! The keeper whips the bails off!",
  "hit-wicket": "HIT WICKET! Knocks the stumps over!",
};

const labelize = (value) =>
  String(value || "")
    .replace(/_/g, " ")
    .replace(/-/g, " ")
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

const lookup = (map, value, fallback) => map[value] || labelize(value) || fallback;

// ─── STRUCTURED COMMENTARY BUILDER ───────────────────────────────

function buildStructuredCommentary(data) {
  const {
    runs = 0,
    isWide = false,
    isNoBall = false,
    isWicket = false,
    wicketType = "",
    wicketCancelled = false,
    freeHitNext = false,
    batsmanName = "Batsman",
    bowlerName = "Bowler",
    pitchLine = "",
    pitchLength = "",
    ballMovement = "none",
    shotType = "",
    shotName = "",
    shotDirection = "",
    direction = "",
    side = "",
    fieldingZone = "",
    nearestPosition = "",
    zone = "",
  } = data;

  const shotTypeFinal = shotType || shotName || "shot";
  const dir = shotDirection || direction || side || fieldingZone || nearestPosition || zone || "the outfield";
  const lineText = lookup(LINE_LABELS, pitchLine, "on the stumps");
  const lengthText = lookup(LENGTH_LABELS, pitchLength, "Good length");
  const moveText =
    !ballMovement || ballMovement === "none"
      ? "straight delivery"
      : lookup(MOVEMENT_LABELS, ballMovement, ballMovement.replace(/_/g, " "));
  const shotText = shotTypeFinal && shotTypeFinal !== "shot" ? labelize(shotTypeFinal) : "shot";
  const outcomeText = wicketCancelled
    ? "no ball, wicket cancelled"
    : isWicket
      ? lookup(WICKET_WORDS, normalizeKey(wicketType), "OUT!")
      : isWide
        ? "wide ball"
        : isNoBall
          ? "no ball"
          : lookup(RUN_OUTCOME, runs, `${runs} runs`);

  // Handle extras differently — pitch details may not apply
  if (isWide) {
    const wideDesc = lineText !== "on the stumps" ? `down ${lineText}` : "down the leg side";
    return {
      short: `${bowlerName} to ${batsmanName}, ${outcomeText}`,
      vivid: `Wide delivery ${wideDesc}, ${moveText}. ${batsmanName} lets it go, called wide by the umpire.`,
    };
  }
  if (wicketCancelled) {
    const freeHitLine = freeHitNext ? " Free Hit is coming next ball." : "";
    const wicketDesc = lookup(WICKET_WORDS, normalizeKey(wicketType), "OUT!").toLowerCase();
    return {
      short: `${bowlerName} to ${batsmanName}, ${outcomeText}`,
      vivid: `${lengthText} ball ${lineText}, ${moveText} — ${batsmanName} plays the ${shotText}, sends it toward ${dir}. ${wicketDesc} But wait — it is a NO BALL! Wicket cancelled, ${batsmanName} survives. One extra run added.${freeHitLine}`,
    };
  }
  if (isNoBall) {
    const freeHitLine = freeHitNext ? " Free Hit is coming next ball." : "";
    if (runs === 0) {
      return {
        short: `${bowlerName} to ${batsmanName}, ${outcomeText}`,
        vivid: `${lengthText} ball ${lineText}, ${moveText} — ${batsmanName} swings but fails to connect. No ball called.${freeHitLine}`,
      };
    }
    const runDesc = runs === 4 ? "FOUR!" : runs === 6 ? "SIX!" : `${runs} run${runs !== 1 ? 's' : ''}`;
    return {
      short: `${bowlerName} to ${batsmanName}, ${outcomeText}, ${runs} run${runs !== 1 ? 's' : ''}`,
      vivid: `${lengthText} ball ${lineText}, ${moveText} — ${batsmanName} gets ${runDesc} on a no ball.${freeHitLine}`,
    };
  }

  // ─── MAIN TEMPLATE ────────────────────────────────────────────

  const vivid = `${lengthText} ball ${lineText}, ${moveText} — ${batsmanName} plays the ${shotText}, sends it toward ${dir}. ${outcomeText}`;
  const short = `${bowlerName} to ${batsmanName}, ${lengthText.toLowerCase()} ${lineText}, ${moveText}, ${batsmanName} ${shotText} to ${dir}, ${outcomeText.toLowerCase()}`;

  return { short, vivid };
}

const normalizeKey = (value = "") =>
  String(value || "").trim().toLowerCase().replace(/_/g, "-").replace(/\s+/g, "-");

// ─── AI COMMENTARY SERVICE ──────────────────────────────────────

class AICommentaryService {
  constructor() {
    this.apiKey = process.env.ANTHROPIC_API_KEY;
    this.model = "claude-sonnet-4-20250514";
  }

  // Main entry: always returns structured commentary first, optionally enhances with AI
  async generateBallCommentary(data) {
    // 1. Always generate structured template commentary
    const structured = buildStructuredCommentary(data);
    let result = { ...structured };

    // 2. If AI key available, enhance VIVID with AI flair (keep SHORT as is)
    if (this.apiKey) {
      try {
        const vividEnriched = await this._aiEnrichVivid(data, structured.vivid);
        if (vividEnriched) result.vivid = vividEnriched;
      } catch (err) {
        console.error("AI enrichment error:", err.message);
      }
    }

    return result;
  }

  async _aiEnrichVivid(data, baseVivid) {
    const {
      runs = 0,
      isWide = false,
      isNoBall = false,
      isWicket = false,
      wicketType = "",
      batsmanName = "Batsman",
      bowlerName = "Bowler",
      pitchLine = "",
      pitchLength = "",
      ballMovement = "none",
      shotType = "",
      shotDirection = "",
      fieldingZone = "",
      nearestPosition = "",
      zone = "",
      overNumber = 0,
      ballNumber = 1,
      currentScore = 0,
      currentWickets = 0,
      matchContext = {},
    } = data;

    const lineText = lookup(LINE_LABELS, pitchLine, "on the stumps");
    const lengthText = lookup(LENGTH_LABELS, pitchLength, "Good length");
    const moveText =
      !ballMovement || ballMovement === "none"
        ? "straight"
        : ballMovement.replace(/_/g, " ");
  const shotText = shotTypeFinal && shotTypeFinal !== "shot" ? labelize(shotTypeFinal) : "shot";
    const dir = shotDirection || fieldingZone || nearestPosition || zone || "the outfield";
    const matchSit = matchContext.target
      ? `Need ${matchContext.target - currentScore} from ${Math.max(0, ((matchContext.totalOvers || 1) - (overNumber + ballNumber / 6)) * 6 | 0)} balls`
      : `${currentScore}/${currentWickets}`;

    const prompt = `You are a BQ-PLAY cricket commentator.

BASE COMMENTARY (keep the same factual info, make it sound more natural/expressive):
"${baseVivid}"

BALL DATA:
Bowler: ${bowlerName} | Batter: ${batsmanName}
Delivery: ${lengthText.toLowerCase()} ball ${lineText}, ${moveText}
Shot: ${shotText}
Direction: ${dir}
Runs: ${runs}${isWide ? " (wide)" : ""}${isNoBall ? " (no ball)" : ""}${isWicket ? ` wicket: ${wicketType}` : ""}
Match: ${matchSit}

TASK: Rewrite the VIVID commentary line to be MORE expressive and natural while STRICTLY keeping all 4 factual elements: delivery line+length, ball movement, shot type, and direction. Do NOT remove or reorder these 4 elements from the BASE. Only improve the wording flow. Max 2 sentences.

VIVID:`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": this.apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: 150,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const resBody = await response.json();
    const text = resBody.content?.[0]?.text?.trim();
    if (text && !text.includes("I cannot") && text.length > 20) {
      return text.replace(/^VIVID:\s*/i, "").trim();
    }
    return null;
  }

  async generateOverSummary(data) {
    const {
      overNumber = 0, bowlerName = "Bowler", bowlingStyle = "",
      oversFigures = "0-0-0-0", runsThisOver = 0, wicketsThisOver = 0,
      extrasThisOver = "", ballsSummary = [],
      score = 0, wickets = 0, totalOvers = 0, target = null,
      remainingRuns = null, remainingBalls = null, rrr = null, crr = "0.00",
      batter1 = {}, batter2 = {}
    } = data;

    if (this.apiKey) {
      try {
        const ballsText = ballsSummary.map((b, i) =>
          `${overNumber}.${i + 1} — ${b.notation || b.runs} — ${b.commentary || "no commentary"}`
        ).join("\n");
        const chaseInfo = target ? `Need ${remainingRuns} from ${remainingBalls} balls | RRR: ${rrr}` : "";

        const prompt = `You are a professional BQ-PLAY cricket analyst.

Over ${overNumber + 1} just completed.
Bowler: ${bowlerName}${bowlingStyle ? ` | Style: ${bowlingStyle}` : ""}
Over Figures: ${oversFigures}
Runs This Over: ${runsThisOver} | Wickets: ${wicketsThisOver}
${extrasThisOver ? `Extras: ${extrasThisOver}` : ""}

Balls this over:
${ballsText}

Match Situation After Over:
${score}/${wickets} | ${totalOvers} overs bowled | CRR: ${crr}
${chaseInfo}
Current Batters: ${batter1.name || "?"} ${batter1.runs || 0}(${batter1.balls || 0}b) | ${batter2.name || "?"} ${batter2.runs || 0}(${batter2.balls || 0}b)

Write 2-3 sentences of over summary:
- Comment on the bowling quality and tactical shifts
- Highlight key wickets, big hits, or building pressure
- Note the context (closing in on target, middle-over consolidation, etc.)
BQ-PLAY analyst style. No emojis. Plain flowing text only.`;

        const response = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "x-api-key": this.apiKey,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
          },
          body: JSON.stringify({
            model: this.model,
            max_tokens: 300,
            messages: [{ role: "user", content: prompt }],
          }),
        });

        const resBody = await response.json();
        return resBody.content?.[0]?.text?.trim() || this._overFallback(data);
      } catch (err) {
        console.error("Over Summary AI Error:", err.message);
      }
    }

    return this._overFallback(data);
  }

  _overFallback({ bowlerName, runsThisOver, wicketsThisOver }) {
    return `${runsThisOver} run${runsThisOver !== 1 ? "s" : ""} from the over. ${wicketsThisOver > 0 ? `${wicketsThisOver} wicket${wicketsThisOver > 1 ? "s" : ""} fell.` : "A productive set of deliveries."}`;
  }

  async regenerateEditedBallCommentary(data) {
    const {
      overNumber, ballNumber,
      oldType, oldRuns, oldDirection,
      newType, newRuns, newDirection,
      bowlerName, batsmanName,
      isWide = false, isNoBall = false, isWicket = false, wicketType = ""
    } = data;

    if (this.apiKey) {
      try {
        const prompt = `The ball at ${overNumber}.${ballNumber} was incorrectly recorded. Please provide corrected commentary.

CORRECTED Info:
- Previous: ${oldType} for ${oldRuns}
- Corrected: ${newType} for ${newRuns}
- Bowler: ${bowlerName} | Batter: ${batsmanName}
${isWicket ? `- WICKET: ${wicketType}` : ""}

Write TWO lines of corrected commentary for this ball.
SHORT: [broadcast summary]
VIVID: [Highly technical description of delivery length, shot intent, and specific region] (2-3 sentences)

BQ-PLAY professional style, no emojis.`;

        const response = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "x-api-key": this.apiKey,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
          },
          body: JSON.stringify({
            model: this.model,
            max_tokens: 300,
            messages: [{ role: "user", content: prompt }],
          }),
        });

        const resBody = await response.json();
        const text = resBody.content?.[0]?.text?.trim() || "";

        let short = "";
        let vivid = "";
        const shortMatch = text.match(/SHORT:\s*(.*)/i);
        const vividMatch = text.match(/VIVID:\s*(.*)/i);

        if (shortMatch) short = shortMatch[1].trim();
        if (vividMatch) vivid = vividMatch[1].trim();

        if (!short || !vivid) {
          const lines = text.split("\n").filter((l) => l.trim().length > 0);
          short = short || lines[0]?.replace(/SHORT:?\s*/i, "").trim() || "";
          if (lines.length > 1)
            vivid = vivid || lines.slice(1).join(" ").replace(/VIVID:?\s*/i, "").trim() || "";
        }

        if (short) return { short, vivid };
      } catch (err) {
        console.error("Ball Regenerate AI Error:", err.message);
      }
    }

    const fallbackShort = `${bowlerName} to ${batsmanName}, corrected: ${newType} for ${newRuns} run${newRuns !== 1 ? "s" : ""}`;
    const fallbackVivid = `Corrected delivery: ${newType} for ${newRuns} runs.`;
    return { short: fallbackShort, vivid: fallbackVivid };
  }
}

export default new AICommentaryService();
