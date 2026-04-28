// AI Commentary Generation Service
// Generates intelligent cricket commentary using Anthropic Claude (or fallback templates)
// Returns: { short: "Summary", vivid: "Descriptive paragraph" }

import fetch from "node-fetch";

class AICommentaryService {
  constructor() {
    this.apiKey = process.env.ANTHROPIC_API_KEY;
    this.model = "claude-3-haiku-20240307";
  }

  async generateBallCommentary(data) {
    let result = { short: "", vivid: "" };

    // If API Key is present, use Claude for professional commentary
    if (this.apiKey) {
      try {
        const prompt = `
          You are a professional cricket commentator.
          Generate a two-part commentary for the following ball:
          - Event: ${data.runs} runs${data.isWicket ? ', WICKET (' + data.wicketType + ')' : ''}${data.isWide ? ', WIDE' : ''}${data.isNoBall ? ', NO BALL' : ''}
          - Striker: ${data.batsmanName}
          - Bowler: ${data.bowlerName}
          - Zone: ${data.zone || 'Unknown'}
          - Over: ${data.overNumber}.${data.ballNumber}
          - Match Score: ${data.currentScore}/${data.currentWickets}
          
          FORMAT YOUR RESPONSE EXACTLY LIKE THIS (nothing else):
          SHORT: [Concise 1-sentence summary, e.g. "Starc to Kohli, FOUR runs, beautiful drive"]
          VIVID: [Vivid, descriptive paragraph (2-3 sentences) capturing the emotion and technicality of the shot]
        `;

        const response = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "x-api-key": this.apiKey,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json"
          },
          body: JSON.stringify({
            model: this.model,
            max_tokens: 250,
            messages: [{ role: "user", content: prompt }]
          })
        });

        const resBody = await response.json();
        const text = resBody.content?.[0]?.text || "";
        
        result.short = text.match(/SHORT: (.*)/)?.[1]?.trim() || "";
        result.vivid = text.match(/VIVID: (.*)/s)?.[1]?.trim() || "";
      } catch (err) {
        console.error("AI Commentary Error:", err);
      }
    }

    // Fallback if AI fails or no API key
    if (!result.short) {
      result.short = `${data.bowlerName} to ${data.batsmanName}, ${data.isWicket ? 'OUT! ' + data.wicketType : data.runs + ' run(s)'}`;
    }
    if (!result.vivid) {
      result.vivid = `${data.batsmanName} ${data.isWicket ? 'is dismissed after a challenging delivery' : 'plays it away'} towards ${data.zone || 'the field'}. ${data.bowlerName} looking ${data.isWicket ? 'triumphant' : 'focused'}.`;
    }

    return result;
  }

  generateOverSummary({ runs, wickets, bowlerName }) {
    return `${runs} runs and ${wickets} wicket${wickets === 1 ? '' : 's'} from ${bowlerName}'s over. Match situation intensifying.`;
  }
}

export default new AICommentaryService();
