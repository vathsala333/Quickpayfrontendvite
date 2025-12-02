import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function PaymentHistory() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [page, setPage] = useState(1);
  const itemsPerPage = 5;

  const navigate = useNavigate();

  // 🔥 Use API base URL from .env
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
        const { data } = await axios.get(
          `${API_BASE_URL}/api/payment/history`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

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

  const totalPages = Math.ceil(transactions.length / itemsPerPage);
  const start = (page - 1) * itemsPerPage;
  const currentPageData = transactions.slice(start, start + itemsPerPage);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-6">
      <h1 className="text-3xl font-bold text-green-600 mb-4">Transaction History</h1>

      <button
        onClick={() => navigate("/dashboard")}
        className="mb-4 bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800"
      >
        ← Back to Dashboard
      </button>

      {loading && <p className="text-gray-600 text-lg mt-6">⏳ Loading...</p>}

      {error && (
        <p className="bg-red-100 border border-red-400 text-red-700 p-4 rounded w-full max-w-3xl text-center">
          {error}
        </p>
      )}

      {!loading && !error && (
        <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-3xl">
          {transactions.length === 0 ? (
            <p className="text-gray-500 text-center">No transactions found.</p>
          ) : (
            <>
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-green-100 text-left">
                    <th className="p-2">Customer</th>
                    <th className="p-2">Amount</th>
                    <th className="p-2">Status</th>
                    <th className="p-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {currentPageData.map((tx) => (
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
                      <td className="p-2">
                        {new Date(tx.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex justify-between items-center mt-6">
                <button
                  className={`px-4 py-2 rounded ${
                    page === 1
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-green-600 text-white hover:bg-green-700"
                  }`}
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  ← Previous
                </button>

                <span className="text-gray-700 font-semibold">
                  Page {page} of {totalPages}
                </span>

                <button
                  className={`px-4 py-2 rounded ${
                    page === totalPages
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-green-600 text-white hover:bg-green-700"
                  }`}
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  Next →
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
