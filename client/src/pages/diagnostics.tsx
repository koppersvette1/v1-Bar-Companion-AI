import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, Loader2, RefreshCw, Database, User, Zap, Plane } from "lucide-react";

interface DiagnosticResult {
  endpoint: string;
  status: number | null;
  ok: boolean;
  message: string;
  data?: any;
}

export default function Diagnostics() {
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [running, setRunning] = useState(false);

  const endpoints = [
    { path: "/api/health", name: "Database Health", icon: Database },
    { path: "/api/auth/user", name: "Auth Session", icon: User },
    { path: "/api/recipes", name: "Recipes API", icon: Zap },
    { path: "/api/flights", name: "Flights API", icon: Plane },
  ];

  const runDiagnostics = async () => {
    setRunning(true);
    setResults([]);

    const newResults: DiagnosticResult[] = [];

    for (const endpoint of endpoints) {
      try {
        const res = await fetch(endpoint.path, { credentials: "include" });
        let data = null;
        try {
          data = await res.json();
        } catch {
          data = { raw: await res.text() };
        }

        newResults.push({
          endpoint: endpoint.path,
          status: res.status,
          ok: res.ok,
          message: res.ok ? "Success" : `Error: ${res.statusText}`,
          data: typeof data === 'object' ? data : { response: data },
        });
      } catch (err: any) {
        newResults.push({
          endpoint: endpoint.path,
          status: null,
          ok: false,
          message: `Network error: ${err.message}`,
        });
      }
    }

    setResults(newResults);
    setRunning(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white font-serif">Diagnostics</h1>
          <p className="text-slate-400">API health checks and connectivity status</p>
        </div>
        <Button 
          onClick={runDiagnostics}
          disabled={running}
          className="bg-orange-500 hover:bg-orange-600"
          data-testid="button-run-diagnostics"
        >
          {running ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Run Checks
        </Button>
      </div>

      {results.length === 0 ? (
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="py-12 text-center">
            <Database className="h-12 w-12 mx-auto text-slate-500 mb-4" />
            <p className="text-slate-400">Click "Run Checks" to test API connectivity</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {results.map((result, i) => (
            <Card 
              key={i} 
              className={`border ${result.ok ? 'bg-green-900/20 border-green-700' : 'bg-red-900/20 border-red-700'}`}
              data-testid={`diagnostic-${result.endpoint.replace(/\//g, '-')}`}
            >
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  {result.ok ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  <span className="text-white">{result.endpoint}</span>
                  <span className={`ml-auto text-sm px-2 py-1 rounded ${result.ok ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                    {result.status ?? 'N/A'}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-400 text-sm mb-2">{result.message}</p>
                {result.data && (
                  <pre className="bg-slate-900 rounded p-3 text-xs text-slate-300 overflow-x-auto max-h-40">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="py-4">
          <p className="text-sm text-slate-500">
            Note: 401 responses on /api/auth/user are expected when not logged in. 
            This diagnostics page is for development use only.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
