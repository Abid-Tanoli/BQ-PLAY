import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPlayers, updatePlayerStats, deletePlayerById } from "../store/slices/playersSlice";

export default function PlayerList() {
  const dispatch = useDispatch();
  const { players, loading, error } = useSelector(state => state.players);
  const [search, setSearch] = useState("");

  useEffect(() => {
    dispatch(fetchPlayers());
  }, [dispatch]);

  const filtered = players.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <>
      <input
        className="border p-2 mb-3 w-full"
        placeholder="Search player..."
        onChange={e => setSearch(e.target.value)}
      />

      <table className="w-full border-collapse border border-gray-300">
        <thead className="bg-gray-200">
          <tr>
            <th className="border p-2">Name</th>
            <th className="border p-2">Team</th>
            <th className="border p-2">Runs</th>
            <th className="border p-2">Wickets</th>
            <th className="border p-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(p => (
            <tr key={p._id} className="border-t">
              <td className="border p-2">{p.name}</td>
              <td className="border p-2">{p.team?.name || "-"}</td>
              <td className="border p-2">
                <input
                  type="number"
                  defaultValue={p.stats?.runs || 0}
                  className="border w-20"
                  onBlur={e => dispatch(updatePlayerStats({ id: p._id, stats: { ...p.stats, runs: +e.target.value } }))}
                />
              </td>
              <td className="border p-2">
                <input
                  type="number"
                  defaultValue={p.stats?.wickets || 0}
                  className="border w-20"
                  onBlur={e => dispatch(updatePlayerStats({ id: p._id, stats: { ...p.stats, wickets: +e.target.value } }))}
                />
              </td>
              <td className="border p-2 text-center">
                <button
                  className="text-red-600"
                  onClick={() => dispatch(deletePlayerById(p._id))}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}