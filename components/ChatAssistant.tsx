"use client";

import {
  FormEvent,
  KeyboardEvent,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import type { MoodleLaunchContext } from "@/lib/moodleContext";
import { getRoleGuidance } from "@/lib/moodleRoleGuidance";

type ChatMessage = {
  feedbackStatus?: "idle" | "sending" | "sent";
  role: "student" | "assistant";
  content: string;
};

type FeedbackRating =
  | "academic-integrity-concern"
  | "helpful"
  | "lecturer-follow-up"
  | "lms-navigation-issue"
  | "missing-course-information"
  | "not-helpful"
  | "technical-issue";

const feedbackOptions: Array<{
  label: string;
  value: FeedbackRating;
}> = [
  { label: "Helpful", value: "helpful" },
  { label: "Not helpful", value: "not-helpful" },
  { label: "LMS/navigation issue", value: "lms-navigation-issue" },
  {
    label: "Missing course information",
    value: "missing-course-information"
  },
  {
    label: "Academic integrity concern",
    value: "academic-integrity-concern"
  },
  { label: "Technical issue", value: "technical-issue" },
  { label: "Lecturer follow-up needed", value: "lecturer-follow-up" }
];

const defaultStarterPrompts = [
  "What is FYEC100 about?",
  "How should I approach the reflection assignment?",
  "Can you help me make a weekly study plan?",
  "Where should I look in the LMS for course materials?"
];

type ChatAssistantProps = {
  embedded?: boolean;
  launchContext?: MoodleLaunchContext;
};

export function ChatAssistant({
  embedded = false,
  launchContext
}: ChatAssistantProps) {
  const roleGuidance = getRoleGuidance(launchContext?.role);
  const starterPrompts = launchContext
    ? roleGuidance.starterPrompts
    : defaultStarterPrompts;
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: roleGuidance.assistantIntro
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [feedbackCategory, setFeedbackCategory] =
    useState<FeedbackRating>("helpful");
  const [feedbackNote, setFeedbackNote] = useState("");
  const [statusMessage, setStatusMessage] = useState(
    "FYEC100 assistant ready."
  );
  const [showUseNotice, setShowUseNotice] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const canSend = useMemo(() => input.trim().length > 0 && !isLoading, [
    input,
    isLoading
  ]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ block: "end" });
  }, [messages, isLoading]);

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
    setStatusMessage("Question sent. The assistant is preparing a response.");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ launchContext, messages: nextMessages })
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
      setStatusMessage("Assistant response received.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong.";
      setError(message);
      setStatusMessage(`Error: ${message}`);
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
    setStatusMessage("Saving pilot feedback.");

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assistantResponse: message.content,
          feedbackCategory: rating,
          launchContext,
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
      setFeedbackCategory("helpful");
      setFeedbackNote("");
      setStatusMessage("Feedback saved for pilot review.");
    } catch (err) {
      setMessages((current) =>
        current.map((item, itemIndex) =>
          itemIndex === index ? { ...item, feedbackStatus: "idle" } : item
        )
      );
      const message =
        err instanceof Error ? err.message : "Feedback could not be saved.";
      setError(message);
      setStatusMessage(`Feedback error: ${message}`);
    }
  }

  function handleInputKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (canSend) {
        void sendMessage();
      }
    }
  }

  return (
    <div className={embedded ? "grid gap-3" : "grid gap-6 lg:grid-cols-[1fr_320px]"}>
      <section
        aria-labelledby="fyec-chat-title"
        className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-soft"
      >
        <div
          className={`border-b border-slate-200 bg-slate-50 ${
            embedded ? "px-4 py-3" : "px-5 py-4"
          }`}
        >
          <h2 className="font-bold text-costaatt-navy" id="fyec-chat-title">
            FYEC100 Assistant
          </h2>
          {!embedded ? (
            <p className="text-sm text-slate-600">
              Responses are grounded in the local Phase 1 knowledge base.
            </p>
          ) : null}
          {embedded && launchContext ? (
            <div className="mt-3 grid gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-md bg-costaatt-blue px-2.5 py-1 text-xs font-bold text-white">
                  {roleGuidance.badgeLabel}
                </span>
                <span className="rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800">
                  Pilot context, not authenticated identity
                </span>
              </div>
              <dl className="grid gap-2 text-xs text-slate-600 sm:grid-cols-4">
                <ContextItem label="Course" value={launchContext.courseShortName} />
                <ContextItem label="Course ID" value={launchContext.courseId} />
                <ContextItem label="Role" value={launchContext.role} />
                <ContextItem label="Launch" value={launchContext.launchSource} />
              </dl>
            </div>
          ) : null}
        </div>
        {showUseNotice ? (
          <div
            className={`border-b border-costaatt-gold/40 bg-yellow-50 ${
              embedded ? "px-4 py-3" : "px-5 py-4"
            }`}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="text-sm font-bold text-costaatt-navy">
                  Responsible use notice
                </h3>
                <p className="mt-1 text-sm leading-6 text-slate-700">
                  {roleGuidance.notice} This assistant supports learning and
                  pilot review, but it does not grade work, replace official
                  COSTAATT roles, or write full assignments. Do not enter
                  sensitive personal information.
                </p>
              </div>
              <button
                aria-label="Dismiss responsible use notice"
                className="w-fit rounded-md border border-costaatt-gold/60 px-3 py-2 text-xs font-semibold text-costaatt-navy hover:bg-white"
                onClick={() => setShowUseNotice(false)}
                type="button"
              >
                Dismiss
              </button>
            </div>
          </div>
        ) : null}
        <div
          aria-label="FYEC100 chat messages"
          aria-live="polite"
          className={`space-y-4 overflow-y-auto ${
            embedded ? "h-[430px] px-4 py-4" : "h-[520px] px-5 py-5"
          }`}
          role="log"
        >
          {messages.map((message, index) => (
            <div
              className={`flex ${
                message.role === "student" ? "justify-end" : "justify-start"
              }`}
              key={`${message.role}-${index}`}
            >
              <div className="max-w-[84%]">
                <div
                  aria-label={
                    message.role === "student"
                      ? "Student message"
                      : "Assistant message"
                  }
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
                    id={`feedback-note-${index}`}
                    labelId={`feedback-label-${index}`}
                    category={feedbackCategory}
                    note={feedbackNote}
                    onCategoryChange={setFeedbackCategory}
                    onNoteChange={setFeedbackNote}
                    onSubmit={(rating) => void sendFeedback(index, rating)}
                    status={message.feedbackStatus ?? "idle"}
                  />
                ) : null}
              </div>
            </div>
          ))}
          {isLoading ? (
            <div
              aria-label="Assistant is thinking"
              className="max-w-[84%] rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600"
              role="status"
            >
              Thinking through the FYEC100 knowledge base...
            </div>
          ) : null}
          <div ref={messagesEndRef} />
        </div>
        <p className="sr-only" role="status">
          {statusMessage}
        </p>
        {error ? (
          <p
            className="border-t border-red-200 bg-red-50 px-5 py-3 text-sm text-red-700"
            role="alert"
          >
            {error}
          </p>
        ) : null}
        <form
          className={`flex flex-col gap-3 border-t border-slate-200 ${
            embedded ? "p-3 sm:flex-row" : "p-4 sm:flex-row"
          }`}
          onSubmit={handleSubmit}
        >
          <label className="sr-only" htmlFor="chat-input">
            Ask an FYEC100 question
          </label>
          <textarea
            className="min-h-12 flex-1 resize-none rounded-md border border-slate-300 px-4 py-3 text-sm leading-6 outline-none focus:border-costaatt-blue focus:ring-2 focus:ring-costaatt-blue/20"
            id="chat-input"
            onKeyDown={handleInputKeyDown}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask about course expectations, assignments, study tips, or LMS navigation..."
            rows={2}
            value={input}
            aria-describedby="chat-input-help"
          />
          <button
            aria-label="Send FYEC100 question"
            className="rounded-md bg-costaatt-navy px-5 py-3 text-sm font-semibold text-white hover:bg-costaatt-blue disabled:cursor-not-allowed disabled:bg-slate-300"
            disabled={!canSend}
            type="submit"
          >
            Send
          </button>
        </form>
        <p
          className="border-t border-slate-100 px-4 pb-4 text-xs text-slate-500"
          id="chat-input-help"
        >
          Press Enter to send. Press Shift+Enter for a new line.
        </p>
      </section>
      <aside className={embedded ? "grid gap-3 md:grid-cols-2" : "space-y-5"}>
        <section
          className={`rounded-lg border border-slate-200 bg-white shadow-soft ${
            embedded ? "p-4" : "p-5"
          }`}
        >
          <h3 className="font-bold text-costaatt-navy">Try a prompt</h3>
          <div className="mt-4 space-y-2">
            {starterPrompts.map((prompt) => (
              <button
                aria-label={`Use starter prompt: ${prompt}`}
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
        {embedded && launchContext ? (
          <section
            className={`rounded-lg border border-slate-200 bg-white shadow-soft ${
              embedded ? "p-4" : "p-5"
            }`}
          >
            <h3 className="font-bold text-costaatt-navy">Role-aware focus</h3>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
              {roleGuidance.focusAreas.map((area) => (
                <li className="rounded-md bg-slate-50 px-3 py-2" key={area}>
                  {area}
                </li>
              ))}
            </ul>
          </section>
        ) : null}
        <section
          className={`rounded-lg border border-costaatt-gold/50 bg-yellow-50 text-sm leading-6 text-slate-700 ${
            embedded ? "p-4" : "p-5"
          }`}
        >
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

function ContextItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-slate-200 bg-white px-3 py-2">
      <dt className="font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </dt>
      <dd className="mt-1 font-semibold text-costaatt-navy">{value}</dd>
    </div>
  );
}

function FeedbackPanel({
  category,
  disabled,
  id,
  labelId,
  note,
  onCategoryChange,
  onNoteChange,
  onSubmit,
  status
}: {
  category: FeedbackRating;
  disabled: boolean;
  id: string;
  labelId: string;
  note: string;
  onCategoryChange: (value: FeedbackRating) => void;
  onNoteChange: (value: string) => void;
  onSubmit: (rating: FeedbackRating) => void;
  status: "idle" | "sending" | "sent";
}) {
  if (status === "sent") {
    return (
      <p className="mt-2 text-xs font-medium text-emerald-700" role="status">
        Feedback saved for the pilot review.
      </p>
    );
  }

  return (
    <div
      aria-label="Pilot feedback controls"
      className="mt-2 rounded-md border border-slate-200 bg-white p-3"
    >
      <p className="text-xs font-semibold text-slate-700" id={labelId}>
        Help us route this pilot feedback
      </p>
      <label
        className="mt-2 block text-xs font-semibold text-slate-700"
        htmlFor={`${id}-category`}
      >
        Category
      </label>
      <select
        aria-labelledby={labelId}
        className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 outline-none focus:border-costaatt-blue focus:ring-2 focus:ring-costaatt-blue/20 disabled:opacity-60"
        disabled={disabled}
        id={`${id}-category`}
        onChange={(event) =>
          onCategoryChange(event.target.value as FeedbackRating)
        }
        value={category}
      >
        {feedbackOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <label
        className="mt-3 block text-xs font-semibold text-slate-700"
        htmlFor={id}
      >
        Optional note
        <textarea
          id={id}
          className="mt-1 min-h-16 w-full resize-none rounded-md border border-slate-300 px-3 py-2 text-xs leading-5 outline-none focus:border-costaatt-blue focus:ring-2 focus:ring-costaatt-blue/20"
          disabled={disabled}
          onChange={(event) => onNoteChange(event.target.value)}
          placeholder="Optional: what should the pilot team know? Do not enter names, IDs, grades, or private information."
          value={note}
        />
      </label>
      <button
        aria-label="Submit pilot feedback"
        className="mt-3 rounded-md bg-costaatt-navy px-3 py-2 text-xs font-semibold text-white hover:bg-costaatt-blue disabled:cursor-not-allowed disabled:bg-slate-300"
        disabled={disabled}
        onClick={() => onSubmit(category)}
        type="button"
      >
        Save feedback
      </button>
    </div>
  );
}
