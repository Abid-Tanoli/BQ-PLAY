import { formatDate, getTossLine } from "../utils/matchHelpers";
import InfoRow from "./InfoRow";

export default function MiniInfo({ match }) {
  return (
    <div className="border-b border-cric-border bg-cric-card pb-3 sm:pb-4">
      <h3 className="text-base sm:text-lg font-black text-cric-text">Match Info</h3>
      <dl className="mt-3 space-y-2 text-sm">
        <InfoRow label="Venue" value={match.venue || "TBC"} />
        <InfoRow label="Date" value={formatDate(match.startAt)} />
        <InfoRow label="Type" value={match.matchType || "T20"} />
        <InfoRow label="Toss" value={getTossLine(match)} />
      </dl>
    </div>
  );
}
