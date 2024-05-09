// pages/index.js
"use client"
import { useState, useEffect } from "react";

const Homepage = () => {
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // const apiKey = "sk-proj-3PG4iOHZuCCV4L62UFwaT3BlbkFJ5jxNXGvlUlDcYrw0zShQ";
    const fetchData = async () => {
      setIsLoading(true);
      setError("");
      try {
        const data = {
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: "Hello, world!" }],
        };
        const response = await fetch(
          "https://api.openai.com/v1/chat/completions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify(data),
          }
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        setResponse(result.choices[0].message.content);
      } catch (e) {
        setError(`Failed to fetch: ${e.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <h1>ChatGPT Response</h1>
      {isLoading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>Error: {error}</p>
      ) : (
        <p>{response}</p>
      )}
    </div>
  );
};

export default Homepage;
