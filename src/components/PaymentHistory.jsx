import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function PaymentHistory() {
  const [transactions, setTransactions] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("");
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

        setTransactions(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      } catch (err) {
        console.error(err);
        setError("Failed to load transaction history.");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [navigate, API_BASE_URL]);

  // Generate months for current year
  const now = new Date();
  const months = Array.from({ length: 12 }, (_, i) => {
    const date = new Date(now.getFullYear(), i, 1);
    return {
      value: `${i}-${now.getFullYear()}`,
      label: date.toLocaleDateString("en-US", { month: "long", year: "numeric" }),
    };
  });

  // Default month (current)
  useEffect(() => {
    if (months.length > 0 && !selectedMonth) {
      const current = `${now.getMonth()}-${now.getFullYear()}`;
      setSelectedMonth(current);
    }
  }, [months, selectedMonth]);

  // Filter transactions by selected month
  const filteredTransactions = transactions.filter((tx) => {
    const date = new Date(tx.createdAt);
    const [m, y] = selectedMonth.split("-");
    return date.getMonth() === Number(m) && date.getFullYear() === Number(y);
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center">
      <h1 className="text-3xl font-bold text-green-600 mb-6">Transaction History</h1>

      <button
        onClick={() => navigate("/dashboard")}
        className="mb-4 bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800"
      >
        ← Back to Dashboard
      </button>

      {/* Dropdown Month Selector */}
      <select
        className="mb-5 p-2 border rounded text-gray-700"
        value={selectedMonth}
        onChange={(e) => setSelectedMonth(e.target.value)}
      >
        {months.map((m) => (
          <option key={m.value} value={m.value}>
            {m.label}
          </option>
        ))}
      </select>

      {!loading && !error && (
        <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-3xl">
          <h2 className="text-xl font-bold text-green-700 mb-4">
            {months.find((m) => m.value === selectedMonth)?.label}
          </h2>

          {filteredTransactions.length === 0 ? (
            <p className="text-gray-500">No transactions</p>
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
                {filteredTransactions.map((tx) => (
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
      )}
    </div>
  );
}
