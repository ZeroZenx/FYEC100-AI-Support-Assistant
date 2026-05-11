"use client";

import { FormEvent, useMemo, useState } from "react";

type ChatMessage = {
  feedbackStatus?: "idle" | "sending" | "sent";
  role: "student" | "assistant";
  content: string;
};

type FeedbackRating = "helpful" | "not-helpful" | "lecturer-follow-up";

const starterPrompts = [
  "What is FYEC100 about?",
  "How should I approach the reflection assignment?",
  "Can you help me make a weekly study plan?",
  "Where should I look in the LMS for course materials?"
];

type ChatAssistantProps = {
  embedded?: boolean;
};

export function ChatAssistant({ embedded = false }: ChatAssistantProps) {
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
  const [feedbackNote, setFeedbackNote] = useState("");
  const [showUseNotice, setShowUseNotice] = useState(true);

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
          content: data.answer ?? "I could not find a helpful response.",
          feedbackStatus: "idle"
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

  async function sendFeedback(index: number, rating: FeedbackRating) {
    const message = messages[index];
    const previousQuestion = [...messages]
      .slice(0, index)
      .reverse()
      .find((item) => item.role === "student");

    if (!message || !previousQuestion) return;

    setMessages((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, feedbackStatus: "sending" } : item
      )
    );
    setError("");

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assistantResponse: message.content,
          mode: embedded ? "embedded" : "standalone",
          note: feedbackNote.trim() || undefined,
          rating,
          studentQuestion: previousQuestion.content
        })
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Feedback could not be saved.");
      }

      setMessages((current) =>
        current.map((item, itemIndex) =>
          itemIndex === index ? { ...item, feedbackStatus: "sent" } : item
        )
      );
      setFeedbackNote("");
    } catch (err) {
      setMessages((current) =>
        current.map((item, itemIndex) =>
          itemIndex === index ? { ...item, feedbackStatus: "idle" } : item
        )
      );
      setError(err instanceof Error ? err.message : "Feedback could not be saved.");
    }
  }

  return (
    <div className={embedded ? "grid gap-5" : "grid gap-6 lg:grid-cols-[1fr_320px]"}>
      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-soft">
        <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
          <h2 className="font-bold text-costaatt-navy">FYEC100 Assistant</h2>
          <p className="text-sm text-slate-600">
            Responses are grounded in the local Phase 1 knowledge base.
          </p>
        </div>
        {showUseNotice ? (
          <div className="border-b border-costaatt-gold/40 bg-yellow-50 px-5 py-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="text-sm font-bold text-costaatt-navy">
                  Responsible use notice
                </h3>
                <p className="mt-1 text-sm leading-6 text-slate-700">
                  This assistant supports learning but does not grade work,
                  replace your lecturer, or write full assignments. Do not enter
                  sensitive personal information, and do not submit AI output as
                  your own work.
                </p>
              </div>
              <button
                className="w-fit rounded-md border border-costaatt-gold/60 px-3 py-2 text-xs font-semibold text-costaatt-navy hover:bg-white"
                onClick={() => setShowUseNotice(false)}
                type="button"
              >
                Dismiss
              </button>
            </div>
          </div>
        ) : null}
        <div className="h-[520px] space-y-4 overflow-y-auto px-5 py-5">
          {messages.map((message, index) => (
            <div
              className={`flex ${
                message.role === "student" ? "justify-end" : "justify-start"
              }`}
              key={`${message.role}-${index}`}
            >
              <div className="max-w-[84%]">
                <div
                  className={`rounded-lg px-4 py-3 text-sm leading-6 ${
                    message.role === "student"
                      ? "bg-costaatt-blue text-white"
                      : "border border-slate-200 bg-slate-50 text-slate-800"
                  }`}
                >
                  {message.content}
                </div>
                {message.role === "assistant" && index > 0 ? (
                  <FeedbackPanel
                    disabled={message.feedbackStatus === "sending"}
                    note={feedbackNote}
                    onNoteChange={setFeedbackNote}
                    onSubmit={(rating) => void sendFeedback(index, rating)}
                    status={message.feedbackStatus ?? "idle"}
                  />
                ) : null}
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
      <aside className={embedded ? "grid gap-5 md:grid-cols-2" : "space-y-5"}>
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

function FeedbackPanel({
  disabled,
  note,
  onNoteChange,
  onSubmit,
  status
}: {
  disabled: boolean;
  note: string;
  onNoteChange: (value: string) => void;
  onSubmit: (rating: FeedbackRating) => void;
  status: "idle" | "sending" | "sent";
}) {
  if (status === "sent") {
    return (
      <p className="mt-2 text-xs font-medium text-emerald-700">
        Feedback saved for the pilot review.
      </p>
    );
  }

  return (
    <div className="mt-2 rounded-md border border-slate-200 bg-white p-3">
      <p className="text-xs font-semibold text-slate-700">
        Was this response useful?
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        <button
          className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-emerald-500 hover:text-emerald-700 disabled:opacity-60"
          disabled={disabled}
          onClick={() => onSubmit("helpful")}
          type="button"
        >
          Helpful
        </button>
        <button
          className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-red-500 hover:text-red-700 disabled:opacity-60"
          disabled={disabled}
          onClick={() => onSubmit("not-helpful")}
          type="button"
        >
          Not helpful
        </button>
        <button
          className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-amber-500 hover:text-amber-700 disabled:opacity-60"
          disabled={disabled}
          onClick={() => onSubmit("lecturer-follow-up")}
          type="button"
        >
          Needs lecturer follow-up
        </button>
      </div>
      <label className="mt-3 block text-xs font-semibold text-slate-700">
        Optional note
        <textarea
          className="mt-1 min-h-16 w-full resize-none rounded-md border border-slate-300 px-3 py-2 text-xs leading-5 outline-none focus:border-costaatt-blue focus:ring-2 focus:ring-costaatt-blue/20"
          onChange={(event) => onNoteChange(event.target.value)}
          placeholder="What was missing or confusing?"
          value={note}
        />
      </label>
    </div>
  );
}
