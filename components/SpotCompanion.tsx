"use client";

import {
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
} from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  MessageCircle,
  Send,
  Sparkles,
  X,
} from "lucide-react";

import { useSpot } from "@/components/SpotProvider";
import {
  SPOT_GREETING,
  SPOT_LOADING_LOCAL,
  SPOT_LOADING_RESEARCH,
  SPOT_QUICK_PROMPTS,
  type SpotMessage,
  type SpotSide,
} from "@/lib/spotAssistant";
import type { SpotResponse } from "@/lib/spot/types";

const SIDE_STORAGE_KEY = "remi-spot-side";
const GREETING_STORAGE_KEY = "remi-spot-greeted";

function createMessage(role: SpotMessage["role"], text: string): SpotMessage {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    role,
    text,
  };
}

function createAssistantMessage(response: SpotResponse): SpotMessage {
  return {
    id: `assistant-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    role: "assistant",
    text: response.answer,
    disclosure: response.disclosure,
    localSignals: response.localSignals,
    sources: response.sources,
    sourceType: response.sourceType,
  };
}

function SpotCloud() {
  return (
    <span className="spot-cloud" aria-hidden="true">
      <span className="spot-puff spot-puff-one" />
      <span className="spot-puff spot-puff-two" />
      <span className="spot-puff spot-puff-three" />
      <span className="spot-eye spot-eye-left" />
      <span className="spot-eye spot-eye-right" />
      <span className="spot-cheek spot-cheek-left" />
      <span className="spot-cheek spot-cheek-right" />
    </span>
  );
}

export function SpotCompanion() {
  const { result } = useSpot();
  const reduceMotion = useReducedMotion();
  const railRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const messageEndRef = useRef<HTMLDivElement>(null);
  const didDragRef = useRef(false);
  const dragX = useMotionValue(0);
  const [side, setSide] = useState<SpotSide>("right");
  const [isOpen, setIsOpen] = useState(false);
  const [showGreeting, setShowGreeting] = useState(false);
  const [input, setInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [messages, setMessages] = useState<SpotMessage[]>([
    {
      id: "spot-welcome",
      role: "assistant",
      text: SPOT_GREETING,
    },
  ]);

  useEffect(() => {
    const storedSide = window.sessionStorage.getItem(SIDE_STORAGE_KEY);
    if (storedSide === "left" || storedSide === "right") {
      setSide(storedSide);
    }

    if (!window.sessionStorage.getItem(GREETING_STORAGE_KEY)) {
      window.sessionStorage.setItem(GREETING_STORAGE_KEY, "true");
      setShowGreeting(true);
      const timer = window.setTimeout(() => setShowGreeting(false), 8000);
      return () => window.clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusTimer = window.setTimeout(() => inputRef.current?.focus(), 80);

    function handleKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
        return;
      }

      if (event.key !== "Tab" || !panelRef.current) return;

      const focusable = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
        ),
      );

      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      messageEndRef.current?.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
      });
    }
  }, [isOpen, messages, reduceMotion]);

  function updateSide(nextSide: SpotSide) {
    setSide(nextSide);
    window.sessionStorage.setItem(SIDE_STORAGE_KEY, nextSide);
  }

  function toggleSide() {
    updateSide(side === "right" ? "left" : "right");
  }

  function openPanel() {
    setShowGreeting(false);
    setIsOpen(true);
  }

  function handleLauncherClick() {
    if (didDragRef.current) {
      didDragRef.current = false;
      return;
    }

    openPanel();
  }

  function handleDragEnd(
    _: MouseEvent | TouchEvent | PointerEvent,
    info: { point: { x: number }; offset: { x: number } },
  ) {
    didDragRef.current = Math.abs(info.offset.x) > 8;
    dragX.set(0);
    updateSide(info.point.x < window.innerWidth / 2 ? "left" : "right");
  }

  function updateMessage(messageId: string, nextMessage: SpotMessage) {
    setMessages((current) =>
      current.map((message) => (message.id === messageId ? nextMessage : message)),
    );
  }

  async function submitSpotQuestion(text: string) {
    const cleanText = text.trim();
    if (!cleanText || isSubmitting) return;

    const userMessage = createMessage("user", cleanText);
    const loadingMessageId = `assistant-loading-${Date.now()}`;
    const loadingMessage: SpotMessage = {
      id: loadingMessageId,
      role: "assistant",
      text: SPOT_LOADING_LOCAL,
      sourceType: "loading",
    };

    setIsSubmitting(true);
    setMessages((current) => [...current, userMessage, loadingMessage]);
    setInput("");

    const loadingTimer = window.setTimeout(() => {
      updateMessage(loadingMessageId, {
        ...loadingMessage,
        text: SPOT_LOADING_RESEARCH,
      });
    }, 1800);

    try {
      const response = await fetch("/api/spot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: cleanText,
          demoRecordKey: result?.demoRecord?.record_key,
        }),
      });

      const payload = (await response.json()) as Partial<SpotResponse>;
      const nextMessage =
        payload &&
        typeof payload.answer === "string" &&
        Array.isArray(payload.localSignals) &&
        Array.isArray(payload.sources)
          ? createAssistantMessage(payload as SpotResponse)
          : createMessage(
              "assistant",
              "Spot couldn’t process that question right now. Please try again.",
            );

      updateMessage(loadingMessageId, nextMessage);
    } catch {
      updateMessage(
        loadingMessageId,
        createMessage(
          "assistant",
          "Spot couldn’t reach the server right now. Please try again.",
        ),
      );
    } finally {
      window.clearTimeout(loadingTimer);
      setIsSubmitting(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void submitSpotQuestion(input);
  }

  function handleInputKeyDown(event: ReactKeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      setIsOpen(false);
    }
  }

  return (
    <>
      <div
        ref={railRef}
        className={`spot-launcher-rail spot-side-${side} ${
          isOpen ? "spot-launcher-hidden" : ""
        }`}
      >
        <AnimatePresence>
          {showGreeting && !isOpen && (
            <motion.button
              type="button"
              className="spot-greeting"
              initial={reduceMotion ? false : { opacity: 0, y: 8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 6 }}
              onClick={openPanel}
            >
              {SPOT_GREETING}
            </motion.button>
          )}
        </AnimatePresence>

        <motion.button
          type="button"
          className="spot-launcher"
          aria-label="Open Spot wellness assistant"
          aria-expanded={isOpen}
          aria-controls="spot-assistant-panel"
          layout={!reduceMotion}
          style={{ x: dragX }}
          drag="x"
          dragConstraints={railRef}
          dragElastic={0.08}
          dragMomentum={false}
          whileHover={reduceMotion ? undefined : { y: -3 }}
          whileTap={reduceMotion ? undefined : { scale: 0.97 }}
          onDragStart={() => {
            didDragRef.current = false;
            setShowGreeting(false);
          }}
          onDragEnd={handleDragEnd}
          onClick={handleLauncherClick}
        >
          <span className="spot-launcher-sparkle" aria-hidden="true">
            <Sparkles size={14} />
          </span>
          <SpotCloud />
          <span className="spot-launcher-label">
            <MessageCircle size={12} />
            Ask Spot
          </span>
        </motion.button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Close Spot assistant"
              className="spot-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />
            <motion.aside
              ref={panelRef}
              id="spot-assistant-panel"
              role="dialog"
              aria-modal="true"
              aria-labelledby="spot-assistant-title"
              className={`spot-panel spot-panel-${side}`}
              initial={
                reduceMotion
                  ? { opacity: 0 }
                  : {
                      opacity: 0,
                      x: side === "right" ? 32 : -32,
                      y: 10,
                    }
              }
              animate={{ opacity: 1, x: 0, y: 0 }}
              exit={
                reduceMotion
                  ? { opacity: 0 }
                  : {
                      opacity: 0,
                      x: side === "right" ? 26 : -26,
                      y: 10,
                    }
              }
              transition={{ duration: reduceMotion ? 0.01 : 0.24 }}
            >
              <header className="spot-panel-header">
                <div className="spot-panel-identity">
                  <span className="spot-panel-avatar">
                    <SpotCloud />
                  </span>
                  <div>
                    <p className="spot-panel-kicker">Your REMi companion</p>
                    <h2 id="spot-assistant-title">Chat with Spot</h2>
                  </div>
                </div>
                <div className="spot-panel-actions">
                  <button
                    type="button"
                    className="spot-icon-button"
                    onClick={toggleSide}
                    aria-label={`Move Spot to the ${side === "right" ? "left" : "right"} side`}
                    title={`Move Spot to the ${side === "right" ? "left" : "right"} side`}
                  >
                    {side === "right" ? (
                      <ArrowLeft size={17} />
                    ) : (
                      <ArrowRight size={17} />
                    )}
                  </button>
                  <button
                    type="button"
                    className="spot-icon-button"
                    onClick={() => setIsOpen(false)}
                    aria-label="Close Spot assistant"
                  >
                    <X size={18} />
                  </button>
                </div>
              </header>

              <div className="spot-status">
                <span aria-hidden="true" />
                {result ? "Tonight’s plan is ready" : "Ready when you are"}
              </div>

              <div
                className="spot-messages"
                role="log"
                aria-live="polite"
                aria-relevant="additions"
              >
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`spot-message spot-message-${message.role} ${
                      message.sourceType === "loading" ? "spot-message-loading" : ""
                    }`}
                  >
                    <p className="spot-message-text">{message.text}</p>
                    {message.disclosure ? (
                      <p className="spot-message-disclosure">{message.disclosure}</p>
                    ) : null}
                    {message.localSignals && message.localSignals.length > 0 ? (
                      <div className="spot-signal-list">
                        {message.localSignals.map((signal) => (
                          <span key={signal} className="spot-signal-pill">
                            {signal}
                          </span>
                        ))}
                      </div>
                    ) : null}
                    {message.sources && message.sources.length > 0 ? (
                      <div className="spot-source-list">
                        {message.sources.map((source) => (
                          <a
                            key={`${source.url}-${source.title}`}
                            className="spot-source-card"
                            href={source.url}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <div className="spot-source-meta">
                              <span>{source.domain}</span>
                              {source.evidenceType ? (
                                <span>{source.evidenceType.replace(/-/g, " ")}</span>
                              ) : null}
                            </div>
                            <p className="spot-source-title">
                              {source.title}
                              <ExternalLink size={12} />
                            </p>
                            <p className="spot-source-snippet">{source.snippet}</p>
                          </a>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ))}
                <div ref={messageEndRef} />
              </div>

              <div className="spot-prompt-list" aria-label="Suggested questions">
                {SPOT_QUICK_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => {
                      void submitSpotQuestion(prompt);
                    }}
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              <form className="spot-input-row" onSubmit={handleSubmit}>
                <label className="sr-only" htmlFor="spot-message-input">
                  Ask Spot a question
                </label>
                <input
                  ref={inputRef}
                  id="spot-message-input"
                  value={input}
                  maxLength={240}
                  placeholder="Ask about tonight’s plan..."
                  autoComplete="off"
                  aria-describedby="spot-disclaimer"
                  disabled={isSubmitting}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={handleInputKeyDown}
                />
                <button
                  type="submit"
                  aria-label="Send message"
                  disabled={!input.trim() || isSubmitting}
                >
                  <Send size={17} />
                </button>
              </form>

              <p id="spot-disclaimer" className="spot-disclaimer">
                Wellness guidance only. Spot does not provide medical advice,
                diagnosis, or treatment.
              </p>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
