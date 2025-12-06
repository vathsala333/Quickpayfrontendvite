import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function PaymentHistory() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchHistory = async () => {
      const token = sessionStorage.getItem("token");

      if (!token) {
        setError("Session expired. Please log in again.");
        setLoading(false);
        setTimeout(() => navigate("/login"), 1500);
        return;
      }

      try {
        const { data } = await axios.get(`${API_BASE_URL}/api/payment/history`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setTransactions(
          data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        );
      } catch (err) {
        console.error(err);
        setError("Failed to load transaction history.");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [navigate, API_BASE_URL]);

  // === GROUP BY MONTH ===
  const groupByMonth = () => {
    const now = new Date();
    const months = [];

    for (let i = 0; i < 12; i++) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = month.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });

      const monthTransactions = transactions.filter(
        (t) =>
          new Date(t.createdAt).getMonth() === month.getMonth() &&
          new Date(t.createdAt).getFullYear() === month.getFullYear()
      );

      months.push({ label, history: monthTransactions });
    }

    return months;
  };

  const groupedMonths = groupByMonth();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-6">
      <h1 className="text-3xl font-bold text-green-600 mb-4">
        Transaction History
      </h1>

      <button
        onClick={() => navigate("/dashboard")}
        className="mb-4 bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800"
      >
        ← Back to Dashboard
      </button>

      {loading && <p>⏳ Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && (
        <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-3xl">
          {groupedMonths.map((month, index) => (
            <div key={index} className="mb-6">
              <h2 className="text-xl font-bold text-green-700 mb-2">
                {month.label}
              </h2>

              {month.history.length === 0 ? (
                <p className="text-gray-500 ml-4">No transactions</p>
              ) : (
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-green-100">
                      <th className="p-2">Customer</th>
                      <th className="p-2">Amount</th>
                      <th className="p-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {month.history.map((tx) => (
                      <tr key={tx._id} className="border-t hover:bg-gray-50">
                        <td className="p-2">{tx.customerName}</td>
                        <td className="p-2 font-semibold">₹{tx.amount}</td>
                        <td
                          className={`p-2 font-semibold ${
                            tx.status === "COMPLETED"
                              ? "text-green-600"
                              : tx.status === "FAILED"
                              ? "text-red-600"
                              : "text-yellow-600"
                          }`}
                        >
                          {tx.status}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
