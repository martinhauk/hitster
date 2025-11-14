import { useEffect, useState } from "react";
import { findExistingPublicFiles } from "../utility";
import { Link } from "react-router-dom";
import { Page } from "../features";

export function ConfigPage() {
  const [files, setFiles] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;

    findExistingPublicFiles([
      "1.mp3",
      "2.mp3",
      "3.mp3",
      "4.mp3",
      "5.mp3",
      "6.mp3",
      "7.mp3",
      "8.mp3",
      "9.mp3",
      "10.mp3",
      "11.mp3",
      "12.mp3",
      "13.mp3",
      "14.mp3",
      "15.mp3",
      "16.mp3",
      "17.mp3",
      "18.mp3",
      "19.mp3",
      "20.mp3",
      "21.mp3",
      "22.mp3",
      "23.mp3",
      "24.mp3",
    ])
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

  return (
    <Page>
      {files.map((filename) => (
        <Link key={filename} to={`/player/${filename}`}>
          {filename}
        </Link>
      ))}
    </Page>
  );
}
