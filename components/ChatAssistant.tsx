"use client";

import { FormEvent, useMemo, useState } from "react";

type ChatMessage = {
  role: "student" | "assistant";
  content: string;
};

const starterPrompts = [
  "What is FYEC100 about?",
  "How should I approach the reflection assignment?",
  "Can you help me make a weekly study plan?",
  "Where should I look in the LMS for course materials?"
];

export function ChatAssistant() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Hello. I can help with FYEC100 course questions, study tips, LMS guidance, and academic integrity. I cannot write full assignments or grade your work."
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const canSend = useMemo(() => input.trim().length > 0 && !isLoading, [
    input,
    isLoading
  ]);

  async function sendMessage(nextInput?: string) {
    const question = (nextInput ?? input).trim();
    if (!question) return;

    const nextMessages: ChatMessage[] = [
      ...messages,
      { role: "student", content: question }
    ];

    setMessages(nextMessages);
    setInput("");
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages })
      });

      const data = (await response.json()) as { answer?: string; error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "The assistant could not respond.");
      }

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: data.answer ?? "I could not find a helpful response."
        }
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendMessage();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-soft">
        <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
          <h2 className="font-bold text-costaatt-navy">FYEC100 Assistant</h2>
          <p className="text-sm text-slate-600">
            Responses are grounded in the local Phase 1 knowledge base.
          </p>
        </div>
        <div className="h-[520px] space-y-4 overflow-y-auto px-5 py-5">
          {messages.map((message, index) => (
            <div
              className={`flex ${
                message.role === "student" ? "justify-end" : "justify-start"
              }`}
              key={`${message.role}-${index}`}
            >
              <div
                className={`max-w-[84%] rounded-lg px-4 py-3 text-sm leading-6 ${
                  message.role === "student"
                    ? "bg-costaatt-blue text-white"
                    : "border border-slate-200 bg-slate-50 text-slate-800"
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}
          {isLoading ? (
            <div className="max-w-[84%] rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              Thinking through the FYEC100 knowledge base...
            </div>
          ) : null}
        </div>
        {error ? (
          <p className="border-t border-red-200 bg-red-50 px-5 py-3 text-sm text-red-700">
            {error}
          </p>
        ) : null}
        <form
          className="flex flex-col gap-3 border-t border-slate-200 p-4 sm:flex-row"
          onSubmit={handleSubmit}
        >
          <label className="sr-only" htmlFor="chat-input">
            Ask an FYEC100 question
          </label>
          <textarea
            className="min-h-12 flex-1 resize-none rounded-md border border-slate-300 px-4 py-3 text-sm leading-6 outline-none focus:border-costaatt-blue focus:ring-2 focus:ring-costaatt-blue/20"
            id="chat-input"
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask about course expectations, assignments, study tips, or LMS navigation..."
            rows={2}
            value={input}
          />
          <button
            className="rounded-md bg-costaatt-navy px-5 py-3 text-sm font-semibold text-white hover:bg-costaatt-blue disabled:cursor-not-allowed disabled:bg-slate-300"
            disabled={!canSend}
            type="submit"
          >
            Send
          </button>
        </form>
      </section>
      <aside className="space-y-5">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
          <h3 className="font-bold text-costaatt-navy">Try a prompt</h3>
          <div className="mt-4 space-y-2">
            {starterPrompts.map((prompt) => (
              <button
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-left text-sm leading-5 text-slate-700 hover:border-costaatt-blue hover:text-costaatt-blue"
                disabled={isLoading}
                key={prompt}
                onClick={() => void sendMessage(prompt)}
                type="button"
              >
                {prompt}
              </button>
            ))}
          </div>
        </section>
        <section className="rounded-lg border border-costaatt-gold/50 bg-yellow-50 p-5 text-sm leading-6 text-slate-700">
          <h3 className="font-bold text-costaatt-navy">Academic integrity</h3>
          <p className="mt-2">
            Use the assistant to learn, plan, and clarify. Do not submit AI
            output as your own work. Ask your lecturer when assignment
            requirements are unclear.
          </p>
        </section>
      </aside>
    </div>
  );
}
