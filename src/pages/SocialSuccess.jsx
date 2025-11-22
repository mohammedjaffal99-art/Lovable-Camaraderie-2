import { useSearchParams } from "react-router-dom";

export default function SocialSuccess() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");

  return (
    <div style={{ padding: 40, textAlign: "center" }}>
      <h1>🎉 Social Links Unlocked</h1>
      <p>Your purchase was successful.</p>
      <p>Session: {sessionId}</p>
    </div>
  );
}