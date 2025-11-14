import { useEffect, useState } from "react";
import { findExistingPublicFiles } from "../utility";
import { Link } from "react-router-dom";

export function ConfigPage() {
  const [files, setFiles] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;

    findExistingPublicFiles(["1.mp3", "2.mp3", "3.mp3"])
      .then((resolvedFiles) => {
        if (!cancelled) {
          setFiles(resolvedFiles);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setFiles([]);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return files.map((filename) => (
    <div key={filename}>
      <Link to={`/player/${filename}`}>{filename}</Link>
    </div>
  ));
}
