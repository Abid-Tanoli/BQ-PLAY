import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { updateScore } from "../store/slices/matchesSlice";
import api from "../services/api";
import { getSocket } from "../store/socket";
import PartnershipChart from "./PartnershipChart";
import SquadSelectionModal from "./SquadSelectionModal";
import PlayingXISelector from "./PlayingXISelector";

// Fielding positions based on actual cricket field (angles from straight, distance from pitch)
// Reference: Standard cricket fielding positions
const FIELDING_POSITIONS = {
  // OFF SIDE (Right side for right-handed batsman)
  firstSlip: { angle: 105, distance: 45, label: '1st Slip', x: 78, y: 35 },
  secondSlip: { angle: 110, distance: 50, label: '2nd Slip', x: 82, y: 38 },
  thirdSlip: { angle: 115, distance: 55, label: '3rd Slip', x: 85, y: 42 },
  gully: { angle: 95, distance: 40, label: 'Gully', x: 72, y: 32 },
  point: { angle: 85, distance: 50, label: 'Point', x: 65, y: 28 },
  backwardPoint: { angle: 75, distance: 55, label: 'Backward Point', x: 58, y: 25 },
  cover: { angle: 55, distance: 50, label: 'Cover', x: 45, y: 22 },
  extraCover: { angle: 45, distance: 60, label: 'Extra Cover', x: 38, y: 18 },
  deepCover: { angle: 50, distance: 85, label: 'Deep Cover', x: 42, y: 12 },
  deepPoint: { angle: 80, distance: 85, label: 'Deep Point', x: 62, y: 10 },
  longOff: { angle: 20, distance: 85, label: 'Long Off', x: 25, y: 8 },
  thirdMan: { angle: 130, distance: 65, label: 'Third Man', x: 90, y: 48 },
  fineLeg: { angle: 150, distance: 65, label: 'Fine Leg', x: 88, y: 65 },
  deepFineLeg: { angle: 145, distance: 85, label: 'Deep Fine Leg', x: 92, y: 58 },

  // ON SIDE (Left side for right-handed batsman)
  midwicket: { angle: -65, distance: 45, label: 'Mid Wicket', x: 48, y: 68 },
  squareLeg: { angle: -90, distance: 40, label: 'Square Leg', x: 65, y: 75 },
  backwardSquareLeg: { angle: -100, distance: 50, label: 'Backward Square Leg', x: 72, y: 78 },
  midOn: { angle: -20, distance: 50, label: 'Mid On', x: 28, y: 65 },
  deepMidwicket: { angle: -70, distance: 85, label: 'Deep Mid Wicket', x: 52, y: 88 },
  deepSquareLeg: { angle: -85, distance: 85, label: 'Deep Square Leg', x: 68, y: 92 },
  longOn: { angle: -15, distance: 85, label: 'Long On', x: 22, y: 85 },

  // STRAIGHT
  bowler: { angle: 0, distance: 15, label: 'Bowler', x: 50, y: 50 },
  midOff: { angle: 15, distance: 50, label: 'Mid Off', x: 32, y: 35 }
};

// ESPN Cricinfo style commentary templates
const COMMENTARY_TEMPLATES = {
  dot: [
    "Good length delivery outside off, left alone",
    "Defended solidly off the front foot",
    "Short of length, batsman ducks under it",
    "Full and straight, driven to mid-on",
    "Outside off, beaten! Excellent delivery",
    "On the pads, flicked to square leg, no run",
    "Back of a length, defended to cover",
    "Good length on off stump, blocked back"
  ],
  single: [
    "Worked away to deep square leg for one",
    "Pushed into the gap at cover for a quick single",
    "Tucked off the hips to fine leg, one run",
    "Driven to long-off, easy single",
    "Guided to third man for one",
    "Swept to deep backward square leg, single taken",
    "Nudged to mid-wicket, they scamper through",
    "Pushed to mid-on, quick single taken"
  ],
  two: [
    "Nicely timed through the covers, they come back for two",
    "Worked into the gap at deep mid-wicket, good running",
    "Driven through extra cover, fielder chases it down",
    "Flicked off the pads, they push hard for the second",
    "Cut away past point, good fielding keeps it to two"
  ],
  three: [
    "THREE RUNS! Brilliant running! Pushed to long-off and they scamper back for three",
    "Swept hard to deep backward square leg, good effort to get three",
    "Driven through the covers, fielder chases, three runs"
  ],
  four: {
    cover: ["FOUR! Beautiful drive! Leans into it and sends it racing through cover", "FOUR! Gorgeous shot! Timing and placement, rolls away through cover", "FOUR! Overpitched and punished! Driven elegantly through cover"],
    point: ["FOUR! Short and wide, cut away past point for a boundary", "FOUR! Late cut! Guided beautifully past point to the fence", "FOUR! Slashed over backward point, no chance for the fielder"],
    midwicket: ["FOUR! Flicked away! Picked the gap at mid-wicket perfectly", "FOUR! Short and pulled! Races away to the mid-wicket boundary", "FOUR! On the pads and worked away! Beautiful shot through mid-wicket"],
    squareLeg: ["FOUR! Glanced fine! Beautiful touch, runs away to the square leg fence", "FOUR! Short and pulled! No mercy, over square leg for four", "FOUR! Tucked off the pads! Finds the gap at square leg"],
    thirdMan: ["FOUR! Late cut! Guided beautifully past third man for four", "FOUR! Edged but safe! Flies through third man for a boundary", "FOUR! Fine touch! Guided away to the third man fence"],
    longOn: ["FOUR! Driven! Long-on dives but can't stop it, boundary!", "FOUR! Lofted! Clears long-on and bounces over the rope", "FOUR! Straight hit! Long-on has no chance, four runs"],
    longOff: ["FOUR! Driven! Long-off runs across but can't reach it", "FOUR! Lofted! Sails over long-off for a boundary", "FOUR! Sliced! Flies over long-off for four"],
    generic: ["FOUR! Beautiful shot! Races away to the boundary", "FOUR! Perfectly timed! Finds the gap perfectly", "FOUR! What a stroke! The crowd goes up"]
  },
  six: {
    longOn: ["SIX! MASSIVE! Down the ground and out of the ground!", "SIX! Clean strike! Long-on has no chance, that's huge!", "SIX! Incredible hit! Straight down the ground for a maximum"],
    longOff: ["SIX! Looped! Long-off runs back but it's over the rope!", "SIX! Elegant! Lofted beautifully over long-off for six", "SIX! That's gone! Sailed over long-off into the stands"],
    midwicket: ["SIX! Pulled away! Deep mid-wicket watches it sail over!", "SIX! Short and deposited! Hooked over mid-wicket for six", "SIX! Whipped away! What power over mid-wicket!"],
    squareLeg: ["SIX! Hooked! Short ball punished, over square leg for six", "SIX! Pulled away! No mercy, that's out of the ground!", "SIX! Short and wide! Hooked over square leg for a maximum"],
    cover: ["SIX! Looped! Cover runs back but it's way over!", "SIX! Elegant! Lofted beautifully over cover for six", "SIX! That's huge! Sailed over cover into the crowd"],
    generic: ["SIX! MASSIVE! That's out of the ground!", "SIX! Clean strike! Clears the boundary with ease", "SIX! Incredible hit! That went a long way!"]
  },
  wide: ["WIDE! Down the leg side, keeper can't reach it", "WIDE! Way outside off stump, left alone", "WIDE! Strays on middle and leg, called wide", "WIDE! Full toss outside off, called wide"],
  noBall: ["NO BALL! Over the crease, free hit coming up", "NO BALL! Full toss above waist height", "NO BALL! Back foot lands on the line", "NO BALL! Front foot over the line"],
  wicket: {
    bowled: ["BOWLED! What a delivery! Cleaned him up completely!", "BOWLED HIM! Absolute jaffa! Off stump goes cartwheeling!", "BOWLED! Through the gate! The batsman had no answer!", "BOWLED! Perfect delivery! Nips back and crashes into middle!"],
    caught: {
      slip: ["CAUGHT! Edged and taken! The keeper makes no mistake!", "CAUGHT! Thick edge flies to slip, sharp catch!", "CAUGHT! Away he goes! Edged to slip!"],
      cover: ["CAUGHT! Drives it straight to cover! End of a fine innings!", "CAUGHT! Slices it to cover, simple catch!", "CAUGHT! Holes out! Cover takes it!"],
      midwicket: ["CAUGHT! Pulled straight to mid-wicket! No second chances!", "CAUGHT! Holes out to deep mid-wicket! That's it!", "CAUGHT! Short ball, pulled to mid-wicket, taken!"],
      deep: ["CAUGHT! Loops it up! Deep fielder runs in and takes it!", "CAUGHT! Slog-swept! Deep fielder takes it on the boundary!", "CAUGHT! Holes out to the deep! That's a big wicket!"],
      generic: ["CAUGHT! Edged and taken! The keeper makes no mistake!", "CAUGHT! Holes out to the deep! End of a fine innings!", "CAUGHT! Slices it straight to fielder, simple catch!"]
    },
    lbw: ["LBW! Plumb in front! The finger goes up immediately!", "LBW! Dead in front of middle stump! Umpire raises the finger!", "LBW! Trapped in front! Batsman reviews but it's umpire's call!", "LBW! That's out! Three reds! Umpire's call on impact!"],
    runout: ["RUN OUT! Direct hit! The batsman is well short of his crease!", "RUN OUT! Mix-up between the wickets! No chance to make the ground!", "RUN OUT! Brilliant fielding! Quick throw and the bails are off!"],
    stumped: ["STUMPED! Quick as a flash! The keeper whips off the bails!", "STUMPED! Beaten by the spin and out of his crease!", "STUMPED! Down the track and beaten! Smart glovework!"]
  }
};

const generateFirstLine = (bowler, batsman, runs, overNum, ballNum, isWide, isNoBall, isBye, isLegBye) => {
  let runsText = "";
  if (isWide) runsText = "1 run";
  else if (isNoBall) runsText = runs > 0 ? `${runs} runs` : "1 run";
  else if (isBye || isLegBye) runsText = `${runs} ${runs === 1 ? (isBye ? 'bye' : 'leg bye') : (isBye ? 'byes' : 'leg byes')}`;
  else if (runs === 0) runsText = "No runs";
  else if (runs === 1) runsText = "1 run";
  else if (runs === 2) runsText = "2 runs";
  else if (runs === 3) runsText = "3 runs";
  else if (runs === 4) runsText = "4 runs";
  else if (runs === 6) runsText = "6 runs";

  return `${overNum}.${ballNum}${isNoBall ? 'nb' : ''}\n${bowler} to ${batsman}, ${runsText}`;
};

const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

export default function MatchEditor({ matchId, onClose, isEmbedded = false }) {
  const dispatch = useDispatch();
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentInnings, setCurrentInnings] = useState(0);

  // Scoring state
  const [runs, setRuns] = useState(0);
  const [isWide, setIsWide] = useState(false);
  const [isNoBall, setIsNoBall] = useState(false);
  const [isBye, setIsBye] = useState(false);
  const [isLegBye, setIsLegBye] = useState(false);
  const [isWicket, setIsWicket] = useState(false);
  const [wicketType, setWicketType] = useState("");
  const [dismissedPlayerId, setDismissedPlayerId] = useState("");
  const [fielderId, setFielderId] = useState("");

  // Commentary state
  const [commentaryFirstLine, setCommentaryFirstLine] = useState("");
  const [commentaryText, setCommentaryText] = useState("");
  const [showCommentaryEdit, setShowCommentaryEdit] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState(null);

  // Commentary Edit Modal state
  const [showCommentaryEditModal, setShowCommentaryEditModal] = useState(false);
  const [editingBallData, setEditingBallData] = useState(null);
  const [editingCommentaryFirstLine, setEditingCommentaryFirstLine] = useState("");
  const [editingCommentaryText, setEditingCommentaryText] = useState("");

  // Undo functionality
  const [lastBallState, setLastBallState] = useState(null);

  // Player selection state - AUTO-MANAGED
  const [batsman1, setBatsman1] = useState("");
  const [batsman2, setBatsman2] = useState("");
  const [onStrikeBatsman, setOnStrikeBatsman] = useState("");
  const [bowler, setBowler] = useState("");
  const [showBatsmanPicker, setShowBatsmanPicker] = useState(false);
  const [showBowlerPicker, setShowBowlerPicker] = useState(false);
  const [pickingForSlot, setPickingForSlot] = useState(1);
  const [availablePlayers, setAvailablePlayers] = useState({ batting: [], bowling: [] });

  // Wagon wheel state
  const [showWagonWheel, setShowWagonWheel] = useState(false);
  const [wagonWheelMode, setWagonWheelMode] = useState('shot');

  // Toss and Playing XI state
  const [tossWinnerId, setTossWinnerId] = useState("");
  const [tossDecision, setTossDecision] = useState("");
  const [showPlayingXISelector, setShowPlayingXISelector] = useState(false);
  const [selectedTeamForXI, setSelectedTeamForXI] = useState("");
  const [tempXI, setTempXI] = useState([]);

  // Squad 15 and 12th man state
  const [showSquad15Selector, setShowSquad15Selector] = useState(false);
  const [selectedTeamForSquad, setSelectedTeamForSquad] = useState("");
  const [tempSquad15, setTempSquad15] = useState([]);
  const [showTwelfthManSelector, setShowTwelfthManSelector] = useState(false);
  const [selectedTeamFor12thMan, setSelectedTeamFor12thMan] = useState("");
  const [temp12thMan, setTemp12thMan] = useState("");

  // Socket connection
  useEffect(() => {
    fetchMatch();
    const socket = getSocket();
    if (socket) {
      socket.emit("join-match", matchId);
      socket.on("match:ballUpdate", (data) => { if (data.matchId === matchId) fetchMatch(); });
      socket.on("match:scoreUpdate", (data) => { if (data.matchId === matchId) fetchMatch(); });
      socket.on("match:overComplete", (data) => {
        if (data.matchId === matchId) {
          fetchMatch();
          setBowler(""); // Clear bowler to force selection
          setShowBowlerPicker(true);
        }
      });
      socket.on("match:inningsEnd", (data) => {
        if (data.matchId === matchId && window.confirm(data.suggestion)) handleEndInnings();
      });
    }
    return () => {
      if (socket) {
        socket.emit("leave-match", matchId);
        socket.off("match:ballUpdate");
        socket.off("match:scoreUpdate");
        socket.off("match:overComplete");
        socket.off("match:inningsEnd");
      }
    };
  }, [matchId]);

  // Load team players and AUTO-SELECT current players
  useEffect(() => {
    if (match) {
      loadTeamPlayers();
      autoSelectPlayers();
    }
  }, [match?._id, match?.status, match?.innings?.[currentInnings]?.batting?.length, currentInnings]);

  const fetchMatch = async () => {
    try {
      const res = await api.get(`/matches/${matchId}`);
      setMatch(res.data);
      if (res.data.currentInnings !== undefined) setCurrentInnings(res.data.currentInnings);

      const innings = res.data.innings?.[currentInnings];
      if (innings) {
        // Auto-select players from match data
        const b1Id = innings.currentBatsman1?._id || innings.currentBatsman1;
        const b2Id = innings.currentBatsman2?._id || innings.currentBatsman2;
        const sId = innings.onStrikeBatsman?._id || innings.onStrikeBatsman;
        const bowlId = innings.currentBowler?._id || innings.currentBowler;

        if (b1Id) setBatsman1(b1Id);
        if (b2Id) setBatsman2(b2Id);
        if (sId) setOnStrikeBatsman(sId);
        if (bowlId) setBowler(bowlId);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to load match");
    }
  };

  const autoSelectPlayers = () => {
    // This runs after match data is loaded to auto-select players
    const innings = match?.innings?.[currentInnings];
    if (!innings) return;

    const b1Id = innings.currentBatsman1?._id || innings.currentBatsman1;
    const b2Id = innings.currentBatsman2?._id || innings.currentBatsman2;
    const sId = innings.onStrikeBatsman?._id || innings.onStrikeBatsman;
    const bowlId = innings.currentBowler?._id || innings.currentBowler;

    if (b1Id && !batsman1) setBatsman1(b1Id);
    if (b2Id && !batsman2) setBatsman2(b2Id);
    if (sId && !onStrikeBatsman) setOnStrikeBatsman(sId);
    if (bowlId && !bowler) setBowler(bowlId);
  };

  const loadTeamPlayers = async () => {
    try {
      if (!match || !match.teams || match.teams.length < 2) return;
      const battingTeamId = match.innings[currentInnings]?.team?._id || match.innings[currentInnings]?.team;
      if (!battingTeamId) return;
      const bowlingTeamId = match.teams.find(t => (t._id || t) !== battingTeamId);
      if (!bowlingTeamId) return;

      const battingXI = match.playingXI?.find(xi => (xi.team?._id || xi.team) === (battingTeamId?._id || battingTeamId));
      const bowlingXI = match.playingXI?.find(xi => (xi.team?._id || xi.team) === (bowlingTeamId?._id || bowlingTeamId));

      let battingPlayers = battingXI?.players?.length > 0 ? battingXI.players : [];
      let bowlingPlayers = bowlingXI?.players?.length > 0 ? bowlingXI.players : [];

      if (battingPlayers.length === 0) {
        const res = await api.get(`/teams/${battingTeamId?._id || battingTeamId}`);
        battingPlayers = res.data.players || res.data.playerList || [];
      }
      if (bowlingPlayers.length === 0) {
        const res = await api.get(`/teams/${bowlingTeamId?._id || bowlingTeamId}`);
        bowlingPlayers = res.data.players || res.data.playerList || [];
      }

      const innings = match.innings?.[currentInnings];
      if (innings && innings.batting) {
        battingPlayers = battingPlayers.filter(p => {
          const batStats = innings.batting.find(b => (b.player?._id || b.player) === p._id);
          return !batStats?.isOut;
        });
      }

      setAvailablePlayers({ batting: battingPlayers, bowling: bowlingPlayers });
    } catch (err) {
      console.error("Error loading players:", err);
    }
  };

  // Generate AI commentary when runs or position changes
  useEffect(() => {
    if (!match || !onStrikeBatsman || !bowler) return;
    const innings = match.innings?.[currentInnings];
    if (!innings) return;

    const overNum = Math.floor(innings.balls / 6) + 1;
    const ballNum = (innings.balls % 6) + 1;
    const batsmanName = availablePlayers.batting.find(p => p._id === onStrikeBatsman)?.name || "Batsman";
    const bowlerName = availablePlayers.bowling.find(p => p._id === bowler)?.name || "Bowler";

    const firstLine = generateFirstLine(bowlerName, batsmanName, runs, overNum, ballNum, isWide, isNoBall, isBye, isLegBye);
    setCommentaryFirstLine(firstLine);

    let commentary = "";

    if (isWicket) {
      if (wicketType === 'bowled') commentary = getRandom(COMMENTARY_TEMPLATES.wicket.bowled);
      else if (wicketType === 'lbw') commentary = getRandom(COMMENTARY_TEMPLATES.wicket.lbw);
      else if (wicketType === 'run out') commentary = getRandom(COMMENTARY_TEMPLATES.wicket.runout);
      else if (wicketType === 'stumped') commentary = getRandom(COMMENTARY_TEMPLATES.wicket.stumped);
      else if (wicketType === 'caught' && selectedPosition) {
        const posData = FIELDING_POSITIONS[selectedPosition];
        if (posData) {
          const region = posData.label.toLowerCase().includes('slip') || posData.label.toLowerCase().includes('gully') ? 'slip' :
            posData.label.toLowerCase().includes('deep') ? 'deep' : posData.label.toLowerCase().replace(' ', '');
          if (COMMENTARY_TEMPLATES.wicket.caught[region]) {
            commentary = getRandom(COMMENTARY_TEMPLATES.wicket.caught[region]);
          } else {
            commentary = getRandom(COMMENTARY_TEMPLATES.wicket.caught.generic);
          }
        } else {
          commentary = getRandom(COMMENTARY_TEMPLATES.wicket.caught.generic);
        }
      } else {
        commentary = getRandom(COMMENTARY_TEMPLATES.wicket.caught.generic);
      }
    } else if (isWide) {
      commentary = getRandom(COMMENTARY_TEMPLATES.wide);
    } else if (isNoBall) {
      commentary = getRandom(COMMENTARY_TEMPLATES.noBall);
    } else if (runs === 0) {
      commentary = getRandom(COMMENTARY_TEMPLATES.dot);
    } else if (runs === 1) {
      commentary = getRandom(COMMENTARY_TEMPLATES.single);
    } else if (runs === 2) {
      commentary = getRandom(COMMENTARY_TEMPLATES.two);
    } else if (runs === 3) {
      commentary = getRandom(COMMENTARY_TEMPLATES.three);
    } else if (runs === 4) {
      if (selectedPosition && COMMENTARY_TEMPLATES.four[selectedPosition]) {
        commentary = getRandom(COMMENTARY_TEMPLATES.four[selectedPosition]);
      } else {
        commentary = getRandom(COMMENTARY_TEMPLATES.four.generic);
      }
    } else if (runs === 6) {
      if (selectedPosition && COMMENTARY_TEMPLATES.six[selectedPosition]) {
        commentary = getRandom(COMMENTARY_TEMPLATES.six[selectedPosition]);
      } else {
        commentary = getRandom(COMMENTARY_TEMPLATES.six.generic);
      }
    }

    setCommentaryText(commentary);
  }, [runs, isWide, isNoBall, isBye, isLegBye, isWicket, wicketType, selectedPosition, onStrikeBatsman, bowler, match, currentInnings, availablePlayers]);

  const handleWagonWheelClick = (angle, distance) => {
    let closestPosition = null;
    let minDiff = 360;
    Object.entries(FIELDING_POSITIONS).forEach(([key, pos]) => {
      const diff = Math.abs(angle - pos.angle);
      if (diff < minDiff) {
        minDiff = diff;
        closestPosition = key;
      }
    });
    setSelectedPosition(closestPosition);
    setShowWagonWheel(false);
  };

  const sendUpdate = async () => {
    if (!match || !batsman1 || !batsman2 || !bowler || !onStrikeBatsman) {
      alert("Please ensure both batsmen and bowler are selected");
      return;
    }
    if (isWicket && (!wicketType || !dismissedPlayerId)) {
      alert("Please select wicket type and dismissed player");
      return;
    }

    // Save current state for undo
    setLastBallState({
      matchData: JSON.parse(JSON.stringify(match)),
      ballsCount: match.innings[currentInnings].balls
    });

    setLoading(true);
    try {
      const result = await dispatch(
        updateScore({
          matchId,
          inningsIndex: currentInnings,
          runs,
          isWide,
          isNoBall,
          isBye,
          isLegBye,
          isWicket,
          wicketType: isWicket ? wicketType : "",
          dismissedPlayerId: isWicket ? dismissedPlayerId : null,
          fielderId: isWicket && fielderId ? fielderId : null,
          batsmanOnStrikeId: onStrikeBatsman,
          batsmanNonStrikeId: onStrikeBatsman === batsman1 ? batsman2 : batsman1,
          bowlerId: bowler,
          commentaryText: `${commentaryFirstLine}\n${commentaryText}`,
          customCommentary: false
        })
      ).unwrap();

      if (result.match) {
        setMatch(result.match);
        const updatedInnings = result.match.innings?.[currentInnings];
        if (updatedInnings) {
          const b1Id = updatedInnings.currentBatsman1?._id || updatedInnings.currentBatsman1;
          const b2Id = updatedInnings.currentBatsman2?._id || updatedInnings.currentBatsman2;
          const b1Stats = updatedInnings.batting?.find(b => (b.player?._id || b.player) === b1Id);
          const b2Stats = updatedInnings.batting?.find(b => (b.player?._id || b.player) === b2Id);

          if (b1Id && !b1Stats?.isOut) setBatsman1(b1Id);
          else if (b1Stats?.isOut) { setBatsman1(""); setPickingForSlot(1); setShowBatsmanPicker(true); }

          if (b2Id && !b2Stats?.isOut) setBatsman2(b2Id);
          else if (b2Stats?.isOut) { setBatsman2(""); setPickingForSlot(2); setShowBatsmanPicker(true); }

          if (updatedInnings.onStrikeBatsman) {
            const sId = updatedInnings.onStrikeBatsman._id || updatedInnings.onStrikeBatsman;
            const sStats = updatedInnings.batting?.find(b => (b.player?._id || b.player) === sId);
            if (!sStats?.isOut) setOnStrikeBatsman(sId);
          }
          if (updatedInnings.currentBowler) setBowler(updatedInnings.currentBowler._id || updatedInnings.currentBowler);
        }
      }

      setRuns(0); setIsWide(false); setIsNoBall(false); setIsBye(false); setIsLegBye(false);
      setIsWicket(false); setWicketType(""); setDismissedPlayerId(""); setFielderId("");
      setSelectedPosition(null); setShowCommentaryEdit(false);

      if (result.isOverComplete) { setBowler(""); setShowBowlerPicker(true); }
    } catch (err) {
      console.error(err);
      alert(err || "Error sending update");
    } finally {
      setLoading(false);
    }
  };

  const handleUndo = async () => {
    if (!lastBallState) {
      alert("No previous ball to undo");
      return;
    }
    try {
      setLoading(true);
      // Restore previous state
      setMatch(lastBallState.matchData);
      setLastBallState(null);
      // Reload match to ensure consistency
      await fetchMatch();
      alert("Last ball removed successfully");
    } catch (err) {
      console.error(err);
      alert("Failed to undo");
    } finally {
      setLoading(false);
    }
  };

  const openCommentaryEditor = (overNumber, ballNumber, currentCommentary) => {
    const lines = currentCommentary.split('\n');
    setEditingBallData({ overNumber, ballNumber });
    setEditingCommentaryFirstLine(lines[0] || "");
    setEditingCommentaryText(lines.slice(1).join('\n') || "");
    setShowCommentaryEditModal(true);
  };

  const saveCommentaryEdit = async () => {
    if (!editingBallData) return;
    try {
      setLoading(true);
      const newCommentary = `${editingCommentaryFirstLine}\n${editingCommentaryText}`;
      await api.put(`/matches/${matchId}/edit-commentary`, {
        inningsIndex: currentInnings,
        overNumber: editingBallData.overNumber,
        ballNumber: editingBallData.ballNumber,
        newCommentary
      });
      await fetchMatch();
      setShowCommentaryEditModal(false);
      setEditingBallData(null);
      setEditingCommentaryFirstLine("");
      setEditingCommentaryText("");
      alert("Commentary updated successfully");
    } catch (err) {
      console.error("Error updating commentary:", err);
      alert("Failed to update commentary");
    } finally {
      setLoading(false);
    }
  };

  const handleTossUpdate = async () => {
    if (!tossWinnerId || !tossDecision) { alert("Please select toss winner and decision"); return; }
    setLoading(true);
    try {
      await api.put(`/matches/${matchId}/toss`, { tossWinnerId, decision: tossDecision });
      alert("Toss updated successfully");
      fetchMatch();
    } catch (err) { alert(err || "Error updating toss"); } finally { setLoading(false); }
  };

  const handleSetPlayingXI = async () => {
    if (tempXI.length !== 11) { alert("Please select exactly 11 players"); return; }
    setLoading(true);
    try {
      await api.put(`/matches/${matchId}/playing-xi`, { teamId: selectedTeamForXI, players: tempXI });
      alert("Playing XI updated successfully");
      setShowPlayingXISelector(false);
      fetchMatch();
    } catch (err) { alert(err || "Error setting Playing XI"); } finally { setLoading(false); }
  };

  const handleSetSquad15 = async () => {
    if (tempSquad15.length < 11 || tempSquad15.length > 20) { alert("Please select between 11 and 20 players"); return; }
    setLoading(true);
    try {
      await api.put(`/matches/${matchId}/squad15`, { teamId: selectedTeamForSquad, players: tempSquad15 });
      alert("Squad updated successfully");
      setShowSquad15Selector(false);
      fetchMatch();
    } catch (err) { alert(err || "Error setting squad"); } finally { setLoading(false); }
  };

  const handleSetTwelfthMan = async () => {
    if (!temp12thMan) { alert("Please select 12th man"); return; }
    setLoading(true);
    try {
      await api.put(`/matches/${matchId}/twelfth-man`, { teamId: selectedTeamFor12thMan, playerId: temp12thMan });
      alert("12th man updated successfully");
      setShowTwelfthManSelector(false);
      fetchMatch();
    } catch (err) { alert(err || "Error setting 12th man"); } finally { setLoading(false); }
  };

  const handleEndInnings = async () => {
    try { await api.post(`/matches/${matchId}/end-innings`, { inningsIndex: currentInnings }); fetchMatch(); alert("Innings ended successfully"); }
    catch (err) { alert("Failed to end innings"); }
  };

  const handleStartNextInnings = async () => {
    try { await api.post(`/matches/${matchId}/start-next-innings`); fetchMatch(); setCurrentInnings(prev => prev + 1); alert("Next innings started"); }
    catch (err) { alert("Failed to start next innings"); }
  };

  const togglePlayerSelection = (playerId) => {
    if (tempXI.includes(playerId)) setTempXI(tempXI.filter(id => id !== playerId));
    else if (tempXI.length < 11) setTempXI([...tempXI, playerId]);
    else alert("You can only select 11 players");
  };

  const togglePlayerSelectionForSquad = (playerId) => {
    if (tempSquad15.includes(playerId)) setTempSquad15(tempSquad15.filter(id => id !== playerId));
    else if (tempSquad15.length < 20) setTempSquad15([...tempSquad15, playerId]);
    else alert("You can only select up to 20 players");
  };

  const openXISelector = (teamId) => {
    const team = match.teams.find(t => (t._id || t) === teamId);
    setSelectedTeamForXI(teamId);
    const existingXI = match.playingXI?.find(xi => (xi.team?._id || xi.team) === teamId);
    setTempXI(existingXI ? existingXI.players.map(p => p._id || p) : []);
    setShowPlayingXISelector(true);
  };

  const openSquad15Selector = (teamId) => {
    const team = match.teams.find(t => (t._id || t) === teamId);
    setSelectedTeamForSquad(teamId);
    const existingSquad = match.squad15?.find(sq => (sq.team?._id || sq.team) === teamId);
    setTempSquad15(existingSquad ? existingSquad.players.map(p => p._id || p) : []);
    setShowSquad15Selector(true);
  };

  const openTwelfthManSelector = (teamId) => {
    const team = match.teams.find(t => (t._id || t) === teamId);
    setSelectedTeamFor12thMan(teamId);
    const existing12thMan = match.twelfthMan?.find(tm => (tm.team?._id || tm.team) === teamId);
    setTemp12thMan(existing12thMan ? (existing12thMan.player?._id || existing12thMan.player) : "");
    setShowTwelfthManSelector(true);
  };

  if (!match) return <div className="text-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div><p className="mt-2 text-slate-600">Loading match...</p></div>;

  const innings = match.innings?.[currentInnings] || {};
  const currentOver = innings.oversHistory?.[innings.oversHistory.length - 1] || null;
  const ballsInCurrentOver = currentOver?.balls || [];
  const getTeamName = (team) => typeof team === 'object' ? team.name : "Team";
  const getPlayerName = (player) => typeof player === 'object' ? player.name : "Player";

  return (
    <div className="space-y-6">
      {/* Match Header */}
      {!isEmbedded && (
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-lg">
          <h3 className="text-lg font-semibold">{match.title}</h3>
          <div className="flex items-center gap-4 mt-2 text-sm">
            <span className="px-2 py-1 bg-white/20 rounded-full text-xs font-medium">{match.matchType || "T20"}</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${match.status === "live" ? "bg-green-500 animate-pulse" : "bg-white/20"}`}>{match.status?.toUpperCase()}</span>
          </div>
        </div>
      )}

      {/* Toss Selection */}
      {!match.tossWinner && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-800 mb-3">Toss Selection</h4>
          <div className="grid grid-cols-2 gap-4">
            <select value={tossWinnerId} onChange={(e) => setTossWinnerId(e.target.value)} className="p-2 border rounded-lg">
              <option value="">Select Team</option>
              {match.teams?.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
            </select>
            <select value={tossDecision} onChange={(e) => setTossDecision(e.target.value)} className="p-2 border rounded-lg">
              <option value="">Select Decision</option>
              <option value="bat">Bat</option>
              <option value="bowl">Bowl</option>
            </select>
          </div>
          <button onClick={handleTossUpdate} className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg font-bold">Update Toss</button>
        </div>
      )}

      {/* Squad 15, Playing XI & 12th Man Management - Must be done before toss */}
      {!match.tossWinner && (
        <div className="space-y-3">
          <h4 className="font-semibold text-slate-800 text-sm uppercase tracking-widest">Pre-Match Selections</h4>
          <div className="grid grid-cols-3 gap-2">
            {match.teams?.map((team) => {
              const squad = match.squad15?.find(sq => (sq.team?._id || sq.team) === team._id);
              const squadSet = squad?.players?.length >= 11 && squad?.players?.length <= 20;
              return (
                <button
                  key={team._id}
                  onClick={() => openSquad15Selector(team._id)}
                  className={`py-2 rounded-lg text-xs font-bold transition-all ${squadSet
                    ? "bg-green-100 text-green-700 border-2 border-green-500"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                    }`}
                >
                  Squad ({squad?.players?.length || 0}/20) {squadSet && "✓"}
                </button>
              );
            })}
          </div>
          {match.squad15?.length > 0 && (
            <div className="grid grid-cols-2 gap-4 mt-4">
              {match.teams?.map((team) => {
                const squad = match.squad15?.find(sq => (sq.team?._id || sq.team) === team._id);
                if (!squad) return null;
                const captain = squad.captain ? squad.players?.find(p => p._id === squad.captain) : null;
                const viceCaptain = squad.viceCaptain ? squad.players?.find(p => p._id === squad.viceCaptain) : null;
                const wicketKeepers = squad.wicketKeepers?.map(id => squad.players?.find(p => p._id === id)).filter(Boolean) || [];
                return (
                  <div key={team._id} className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <h5 className="font-bold text-sm text-slate-700 mb-2">{team.name} Squad</h5>
                    <div className="space-y-1 text-xs">
                      {captain && (
                        <div className="flex items-center gap-1">
                          <span className="px-1.5 py-0.5 bg-yellow-400 text-black rounded font-bold text-[10px]">C</span>
                          <span className="text-slate-600">{captain.name}</span>
                        </div>
                      )}
                      {viceCaptain && (
                        <div className="flex items-center gap-1">
                          <span className="px-1.5 py-0.5 bg-green-500 text-white rounded font-bold text-[10px]">VC</span>
                          <span className="text-slate-600">{viceCaptain.name}</span>
                        </div>
                      )}
                      {wicketKeepers.length > 0 && (
                        <div className="flex items-center gap-1 flex-wrap">
                          <span className="px-1.5 py-0.5 bg-orange-500 text-white rounded font-bold text-[10px]">WK</span>
                          <span className="text-slate-600">{wicketKeepers.map(wk => wk.name).join(", ")}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Playing XI Management (After Toss) */}
      {match.tossWinner && (
        <div className="grid grid-cols-2 gap-2">
          {match.teams?.map((team) => (
            <button key={team._id} onClick={() => openXISelector(team._id)} className="bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-lg text-xs font-bold">
              Set {team.name} XI {match.playingXI?.find(xi => (xi.team?._id || xi.team) === team._id)?.players?.length === 11 && "✓"}
            </button>
          ))}
        </div>
      )}

      {showSquad15Selector && (
        <SquadSelectionModal
          matchId={matchId}
          teams={match.teams?.filter(t => t._id === selectedTeamForSquad)}
          onClose={() => setShowSquad15Selector(false)}
          onSubmit={() => {
            setShowSquad15Selector(false);
            fetchMatch();
          }}
        />
      )}

      {showPlayingXISelector && (
        <PlayingXISelector
          matchId={matchId}
          match={match}
          teams={match.teams?.filter(t => t._id === selectedTeamForXI)}
          onClose={() => setShowPlayingXISelector(false)}
          onSubmit={() => {
            setShowPlayingXISelector(false);
            fetchMatch();
          }}
        />
      )}

      {/* Innings Selector */}
      {match.innings && match.innings.length > 1 && (
        <div className="flex gap-2">
          {match.innings.map((inn, idx) => (
            <button key={idx} onClick={() => { setCurrentInnings(idx); loadTeamPlayers(); }} disabled={inn.status === "upcoming"} className={`flex-1 py-2 rounded-lg font-medium ${currentInnings === idx ? "bg-blue-600 text-white" : "bg-slate-100"}`}>
              {getTeamName(inn.team)} {inn.status === "completed" && "✓"}
            </button>
          ))}
        </div>
      )}

      {/* Innings Break */}
      {match.status === "innings-break" && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800 font-medium">Innings Break</p>
          <p className="text-yellow-700 text-sm">{getTeamName(match.innings[0].team)}: {match.innings[0].runs}/{match.innings[0].wickets}</p>
          <button onClick={handleStartNextInnings} className="mt-3 bg-yellow-600 text-white px-4 py-2 rounded-lg">Start Next Innings</button>
        </div>
      )}

      {/* Score Display */}
      <div className="grid grid-cols-2 gap-4">
        {match.innings.map((inn, idx) => (
          <div key={idx} className={`p-4 rounded-lg border-2 ${currentInnings === idx ? "border-blue-500 bg-blue-50" : "border-slate-200"}`}>
            <p className="text-sm text-slate-600">{getTeamName(inn.team)}</p>
            <p className="text-3xl font-bold">{inn.runs}/{inn.wickets}</p>
            <p className="text-xs text-slate-500">{Math.floor(inn.balls / 6)}.{inn.balls % 6} ov</p>
          </div>
        ))}
      </div>

      {/* Current Over Balls */}
      {ballsInCurrentOver.length > 0 && (
        <div className="bg-slate-50 p-4 rounded-lg">
          <p className="text-sm font-medium mb-2">Over {Math.floor(innings.balls / 6) + 1}</p>
          <div className="flex gap-2 flex-wrap">
            {ballsInCurrentOver.map((ball, i) => (
              <div key={i} className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${ball.isWicket ? "bg-red-500 text-white" : ball.runs === 4 || ball.runs === 6 ? "bg-green-500 text-white" : "bg-slate-300"}`}>
                {ball.isWicket ? "W" : ball.runs}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Live Commentary - Organized by Overs with Summaries */}
      {innings.oversHistory && innings.oversHistory.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-4">
            <h3 className="font-bold text-white text-lg">📻 Live Commentary</h3>
            <p className="text-blue-200 text-sm mt-1">Organized by Overs with Summaries</p>
          </div>
          <div className="max-h-[600px] overflow-y-auto">
            {[...innings.oversHistory].reverse().map((over) => {
              const overRuns = over.balls.reduce((sum, b) => sum + (b.runs || 0) + (b.isWide ? 1 : 0) + (b.isNoBall ? 1 : 0), 0);
              const overWickets = over.balls.filter(b => b.isWicket).length;
              const dotBalls = over.balls.filter(b => b.runs === 0 && !b.isWide && !b.isNoBall).length;
              return (
                <div key={over.overNumber} className="border-b last:border-b-0">
                  {/* Over Header */}
                  <div className="bg-slate-100 px-4 py-3 sticky top-0 z-10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-black text-slate-800">Over {over.overNumber + 1}</span>
                        <span className="text-xs font-bold bg-blue-600 text-white px-2 py-1 rounded">{over.bowler?.name}</span>
                      </div>
                      <div className="flex gap-4 text-sm font-bold">
                        <span className="text-green-600">{overRuns} runs</span>
                        {overWickets > 0 && <span className="text-red-600">{overWickets}W</span>}
                        <span className="text-slate-600">{dotBalls} dots</span>
                      </div>
                    </div>
                  </div>

                  {/* Balls in Over */}
                  <div className="p-4 space-y-3">
                    {over.balls.map((ball, ballIdx) => {
                      const [firstLine, ...descLines] = (ball.commentary || "").split('\n');
                      return (
                        <div key={ballIdx} className="border-l-4 border-blue-400 pl-4 pb-3 last:pb-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2">
                              <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-black">
                                {over.overNumber + 1}.{ball.ballNumber}
                              </span>
                              <span className={`text-sm font-bold ${ball.isWicket ? 'text-red-600' :
                                ball.runs === 4 || ball.runs === 6 ? 'text-green-600' :
                                  ball.isWide || ball.isNoBall ? 'text-orange-600' :
                                    ball.runs === 0 ? 'text-slate-500' : 'text-blue-600'
                                }`}>
                                {ball.isWicket ? '⚾ WICKET' :
                                  ball.isWide ? 'Wd' :
                                    ball.isNoBall ? 'Nb' :
                                      `${ball.runs} run${ball.runs !== 1 ? 's' : ''}`}
                              </span>
                            </div>
                            <button
                              onClick={() => openCommentaryEditor(over.overNumber, ball.ballNumber, ball.commentary || "")}
                              className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 px-2 py-1 rounded font-bold"
                            >
                              Edit
                            </button>
                          </div>
                          <p className="font-bold text-slate-700 text-sm">{firstLine}</p>
                          {descLines.length > 0 && (
                            <p className="text-slate-600 text-xs mt-1">{descLines.join('\n')}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Over Summary */}
                  <div className="bg-blue-50 border-t px-4 py-2 text-xs font-bold text-slate-700">
                    Over Summary: {overRuns} runs {overWickets > 0 && `, ${overWickets} wicket${overWickets !== 1 ? 's' : ''}`}, {dotBalls} dots
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Scorecard Section - Clickable to Select Players */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white px-6 py-3">
          <h3 className="font-bold text-lg">📊 Scorecard (Click to Select Players)</h3>
        </div>

        {/* Batting Stats */}
        <div className="p-4 border-b bg-blue-50">
          <p className="text-sm font-bold text-blue-700 mb-3 uppercase">Batting</p>
          <div className="space-y-2">
            {innings.batting?.slice(0, 5).map((b) => (
              <button
                key={b.player?._id || b.player}
                onClick={() => {
                  if (!b.isOut) {
                    if (onStrikeBatsman === (b.player?._id || b.player)) {
                      // Switch batsmen
                      setOnStrikeBatsman(onStrikeBatsman === batsman1 ? batsman2 : batsman1);
                    } else {
                      setOnStrikeBatsman(b.player?._id || b.player);
                    }
                  }
                }}
                className={`w-full text-left px-3 py-2 rounded-lg border-2 transition-all ${onStrikeBatsman === (b.player?._id || b.player)
                  ? 'bg-blue-600 text-white border-blue-700'
                  : b.isOut
                    ? 'bg-red-50 text-red-700 border-red-200 opacity-60'
                    : 'bg-white text-slate-800 border-blue-200 hover:border-blue-400'
                  }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold">{b.player?.name}  {onStrikeBatsman === (b.player?._id || b.player) && ' ☆'} {b.isOut && ' ✗'}</span>
                  <span className="text-xs">{b.runs}-{b.balls} ({(b.strikeRate || 0).toFixed(1)})</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Bowling Stats */}
        <div className="p-4 bg-green-50">
          <p className="text-sm font-bold text-green-700 mb-3 uppercase">Bowling</p>
          <div className="space-y-2">
            {innings.oversHistory?.map((over) => over.bowler).filter((v, i, a) => a.indexOf(v) === i).slice(0, 5).map((bowlerData) => {
              const bowlerStats = innings.bowling?.find(b => (b.player?._id || b.player) === (bowlerData?._id || bowlerData));
              return (
                <button
                  key={bowlerData?._id || bowlerData}
                  onClick={() => setBowler(bowlerData?._id || bowlerData)}
                  className={`w-full text-left px-3 py-2 rounded-lg border-2 transition-all ${bowler === (bowlerData?._id || bowlerData)
                    ? 'bg-green-600 text-white border-green-700'
                    : 'bg-white text-slate-800 border-green-200 hover:border-green-400'
                    }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold">{bowlerData?.name} {bowler === (bowlerData?._id || bowlerData) && ' ☆'}</span>
                    <span className="text-xs">W:{bowlerStats?.wickets || 0} R:{bowlerStats?.runs || 0} E:{(bowlerStats?.economy || 0).toFixed(2)}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Run Selection Buttons */}
      {innings.status !== "completed" && (
        <div>
          <label className="block text-sm font-medium mb-2">Runs (Click to Select)</label>
          <div className="grid grid-cols-7 gap-2">
            {[0, 1, 2, 3, 4, 5, 6].map((r) => (
              <button
                key={r}
                onClick={() => {
                  setRuns(r);
                  if (r >= 1 && r <= 4) { setShowWagonWheel(true); setWagonWheelMode('shot'); }
                  else if (r === 6) { setShowWagonWheel(true); setWagonWheelMode('six'); }
                  else setSelectedPosition(null);
                }}
                className={`py-3 rounded-lg font-bold ${runs === r ? (r === 0 ? "bg-slate-700 text-white" : r === 4 || r === 6 ? "bg-green-600 text-white" : "bg-blue-600 text-white") : "bg-slate-200"}`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Wagon Wheel Modal with Correct Fielding Positions */}
      {showWagonWheel && (
        <div className="fixed inset-0 bg-black/70 z-[80] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">{wagonWheelMode === 'six' ? 'Click where the six went' : 'Click where the ball went'}</h3>
              <button onClick={() => setShowWagonWheel(false)} className="text-slate-400 hover:text-slate-600 text-xl">✕</button>
            </div>
            <div className="relative w-full aspect-square bg-green-100 rounded-full border-4 border-green-800 overflow-hidden shadow-inner" onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - rect.left - rect.width / 2;
              const y = e.clientY - rect.top - rect.height / 2;
              const angle = Math.atan2(-y, x) * (180 / Math.PI);
              const distance = Math.sqrt(x * x + y * y) / (rect.width / 2) * 100;
              handleWagonWheelClick(angle, distance);
            }}>
              {/* Cricket field background */}
              <div className="absolute inset-0 bg-gradient-to-radial from-green-200 to-green-400"></div>

              {/* Inner circle (30 yards) */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-[35%] h-[35%] rounded-full border-2 border-white/60"></div>
              </div>

              {/* Outer circle (boundary) */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-[70%] h-[70%] rounded-full border-2 border-white/40 border-dashed"></div>
              </div>

              {/* Pitch */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-10 h-32 bg-amber-200 border-2 border-amber-300 rounded"></div>

              {/* Fielding position markers using x,y coordinates */}
              {Object.entries(FIELDING_POSITIONS).map(([key, pos]) => (
                <div
                  key={key}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 text-[8px] font-bold text-white bg-green-900/80 px-1 py-0.5 rounded whitespace-nowrap hover:bg-green-900 hover:scale-125 transition-all cursor-pointer"
                  style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                >
                  {pos.label}
                </div>
              ))}

              {/* Boundary rope */}
              <div className="absolute inset-2 rounded-full border-4 border-blue-600/30"></div>

              {/* Instructions */}
              <div className="absolute bottom-6 left-0 right-0 text-center text-sm text-white font-bold bg-black/40 py-2 rounded">
                Click anywhere on the field
              </div>
            </div>
            {selectedPosition && (
              <p className="mt-3 text-sm text-center font-medium text-green-700">
                Selected: <span className="font-bold">{FIELDING_POSITIONS[selectedPosition]?.label || 'Custom position'}</span>
              </p>
            )}
          </div>
        </div>
      )}

      {/* Commentary Preview & Edit */}
      {innings.status !== "completed" && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-bold text-yellow-800">ESPN Cricinfo Style Commentary</h4>
            <button onClick={() => setShowCommentaryEdit(!showCommentaryEdit)} className="text-xs bg-yellow-200 px-3 py-1 rounded font-bold">{showCommentaryEdit ? "Hide Edit" : "Edit"}</button>
          </div>
          <div className="bg-white rounded border p-3 mb-3 font-mono text-sm">
            <p className="font-bold text-[#031d44] whitespace-pre-line">{commentaryFirstLine}</p>
            <p className="text-slate-600 mt-2">{commentaryText}</p>
          </div>
          {showCommentaryEdit && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-yellow-800 mb-1">First Line</label>
                <textarea value={commentaryFirstLine} onChange={(e) => setCommentaryFirstLine(e.target.value)} rows={2} className="w-full p-2 border rounded text-sm font-mono" />
              </div>
              <div>
                <label className="block text-xs font-medium text-yellow-800 mb-1">Commentary Description</label>
                <textarea value={commentaryText} onChange={(e) => setCommentaryText(e.target.value)} rows={3} className="w-full p-2 border rounded text-sm" />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Extras & Wicket */}
      {innings.status !== "completed" && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Extras</label>
            <div className="grid grid-cols-2 gap-2">
              <label className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border cursor-pointer hover:bg-slate-100">
                <input type="checkbox" checked={isWide} onChange={(e) => setIsWide(e.target.checked)} className="w-4 h-4" />
                <span className="text-sm">Wide</span>
              </label>
              <label className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border cursor-pointer hover:bg-slate-100">
                <input type="checkbox" checked={isNoBall} onChange={(e) => setIsNoBall(e.target.checked)} className="w-4 h-4" />
                <span className="text-sm">No Ball</span>
              </label>
              <label className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border cursor-pointer hover:bg-slate-100">
                <input type="checkbox" checked={isBye} onChange={(e) => setIsBye(e.target.checked)} className="w-4 h-4" />
                <span className="text-sm">Bye</span>
              </label>
              <label className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border cursor-pointer hover:bg-slate-100">
                <input type="checkbox" checked={isLegBye} onChange={(e) => setIsLegBye(e.target.checked)} className="w-4 h-4" />
                <span className="text-sm">Leg Bye</span>
              </label>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Wicket</label>
            <label className="flex items-center gap-2 p-3 bg-red-50 rounded-lg border border-red-200 cursor-pointer hover:bg-red-100">
              <input type="checkbox" checked={isWicket} onChange={(e) => setIsWicket(e.target.checked)} className="w-4 h-4" />
              <span className="text-sm text-red-700 font-medium">Wicket</span>
            </label>
            {isWicket && (
              <select value={wicketType} onChange={(e) => setWicketType(e.target.value)} className="mt-3 w-full p-2 border rounded-lg text-sm">
                <option value="">Select Wicket Type</option>
                <option value="bowled">Bowled</option>
                <option value="caught">Caught</option>
                <option value="lbw">LBW</option>
                <option value="run out">Run Out</option>
                <option value="stumped">Stumped</option>
              </select>
            )}
          </div>
        </div>
      )}

      {/* Update & Undo Buttons */}
      {innings.status !== "completed" && (
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={handleUndo}
            disabled={loading || !lastBallState}
            className="bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white py-3 rounded-lg font-bold transition-all shadow-lg"
            title="Remove the last ball added"
          >
            ↶ Undo
          </button>
          <div></div>
          <button
            onClick={sendUpdate}
            disabled={loading}
            className="col-span-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg font-bold disabled:opacity-50 shadow-lg hover:shadow-xl transition-all"
          >
            {loading ? "Updating..." : "✓ Update Score"}
          </button>
        </div>
      )}

      {/* Commentary Edit Modal */}
      {showCommentaryEditModal && editingBallData && (
        <div className="fixed inset-0 bg-black/50 z-[90] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 border-b flex justify-between items-center">
              <h3 className="font-bold text-white">
                Edit Commentary - Over {editingBallData.overNumber + 1}.{editingBallData.ballNumber}
              </h3>
              <button
                onClick={() => {
                  setShowCommentaryEditModal(false);
                  setEditingBallData(null);
                }}
                className="text-white hover:text-slate-200 text-2xl"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  First Line (Format: Bowler to Batsman, Runs)
                </label>
                <textarea
                  value={editingCommentaryFirstLine}
                  onChange={(e) => setEditingCommentaryFirstLine(e.target.value)}
                  rows={2}
                  placeholder="e.g., Mustafizur to Mohammad Ali, No runs"
                  className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Detailed Commentary Description
                </label>
                <textarea
                  value={editingCommentaryText}
                  onChange={(e) => setEditingCommentaryText(e.target.value)}
                  rows={4}
                  placeholder="e.g., Slower ball on off, no pace whatsoever to deal with, pushed to cover for single"
                  className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <p className="text-xs font-bold text-slate-600 mb-2">PREVIEW:</p>
                <p className="font-bold text-slate-800 whitespace-pre-wrap">{editingCommentaryFirstLine}</p>
                <p className="text-slate-600 text-sm mt-2 whitespace-pre-wrap">{editingCommentaryText}</p>
              </div>
            </div>
            <div className="bg-slate-50 px-6 py-4 border-t flex gap-3">
              <button
                onClick={() => {
                  setShowCommentaryEditModal(false);
                  setEditingBallData(null);
                }}
                disabled={loading}
                className="flex-1 bg-slate-300 hover:bg-slate-400 text-slate-800 py-2 rounded-lg font-bold disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={saveCommentaryEdit}
                disabled={loading || !editingCommentaryFirstLine.trim()}
                className="flex-[2] bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-2 rounded-lg font-bold disabled:opacity-50 shadow-lg"
              >
                {loading ? "Saving..." : "Save & Update"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Partnership Chart */}
      <PartnershipChart match={match} inningsIndex={currentInnings} />
    </div>
  );
}
