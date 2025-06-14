"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SearchCheck, ShieldCheck, AlertTriangle } from "lucide-react";
import { TopNav } from "@/components/TopNav";

type LinkResult = {
  url: string;
  status: number | string;
};

export default function HomePage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<LinkResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const ITEMS_PER_PAGE = 20;
  const paginatedResults = results.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleScan = async () => {
    if (!url) return;
    setLoading(true);
    setResults([]);
    setError(null);

    try {
      const res = await fetch(
        "https://linkguard-lite.onrender.com/check-links",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Unknown error occurred.");
      }

      setResults(data.links || []);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Unknown error occurred.");
      } else {
        setError("An unknown error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <TopNav />

      <main className="min-h-screen bg-background px-4 py-10 flex items-center justify-center">
        <div className="max-w-3xl w-full space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2">
              <span className="text-blue-600">LinkGuard Lite</span>
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Scan a webpage and check for broken links
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleScan();
            }}
            className="flex flex-col sm:flex-row gap-3 items-center justify-center"
          >
            <Input
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <Button type="submit" disabled={loading}>
              {loading ? "Scanning..." : "Scan"}
            </Button>
          </form>

          <div className="bg-muted p-5 rounded-md text-sm text-gray-700 dark:text-gray-200 animate-in fade-in duration-500 border">
            <div className="flex items-center gap-2 mb-2">
              <SearchCheck className="w-5 h-5 text-blue-600" />
              <h2 className="font-semibold">What does LinkGuard do?</h2>
            </div>
            <p className="mb-2">
              LinkGuard scans any webpage and finds all the links — then checks
              which are working or broken. It’s helpful for developers, SEO
              folks, and anyone managing a website.
            </p>
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="w-4 h-4 text-green-600" />
              <p>
                Works only for public URLs. Make sure to include{" "}
                <code>https://</code>
              </p>
            </div>
            <div className="mb-2">
              <p>Try one of these:</p>
              <ul className="list-disc ml-6 mt-2 text-blue-600">
                <li>https://vercel.com</li>
                <li>https://wikipedia.org</li>
                <li>https://w3schools.com</li>
              </ul>
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm bg-red-100 border border-red-300 rounded-md p-3 flex gap-2 items-center">
              <AlertTriangle className="w-4 h-4" />
              <span>
                <strong>Error:</strong> {error}
              </span>
            </div>
          )}

          {results.length > 0 && (
            <div className="mt-6 border rounded-md overflow-x-auto space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80%]">URL</TableHead>
                    <TableHead className="text-right pr-6">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedResults.map((link, i) => {
                    const isOk = link.status === 200;
                    return (
                      <TableRow
                        key={i}
                        className={
                          isOk
                            ? "bg-green-50 dark:bg-green-900/10"
                            : "bg-red-50 dark:bg-red-900/10"
                        }
                      >
                        <TableCell className="break-words max-w-[600px]">
                          <a
                            href={link.url}
                            className="text-blue-600 hover:underline"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {link.url}
                          </a>
                        </TableCell>
                        <TableCell
                          className={`text-right font-semibold pr-6 ${
                            isOk ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {link.status}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {results.length > ITEMS_PER_PAGE && (
                <div className="flex justify-center gap-3 mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  >
                    Prev
                  </Button>
                  <span className="text-sm text-muted-foreground pt-1">
                    Page {currentPage} of{" "}
                    {Math.ceil(results.length / ITEMS_PER_PAGE)}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={
                      currentPage >= Math.ceil(results.length / ITEMS_PER_PAGE)
                    }
                    onClick={() => setCurrentPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          )}

          <footer className="text-center text-xs text-muted-foreground mt-10">
            Made with 💙 by Akshay |{" "}
            <a
              className="underline"
              href="https://github.com/Bit-Trail/"
              target="_blank"
            >
              GitHub Repo
            </a>
          </footer>
        </div>
      </main>
    </>
  );
}
