export default function PointsTable({ table }) {
  return (
    <table className="w-full border">
      <thead>
        <tr>
          <th>Team</th>
          <th>P</th>
          <th>W</th>
          <th>L</th>
          <th>Pts</th>
        </tr>
      </thead>
      <tbody>
        {table.map(t => (
          <tr key={t.team}>
            <td>{t.team}</td>
            <td>{t.played}</td>
            <td>{t.won}</td>
            <td>{t.lost}</td>
            <td>{t.points}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
