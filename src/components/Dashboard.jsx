import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();

  const API_BASE = import.meta.env.VITE_API_BASE_URL;
  
  const [balance, setBalance] = useState(0);
  const [showWallet, setShowWallet] = useState(false);
  const [addAmount, setAddAmount] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");

  // ⭐ Fetch wallet balance
  const fetchBalance = async () => {
    try {
      const token = sessionStorage.getItem("token");

      const { data } = await axios.get(`${API_BASE}/api/wallet/balance`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setBalance(data.balance);
    } catch (err) {
      console.error(err);
      alert("Unable to fetch wallet balance");
    }
  };

  // Load balance on mount
  useEffect(() => {
    fetchBalance();
  }, []);

  // ⭐ Auto Logout for inactivity
  useEffect(() => {
    let timeout;

    const resetTimer = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        sessionStorage.clear();
        alert("Session expired due to inactivity.");
        navigate("/login", { replace: true });
      }, 60000);
    };

    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keydown", resetTimer);

    resetTimer();

    return () => {
      clearTimeout(timeout);
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keydown", resetTimer);
    };
  }, [navigate]);

  // ⭐ Add Money
  const handleAddMoney = async () => {
    if (!addAmount || addAmount <= 0) {
      alert("Enter a valid amount");
      return;
    }

    try {
      const token = sessionStorage.getItem("token");

      const { data } = await axios.post(
        `${API_BASE}/api/wallet/add`,
        { amount: parseInt(addAmount) },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert("Money added successfully!");
      setAddAmount("");
      setBalance(data.balance);
    } catch (err) {
      console.error(err);
      alert("Failed to add money");
    }
  };

  // ⭐ Razorpay Send Payment
  const handlePayment = async () => {
    const token = sessionStorage.getItem("token");
    if (!token) return;

    if (!customerName || !mobile || !amount) {
      alert("Please fill all required fields");
      return;
    }

    if (amount > balance) {
      alert("Insufficient wallet balance!");
      return;
    }

    if (!window.Razorpay) {
      alert("Razorpay SDK failed to load.");
      return;
    }

    try {
      const userId = sessionStorage.getItem("userId");

      const { data } = await axios.post(
        `${API_BASE}/api/payment/create-order`,
        { amount, customerName, mobile, email, userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { order } = data;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID, // ✅ FIXED
        amount: order.amount,
        currency: "INR",
        name: "QuickPay",
        order_id: order.id,
        handler: async function (response) {
          setMessage(`Payment Successful: ${response.razorpay_payment_id}`);

          await axios.post(
            `${API_BASE}/api/payment/update-status`,
            { orderId: order.id, status: "COMPLETED" },
            { headers: { Authorization: `Bearer ${token}` } }
          );

          await axios.post(
            `${API_BASE}/api/wallet/deduct`,
            { amount: parseInt(amount) },
            { headers: { Authorization: `Bearer ${token}` } }
          );

          fetchBalance();
        },
        theme: { color: "#0d6efd" },
      };

      new window.Razorpay(options).open();
    } catch (err) {
      console.error(err);
      setMessage("Payment initiation failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 relative">
      <div className="absolute top-4 right-4 flex gap-3">
        <button
          onClick={() => navigate("/history")}
          className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition"
        >
          View History
        </button>

        <button
          onClick={() => {
            sessionStorage.clear();
            navigate("/login");
          }}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
        >
          Logout
        </button>
      </div>

      <h1 className="text-3xl font-bold text-green-600 mb-6 text-center">
        QuickPay Dashboard
      </h1>

      <div className="text-center mb-3">
        <button
          onClick={() => setShowWallet(!showWallet)}
          className="underline text-blue-600"
        >
          {showWallet ? "Hide Wallet" : "Show Wallet"}
        </button>
      </div>

      {showWallet && (
        <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-xl mx-auto mb-6">
          <h3 className="text-xl font-semibold">💰 Wallet Balance</h3>
          <p className="text-3xl font-bold mt-2">₹{balance}</p>
        </div>
      )}

      <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-xl mx-auto mb-6">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          ➕ Add Money
        </h3>

        <input
          type="number"
          placeholder="Enter amount"
          value={addAmount}
          onChange={(e) => setAddAmount(e.target.value)}
          className="border p-2 w-full rounded mt-3"
        />

        <button
          onClick={handleAddMoney}
          className="w-full bg-blue-600 text-white py-2 rounded mt-3 hover:bg-blue-700"
        >
          Add Money
        </button>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-xl mx-auto">
        <h3 className="text-xl font-semibold mb-3">Send Money</h3>

        <input
          type="text"
          placeholder="Customer Name"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          className="border p-2 w-full rounded mb-3"
        />

        <input
          type="tel"
          placeholder="Mobile"
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
          className="border p-2 w-full rounded mb-3"
        />

        <input
          type="email"
          placeholder="Email (optional)"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 w-full rounded mb-3"
        />

        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="border p-2 w-full rounded mb-4"
        />

        <button
          onClick={handlePayment}
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
        >
          Send Money
        </button>

        {message && <p className="mt-4 text-gray-600">{message}</p>}
      </div>
    </div>
  );
}

































































































































































































































































































/*import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();

  const [balance, setBalance] = useState(0);
  const [showWallet, setShowWallet] = useState(false);

  const [addAmount, setAddAmount] = useState("");

  const [customerName, setCustomerName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");

  // ⭐ Fetch wallet balance
  const fetchBalance = async () => {
    try {
      const token = sessionStorage.getItem("token");

      const { data } = await axios.get(
        "http://localhost:5000/api/wallet/balance",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setBalance(data.balance);
    } catch (err) {
      console.error(err);
      alert("Unable to fetch wallet balance");
    }
  };

  // Load balance on mount
  useEffect(() => {
    fetchBalance();
  }, []);

  // ⭐ Add Money
  const handleAddMoney = async () => {
    if (!addAmount || addAmount <= 0) {
      alert("Enter a valid amount");
      return;
    }

    try {
      const token = sessionStorage.getItem("token");

      const { data } = await axios.post(
        "http://localhost:5000/api/wallet/add",
        { amount: parseInt(addAmount) },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert("Money added successfully!");
      setAddAmount("");
      setBalance(data.balance);
    } catch (err) {
      console.error(err);
      alert("Failed to add money");
    }
  };

  // ⭐ Send Money (Razorpay)
  const handlePayment = async () => {
    if (!customerName || !mobile || !amount) {
      alert("Please fill all required fields");
      return;
    }

    if (amount > balance) {
      alert("Insufficient wallet balance!");
      return;
    }

    try {
      const token = sessionStorage.getItem("token");
      const userId = sessionStorage.getItem("userId");

      const { data } = await axios.post(
        "http://localhost:5000/api/payment/create-order",
        {
          amount,
          customerName,
          mobile,
          email,
          userId,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const { order } = data;

      const options = {
        key: "rzp_test_Re3tOLhWMc289q",
        amount: order.amount,
        currency: "INR",
        name: "QuickPay",
        order_id: order.id,
        handler: async function (response) {
          setMessage(`Payment Successful: ${response.razorpay_payment_id}`);

          // Update status
          await axios.post(
            "http://localhost:5000/api/payment/update-status",
            {
              orderId: order.id,
              status: "COMPLETED",
            },
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          // Deduct wallet
          await axios.post(
            "http://localhost:5000/api/wallet/deduct",
            { amount: parseInt(amount) },
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          fetchBalance(); // refresh balance
        },
      };

      new window.Razorpay(options).open();
    } catch (err) {
      console.error(err);
      setMessage("Payment initiation failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 relative">
    /* 
    /*  <div className="absolute top-4 right-4 flex gap-3">
        <button
          onClick={() => navigate("/history")}
          className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition"
        >
          View History 
        </button>

        <button
          onClick={() => {
            sessionStorage.clear();
            navigate("/login");
          }}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
        >
          Logout 
        </button>
      </div>

      <h1 className="text-3xl font-bold text-green-600 mb-6">
        QuickPay Dashboard
      </h1>

     
      <button
        onClick={() => setShowWallet(!showWallet)}
        className="underline text-blue-600 mb-3"
      >
        {showWallet ? "Hide Wallet" : "Show Wallet"}
      </button>


      {showWallet && (
        <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-xl mx-auto mb-6">
          <h3 className="text-xl font-semibold">💰 Wallet Balance</h3>
          <p className="text-3xl font-bold mt-2">₹{balance}</p>
        </div>
      )}

      
      <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-xl mx-auto mb-6">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          ➕ Add Money
        </h3>

        <input
          type="number"
          placeholder="Enter amount"
          value={addAmount}
          onChange={(e) => setAddAmount(e.target.value)}
          className="border p-2 w-full rounded mt-3"
        />

        <button
          onClick={handleAddMoney}
          className="w-full bg-blue-600 text-white py-2 rounded mt-3 hover:bg-blue-700"
        >
          Add Money
        </button>
      </div>

     
      <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-xl mx-auto">
        <h3 className="text-xl font-semibold mb-3">Send Money</h3>

        <input
          type="text"
          placeholder="Customer Name"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          className="border p-2 w-full rounded mb-3"
        />

        <input
          type="tel"
          placeholder="Mobile"
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
          className="border p-2 w-full rounded mb-3"
        />

        <input
          type="email"
          placeholder="Email (optional)"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 w-full rounded mb-3"
        />

        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="border p-2 w-full rounded mb-4"
        />

        <button
          onClick={handlePayment}
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
        >
          Send Money 
        </button>

        {message && <p className="mt-4 text-gray-600">{message}</p>}
      </div>
    </div>
  );
}*/
