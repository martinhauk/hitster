import { useParams } from "react-router-dom";

export function PlayerPage() {
  const { fileName } = useParams();

  return (
    <div>
      <audio src={`/${fileName}`} controls />
    </div>
  );
}
