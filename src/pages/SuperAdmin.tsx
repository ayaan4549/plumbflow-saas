import { useState, useEffect } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import { Users, Calendar, ShieldAlert, Wrench } from "lucide-react";

export default function SuperAdmin() {
  const [plumbers, setPlumbers] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const plumbersSnap = await getDocs(collection(db, "plumbers"));
      const bookingsSnap = await getDocs(query(collection(db, "bookings"), orderBy("createdAt", "desc")));
      
      setPlumbers(plumbersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setBookings(bookingsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) return <div className="p-8">Loading Super Admin...</div>;

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="flex items-center gap-3 mb-12">
        <ShieldAlert className="text-red-500 w-8 h-8" />
        <h1 className="text-3xl font-bold">PlumbFlow Super Admin</h1>
      </div>

      <div className="grid md:grid-cols-2 gap-12">
        {/* Plumbers List */}
        <div>
          <div className="flex items-center gap-2 mb-6">
            <Users className="text-blue-400 w-6 h-6" />
            <h2 className="text-xl font-bold">Registered Plumbers ({plumbers.length})</h2>
          </div>
          <div className="bg-slate-800 rounded-2xl overflow-hidden border border-slate-700">
            <table className="w-full text-left">
              <thead className="bg-slate-700 text-slate-400 text-xs font-bold uppercase">
                <tr>
                  <th className="px-6 py-4">Business</th>
                  <th className="px-6 py-4">Plan</th>
                  <th className="px-6 py-4">Subdomain</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {plumbers.map(p => (
                  <tr key={p.id} className="hover:bg-slate-700/50">
                    <td className="px-6 py-4 font-bold">{p.businessName}</td>
                    <td className="px-6 py-4 uppercase text-xs">{p.plan}</td>
                    <td className="px-6 py-4 text-slate-400">{p.subdomain}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Global Bookings */}
        <div>
          <div className="flex items-center gap-2 mb-6">
            <Calendar className="text-emerald-400 w-6 h-6" />
            <h2 className="text-xl font-bold">Global Bookings ({bookings.length})</h2>
          </div>
          <div className="bg-slate-800 rounded-2xl overflow-hidden border border-slate-700">
            <table className="w-full text-left">
              <thead className="bg-slate-700 text-slate-400 text-xs font-bold uppercase">
                <tr>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Job</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {bookings.map(b => (
                  <tr key={b.id} className="hover:bg-slate-700/50">
                    <td className="px-6 py-4 font-bold">{b.customerName}</td>
                    <td className="px-6 py-4 text-sm">{b.jobType}</td>
                    <td className="px-6 py-4 uppercase text-xs">{b.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
