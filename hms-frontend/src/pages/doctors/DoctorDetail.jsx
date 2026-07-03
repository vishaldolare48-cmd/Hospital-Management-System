import { useParams, useNavigate } from 'react-router-dom';

export default function DoctorDetail() {
  const navigate = useNavigate();
  return (
    <div className="max-w-2xl mx-auto text-center py-20 space-y-4">
      <h1 className="text-xl font-bold">Doctor Profile Details</h1>
      <p className="text-text-secondary text-sm">Doctor profiles can be viewed directly on the doctor list grid overview page.</p>
      <button onClick={() => navigate('/doctors')} className="px-5 py-2 bg-accent text-text-inverse font-semibold rounded-xl">Go back to Doctor List</button>
    </div>
  );
}
