import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Play, Copy, Check, AlertTriangle, CheckCircle, XCircle, Database } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

interface DiagnosticResult {
  endpoint: string;
  method: string;
  status: number | null;
  ok: boolean;
  responseTime: number;
  response: any;
  error?: string;
}

const DIAGNOSTIC_ENDPOINTS: Array<{
  endpoint: string;
  method: "GET" | "POST";
  body?: any;
  label: string;
}> = [
  { endpoint: "/api/health", method: "GET", label: "Health Check" },
  { endpoint: "/api/auth/session", method: "GET", label: "Auth Session" },
  { endpoint: "/api/public/recipes", method: "GET", label: "Public Recipes" },
  { endpoint: "/api/public/woods", method: "GET", label: "Public Woods" },
  { endpoint: "/api/public/garnishes", method: "GET", label: "Public Garnishes" },
  { endpoint: "/api/people", method: "GET", label: "People (Auth Required)" },
  { endpoint: "/api/favorites", method: "GET", label: "Favorites (Auth Required)" },
  { endpoint: "/api/flights", method: "GET", label: "Flights (Auth Required)" },
  { endpoint: "/api/woods", method: "GET", label: "Woods (Auth Required)" },
  { endpoint: "/api/garnishes", method: "GET", label: "Garnishes (Auth Required)" },
  { 
    endpoint: "/api/generation/batch", 
    method: "POST", 
    body: { includeKidFriendly: false },
    label: "Generation API" 
  },
];

async function runDiagnostic(
  endpoint: string, 
  method: "GET" | "POST", 
  body?: any
): Promise<DiagnosticResult> {
  const startTime = performance.now();
  
  try {
    const response = await fetch(endpoint, {
      method,
      headers: method === "POST" ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      credentials: "include",
    });
    
    const responseTime = Math.round(performance.now() - startTime);
    let responseData: any;
    
    try {
      responseData = await response.json();
    } catch {
      responseData = { _raw: "Non-JSON response" };
    }
    
    return {
      endpoint,
      method,
      status: response.status,
      ok: response.ok,
      responseTime,
      response: responseData,
    };
  } catch (error: any) {
    return {
      endpoint,
      method,
      status: null,
      ok: false,
      responseTime: Math.round(performance.now() - startTime),
      response: null,
      error: error.message || "Network error",
    };
  }
}

function ResultCard({ result }: { result: DiagnosticResult }) {
  const [expanded, setExpanded] = useState(false);
  
  const getStatusColor = () => {
    if (result.error || result.status === null) return "bg-red-600";
    if (result.ok) return "bg-green-600";
    if (result.status === 401 || result.status === 403) return "bg-amber-600";
    return "bg-red-600";
  };
  
  const getStatusIcon = () => {
    if (result.error || result.status === null) return <XCircle className="h-4 w-4" />;
    if (result.ok) return <CheckCircle className="h-4 w-4" />;
    if (result.status === 401 || result.status === 403) return <AlertTriangle className="h-4 w-4" />;
    return <XCircle className="h-4 w-4" />;
  };
  
  return (
    <Card 
      className={`bg-slate-800/50 border-slate-700 cursor-pointer transition-all hover:border-slate-600`}
      onClick={() => setExpanded(!expanded)}
      data-testid={`result-${result.endpoint.replace(/\//g, "-")}`}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge className={`${getStatusColor()} text-white`}>
              {result.method}
            </Badge>
            <span className="font-mono text-sm text-slate-300">{result.endpoint}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500">{result.responseTime}ms</span>
            <Badge 
              variant="outline" 
              className={`flex items-center gap-1 ${
                result.ok ? "border-green-600 text-green-400" : 
                (result.status === 401 || result.status === 403) ? "border-amber-600 text-amber-400" :
                "border-red-600 text-red-400"
              }`}
            >
              {getStatusIcon()}
              {result.status || "ERR"}
            </Badge>
          </div>
        </div>
        
        {expanded && (
          <div className="mt-4 pt-4 border-t border-slate-700">
            {result.error && (
              <div className="text-red-400 text-sm mb-2">
                Error: {result.error}
              </div>
            )}
            <ScrollArea className="h-48">
              <pre className="text-xs text-slate-400 font-mono whitespace-pre-wrap">
                {JSON.stringify(result.response, null, 2)}
              </pre>
            </ScrollArea>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function Diagnostics() {
  const { user, isLoading: authLoading } = useAuth();
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [running, setRunning] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const isDevelopment = import.meta.env.DEV;
  const diagnosticsEnabled = import.meta.env.VITE_DIAGNOSTICS_ENABLED === "true";
  
  const canAccess = isDevelopment || diagnosticsEnabled || user;
  
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }
  
  if (!canAccess) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-serif font-bold text-white">Diagnostics</h1>
        <Card className="bg-red-900/20 border-red-700">
          <CardContent className="py-6">
            <p className="text-red-400 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Access denied. Please log in or enable diagnostics via environment variable.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const runAllDiagnostics = async () => {
    setRunning(true);
    setResults([]);
    
    const newResults: DiagnosticResult[] = [];
    
    for (const config of DIAGNOSTIC_ENDPOINTS) {
      const result = await runDiagnostic(config.endpoint, config.method, config.body);
      newResults.push(result);
      setResults([...newResults]);
    }
    
    setRunning(false);
  };
  
  const copyResults = async () => {
    const text = results.map(r => {
      return `## ${r.method} ${r.endpoint}\n` +
        `Status: ${r.status || "ERROR"} (${r.responseTime}ms)\n` +
        `Response:\n\`\`\`json\n${JSON.stringify(r.response, null, 2)}\n\`\`\`\n` +
        (r.error ? `Error: ${r.error}\n` : "");
    }).join("\n---\n\n");
    
    const header = `# BarBuddy Diagnostics Report\n` +
      `Generated: ${new Date().toISOString()}\n` +
      `Environment: ${isDevelopment ? "development" : "production"}\n` +
      `User: ${user ? "Logged in" : "Guest"}\n\n---\n\n`;
    
    await navigator.clipboard.writeText(header + text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const successCount = results.filter(r => r.ok).length;
  const authFailCount = results.filter(r => r.status === 401 || r.status === 403).length;
  const errorCount = results.filter(r => !r.ok && r.status !== 401 && r.status !== 403).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-serif font-bold text-white flex items-center gap-3">
          Diagnostics
        </h1>
        <p className="text-slate-400 mt-2">
          Test all API endpoints and view detailed responses.
        </p>
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">API Diagnostics</CardTitle>
          <CardDescription className="text-slate-400">
            Run tests against {DIAGNOSTIC_ENDPOINTS.length} endpoints to verify system health.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Button 
              onClick={runAllDiagnostics}
              disabled={running}
              className="bg-orange-500 hover:bg-orange-600 text-white"
              data-testid="button-run-diagnostics"
            >
              {running ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Run Diagnostics
                </>
              )}
            </Button>
            
            {results.length > 0 && (
              <Button 
                variant="outline"
                onClick={copyResults}
                className="border-slate-700 text-slate-300"
                data-testid="button-copy-results"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Results
                  </>
                )}
              </Button>
            )}
          </div>
          
          {results.length > 0 && (
            <div className="flex items-center gap-4 text-sm">
              <Badge className="bg-green-600/20 text-green-400 border-green-600/30">
                {successCount} Passed
              </Badge>
              {authFailCount > 0 && (
                <Badge className="bg-amber-600/20 text-amber-400 border-amber-600/30">
                  {authFailCount} Auth Required
                </Badge>
              )}
              {errorCount > 0 && (
                <Badge className="bg-red-600/20 text-red-400 border-red-600/30">
                  {errorCount} Failed
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {results.length === 0 && !running && (
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="py-12 text-center">
            <Database className="h-12 w-12 mx-auto text-slate-500 mb-4" />
            <p className="text-slate-400">Click "Run Diagnostics" to test API connectivity</p>
          </CardContent>
        </Card>
      )}

      {results.length > 0 && (
        <div className="space-y-3">
          {results.map((result, idx) => (
            <ResultCard key={idx} result={result} />
          ))}
        </div>
      )}
      
      {running && results.length < DIAGNOSTIC_ENDPOINTS.length && (
        <Card className="bg-slate-800/30 border-slate-700">
          <CardContent className="py-4">
            <div className="flex items-center gap-3 text-slate-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              Testing endpoint {results.length + 1} of {DIAGNOSTIC_ENDPOINTS.length}...
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="py-4">
          <p className="text-sm text-slate-500">
            Note: 401 responses on auth-protected endpoints are expected when not logged in.
            Click any result card to expand and view the full response JSON.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
