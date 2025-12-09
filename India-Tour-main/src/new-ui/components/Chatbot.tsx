import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, Send, X, Bot, User, Mic, Sparkles } from 'lucide-react'
import { cn } from '@/utils/cn'
import { ChatMessage } from '@/types'
import Button from './Button'
import { sendChatMessage, ChatApiMessage } from '../../services/safetyApi'

const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [suggestedActions, setSuggestedActions] = useState<string[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const recognitionRef = useRef<any>(null)

  // Removed old capabilities and quick question lists to simplify UI

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight
    }
  }, [messages])

  useEffect(() => {
    // Initialize with a single welcome message
    const welcomeMessage: ChatMessage = {
      id: 'welcome',
      type: 'assistant',
      content:
        "🇮🇳 Namaste! I'm your India Tour AI Assistant. Ask me anything about safe travel, emergencies, local information, or translations while you explore India.",
      timestamp: new Date()
    }
    setMessages([welcomeMessage])
  }, [])

  // Prepare browser speech recognition (if available)
  useEffect(() => {
    if (typeof window === 'undefined') return

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

    if (!SpeechRecognition) {
      recognitionRef.current = null
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = 'en-IN'
    recognition.interimResults = false
    recognition.maxAlternatives = 1

    recognition.onresult = (event: any) => {
      const transcript = event.results?.[0]?.[0]?.transcript as string | undefined
      if (transcript) {
        setMessage((prev) => (prev ? prev + ' ' + transcript : transcript))
      }
    }

    recognition.onerror = () => {
      setIsListening(false)
      setIsRecording(false)
    }

    recognition.onend = () => {
      setIsListening(false)
      setIsRecording(false)
    }

    recognitionRef.current = recognition

    return () => {
      recognition.stop()
      recognitionRef.current = null
    }
  }, [])

  const handleSendMessage = async () => {
    if (!message.trim()) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: message.trim(),
      timestamp: new Date()
    }

    // Snapshot of history to send to backend
    const historyMessages: ChatApiMessage[] = [
      {
        role: 'system',
        content:
          'You are an AI safety assistant for travellers in India. Answer clearly and helpfully about safety, emergencies, navigation and local information.'
      },
      ...messages.map((m): ChatApiMessage => ({
        role: m.type === 'user' ? 'user' : 'assistant',
        content: m.content
      })),
      {
        role: 'user',
        content: userMessage.content
      }
    ]

    setMessages((prev) => [...prev, userMessage])
    setMessage('')
    setIsTyping(true)

    try {
      const replyText = await sendChatMessage(historyMessages)

      const aiResponse: ChatMessage = {
        id: `${Date.now()}-ai`,
        type: 'assistant',
        content:
          replyText ||
          'AI assistant is not configured yet. Please set API KEY in the backend environment to enable AI responses.',
        timestamp: new Date()
      }

      setMessages((prev) => [...prev, aiResponse])
      setSuggestedActions(aiResponse.suggestedActions || [])
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: `${Date.now()}-error`,
        type: 'assistant',
        content:
          'Sorry, I was unable to contact the AI assistant service. Please try again later.',
        timestamp: new Date()
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
    }
  }

  const handleSuggestedAction = async (action: string) => {
    const actionMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: `I need help with: ${action}`,
      timestamp: new Date()
    }

    const historyMessages: ChatApiMessage[] = [
      {
        role: 'system',
        content:
          'You are an AI safety assistant for travellers in India. Answer clearly and helpfully about safety, emergencies, navigation and local information.'
      },
      ...messages.map((m): ChatApiMessage => ({
        role: m.type === 'user' ? 'user' : 'assistant',
        content: m.content
      })),
      {
        role: 'user',
        content: actionMessage.content
      }
    ]

    setMessages((prev) => [...prev, actionMessage])
    setMessage('')
    setIsTyping(true)

    try {
      const replyText = await sendChatMessage(historyMessages)

      const response: ChatMessage = {
        id: `${Date.now()}-ai`,
        type: 'assistant',
        content:
          replyText ||
          'AI assistant is not configured yet. Please set API KEY in the backend environment to enable AI responses.',
        timestamp: new Date()
      }

      setMessages((prev) => [...prev, response])
      setSuggestedActions(response.suggestedActions || [])
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: `${Date.now()}-error`,
        type: 'assistant',
        content:
          'Sorry, I was unable to contact the AI assistant service. Please try again later.',
        timestamp: new Date()
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
    }
  }

  const handleVoiceToggle = () => {
    if (isListening) {
      setIsListening(false)
      setIsRecording(false)
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      return
    }

    const recognition = recognitionRef.current
    if (!recognition) {
      // Browser does not support speech recognition
      const infoMessage: ChatMessage = {
        id: `${Date.now()}-no-voice`,
        type: 'assistant',
        content:
          'Voice input is not supported in this browser. Please type your question instead.',
        timestamp: new Date()
      }
      setMessages((prev) => [...prev, infoMessage])
      return
    }

    setIsListening(true)
    setIsRecording(true)
    recognition.start()
  }

  const renderMessage = (msg: ChatMessage) => {
    const isUser = msg.type === 'user'

    return (
      <motion.div
        key={msg.id}
        initial={{ opacity: 0, y: 20, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className={cn(
          'flex gap-3 mb-0',
          isUser ? 'flex-row-reverse' : 'flex-row'
        )}
      >
        {/* Avatar */}
        <div className={cn(
          'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0',
          isUser
            ? 'bg-primary-saffron text-white'
            : 'glass-morphism text-primary-royal-blue'
        )}>
          {isUser ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
        </div>

        {/* Message Bubble */}
        <div className={cn(
          'max-w-xs lg:max-w-md px-3 py-1.5 rounded-2xl',
          isUser
            ? 'bg-primary-saffron text-white rounded-br-2xl rounded-bl-xl'
            : 'glass-card-intense text-gray-800 rounded-bl-2xl rounded-br-xl'
        )}>
          <div className="text-sm leading-relaxed whitespace-pre-wrap">
            {msg.content}
          </div>

          {/* Timestamp */}
          <div className={cn(
            'text-[10px] opacity-60 mt-0',
            isUser ? 'text-right' : 'text-left'
          )}>
            {msg.timestamp.toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit'
            })}
          </div>
        </div>
      </motion.div>
    )
  }

  const renderSuggestedActions = () => {
    if (suggestedActions.length === 0) return null

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap gap-2 p-4 border-t border-gray-200"
      >
        {suggestedActions.map((action, index) => (
          <motion.button
            key={action}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => handleSuggestedAction(action)}
            className="glass-morphism px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-primary-saffron/20 transition-colors duration-200 flex items-center space-x-2"
          >
            <Sparkles className="w-3 h-3 text-accent-electric-yellow" />
            <span>{action}</span>
          </motion.button>
        ))}
      </motion.div>
    )
  }

  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className={cn(
          'fixed bottom-6 right-6 z-50 flex items-center gap-2 px-3.5 py-2 rounded-full',
          'bg-white/40 backdrop-blur-2xl shadow-lg shadow-black/25 border border-white/40 text-gray-900',
          'hover:shadow-xl hover:-translate-y-0.5',
          'transition-all duration-200'
        )}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
      >
        <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-white/90 text-gray-900">
          <MessageCircle className="w-4 h-4" />
          <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-accent-electric-yellow rounded-full animate-pulse" />
        </div>
        <div className="hidden sm:flex flex-col items-start leading-tight">
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-900">AI Assistant</span>
          <span className="text-[10px] text-gray-900/80">Ask anything while you travel</span>
        </div>
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop on small screens */}
            <motion.div
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm sm:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />

            {/* Chat Container as right-hand sidebar */}
            <motion.div
              className="fixed top-20 right-0 bottom-4 z-50 w-full sm:w-96 flex flex-col overflow-hidden border-l border-white/40 bg-white/70 backdrop-blur-2xl shadow-lg shadow-black/10 rounded-tl-2xl rounded-bl-2xl"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 260, damping: 25 }}
            >
              {/* Header */}
              <div className="px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-primary-royal-blue/5 via-white to-primary-saffron/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-white shadow-md shadow-primary-royal-blue/30 flex items-center justify-center">
                      <Bot className="w-5 h-5 text-primary-royal-blue" />
                    </div>
                    <div className="flex flex-col">
                      <h3 className="text-sm font-semibold text-gray-900 tracking-wide">
                        AI Assistant
                      </h3>
                      <span className="text-[11px] text-gray-500">For India Tour travellers</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="small"
                    icon={<X className="w-4 h-4" />}
                    onClick={() => setIsOpen(false)}
                  >
                    <span className="sr-only">Close chat</span>
                  </Button>
                </div>
              </div>

              {/* Messages Area */}
              <div
                ref={messagesEndRef}
                className="flex-1 overflow-y-auto p-4 space-y-0 bg-gradient-to-b from-gray-50/60 via-white to-gray-50/80"
              >
                {messages.map(renderMessage)}

                {/* Typing Indicator */}
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex gap-3"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary-royal-blue text-white flex items-center justify-center">
                      <Bot className="w-5 h-5" />
                    </div>
                    <div className="glass-card-intense max-w-xs p-4 rounded-2xl">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      </div>
                    </div>
                  </motion.div>
                )}

                {suggestedActions && renderSuggestedActions()}
              </div>

              {/* Input Area */}
              <div className="p-4 border-t border-gray-200 bg-white/90 backdrop-blur-sm">
                {/* Message Input */}
                <div className="flex items-center space-x-3">
                  <textarea
                    ref={inputRef}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage()
                      }
                    }}
                    placeholder=""
                    className="flex-1 resize-none bg-white border border-gray-300 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-primary-royal-blue focus:ring-2 focus:ring-primary-royal-blue/50 transition-all duration-200 shadow-md shadow-black/5"
                    rows={2}
                  />

                  {/* Voice Input */}
                  <Button
                    variant="ghost"
                    size="small"
                    icon={<Mic className="w-4 h-4 leading-none -translate-y-[1px]" />}
                    onClick={handleVoiceToggle}
                    className={cn(
                      'transition-all duration-200 w-8 h-8 rounded-full flex items-center justify-center border bg-white',
                      isRecording
                        ? 'border-red-400 text-red-500 shadow-sm'
                        : 'border-gray-200 text-gray-600 hover:text-primary-saffron'
                    )}
                  >
                    <span className="sr-only">Toggle voice input</span>
                  </Button>

                  {/* Send Button */}
                  <Button
                    variant="primary"
                    size="small"
                    icon={<Send className="w-4 h-4" />}
                    onClick={handleSendMessage}
                    disabled={!message.trim()}
                    className="transition-all duration-200 p-0 w-8 h-8 rounded-full flex items-center justify-center bg-white text-black border border-gray-200 shadow-sm hover:bg-gray-100"
                  >
                    <span className="sr-only">Send message</span>
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

export default Chatbot