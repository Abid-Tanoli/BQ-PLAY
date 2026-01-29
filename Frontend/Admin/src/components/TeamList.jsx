import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchTeams } from "../store/slices/teamSlice";

export default function TeamList() {
  const { teams, loading, error } = useSelector(state => state.teams);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchTeams());
  }, [dispatch]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse border border-gray-300">
        <thead className="bg-gray-200">
          <tr>
            <th className="border p-2">Name</th>
            <th className="border p-2">Owner</th>
            <th className="border p-2">Logo</th>
          </tr>
        </thead>
        <tbody>
          {teams.map(team => (
            <tr key={team._id} className="border-t">
              <td className="border p-2">{team.name}</td>
              <td className="border p-2">{team.ownername}</td>
              <td className="border p-2 text-center">
                {team.logo 
                  ? <img src={`http://localhost:5000${team.logo}`} className="w-12 h-12 mx-auto" alt={team.name} /> 
                  : "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
