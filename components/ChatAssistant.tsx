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
import type { CourseChatContext } from "@/lib/courseResolver";
import { FormattedAssistantMessage } from "@/components/FormattedAssistantMessage";

type ChatMessage = {
  feedbackStatus?: "idle" | "sending" | "sent";
  role: "student" | "assistant";
  content: string;
};

type SupportEscalationCategory =
  | "lecturer-help"
  | "missing-course-info"
  | "moodle-help";

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
  "Help me plan my week for FYEC100.",
  "Explain academic integrity in simple terms.",
  "Where do I find FYEC100 resources in Moodle?",
  "Help me understand what FYEC100 expects from first-year students.",
  "How can I use AI responsibly for brainstorming and studying?"
];

type ChatAssistantProps = {
  courseContext?: CourseChatContext;
  embedded?: boolean;
  launchContext?: MoodleLaunchContext;
};

export function ChatAssistant({
  courseContext,
  embedded = false,
  launchContext
}: ChatAssistantProps) {
  const roleGuidance = getRoleGuidance(launchContext?.role);
  const [activeCourse, setActiveCourse] = useState<CourseChatContext | undefined>(
    courseContext
  );
  const courseLabel = activeCourse?.courseCode ?? launchContext?.courseShortName ?? "FYEC100";
  const courseTitle = activeCourse?.title ?? "First Year Experience";
  const starterPrompts = launchContext
    ? roleGuidance.starterPrompts.map((prompt) =>
        prompt.replaceAll("FYEC100", courseLabel)
      )
    : defaultStarterPrompts.map((prompt) =>
        prompt.replaceAll("FYEC100", courseLabel)
      );
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: roleGuidance.assistantIntro.replaceAll("FYEC100", courseLabel)
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [feedbackCategory, setFeedbackCategory] =
    useState<FeedbackRating>("helpful");
  const [feedbackNote, setFeedbackNote] = useState("");
  const [statusMessage, setStatusMessage] = useState(
    `${courseLabel} assistant ready.`
  );
  const [showUseNotice, setShowUseNotice] = useState(true);
  const [consentAcknowledged, setConsentAcknowledged] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [sessionHistory, setSessionHistory] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const canSend = useMemo(() => input.trim().length > 0 && !isLoading, [
    input,
    isLoading
  ]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ block: "end" });
  }, [messages, isLoading]);

  useEffect(() => {
    queueMicrotask(() => {
      setConsentAcknowledged(localStorage.getItem("fyec100-consent") === "acknowledged");
      setSessionHistory(JSON.parse(localStorage.getItem("fyec100-session-history") || "[]") as string[]);
    });
  }, []);

  async function sendMessage(nextInput?: string) {
    const question = (nextInput ?? input).trim();
    if (!question) return;

    const nextMessages: ChatMessage[] = [
      ...messages,
      { role: "student", content: question }
    ];

    setMessages(nextMessages);
    rememberQuestion(question);
    setInput("");
    setIsLoading(true);
    setError("");
    setStatusMessage("Question sent. The assistant is preparing a response.");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseCode: activeCourse?.courseCode ?? launchContext?.courseShortName,
          launchContext,
          messages: nextMessages.slice(-12)
        })
      });

      const data = (await response.json()) as {
        answer?: string;
        course?: CourseChatContext;
        error?: string;
      };

      if (data.course) {
        setActiveCourse(data.course);
      }

      if (!response.ok) {
        if (data.answer) {
          setMessages((current) => [
            ...current,
            {
              role: "assistant",
              content: data.answer ?? "This course context is not available for chat.",
              feedbackStatus: "idle"
            }
          ]);
          setStatusMessage("Course routing stopped the chat request.");
          return;
        }

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
          consentAcknowledged,
          courseCode: activeCourse?.courseCode || launchContext?.courseShortName || launchContext?.courseId || "FYEC100",
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

  async function createEscalation(category: SupportEscalationCategory, prompt: string) {
    if (!consentAcknowledged) {
      setError("Please acknowledge the pilot privacy notice before requesting human support.");
      return;
    }

    setStatusMessage("Creating human support handoff.");
    const response = await fetch("/api/support-handoff", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        category,
        consentAcknowledged,
        courseCode: activeCourse?.courseCode || launchContext?.courseShortName || launchContext?.courseId || "FYEC100",
        safeSummary: prompt
      })
    });
    const data = (await response.json()) as { case?: { studentFacingConfirmation?: string }; error?: string };

    if (!response.ok) {
      setError(data.error || "Support handoff could not be created.");
      return;
    }

    setStatusMessage(data.case?.studentFacingConfirmation || "Human support handoff created.");
    await sendMessage(prompt);
  }

  function acknowledgeConsent() {
    localStorage.setItem("fyec100-consent", "acknowledged");
    setConsentAcknowledged(true);
  }

  function clearSession() {
    localStorage.removeItem("fyec100-session-history");
    setSessionHistory([]);
    setMessages([{ role: "assistant", content: roleGuidance.assistantIntro.replaceAll("FYEC100", courseLabel) }]);
  }

  function rememberQuestion(question: string) {
    const next = [question, ...sessionHistory.filter((item) => item !== question)].slice(0, 6);
    setSessionHistory(next);
    localStorage.setItem("fyec100-session-history", JSON.stringify(next));
  }

  function handleInputKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (canSend) {
        void sendMessage();
      }
    }
  }

  const boundaryVisible = messages.some((message) =>
    /full assignment|write (the )?assignment|cannot grade|does not grade|academic integrity/i.test(
      message.content
    )
  );

  const studySummary = messages
    .map((message) => `${message.role === "student" ? "Student" : `${courseLabel} Assistant`}: ${message.content}`)
    .join("\n\n")
    .concat(
      "\n\nReminder: This is study guidance only. It is not an assignment submission, grade, or replacement for lecturer instructions."
    );

  async function copyStudySummary() {
    await navigator.clipboard.writeText(studySummary);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 1800);
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
            {courseLabel} Assistant
          </h2>
          {!embedded ? (
            <p className="text-sm text-slate-600">
              Responses are grounded in the active local course knowledge base.
            </p>
          ) : null}
          {activeCourse ? (
            <div className="mt-3 grid gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600 sm:grid-cols-3">
              <div className="sm:hidden">
                <ContextItem
                  label="Active course"
                  value={`${activeCourse.courseCode}: ${courseTitle} · ${activeCourse.status}`}
                />
              </div>
              <div className="hidden sm:contents">
                <ContextItem label="Course" value={`${activeCourse.courseCode}: ${courseTitle}`} />
                <ContextItem label="KB" value={activeCourse.knowledgeBasePath || "Not configured"} />
                <ContextItem label="Status" value={`${activeCourse.status} · ${activeCourse.lifecycleStatus}`} />
              </div>
            </div>
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
                  Pilot privacy and responsible use notice
                </h3>
                <p className="mt-1 text-sm leading-6 text-slate-700">
                  <span className="sm:hidden">
                    Use this assistant for guidance, not grades or completed
                    assignments. Do not enter passwords, student IDs, grades, or
                    sensitive personal information.
                  </span>
                  <span className="hidden sm:inline">
                    {roleGuidance.notice} This assistant supports learning and
                    pilot review, but it does not grade work, replace official
                    COSTAATT roles, or write full assignments. Do not enter
                    passwords, student ID numbers, grades, medical details, or
                    sensitive personal information.
                  </span>
                </p>
                <p className="mt-2 text-xs font-semibold text-slate-700">
                  Feedback and escalation features are enabled only after this
                  notice is acknowledged.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {!consentAcknowledged ? (
                  <button
                    className="w-fit rounded-md bg-costaatt-navy px-3 py-2 text-xs font-semibold text-white hover:bg-costaatt-blue"
                    onClick={acknowledgeConsent}
                    type="button"
                  >
                    I understand
                  </button>
                ) : null}
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
          </div>
        ) : null}
        <div
          aria-label="FYEC100 chat messages"
          aria-live="polite"
          className={`space-y-4 overflow-y-auto ${
            embedded
              ? "h-[300px] px-4 py-4 sm:h-[430px]"
              : "h-[300px] px-5 py-5 sm:h-[420px] lg:h-[520px]"
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
                      : "border border-slate-200 bg-slate-50 text-slate-800 shadow-sm"
                  }`}
                >
                  {message.role === "assistant" ? (
                    <FormattedAssistantMessage content={message.content} />
                  ) : (
                    <span className="whitespace-pre-wrap">{message.content}</span>
                  )}
                </div>
                {message.role === "assistant" && index > 0 ? (
                  <FeedbackPanel
                    consentAcknowledged={consentAcknowledged}
                    disabled={message.feedbackStatus === "sending" || !consentAcknowledged}
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
              Thinking through the {courseLabel} knowledge base...
            </div>
          ) : null}
          <div ref={messagesEndRef} />
        </div>
        {boundaryVisible ? (
          <div className="border-t border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
            <strong className="block text-costaatt-navy">Academic integrity boundary</strong>
            I can help you understand instructions, plan your work, brainstorm responsibly, and prepare questions for your lecturer. I cannot write a full assignment, invent policy, or grade your work.
          </div>
        ) : null}
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
            Ask a course question
          </label>
          <textarea
            className="min-h-12 flex-1 resize-none rounded-md border border-slate-300 px-4 py-3 text-sm leading-6 outline-none focus:border-costaatt-blue focus:ring-2 focus:ring-costaatt-blue/20"
            id="chat-input"
            maxLength={2000}
            onKeyDown={handleInputKeyDown}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask about course expectations, assignments, study tips, or LMS navigation..."
            rows={2}
            value={input}
            aria-describedby="chat-input-help"
          />
          <button
            aria-label={`Send ${courseLabel} question`}
            className="rounded-md bg-costaatt-navy px-5 py-3 text-sm font-semibold text-white hover:bg-costaatt-blue disabled:cursor-not-allowed disabled:bg-slate-300"
            disabled={!canSend}
            type="submit"
          >
            Send
          </button>
        </form>
        <div className="flex flex-wrap gap-2 border-t border-slate-100 px-4 py-3">
          <button className="rounded-md border border-slate-200 px-3 py-2 text-xs font-semibold text-costaatt-navy hover:border-costaatt-blue disabled:opacity-50" disabled={!consentAcknowledged} onClick={() => void createEscalation("lecturer-help", `I need lecturer help with this ${courseLabel} question.`)} type="button">
            I need lecturer help
          </button>
          <button className="rounded-md border border-slate-200 px-3 py-2 text-xs font-semibold text-costaatt-navy hover:border-costaatt-blue disabled:opacity-50" disabled={!consentAcknowledged} onClick={() => void createEscalation("moodle-help", `I need Moodle help finding ${courseLabel} materials.`)} type="button">
            I need Moodle help
          </button>
          <button className="rounded-md border border-slate-200 px-3 py-2 text-xs font-semibold text-costaatt-navy hover:border-costaatt-blue disabled:opacity-50" disabled={!consentAcknowledged} onClick={() => void createEscalation("missing-course-info", "This answer seems to be missing course information. What should I ask my lecturer?")} type="button">
            Missing course info
          </button>
          <button className="rounded-md bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200" onClick={() => void copyStudySummary()} type="button">
            {copiedSummary ? "Summary copied" : "Copy study summary"}
          </button>
        </div>
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
          {activeCourse?.allowedTopics.length ? (
            <p className="mt-2 text-xs leading-5 text-slate-600">
              Active topics: {activeCourse.allowedTopics.join(", ")}
            </p>
          ) : null}
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
        <section
          className={`rounded-lg border border-slate-200 bg-white shadow-soft ${
            embedded ? "p-4" : "p-5"
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-bold text-costaatt-navy">This session</h3>
            <button className="rounded-md border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-600" onClick={clearSession} type="button">
              Clear
            </button>
          </div>
          <div className="mt-3 grid gap-2 text-sm text-slate-700">
            {sessionHistory.length ? (
              sessionHistory.map((item) => (
                <button className="rounded-md bg-slate-50 px-3 py-2 text-left hover:bg-slate-100" key={item} onClick={() => void sendMessage(item)} type="button">
                  {item}
                </button>
              ))
            ) : (
              <p className="text-sm text-slate-600">Recent questions will appear here during this browser session.</p>
            )}
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
          {activeCourse?.guardrailNotes ? (
            <p className="mt-2 text-xs font-semibold text-costaatt-navy">
              {activeCourse.guardrailNotes}
            </p>
          ) : null}
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
  consentAcknowledged,
  id,
  labelId,
  note,
  onCategoryChange,
  onNoteChange,
  onSubmit,
  status
}: {
  category: FeedbackRating;
  consentAcknowledged: boolean;
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
      {!consentAcknowledged ? (
        <p className="mt-2 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800">
          Acknowledge the pilot privacy notice before submitting feedback.
        </p>
      ) : null}
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
          maxLength={1000}
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
