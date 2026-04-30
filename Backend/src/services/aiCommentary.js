// AI Commentary Generation Service — ESPNcricinfo Style
// Using claude-sonnet-4-20250514 as specified by user
// Parts 4, 5, 6: Per-ball, Over Summary, Ball Edit prompts

import fetch from "node-fetch";

class AICommentaryService {
  constructor() {
    this.apiKey = process.env.ANTHROPIC_API_KEY;
    this.model = "claude-sonnet-4-20250514";
  }

  // ─── PART 4: Per-Ball Commentary ─────────────────────────────────────────
  async generateBallCommentary(data) {
    let result = { short: "", vivid: "" };

    const {
      runs = 0, isWide = false, isNoBall = false, isBye = false, isLegBye = false,
      isWicket = false, wicketType = "",
      batsmanName = "Batsman", bowlerName = "Bowler",
      zone = "", direction = "", shotName = "", side = "", nearestPosition = "",
      overNumber = 0, ballNumber = 1,
      currentScore = 0, currentWickets = 0,
      matchContext = {}
    } = data;

    const deliveryType = isWide ? "wide" : isNoBall ? "no_ball" : isBye ? "bye" : isLegBye ? "leg_bye" : "normal";
    const boundaryNote = runs === 4
        ? `FOUR — ground shot bounced to boundary toward ${direction || nearestPosition}`
        : runs === 6
        ? `SIX — direct over ${nearestPosition || direction}, cleared boundary in air`
        : "";

    const matchSit = matchContext.target
        ? `Need ${matchContext.target - currentScore} from ${(matchContext.totalOvers - (Math.floor(overNumber) + (ballNumber / 6))) * 6 | 0} balls | RRR: ${matchContext.requiredRunRate}`
        : `${currentScore}/${currentWickets} | CRR: ${matchContext.totalOvers > 0 ? (currentScore / ((overNumber + ballNumber / 6) || 1)).toFixed(2) : '0.00'}`;

    if (this.apiKey) {
      try {
        const prompt = `You are a professional cricket commentator in the style of ESPNcricinfo.

Ball Info:
- Ball Number: ${overNumber}.${ballNumber}
- Delivery Type: ${deliveryType}
- Bowler: ${bowlerName}
- Batter: ${batsmanName}
- Runs This Ball: ${runs}${isWide ? ` (Wide +${runs})` : ""}${isNoBall ? " (No Ball)" : ""}
- Shot Direction: ${direction || "unknown area"}${side ? ` (${side})` : ""}${nearestPosition ? ` near ${nearestPosition}` : ""}
${boundaryNote ? `- Boundary: ${boundaryNote}` : ""}
${isWicket ? `- WICKET: ${wicketType}` : ""}
- Match Situation: ${matchSit}

Write ONE LINE of ball-by-ball commentary.
Rules:
- Describe ball length (full / good length / short / yorker / bouncer)
- Describe line (on stumps / outside off / outside leg / on pads)
- Describe shot played (drive / pull / cut / flick / sweep / ramp / glance / block)
- End with outcome (hit to {region}, ball races to boundary, etc.)
- Max 20 words. No emojis. ESPNcricinfo style only.

FORMAT EXACTLY:
SHORT: [one line, max 20 words]
VIVID: [2-3 sentence descriptive paragraph with emotion and technicality]`;

        const response = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "x-api-key": this.apiKey,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json"
          },
          body: JSON.stringify({
            model: this.model,
            max_tokens: 300,
            messages: [{ role: "user", content: prompt }]
          })
        });

        const resBody = await response.json();
        const text = resBody.content?.[0]?.text || "";
        result.short = text.match(/SHORT:\s*(.*)/)?.[1]?.trim() || "";
        result.vivid = text.match(/VIVID:\s*([\s\S]*?)(?:$|SHORT:)/)?.[1]?.trim() || "";
      } catch (err) {
        console.error("AI Commentary Error:", err.message);
      }
    }

    // Fallback templates
    if (!result.short) {
      if (isWide) result.short = `Wide ball down ${side || "leg"} side — ${1 + runs} extra${1 + runs !== 1 ? "s" : ""}`;
      else if (isNoBall) result.short = `No ball from ${bowlerName} — ${runs > 0 ? runs + " runs to " + batsmanName : "batter misses"}`;
      else if (isWicket) result.short = `${bowlerName} strikes! ${batsmanName} is ${wicketType}!`;
      else if (runs === 6) result.short = `${batsmanName} dispatches it over the boundary — SIX!`;
      else if (runs === 4) result.short = `${batsmanName} finds the gap, ball races to the fence — FOUR!`;
      else if (runs === 0) result.short = `${bowlerName} beats the bat — dot ball`;
      else result.short = `${batsmanName} works it for ${runs} run${runs !== 1 ? "s" : ""}`;
    }
    if (!result.vivid) {
      result.vivid = result.short;
    }

    return result;
  }

  // ─── PART 5: Over Summary AI Prompt ──────────────────────────────────────
  async generateOverSummary(data) {
    const {
      overNumber = 0, bowlerName = "Bowler", bowlingStyle = "",
      oversFigures = "0-0-0-0", runsThisOver = 0, wicketsThisOver = 0,
      extrasThisOver = "", ballsSummary = [],
      score = 0, wickets = 0, totalOvers = 0, target = null,
      remainingRuns = null, remainingBalls = null, rrr = null, crr = "0.00",
      batter1 = {}, batter2 = {}
    } = data;

    const ballsText = ballsSummary.map((b, i) =>
      `${overNumber}.${i + 1} — ${b.notation || b.runs} — ${b.commentary || "no commentary"}`
    ).join("\n");

    const chaseInfo = target
      ? `Need ${remainingRuns} from ${remainingBalls} balls | RRR: ${rrr}`
      : "";

    if (this.apiKey) {
      try {
        const prompt = `You are an ESPNcricinfo pundit analyst.

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
- Comment on the bowling (was it good/poor over, key deliveries)
- Mention any wickets or big shots
- Note the match situation and pressure
ESPNcricinfo pundit style. No emojis. No bullet points. Plain flowing text only.`;

        const response = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "x-api-key": this.apiKey,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json"
          },
          body: JSON.stringify({
            model: this.model,
            max_tokens: 200,
            messages: [{ role: "user", content: prompt }]
          })
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
    return `${runsThisOver} runs${wicketsThisOver > 0 ? ` and ${wicketsThisOver} wicket${wicketsThisOver > 1 ? "s" : ""}` : ""} from ${bowlerName}'s over. Match situation intensifying.`;
  }

  // ─── PART 6: Ball Edit/Regenerate Commentary ──────────────────────────────
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
        const prompt = `Ball ${overNumber}.${ballNumber} was INCORRECTLY recorded. Please regenerate commentary.

CORRECTED Info:
- Was recorded as: ${oldType} for ${oldRuns} runs toward ${oldDirection || "unknown"}
- CORRECTED to: ${newType} for ${newRuns} runs toward ${newDirection || "unknown"}
- Bowler: ${bowlerName} | Batter: ${batsmanName}
${isWide ? "- Delivery: Wide ball" : ""}${isNoBall ? "- Delivery: No ball" : ""}
${isWicket ? `- WICKET: ${wicketType}` : ""}

Write ONE LINE of corrected commentary for this ball.
Same rules: max 20 words, ESPNcricinfo style, no emojis.`;

        const response = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "x-api-key": this.apiKey,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json"
          },
          body: JSON.stringify({
            model: this.model,
            max_tokens: 100,
            messages: [{ role: "user", content: prompt }]
          })
        });

        const resBody = await response.json();
        return resBody.content?.[0]?.text?.trim() || "";
      } catch (err) {
        console.error("Ball Regenerate AI Error:", err.message);
      }
    }

    return `${bowlerName} to ${batsmanName}, corrected: ${newType} for ${newRuns} run${newRuns !== 1 ? "s" : ""}`;
  }
}

export default new AICommentaryService();
