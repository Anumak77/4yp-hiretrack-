import React, { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from "firebase/auth";

const IncomingCollabRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchIncomingRequests = async () => {
    if (!user) return;

    try {
      const token = await user.getIdToken();

      const response = await fetch("http://localhost:5000/api/incoming-collab-requests", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        console.log("Fetched Collaboration Requests:", data.requests);
        setRequests(data.requests);

      } else {
        console.error("Failed to fetch full request details");
      }

    } catch (error) {
      console.error(error);
      alert("Error fetching incoming requests!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchIncomingRequests();
    }
  }, [user]);

  if (loading) {
    return <p>Loading incoming requests</p>;
  }

  if (!user) {
    return <p>Please log in first</p>;
  }

  if (requests.length === 0) {
    return <p>No incoming collaboration requests</p>;
  }

  const respondToRequest = async (requestId, action) => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      const token = await user.getIdToken();

      const response = await fetch("http://localhost:5000/api/respond-collab-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          requestId: requestId,
          action: action,
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert(`Request ${action}ed successfully!`);
        fetchIncomingRequests();
      } else {
        alert("Failed to update request status!");
      }
    } catch (error) {
      console.error(error);
      alert("Error updating request status!");
    }
  };


  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">Incoming Collaboration Requests 📥</h2>
      <ul>
        {requests.map((request) => (
          <li key={request.id} className="mb-4 border p-4 rounded-xl">
            <p><strong>Requester:</strong> {request.requester_id}</p>
            <p><strong>CV ID:</strong> {request.cv_id}</p>
            <div className="flex space-x-2 mt-2">
              <button onClick={() => respondToRequest(request.id, "accept")} className="bg-green-500 text-white px-4 py-2 rounded-xl">Accept ✅</button>
              <button onClick={() => respondToRequest(request.id, "reject")} className="bg-red-500 text-white px-4 py-2 rounded-xl">Reject ❌</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default IncomingCollabRequests;
