const analyticsBaseUrl = (
  import.meta.env.VITE_ANALYTICS_API_URL || "http://127.0.0.1:8001"
).replace(/\/$/, "");

export interface ChatCitation {
  marker?: string;
  dataset_id?: string;
  dataset_name?: string;
  version?: number | string;
  source_forms?: string[];
}

export interface ChatToolCall {
  name: string;
  args?: Record<string, unknown>;
  ok?: boolean;
  error?: string | null;
}

export interface AnalyticsChatResponse {
  answer: string;
  thread_id: string;
  citations: ChatCitation[];
  tool_calls: ChatToolCall[];
  usage: Record<string, number>;
}

export interface AnalyticsHistoryMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: ChatCitation[];
  tool_calls?: ChatToolCall[];
  created_at: string;
}

async function analyticsRequest<T>(
  path: string,
  ownerId: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(`${analyticsBaseUrl}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "X-Owner-Id": ownerId,
      ...init?.headers,
    },
  });

  if (!response.ok) {
    let message = `Analytics request failed (${response.status})`;
    try {
      const body = await response.json();
      message = body.detail || body.message || message;
    } catch {
      // Preserve the status-based message for non-JSON errors.
    }
    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

export const analyticsApi = {
  sendMessage(ownerId: string, message: string, threadId?: string) {
    return analyticsRequest<AnalyticsChatResponse>("/chat", ownerId, {
      method: "POST",
      body: JSON.stringify({ message, thread_id: threadId || null }),
    });
  },

  getHistory(ownerId: string, threadId: string) {
    return analyticsRequest<AnalyticsHistoryMessage[]>(
      `/chat/threads/${encodeURIComponent(threadId)}/messages`,
      ownerId,
    );
  },

  async getChart(ownerId: string, chartId: string): Promise<Blob> {
    const response = await fetch(
      `${analyticsBaseUrl}/charts/${encodeURIComponent(chartId)}`,
      { headers: { "X-Owner-Id": ownerId } },
    );
    if (!response.ok) throw new Error("Chart could not be loaded");
    return response.blob();
  },
};
