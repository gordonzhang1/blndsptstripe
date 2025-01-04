import React, { useCallback, useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from "@stripe/react-stripe-js";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";

// Make sure to call `loadStripe` outside of a component’s render to avoid
// recreating the `Stripe` object on every render.
// This is your test secret API key.
const stripePromise = loadStripe(
  "pk_test_51QLMuwHDuUsEP7LqBrA8H9WKxcVcVSBNni7bhsGBSnTA6ra8c2E6rvStUeyprTbmjZsZMZX8cdy4F3yo8hz1SXsm00RUsZr7Bt"
);

const CheckoutForm = () => {
  const queryParams = new URLSearchParams(window.location.search);
  const quantity1 = queryParams.get("quantity1");
  const quantity2 = queryParams.get("quantity2");
  const quantity3 = queryParams.get("quantity3");

  const fetchClientSecret = useCallback(() => {
    // Create a Checkout Session

    return fetch(
      "https://blndsptbackend.onrender.com/create-checkout-session",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ quantity1, quantity2, quantity3 }), // Pass the quantity to the backend
      }
    )
      .then((res) => res.json())
      .then((data) => data.clientSecret);
  }, []);

  const options = { fetchClientSecret };

  return (
    <div id="checkout">
      <EmbeddedCheckoutProvider stripe={stripePromise} options={options}>
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  );
};

const Return = () => {
  const [status, setStatus] = useState(null);
  const [customerEmail, setCustomerEmail] = useState("");

  useEffect(() => {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const sessionId = urlParams.get("session_id");

    console.log("Session ID:", sessionId);

    fetch(`/session-status?session_id=${sessionId}`)
      .then((res) => res.json())
      .then((data) => {
        console.log("Session Status Data:", data); // Add this line for debugging
        setStatus(data.status);
        setCustomerEmail(data.customer_email);
      })
      .catch((error) => {
        console.error("Error fetching session status:", error); // Add error handling
      });
  }, []);

  if (status === "open") {
    return <Navigate to="/checkout" />;
  }

  if (status === "complete") {
    return (
      <section id="success">
        <p>
          We appreciate your business! A confirmation email will be sent to{" "}
          {customerEmail}, with your delivery information. If you have any
          questions, please email{" "}
          <a href="mailto:dkwon13579@gmail.com">dkwon13579@gmail.com</a>.
        </p>
      </section>
    );
  }

  return null;
};

const App = () => {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/checkout" element={<CheckoutForm />} />
          <Route path="/return" element={<Return />} />
        </Routes>
      </Router>
    </div>
  );
};

export default App;
