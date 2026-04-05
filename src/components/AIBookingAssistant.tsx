import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X, Mic, MicOff, Send, Bot, User, CheckCircle, Edit2,
  Phone, MapPin, Calendar, Clock, FileText,
  AlertTriangle, RotateCcw, CalendarDays, Plus, ChevronDown, ChevronUp,
  Zap, Wrench, Droplets, Flame, DollarSign
} from "lucide-react";
import { format, parseISO, isValid } from "date-fns";
import { api } from "../services/api";
import { cn } from "../lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ParsedBooking {
  customer_name: string | null;
  customer_phone: string | null;
  customer_email: string | null;
  service_name: string | null;
  scheduled_date: string | null;
  scheduled_time: string | null;
  duration_minutes: number | null;
  address: string | null;
  notes: string | null;
  urgency: "emergency" | "urgent" | "normal" | null;
  price: number | null;
  payment_status: "paid" | "unpaid" | "deposit" | null;
  confidence: "high" | "medium" | "low";
  missing_fields: string[];
  clarification_needed: string | null;
}

interface ChatMessage {
  role: "ai" | "user";
  content: string;
  parsed?: ParsedBooking;
  isTyping?: boolean;
}

interface CreatedBooking {
  id: string;
  customerName: string;
  jobType: string;
  date?: string;
  scheduled_time?: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  plumber: any;
}

// ─── Quick chips ──────────────────────────────────────────────────────────────
const QUICK_CHIPS = [
  { label: "Emergency Callout", icon: Zap, prefix: "Emergency callout" },
  { label: "Boiler Service", icon: Wrench, prefix: "Boiler service" },
  { label: "Leaking Tap", icon: Droplets, prefix: "Leaking tap repair" },
  { label: "No Heating", icon: Flame, prefix: "No heating" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatScheduledDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  try {
    const d = parseISO(dateStr);
    if (!isValid(d)) return dateStr;
    return format(d, "EEE d MMM yyyy");
  } catch {
    return dateStr;
  }
}

function EditableField({
  label, value, icon: Icon, onSave,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  onSave: (v: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const commit = () => {
    onSave(draft);
    setEditing(false);
  };

  return (
    <div className="flex items-start gap-3 group py-1.5">
      <Icon className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-0.5">{label}</div>
        {editing ? (
          <div className="flex gap-2">
            <input
              ref={inputRef}
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") commit(); if (e.key === "Escape") setEditing(false); }}
              className="flex-1 text-sm bg-slate-100 border border-blue-400 rounded-lg px-2 py-1 text-slate-800 outline-none"
            />
            <button onClick={commit} className="text-xs bg-blue-600 text-white px-2 py-1 rounded-lg font-bold">Save</button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className={cn("text-sm font-semibold", value === "—" ? "text-slate-400" : "text-slate-800")}>{value}</span>
            <button
              onClick={() => { setDraft(value === "—" ? "" : value); setEditing(true); }}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-blue-600"
            >
              <Edit2 className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Booking Confirmation Card ────────────────────────────────────────────────

function BookingCard({
  parsed,
  onUpdate,
}: {
  parsed: ParsedBooking;
  onUpdate: (updated: ParsedBooking) => void;
}) {
  const update = (field: keyof ParsedBooking) => (value: string) => {
    onUpdate({ ...parsed, [field]: value || null });
  };

  const isEmergency = parsed.urgency === "emergency";

  return (
    <div className={cn(
      "bg-white rounded-2xl border-l-4 shadow-sm overflow-hidden",
      isEmergency ? "border-red-500" : "border-blue-500"
    )}>
      {isEmergency && (
        <div className="bg-red-50 border-b border-red-100 px-4 py-2 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-600" />
          <span className="text-xs font-bold text-red-700 uppercase tracking-wider">Emergency — scheduling for today</span>
        </div>
      )}
      <div className="p-4 space-y-0.5">
        <div className="text-xs font-bold text-slate-500 mb-3 flex items-center gap-1.5">
          <CheckCircle className="w-3.5 h-3.5 text-green-500" />
          Here's what I've got:
        </div>
        <EditableField label="Customer" icon={User} value={parsed.customer_name || "—"} onSave={update("customer_name")} />
        <EditableField label="Phone" icon={Phone} value={parsed.customer_phone || "—"} onSave={update("customer_phone")} />
        <EditableField label="Address" icon={MapPin} value={parsed.address || "—"} onSave={update("address")} />
        <EditableField label="Service" icon={Wrench} value={parsed.service_name || "—"} onSave={update("service_name")} />
        <EditableField
          label="Date"
          icon={Calendar}
          value={formatScheduledDate(parsed.scheduled_date)}
          onSave={v => onUpdate({ ...parsed, scheduled_date: v || null })}
        />
        <EditableField label="Time" icon={Clock} value={parsed.scheduled_time || "—"} onSave={update("scheduled_time")} />
        {parsed.duration_minutes && (
          <EditableField label="Duration" icon={Clock} value={`~${Math.round(parsed.duration_minutes / 60)}h`} onSave={() => {}} />
        )}
        {(parsed.price !== null) && (
          <EditableField
            label="Price"
            icon={DollarSign}
            value={`£${parsed.price}${parsed.payment_status ? ` (${parsed.payment_status})` : ""}`}
            onSave={() => {}}
          />
        )}
        {parsed.notes && (
          <EditableField label="Notes" icon={FileText} value={parsed.notes} onSave={update("notes")} />
        )}
      </div>
      {parsed.missing_fields.length > 0 && (
        <div className="border-t border-slate-100 px-4 py-2 bg-amber-50">
          <span className="text-xs text-amber-700 font-semibold">
            ⚠ Missing: {parsed.missing_fields.join(", ")}
          </span>
        </div>
      )}
    </div>
  );
}

// ─── Typing indicator ─────────────────────────────────────────────────────────

function TypingIndicator({ label }: { label?: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center shrink-0">
        <Bot className="w-4 h-4 text-white" />
      </div>
      <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-2 shadow-sm">
        <div className="flex gap-1">
          {[0, 1, 2].map(i => (
            <span
              key={i}
              className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
        <span className="text-xs text-slate-400 font-medium">{label || "Reading your booking details..."}</span>
      </div>
    </div>
  );
}

// ─── Success State ────────────────────────────────────────────────────────────

function SuccessState({
  booking,
  onViewCalendar,
  onAddAnother,
}: {
  booking: CreatedBooking;
  onViewCalendar: () => void;
  onAddAnother: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center h-full gap-8 px-6 py-12 text-center"
    >
      {/* Success animation */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
        className="relative"
      >
        <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center">
          <CheckCircle className="w-14 h-14 text-emerald-500" />
        </div>
        <motion.div
          initial={{ scale: 0.8, opacity: 0.8 }}
          animate={{ scale: 1.4, opacity: 0 }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "easeOut" }}
          className="absolute inset-0 rounded-full bg-emerald-400/30"
        />
      </motion.div>

      <div>
        <h3 className="text-2xl font-extrabold text-slate-800 mb-2">Booking Added!</h3>
        <p className="text-slate-600 font-medium">
          {booking.customerName} — {booking.jobType}
        </p>
        {booking.date && (
          <p className="text-slate-500 text-sm mt-1">
            {formatScheduledDate(booking.date)}
            {booking.scheduled_time ? ` at ${booking.scheduled_time}` : ""}
          </p>
        )}
      </div>

      <div className="w-full space-y-3">
        <button
          onClick={onViewCalendar}
          className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white py-3.5 rounded-2xl font-bold text-sm hover:bg-slate-800 transition-all"
        >
          <CalendarDays className="w-4 h-4" />
          View in Bookings
        </button>
        <button
          onClick={onAddAnother}
          className="w-full flex items-center justify-center gap-2 border-2 border-slate-200 text-slate-700 py-3.5 rounded-2xl font-bold text-sm hover:bg-slate-50 transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Another Booking
        </button>
      </div>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AIBookingAssistant({ open, onClose, plumber }: Props) {
  const [inputMode, setInputMode] = useState<"type" | "voice">("type");
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentParsed, setCurrentParsed] = useState<ParsedBooking | null>(null);
  const [clarificationText, setClarificationText] = useState("");
  const [showClarification, setShowClarification] = useState(false);
  const [successBooking, setSuccessBooking] = useState<CreatedBooking | null>(null);
  const [sessionBookings, setSessionBookings] = useState<CreatedBooking[]>([]);
  const [showSessionList, setShowSessionList] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  // Voice state
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [voiceSupported, setVoiceSupported] = useState(true);
  const recognitionRef = useRef<any>(null);
  const silenceTimer = useRef<any>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // ── Init ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) setVoiceSupported(false);
  }, []);

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{
        role: "ai",
        content: `Hi! Tell me about the booking you want to add. You can say something like:\n\n💬 "John Smith, boiler repair, tomorrow at 10am, 14 Maple Street Glasgow"\n\n💬 "Customer called Sarah — leaking tap, Thursday 2pm, she's at 7 Park Road, mobile is 07712 345678"\n\n💬 "Emergency callout for Mike, burst pipe, today 3pm, paid £150 cash already"\n\nJust speak or type naturally — I'll pick up all the details.`,
      }]);
    }
  }, [open]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isProcessing]);

  // ── Voice ─────────────────────────────────────────────────────────────────
  const startListening = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = "en-GB";
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event: any) => {
      let interim = "";
      let final = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      setInterimTranscript(interim);
      if (final) {
        setInputText(prev => (prev + " " + final).trim());
        setInterimTranscript("");
        clearTimeout(silenceTimer.current);
        silenceTimer.current = setTimeout(() => {
          recognition.stop();
        }, 2000);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimTranscript("");
    };

    recognition.onerror = () => {
      setIsListening(false);
      setInterimTranscript("");
    };

    recognition.start();
  }, []);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    clearTimeout(silenceTimer.current);
  }, []);

  // ── Process input ──────────────────────────────────────────────────────────
  const processInput = useCallback(async (text: string) => {
    if (!text.trim() || isProcessing) return;

    const userMsg: ChatMessage = { role: "user", content: text.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInputText("");
    setIsProcessing(true);
    setCurrentParsed(null);
    setShowClarification(false);

    try {
      const token = localStorage.getItem("token");
      const data = await api.post("/ai-booking-parse", { raw_input: text }, token || undefined);

      const aiMsg: ChatMessage = {
        role: "ai",
        content: data.clarification_needed
          ? data.confidence === "low"
            ? "I picked up some details but I'm not confident about a few things."
            : "Got some details! Here's what I found:"
          : "Here's what I've got:",
        parsed: data,
      };

      setMessages(prev => [...prev, aiMsg]);
      setCurrentParsed(data);

      if (data.clarification_needed) {
        setShowClarification(true);
      }
    } catch (err: any) {
      setMessages(prev => [...prev, {
        role: "ai",
        content: "Sorry, I had trouble reading that. Could you try again with a bit more detail?",
      }]);
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing]);

  const handleSend = () => {
    const text = inputText.trim();
    if (text) processInput(text);
  };

  const handleClarificationAnswer = () => {
    if (!clarificationText.trim() || !currentParsed) return;
    const combined = `${messages.filter(m => m.role === "user").map(m => m.content).join(". ")}. Also: ${clarificationText}`;
    setClarificationText("");
    setShowClarification(false);
    processInput(combined);
  };

  const handleQuickChip = (prefix: string) => {
    setInputText(prefix + " for ");
    inputRef.current?.focus();
  };

  // ── Confirm booking ────────────────────────────────────────────────────────
  const handleConfirm = async () => {
    if (!currentParsed || isConfirming) return;
    setIsConfirming(true);

    try {
      const token = localStorage.getItem("token");
      const created = await api.post("/bookings/ai", {
        customerName: currentParsed.customer_name || "Unknown",
        phone: currentParsed.customer_phone || "",
        address: currentParsed.address || "",
        jobType: currentParsed.service_name || "General Job",
        description: currentParsed.notes || "",
        date: currentParsed.scheduled_date || null,
        scheduledTime: currentParsed.scheduled_time || null,
        durationMinutes: currentParsed.duration_minutes || null,
        urgency: currentParsed.urgency || "normal",
        price: currentParsed.price || null,
        paymentStatus: currentParsed.payment_status || null,
        customerEmail: currentParsed.customer_email || null,
        source: "ai_assistant",
        ai_raw_input: messages.filter(m => m.role === "user").map(m => m.content).join("\n"),
      }, token || undefined);

      const createdBooking: CreatedBooking = {
        id: created.id || created._id,
        customerName: currentParsed.customer_name || "Unknown",
        jobType: currentParsed.service_name || "General Job",
        date: currentParsed.scheduled_date || undefined,
        scheduled_time: currentParsed.scheduled_time || undefined,
      };

      setSessionBookings(prev => [...prev, createdBooking]);
      setSuccessBooking(createdBooking);
      setCurrentParsed(null);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: "ai",
        content: "Sorry, I couldn't save that booking. Please try again.",
      }]);
    } finally {
      setIsConfirming(false);
    }
  };

  const handleStartOver = () => {
    setCurrentParsed(null);
    setMessages([{
      role: "ai",
      content: "Sure! Tell me about the next booking.",
    }]);
    setShowClarification(false);
    setClarificationText("");
  };

  const handleAddAnother = () => {
    setSuccessBooking(null);
    setCurrentParsed(null);
    setShowClarification(false);
    setClarificationText("");
    setMessages([{
      role: "ai",
      content: "Great! Tell me about the next booking.",
    }]);
  };

  const handleViewCalendar = () => {
    onClose();
    window.location.href = "/dashboard/bookings";
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop (mobile) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 md:hidden"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 280, damping: 30 }}
            className={cn(
              "fixed right-0 top-0 h-full z-50 flex flex-col bg-white shadow-2xl",
              "w-full md:w-[420px]"
            )}
          >
            {/* Header */}
            <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="bg-blue-600 p-1.5 rounded-lg">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-extrabold text-sm">AI Booking Assistant</div>
                  <div className="text-slate-400 text-xs">Just tell me about the job</div>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Input Mode Tabs */}
            <div className="border-b border-slate-200 px-4 py-2 flex gap-1 shrink-0 bg-slate-50">
              {[
                { key: "type", label: "⌨ Type it" },
                ...(voiceSupported ? [{ key: "voice", label: "🎤 Voice" }] : []),
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setInputMode(tab.key as "type" | "voice")}
                  className={cn(
                    "px-4 py-1.5 rounded-xl text-sm font-bold transition-all",
                    inputMode === tab.key
                      ? "bg-slate-900 text-white"
                      : "text-slate-500 hover:bg-slate-200"
                  )}
                >
                  {tab.label}
                </button>
              ))}
              {!voiceSupported && (
                <span className="text-xs text-slate-400 self-center ml-2">Voice not supported — try Chrome</span>
              )}
            </div>

            {/* Success State or Chat */}
            {successBooking ? (
              <SuccessState
                booking={successBooking}
                onViewCalendar={handleViewCalendar}
                onAddAnother={handleAddAnother}
              />
            ) : (
              <>
                {/* Chat area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                  {messages.map((msg, i) => (
                    <div key={i} className={cn("flex gap-3", msg.role === "user" ? "flex-row-reverse" : "flex-row")}>
                      {/* Avatar */}
                      <div className={cn(
                        "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5",
                        msg.role === "ai" ? "bg-blue-600" : "bg-slate-800"
                      )}>
                        {msg.role === "ai" ? <Bot className="w-4 h-4 text-white" /> : <User className="w-4 h-4 text-white" />}
                      </div>

                      {/* Bubble */}
                      <div className={cn(
                        "max-w-[80%] space-y-3",
                        msg.role === "user" ? "items-end" : "items-start"
                      )}>
                        <div className={cn(
                          "rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap shadow-sm",
                          msg.role === "user"
                            ? "bg-slate-800 text-white rounded-tr-none"
                            : "bg-white border border-slate-200 text-slate-700 rounded-tl-none"
                        )}>
                          {msg.content}
                        </div>

                        {/* Booking card inside AI message */}
                        {msg.parsed && msg.role === "ai" && (
                          <BookingCard
                            parsed={msg.parsed}
                            onUpdate={updated => {
                              setCurrentParsed(updated);
                              setMessages(prev => prev.map((m, idx) =>
                                idx === i ? { ...m, parsed: updated } : m
                              ));
                            }}
                          />
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Typing indicator */}
                  {isProcessing && <TypingIndicator />}

                  {/* Clarification box */}
                  {showClarification && currentParsed?.clarification_needed && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-amber-50 border border-amber-200 rounded-2xl p-4"
                    >
                      <div className="text-sm font-bold text-amber-800 mb-3">
                        ❓ {currentParsed.clarification_needed}
                      </div>
                      <div className="flex gap-2">
                        <input
                          value={clarificationText}
                          onChange={e => setClarificationText(e.target.value)}
                          onKeyDown={e => e.key === "Enter" && handleClarificationAnswer()}
                          placeholder="Type your answer..."
                          className="flex-1 text-sm bg-white border border-amber-300 rounded-xl px-3 py-2 outline-none focus:border-amber-500"
                        />
                        <button
                          onClick={handleClarificationAnswer}
                          className="bg-amber-500 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-amber-600 transition-colors"
                        >
                          Answer
                        </button>
                      </div>
                    </motion.div>
                  )}

                  <div ref={chatEndRef} />
                </div>

                {/* Action buttons (shown when parsed booking is ready) */}
                {currentParsed && !isProcessing && (
                  <div className="px-4 py-3 border-t border-slate-200 space-y-2 shrink-0 bg-white">
                    <button
                      onClick={handleConfirm}
                      disabled={isConfirming}
                      className="w-full bg-slate-900 text-white py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-800 transition-all disabled:opacity-60"
                    >
                      {isConfirming ? (
                        <span className="flex gap-1">
                          {[0,1,2].map(i => <span key={i} className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />)}
                        </span>
                      ) : (
                        <CheckCircle className="w-4 h-4" />
                      )}
                      Confirm & Add Booking
                    </button>
                    <button
                      onClick={handleStartOver}
                      className="w-full text-slate-500 text-sm font-semibold py-2 hover:text-red-500 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Start Over
                    </button>
                  </div>
                )}

                {/* Voice mode */}
                {inputMode === "voice" ? (
                  <div className="px-4 py-6 border-t border-slate-200 bg-white shrink-0 flex flex-col items-center gap-4">
                    <button
                      onClick={isListening ? stopListening : startListening}
                      className={cn(
                        "relative w-20 h-20 rounded-full flex items-center justify-center transition-all",
                        isListening
                          ? "bg-red-500 shadow-lg shadow-red-500/40"
                          : "bg-slate-900 shadow-lg shadow-slate-900/30 hover:bg-slate-700"
                      )}
                    >
                      {isListening && (
                        <motion.div
                          animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                          className="absolute inset-0 rounded-full bg-red-400"
                        />
                      )}
                      {isListening
                        ? <MicOff className="w-8 h-8 text-white relative z-10" />
                        : <Mic className="w-8 h-8 text-white relative z-10" />
                      }
                    </button>
                    {isListening ? (
                      <div className="text-center">
                        <div className="text-sm font-bold text-red-600">Listening...</div>
                        {interimTranscript && (
                          <div className="text-sm text-slate-500 mt-1 italic">{interimTranscript}</div>
                        )}
                      </div>
                    ) : (
                      <div className="text-sm text-slate-500 font-medium">Tap to speak</div>
                    )}
                    {inputText && (
                      <div className="w-full bg-slate-50 rounded-xl p-3 text-sm text-slate-700">
                        <div className="text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">Transcript</div>
                        {inputText}
                      </div>
                    )}
                    {inputText && (
                      <button
                        onClick={handleSend}
                        className="w-full bg-slate-900 text-white py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2"
                      >
                        <Send className="w-4 h-4" />
                        Process this booking
                      </button>
                    )}
                  </div>
                ) : (
                  /* Type mode input */
                  <div className="border-t border-slate-200 bg-white shrink-0">
                    {/* Quick chips */}
                    <div className="px-3 pt-3 pb-1 flex gap-2 overflow-x-auto no-scrollbar">
                      {QUICK_CHIPS.map(chip => (
                        <button
                          key={chip.label}
                          onClick={() => handleQuickChip(chip.prefix)}
                          className="shrink-0 flex items-center gap-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-full transition-colors"
                        >
                          <chip.icon className="w-3 h-3" />
                          {chip.label}
                        </button>
                      ))}
                    </div>

                    <div className="flex gap-2 p-3">
                      <textarea
                        ref={inputRef}
                        value={inputText}
                        onChange={e => setInputText(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                        placeholder='Tell me about the job… e.g. "Boiler repair for Dave, Friday 10am, 22 Oak Ave"'
                        rows={2}
                        className="flex-1 resize-none text-sm bg-slate-100 text-slate-800 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-400 leading-relaxed"
                      />
                      <button
                        onClick={handleSend}
                        disabled={!inputText.trim() || isProcessing}
                        className="self-end bg-slate-900 text-white p-3 rounded-2xl hover:bg-slate-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <Send className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Session bookings (collapsible, at the very bottom) */}
            {sessionBookings.length > 0 && !successBooking && (
              <div className="border-t border-slate-200 bg-slate-50 shrink-0">
                <button
                  onClick={() => setShowSessionList(v => !v)}
                  className="w-full flex items-center justify-between px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 transition-colors"
                >
                  <span>Added this session ({sessionBookings.length})</span>
                  {showSessionList ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
                </button>
                <AnimatePresence>
                  {showSessionList && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-3 space-y-1">
                        {sessionBookings.map((b, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs text-slate-600">
                            <CheckCircle className="w-3 h-3 text-emerald-500 shrink-0" />
                            <span className="font-semibold">{b.customerName}</span>
                            <span className="text-slate-400">— {b.jobType}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
