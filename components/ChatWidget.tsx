"use client";

import React, { useState, useRef, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { MessageSquare, X, Send, Sparkles, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");

  const { messages, status, sendMessage, setMessages, error } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
    }),
  });

  // Inicializar mensajes de bienvenida en el cliente
  useEffect(() => {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        parts: [
          {
            type: "text",
            text: "¡Hola! Soy Antigravity, tu asesora pedagógica de KineKids. 🌱 ¿Cómo puedo ayudarte hoy a estructurar un espacio que fomente el movimiento autónomo de tu pequeño?"
          }
        ]
      }
    ]);
  }, [setMessages]);

  const isLoading = status === "streaming" || status === "submitted";
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll al recibir mensajes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    const currentInput = input;
    setInput("");
    try {
      await sendMessage({
        role: "user",
        parts: [
          {
            type: "text",
            text: currentInput
          }
        ]
      });
    } catch (err) {
      console.error("Error al enviar mensaje:", err);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Toggle Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center justify-center w-14 h-14 bg-brand-charcoal text-brand-sand-light rounded-full shadow-2xl hover:bg-brand-clay transition-all"
        aria-label="Abrir asesor de IA"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="w-6 h-6 stroke-[1.5]" />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative"
            >
              <MessageSquare className="w-6 h-6 stroke-[1.5]" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-brand-clay rounded-full animate-ping" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Floating Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="absolute bottom-20 right-0 w-80 sm:w-96 h-[500px] bg-brand-sand-light border border-brand-sand-dark shadow-2xl rounded-3xl overflow-hidden flex flex-col"
          >
            {/* Header Chat */}
            <div className="h-16 px-5 bg-brand-charcoal text-brand-sand-light flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 bg-brand-clay rounded-full">
                  <Sparkles className="w-3.5 h-3.5 text-brand-sand-light animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-bold tracking-wide">Asesora Antigravity</h3>
                  <p className="text-[9px] uppercase tracking-widest text-brand-sage font-medium -mt-0.5">
                    pedagogical advisor
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-full hover:bg-brand-charcoal/50 text-brand-sand-light/70 hover:text-brand-sand-light transition-all"
                aria-label="Cerrar chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chat History Panel */}
            <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-brand-sand-light/50">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl p-3.5 text-sm leading-relaxed ${
                      message.role === "user"
                        ? "bg-brand-clay text-brand-sand-light rounded-tr-none"
                        : "bg-brand-sand-dark text-brand-charcoal rounded-tl-none"
                    }`}
                  >
                    {message.parts?.map((part, index) => {
                      if (part.type === "text") {
                        return <span key={index}>{part.text}</span>;
                      }
                      return null;
                    }) || (message as any).content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-brand-sand-dark text-brand-charcoal rounded-2xl rounded-tl-none p-3.5 text-xs flex items-center space-x-1.5">
                    <span className="w-1.5 h-1.5 bg-brand-charcoal/40 rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-brand-charcoal/40 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 bg-brand-charcoal/40 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
              {error && (
                <div className="flex items-center space-x-1.5 p-2 bg-red-50 text-red-700 rounded-xl text-xs">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>Error al conectar con la IA. Asegúrate de configurar la API Key de Gemini.</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form Panel */}
            <form
              onSubmit={handleSubmit}
              className="h-16 px-4 border-t border-brand-sand-dark bg-brand-sand-light flex items-center space-x-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Escribe tu consulta pedagógica..."
                className="flex-grow bg-brand-sand-dark text-brand-charcoal text-xs px-4 py-2.5 rounded-xl border border-brand-sand-dark/60 focus:outline-none focus:border-brand-clay focus:bg-brand-sand-light placeholder-brand-charcoal/40"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="p-2.5 bg-brand-charcoal hover:bg-brand-clay text-brand-sand-light rounded-xl transition-all disabled:opacity-40 disabled:hover:bg-brand-charcoal"
                aria-label="Enviar mensaje"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
