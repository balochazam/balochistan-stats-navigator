import { FormEvent, KeyboardEvent, type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import {
  BarChart3,
  Database,
  Download,
  Eraser,
  Loader2,
  Maximize2,
  MessageSquareText,
  Minimize2,
  Send,
  Sparkles,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  analyticsApi,
  type ChatCitation,
} from "@/lib/analyticsApi";
import { cn } from "@/lib/utils";

interface AnalyticsChatDrawerProps {
  ownerId?: string;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: ChatCitation[];
}

const EXAMPLE_PROMPTS = [
  "Compare irrigated and unirrigated wheat area by year",
  "Which districts reported the highest wheat production?",
  "Show the trend in cultivated land across available forms",
];

const CHART_PATTERN = /!\[([^\]]*)\]\(\/charts\/([0-9a-f-]+)\)/gi;

function inlineMarkdown(value: string): ReactNode[] {
  const tokens = value.split(/(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*|\[[^\]]+\]\([^\s)]+\))/g);
  return tokens.filter(Boolean).map((token, index) => {
    if (token.startsWith("**") && token.endsWith("**")) {
      return <strong key={index}>{token.slice(2, -2)}</strong>;
    }
    if (token.startsWith("`") && token.endsWith("`")) {
      return <code key={index} className="rounded bg-slate-100 px-1 py-0.5 font-mono text-[0.85em] text-slate-800">{token.slice(1, -1)}</code>;
    }
    if (token.startsWith("*") && token.endsWith("*")) {
      return <em key={index}>{token.slice(1, -1)}</em>;
    }
    const link = token.match(/^\[([^\]]+)\]\(([^\s)]+)\)$/);
    if (link) {
      return <a key={index} href={link[2]} target="_blank" rel="noreferrer" className="text-blue-700 underline underline-offset-2">{link[1]}</a>;
    }
    return <span key={index}>{token}</span>;
  });
}

function tableCells(line: string): string[] {
  return line.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((cell) => cell.trim());
}

function isTableDivider(line: string): boolean {
  return /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(line);
}

function downloadCsv(fileName: string, rows: string[][]) {
  const csv = rows
    .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(","))
    .join("\r\n");
  const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

function DownloadCsvButton({ rows }: { rows: string[][] }) {
  return (
    <button
      type="button"
      onClick={() => downloadCsv("analytics-table.csv", rows)}
      className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
      title="Download table as CSV"
    >
      <Download className="h-3.5 w-3.5" />Download CSV
    </button>
  );
}

interface HtmlTableCell {
  text: string;
  colSpan: number;
  rowSpan: number;
  align: "left" | "center" | "right";
  header: boolean;
}

function expandHtmlTableForCsv(rows: HtmlTableCell[][]): string[][] {
  const grid: Array<Array<string | undefined>> = [];
  rows.forEach((row, rowIndex) => {
    grid[rowIndex] ||= [];
    let columnIndex = 0;
    row.forEach((cell) => {
      while (grid[rowIndex][columnIndex] !== undefined) columnIndex += 1;
      for (let rowOffset = 0; rowOffset < cell.rowSpan; rowOffset += 1) {
        grid[rowIndex + rowOffset] ||= [];
        for (let columnOffset = 0; columnOffset < cell.colSpan; columnOffset += 1) {
          grid[rowIndex + rowOffset][columnIndex + columnOffset] = rowOffset === 0 && columnOffset === 0
            ? cell.text
            : "";
        }
      }
      columnIndex += cell.colSpan;
    });
  });
  const width = Math.max(0, ...grid.map((row) => row.length));
  return grid.map((row) => Array.from({ length: width }, (_, index) => row[index] || ""));
}

function HtmlTable({ html }: { html: string }) {
  const rows = useMemo(() => {
    const document = new DOMParser().parseFromString(html, "text/html");
    return Array.from(document.querySelectorAll("table tr")).map((row) =>
      Array.from(row.querySelectorAll(":scope > th, :scope > td")).map((cell): HtmlTableCell => {
        cell.querySelectorAll("br").forEach((breakElement) => breakElement.replaceWith("\n"));
        const alignment = cell.getAttribute("align");
        return {
          text: cell.textContent?.replace(/\s+\n\s+/g, "\n").trim() || "",
          colSpan: Math.max(1, Number(cell.getAttribute("colspan")) || 1),
          rowSpan: Math.max(1, Number(cell.getAttribute("rowspan")) || 1),
          align: alignment === "right" || alignment === "center" ? alignment : "left",
          header: cell.tagName.toLowerCase() === "th",
        };
      }),
    );
  }, [html]);
  const csvRows = useMemo(() => expandHtmlTableForCsv(rows), [rows]);

  return (
    <div className="my-3 overflow-x-auto rounded-lg border border-slate-200">
      <div className="flex justify-end border-b bg-slate-50 px-2 py-1.5">
        <DownloadCsvButton rows={csvRows} />
      </div>
      <table className="min-w-full border-collapse text-left text-xs">
        <tbody className="divide-y divide-slate-100 bg-white">
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className={row.some((cell) => cell.header) ? "bg-slate-100 text-slate-700" : "text-slate-600"}>
              {row.map((cell, cellIndex) => {
                const Cell = cell.header ? "th" : "td";
                const alignmentClass = cell.align === "right" ? "text-right" : cell.align === "center" ? "text-center" : "text-left";
                return <Cell key={cellIndex} colSpan={cell.colSpan} rowSpan={cell.rowSpan} className={`whitespace-pre-line border-r border-slate-100 px-3 py-2 align-middle last:border-r-0 ${alignmentClass} ${cell.header ? "font-semibold" : ""}`}>{inlineMarkdown(cell.text)}</Cell>;
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MarkdownText({ content }: { content: string }) {
  const lines = content.split("\n");
  const blocks: ReactNode[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    if (!line.trim()) {
      index += 1;
      continue;
    }
    if (line.trimStart().startsWith("<table")) {
      const tableLines: string[] = [];
      while (index < lines.length) {
        tableLines.push(lines[index]);
        if (lines[index].toLowerCase().includes("</table>")) {
          index += 1;
          break;
        }
        index += 1;
      }
      blocks.push(<HtmlTable key={`html-table-${index}`} html={tableLines.join("\n")} />);
      continue;
    }
    if (index + 1 < lines.length && line.includes("|") && isTableDivider(lines[index + 1])) {
      const headers = tableCells(line);
      const rows: string[][] = [];
      index += 2;
      while (index < lines.length && lines[index].trim().includes("|")) {
        rows.push(tableCells(lines[index]));
        index += 1;
      }
      blocks.push(
        <div key={`table-${index}`} className="my-3 overflow-x-auto rounded-lg border border-slate-200">
          <div className="flex justify-end border-b bg-slate-50 px-2 py-1.5">
            <DownloadCsvButton rows={[headers, ...rows]} />
          </div>
          <table className="min-w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700">
              <tr>{headers.map((header, column) => <th key={column} className="whitespace-nowrap px-3 py-2 font-semibold">{inlineMarkdown(header)}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {rows.map((row, rowIndex) => <tr key={rowIndex}>{headers.map((_, column) => <td key={column} className="whitespace-nowrap px-3 py-2 text-slate-600">{inlineMarkdown(row[column] || "")}</td>)}</tr>)}
            </tbody>
          </table>
        </div>,
      );
      continue;
    }
    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      const Heading = heading[1].length === 1 ? "h3" : heading[1].length === 2 ? "h4" : "h5";
      blocks.push(<Heading key={`heading-${index}`} className="mt-3 font-semibold text-slate-900">{inlineMarkdown(heading[2])}</Heading>);
      index += 1;
      continue;
    }
    const listItems: string[] = [];
    const ordered = /^\s*\d+\.\s+/.test(line);
    while (index < lines.length && (ordered ? /^\s*\d+\.\s+/.test(lines[index]) : /^\s*[-*]\s+/.test(lines[index]))) {
      listItems.push(lines[index].replace(ordered ? /^\s*\d+\.\s+/ : /^\s*[-*]\s+/, ""));
      index += 1;
    }
    if (listItems.length) {
      const List = ordered ? "ol" : "ul";
      blocks.push(<List key={`list-${index}`} className={ordered ? "my-2 list-decimal space-y-1 pl-5" : "my-2 list-disc space-y-1 pl-5"}>{listItems.map((item, itemIndex) => <li key={itemIndex}>{inlineMarkdown(item)}</li>)}</List>);
      continue;
    }
    const paragraph: string[] = [];
    while (index < lines.length && lines[index].trim() && !(lines[index].includes("|") && isTableDivider(lines[index + 1] || "")) && !/^(#{1,3})\s+/.test(lines[index]) && !/^\s*[-*]\s+/.test(lines[index]) && !/^\s*\d+\.\s+/.test(lines[index])) {
      paragraph.push(lines[index]);
      index += 1;
    }
    blocks.push(<p key={`paragraph-${index}`} className="mb-2 last:mb-0">{inlineMarkdown(paragraph.join(" "))}</p>);
  }
  return <>{blocks}</>;
}

function AnalyticsChart({ ownerId, chartId, alt }: { ownerId: string; chartId: string; alt: string }) {
  const [url, setUrl] = useState<string>();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let objectUrl: string | undefined;
    let active = true;
    analyticsApi
      .getChart(ownerId, chartId)
      .then((blob) => {
        if (!active) return;
        objectUrl = URL.createObjectURL(blob);
        setUrl(objectUrl);
      })
      .catch(() => active && setFailed(true));
    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [chartId, ownerId]);

  if (failed) {
    return <div className="mt-3 rounded-lg border bg-slate-50 p-3 text-xs text-slate-500">Chart preview is unavailable.</div>;
  }
  if (!url) {
    return <div className="mt-3 flex h-36 items-center justify-center rounded-lg border bg-slate-50"><Loader2 className="h-5 w-5 animate-spin text-blue-600" /></div>;
  }
  return (
    <div className="mt-3">
      <div className="mb-1.5 flex justify-end">
        <a
          href={url}
          download={`${(alt || "analytics-chart").replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase() || "analytics-chart"}.png`}
          className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
          title="Download chart as PNG"
        >
          <Download className="h-3.5 w-3.5" />Download PNG
        </a>
      </div>
      <img src={url} alt={alt || "Analytics chart"} className="w-full rounded-lg border bg-white" />
    </div>
  );
}

function AssistantContent({ content, ownerId }: { content: string; ownerId: string }) {
  const parts = useMemo(() => {
    const result: Array<{ kind: "text" | "chart"; value: string; chartId?: string }> = [];
    let cursor = 0;
    const pattern = new RegExp(CHART_PATTERN.source, "gi");
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(content)) !== null) {
      const index = match.index ?? 0;
      if (index > cursor) result.push({ kind: "text", value: content.slice(cursor, index) });
      result.push({ kind: "chart", value: match[1], chartId: match[2] });
      cursor = index + match[0].length;
    }
    if (cursor < content.length) result.push({ kind: "text", value: content.slice(cursor) });
    return result;
  }, [content]);

  return (
    <>
      {parts.map((part, index) =>
        part.kind === "chart" && part.chartId ? (
          <AnalyticsChart key={`${part.chartId}-${index}`} ownerId={ownerId} chartId={part.chartId} alt={part.value} />
        ) : (
          <div key={index} className="break-words leading-6"><MarkdownText content={part.value} /></div>
        ),
      )}
    </>
  );
}

export function AnalyticsChatDrawer({ ownerId }: AnalyticsChatDrawerProps) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [threadId, setThreadId] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Prototype behavior: a browser refresh always starts a fresh visual chat.
    // Server-side history remains available and is not deleted.
    if (ownerId) window.localStorage.removeItem(`analytics-chat-thread:${ownerId}`);
  }, [ownerId]);

  useEffect(() => {
    if (!open) return;
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, open]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const clearCurrentChat = () => {
    setMessages([]);
    setThreadId(undefined);
    setInput("");
    setError(undefined);
  };

  const sendMessage = async (messageText = input) => {
    const message = messageText.trim();
    if (!message || loading || !ownerId) return;

    const userMessage: ChatMessage = {
      id: `local-${Date.now()}`,
      role: "user",
      content: message,
    };
    setMessages((current) => [...current, userMessage]);
    setInput("");
    setError(undefined);
    setLoading(true);

    try {
      const response = await analyticsApi.sendMessage(ownerId, message, threadId);
      setThreadId(response.thread_id);
      setMessages((current) => [
        ...current,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: response.answer,
          citations: response.citations,
        },
      ]);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "The analytics assistant could not respond.");
    } finally {
      setLoading(false);
    }
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    void sendMessage();
  };

  const handleInputKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void sendMessage();
    }
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group fixed bottom-6 right-6 z-40 flex h-14 items-center gap-2 rounded-full bg-blue-600 px-4 text-white shadow-xl shadow-blue-600/25 transition hover:-translate-y-0.5 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200"
        aria-label="Open analytics assistant"
      >
        <MessageSquareText className="h-6 w-6" />
        <span className="hidden font-semibold sm:inline">Ask data</span>
        <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-400" />
      </button>
    );
  }

  return (
    <section
      role="dialog"
      aria-label="BBoS analytics assistant"
      className={cn(
        "fixed z-50 flex overflow-hidden border border-slate-200 bg-white shadow-2xl transition-all duration-200",
        expanded
          ? "inset-3 rounded-2xl sm:inset-6 lg:left-[17.5rem]"
          : "inset-x-3 bottom-3 top-16 rounded-2xl sm:left-auto sm:right-5 sm:top-auto sm:h-[min(680px,calc(100vh-2.5rem))] sm:w-[430px]",
      )}
    >
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between bg-gradient-to-r from-blue-700 to-blue-600 px-4 py-3 text-white">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/15 ring-1 ring-white/20">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h2 className="truncate font-semibold">BBoS Data Assistant</h2>
              <p className="flex items-center gap-1.5 text-xs text-blue-100"><span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />Ask across your forms and reports</p>
            </div>
          </div>
          <div className="ml-2 flex items-center">
            <Button variant="ghost" size="icon" onClick={clearCurrentChat} title="Clear current chat" className="text-white hover:bg-white/15 hover:text-white">
              <Eraser className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setExpanded((value) => !value)} title={expanded ? "Compact view" : "Expand view"} className="text-white hover:bg-white/15 hover:text-white">
              {expanded ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setOpen(false)} title="Close chat" className="text-white hover:bg-white/15 hover:text-white">
              <X className="h-5 w-5" />
            </Button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto bg-slate-50/80 px-4 py-5">
          {messages.length === 0 ? (
            <div className="mx-auto flex h-full max-w-lg flex-col items-center justify-center text-center">
              <div className="mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-blue-100 text-blue-700"><BarChart3 className="h-8 w-8" /></div>
              <h3 className="text-xl font-semibold text-slate-900">What would you like to know?</h3>
              <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">I can find your forms, analyze their fields, compare reported data, and create charts.</p>
              <div className="mt-6 grid w-full gap-2">
                {EXAMPLE_PROMPTS.map((prompt) => (
                  <button key={prompt} type="button" onClick={() => void sendMessage(prompt)} className="rounded-xl border bg-white px-4 py-3 text-left text-sm text-slate-700 shadow-sm transition hover:border-blue-300 hover:bg-blue-50">
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className={cn("mx-auto space-y-5", expanded ? "max-w-4xl" : "max-w-full")}>
              {messages.map((message) => (
                <div key={message.id} className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}>
                  <div className={cn("max-w-[88%]", expanded && "sm:max-w-[75%]")}>
                    <div className={cn("rounded-2xl px-4 py-3 text-sm shadow-sm", message.role === "user" ? "rounded-br-md bg-blue-600 text-white" : "rounded-bl-md border bg-white text-slate-700")}>
                      {message.role === "assistant" ? <AssistantContent content={message.content} ownerId={ownerId!} /> : <div className="whitespace-pre-wrap break-words leading-6">{message.content}</div>}
                    </div>
                    {message.role === "assistant" && message.citations && message.citations.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {message.citations.map((citation, index) => (
                          <span key={`${citation.dataset_id || citation.dataset_name}-${index}`} className="inline-flex items-center gap-1 rounded-full border bg-white px-2 py-1 text-[11px] text-slate-500" title={citation.dataset_name || "Analytics dataset"}>
                            <Database className="h-3 w-3" />{citation.marker || citation.dataset_name || `Source ${index + 1}`}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-2 rounded-2xl rounded-bl-md border bg-white px-4 py-3 text-sm text-slate-500 shadow-sm"><Loader2 className="h-4 w-4 animate-spin text-blue-600" />Thinking…</div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        <footer className="border-t bg-white p-3 sm:p-4">
          {error && <div className="mb-3 flex items-start justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700"><span>{error}</span><button type="button" onClick={() => setError(undefined)} aria-label="Dismiss error"><X className="h-4 w-4" /></button></div>}
          {!ownerId && <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">Your user profile is still loading. Please try again shortly.</div>}
          <form onSubmit={submit} className={cn("mx-auto", expanded && "max-w-4xl")}>
            <div className="flex items-end gap-2 rounded-xl border bg-slate-50 p-2 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100">
              <Textarea ref={inputRef} value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={handleInputKeyDown} placeholder="Ask about your collected data…" rows={1} disabled={loading || !ownerId} className="max-h-32 min-h-[42px] resize-none border-0 bg-transparent px-2 py-2 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0" />
              <Button type="submit" size="icon" disabled={!input.trim() || loading || !ownerId} className="h-10 w-10 shrink-0 rounded-lg bg-blue-600 hover:bg-blue-700" aria-label="Send message"><Send className="h-4 w-4" /></Button>
            </div>
            <p className="mt-2 text-center text-[11px] text-slate-400">Enter to send · Shift + Enter for a new line</p>
          </form>
        </footer>
      </div>
    </section>
  );
}
