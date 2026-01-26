import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchTeams } from "../store/slices/teamSlice";

export default function TeamList() {
  const { teams, loading } = useSelector(state => state.teams);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchTeams());
  }, [dispatch]);

  if (loading) return <p>Loading...</p>;

  return (
    <table className="w-full border">
      <thead className="bg-gray-200">
        <tr>
          <th>Name</th>
          <th>Logo</th>
        </tr>
      </thead>
      <tbody>
        {teams.map(team => (
          <tr key={team._id} className="border-t">
            <td>{team.name}</td>
            <td>{team.logo ? <img src={team.logo} className="w-12 h-12" /> : "-"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
