import TeamForm from "../components/TeamForm";
import TeamList from "../components/TeamList";

export default function Teams() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Manage Teams</h2>

      <div className="card p-4">
        <TeamForm />
        <TeamList />
      </div>
    </div>
  );
}
