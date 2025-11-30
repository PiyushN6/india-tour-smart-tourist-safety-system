import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageCircle,
  Send,
  Mic,
  MicOff,
  X,
  Bot,
  Shield,
  AlertTriangle,
  MapPin,
  Heart,
  Zap,
  Clock,
  User,
  Sparkles
} from 'lucide-react'
import { cn } from '@/utils/cn'
import { ChatMessage, AICapability } from '@/types'
import Button from './Button'

const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [capabilities, setCapabilities] = useState<AICapability[]>([])
  const [suggestedActions, setSuggestedActions] = useState<string[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const aiCapabilities: AICapability[] = [
    {
      name: 'Safety Analysis',
      description: 'Real-time safety score and risk assessment',
      icon: <Shield className="w-5 h-5" />,
      isAvailable: true,
      category: 'safety'
    },
    {
      name: 'Emergency Services',
      description: 'Find nearest hospitals, police, and embassies',
      icon: <AlertTriangle className="w-5 h-5" />,
      isAvailable: true,
      category: 'emergency'
    },
    {
      name: 'Navigation',
      description: 'Safe route planning and directions',
      icon: <MapPin className="w-5 h-5" />,
      isAvailable: true,
      category: 'navigation'
    },
    {
      name: 'Translation',
      description: 'Multi-language support for emergency situations',
      icon: <Heart className="w-5 h-5" />,
      isAvailable: true,
      category: 'translation'
    },
    {
      name: 'Health Info',
      description: 'Local medical facilities and health advisories',
      icon: <Zap className="w-5 h-5" />,
      isAvailable: true,
      category: 'information'
    },
    {
      name: 'Local Customs',
      description: 'Cultural etiquette and local laws',
      icon: <Clock className="w-5 h-5" />,
      isAvailable: true,
      category: 'information'
    }
  ]

  const quickQuestions = [
    'What is the current safety score in Delhi?',
    'Find nearest hospital to my location',
    'How do I say "hello" in Hindi?',
    'What are the emergency numbers in India?',
    'Is this area safe for tourists?',
    'Translate "I need help" to Hindi',
    'Recommended safe restaurants nearby'
  ]

  const emergencyPhrases = {
    hindi: [
      { phrase: 'मुझे मदद करो (Mujhe madad karo)', pronunciation: 'moo-jheh ma-da-d ka-ro' },
      { phrase: 'बचाओो, मुझे मदद चाहिए (Bachao, mujhe madad chahiye)', pronunciation: 'ba-chao, moo-jheh ma-da-d cha-hee-yay' }
    ],
    spanish: [
      { phrase: '¡Ayúdame! (Need help)', pronunciation: 'ai-yoo-da-meh' },
      { phrase: 'Llame a una ambulancia', pronunciation: 'ya-meh ah oo-na am-boo-lan-si-a' }
    ]
  }

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight
    }
  }, [messages])

  useEffect(() => {
    // Initialize with welcome message
    const welcomeMessage: ChatMessage = {
      id: 'welcome',
      type: 'assistant',
      content: '🇮🇳 नमस्ते! Hello! I\'m your AI Safety Assistant for India. How can I help you travel safely today? I can provide safety analysis, emergency services, translations, and local cultural guidance.\n\n🛡️ **Emergency?** Click the SOS button or say "emergency" for immediate assistance.',
      timestamp: new Date(),
      suggestedActions: ['Safety Analysis', 'Find Emergency Services', 'Get Translation Help', 'Local Customs Guide']
    }
    setMessages([welcomeMessage])
  }, [])

  const handleSendMessage = async () => {
    if (!message.trim()) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: message.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setMessage('')
    setIsTyping(true)

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = generateAIResponse(userMessage.content)
      setMessages(prev => [...prev, aiResponse])
      setIsTyping(false)
      setSuggestedActions(aiResponse.suggestedActions || [])
    }, 1500 + Math.random() * 1500)
  }

  const generateAIResponse = (userInput: string): ChatMessage => {
    const input = userInput.toLowerCase()

    // Safety score queries
    if (input.includes('safety') || input.includes('score') || input.includes('safe')) {
      return {
        id: Date.now().toString(),
        type: 'assistant',
        content: 'Based on current data, here\'s the safety analysis for your query:\n\n🟢 **Overall Safety Score: 87/100**\n• Security: High - Police presence is good\n• Health: Medium - Medical facilities available\n• Environment: Excellent - Clean and well-maintained\n\n📍 **Current Location Status**: Safe zone with active surveillance\n⚠️ **Recommendations**: Stay in well-lit areas, keep emergency contacts handy.',
        timestamp: new Date(),
        suggestedActions: ['View Safety Map', 'Update Emergency Contacts', 'Get Real-time Alerts']
      }
    }

    // Emergency queries
    if (input.includes('emergency') || input.includes('help') || input.includes('sos')) {
      return {
        id: Date.now().toString(),
        type: 'assistant',
        content: '🚨 **EMERGENCY MODE ACTIVATED**\n\n📞 **Immediate Actions:**\n1. Call 112 - Universal Emergency\n2. Call 100 - Police\n3. Call 108 - Ambulance\n\n📍 **Your Location**: Coordinates being shared with emergency services\n🚑 **Nearest Services**: 3 hospitals, 2 police stations within 2km\n\n⏱️ **Stay Connected**: Keeping you on the line. Help is on the way!',
        timestamp: new Date(),
        suggestedActions: ['Call Emergency Services', 'Share Location', 'Connect to Human Agent']
      }
    }

    // Translation queries
    if (input.includes('translate') || input.includes('hindi') || input.includes('say')) {
      return {
        id: Date.now().toString(),
        type: 'assistant',
        content: '🈲 **Translation Services**\n\n**Essential Hindi Phrases:**\n• मुझे मदद करो (Mujhe madad karo) - "Help me"\n• धन्यवाद (Dhanyavaad) - "Thank you"\n• क्षमा क्षमा है (Khamakha khamakha hai) - "Everything is fine"\n• मुझे खोजना है (Mujhe khojna hai) - "I am lost"\n• बहुत सुरक्षित है (Bahut surakshit hai) - "Very safe"\n\n🎵 **Audio Available**: Click the mic button to hear pronunciation',
        timestamp: new Date(),
        suggestedActions: ['Hear Pronunciation', 'More Emergency Phrases', 'Common Expressions', 'Practice Hindi']
      }
    }

    // Location queries
    if (input.includes('near') || input.includes('find') || input.includes('hospital') || input.includes('police')) {
      return {
        id: Date.now().toString(),
        type: 'assistant',
        content: '🗺️ **Nearby Services Located**\n\n🏥 **Hospitals (Within 3km):**\n• AIIMS Delhi - 1.2km - ⭐⭐⭐⭐⭐\n• Max Super Speciality - 2.1km - ⭐⭐⭐⭐\n• Fortis Escorts - 2.8km - ⭐⭐⭐⭐\n\n👮 **Police Stations:**\n• Connaught Place PS - 0.8km\n• Karol Bagh PS - 1.5km\n• Parliament Street PS - 2.3km\n\n🚑 **Ambulance Services:**\n• Response time: 8-12 minutes average\n• 108 is your emergency number',
        timestamp: new Date(),
        suggestedActions: ['Get Directions', 'Call Hospital', 'View Map', 'Save Emergency Contacts']
      }
    }

    // Default response
    return {
      id: Date.now().toString(),
      type: 'assistant',
      content: 'I understand you need assistance with your travel in India. I can help with:\n\n🛡️ **Safety Analysis** - Current location safety score\n🏥 **Emergency Services** - Nearest hospitals and police\n🈲 **Translation** - Essential phrases in local languages\n🗺️ **Navigation** - Safe routes and directions\n🏛️ **Cultural Guidance** - Local customs and etiquette\n\nCould you please specify what kind of assistance you need?',
      timestamp: new Date(),
      suggestedActions: ['Safety Analysis', 'Emergency Services', 'Translation Help', 'Cultural Guide']
    }
  }

  const handleQuickQuestion = (question: string) => {
    setMessage(question)
    setIsOpen(true)
  }

  const handleSuggestedAction = (action: string) => {
    const actionMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: `I need help with: ${action}`,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, actionMessage])
    setMessage('')
    setIsTyping(true)

    setTimeout(() => {
      const response = generateAIResponse(action)
      setMessages(prev => [...prev, response])
      setIsTyping(false)
      setSuggestedActions(response.suggestedActions || [])
    }, 1500)
  }

  const handleVoiceToggle = () => {
    if (isListening) {
      setIsListening(false)
      setIsRecording(false)
    } else {
      setIsListening(true)
      setIsRecording(true)

      // Simulate voice recording
      setTimeout(() => {
        setIsListening(false)
        setIsRecording(false)
        setMessage('Voice input: "Find emergency services near me"')
      }, 3000)
    }
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
          'flex gap-3 mb-4',
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
          'max-w-xs lg:max-w-md p-4 rounded-2xl',
          isUser
            ? 'bg-primary-saffron text-white rounded-br-2xl rounded-bl-xl'
            : 'glass-card-intense text-gray-800 rounded-bl-2xl rounded-br-xl'
        )}>
          <div className="text-sm leading-relaxed whitespace-pre-wrap">
            {msg.content}
          </div>

          {/* Timestamp */}
          <div className={cn(
            'text-xs opacity-60 mt-2',
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
          'fixed bottom-6 right-6 w-16 h-16 rounded-full z-50 shadow-glass-intense',
          'glass-card-intense text-primary-royal-blue',
          'hover:scale-110 transition-transform duration-200'
        )}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="relative">
          <MessageCircle className="w-8 h-8" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent-electric-yellow rounded-full animate-pulse" />
        </div>
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />

            {/* Chat Container */}
            <motion.div
              className="w-full sm:w-96 h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden"
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              {/* Header */}
              <div className="glass-card-intense p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Bot className="w-6 h-6 text-primary-saffron" />
                    <h3 className="text-lg font-semibold gradient-text-2025">
                      AI Safety Assistant
                    </h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="small"
                    icon={<X className="w-4 h-4" />}
                    onClick={() => setIsOpen(false)}
                  />
                </div>

                {/* Status Indicators */}
                <div className="flex items-center space-x-4 mt-2">
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-xs text-gray-600">Online</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    24/7 Safety Support
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <div
                ref={messagesEndRef}
                className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/30"
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
              <div className="glass-card p-4 border-t border-gray-200">
                {/* Quick Questions */}
                <div className="mb-3">
                  <div className="flex flex-wrap gap-2 overflow-x-auto">
                    {quickQuestions.slice(0, 3).map((question, index) => (
                      <button
                        key={index}
                        onClick={() => handleQuickQuestion(question)}
                        className="glass-morphism px-2 py-1 rounded-lg text-xs text-gray-600 hover:text-primary-saffron hover:bg-primary-saffron/10 transition-colors duration-200 whitespace-nowrap"
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Message Input */}
                <div className="flex items-end space-x-2">
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
                    placeholder="Ask about safety, emergency services, translations..."
                    className="flex-1 resize-none bg-white/80 backdrop-blur-sm border-2 border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary-saffron focus:ring-2 focus:ring-primary-saffron/50 transition-all duration-200"
                    rows={2}
                  />

                  {/* Voice Input */}
                  <Button
                    variant={isRecording ? "danger" : "ghost"}
                    size="small"
                    icon={isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    onClick={handleVoiceToggle}
                    className={cn(
                      'transition-colors duration-200',
                      isRecording ? 'bg-red-500 text-white animate-pulse' : 'hover:bg-primary-saffron/10'
                    )}
                  />

                  {/* Send Button */}
                  <Button
                    variant="primary"
                    size="small"
                    icon={<Send className="w-4 h-4" />}
                    onClick={handleSendMessage}
                    disabled={!message.trim()}
                    className="transition-all duration-200"
                  />
                </div>

                {/* Capabilities */}
                <div className="mt-3 border-t border-gray-200 pt-3">
                  <div className="grid grid-cols-3 gap-2">
                    {aiCapabilities.slice(0, 6).map((capability, index) => (
                      <motion.button
                        key={capability.name}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => handleSuggestedAction(capability.name)}
                        className="glass-morphism p-2 rounded-lg text-xs text-gray-700 hover:bg-primary-saffron/20 transition-colors duration-200 flex flex-col items-center space-y-1"
                      >
                        <div className="text-primary-royal-blue">
                          {capability.icon}
                        </div>
                        <div className="text-center">
                          <div className="font-medium text-xs">{capability.name}</div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default Chatbot