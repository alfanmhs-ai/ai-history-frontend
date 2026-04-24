'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Send, Bot, User, Mic, MicOff, Paperclip, AlertCircle, Volume2, VolumeX } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'
import { LocationCard, parseLocationsFromAIResponse } from './LocationCard'

interface Message {
  id: string
  content: string
  sender: 'user' | 'bot'
  timestamp: Date
  isError?: boolean
}

interface VoiceState {
  isRecording: boolean
  isSpeaking: boolean
  transcript: string
  audioLevel: number
}

interface ChatWindowProps {
  className?: string
}

// Antigravity API endpoint placeholder
const ANTIGRAVITY_API_URL = 'https://api.antigravity.com/v1/chat/completions'

export function ChatWindow({ className = '' }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Halo! Saya adalah asisten virtual Madiun Smart Guide. Saya siap membantu Anda menjelajahi keindahan dan keunikan kota Madiun. Apa yang ingin Anda ketahui hari ini?',
      sender: 'bot',
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [voiceState, setVoiceState] = useState<VoiceState>({
    isRecording: false,
    isSpeaking: false,
    transcript: '',
    audioLevel: 0
  })
  const [detectedLocations, setDetectedLocations] = useState<any[]>([])
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const recognitionRef = useRef<any>(null)
  const synthesisRef = useRef<SpeechSynthesisUtterance | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null)
  const animationFrameRef = useRef<number | null>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
    }
  }

  useEffect(() => {
    adjustTextareaHeight()
  }, [inputMessage])

  // Voice functionality
  const initializeSpeechRecognition = useCallback(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition()
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = 'id-ID' // Indonesian language

      recognition.onstart = () => {
        setVoiceState(prev => ({ ...prev, isRecording: true, transcript: '' }))
      }

      recognition.onresult = (event: any) => {
        let finalTranscript = ''
        let interimTranscript = ''

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' '
          } else {
            interimTranscript += transcript
          }
        }

        setVoiceState(prev => ({
          ...prev,
          transcript: finalTranscript + interimTranscript
        }))
      }

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error)
        setVoiceState(prev => ({ ...prev, isRecording: false }))
        setError('Pengenalan suara gagal. Silakan coba lagi.')
      }

      recognition.onend = () => {
        setVoiceState(prev => ({ ...prev, isRecording: false }))
      }

      recognitionRef.current = recognition
      return recognition
    }
    return null
  }, [])

  const startRecording = useCallback(async () => {
    try {
      const recognition = initializeSpeechRecognition()
      if (!recognition) {
        setError('Browser Anda tidak mendukung pengenalan suara.')
        return
      }

      // Initialize audio context for visualization
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      analyserRef.current = audioContextRef.current.createAnalyser()
      microphoneRef.current = audioContextRef.current.createMediaStreamSource(stream)
      
      microphoneRef.current.connect(analyserRef.current)
      analyserRef.current.fftSize = 256
      
      recognition.start()
      startWaveAnimation()
    } catch (error) {
      console.error('Error starting recording:', error)
      setError('Tidak dapat mengakses mikrofon. Pastikan izin mikrofon diaktifkan.')
    }
  }, [initializeSpeechRecognition])

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    stopWaveAnimation()
    
    // Clean up audio context
    if (microphoneRef.current) {
      microphoneRef.current.disconnect()
      microphoneRef.current = null
    }
    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }
  }, [])

  const startWaveAnimation = useCallback(() => {
    const updateAudioLevel = () => {
      if (analyserRef.current && voiceState.isRecording) {
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
        analyserRef.current.getByteFrequencyData(dataArray)
        
        const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length
        const normalizedLevel = Math.min(100, (average / 128) * 100)
        
        setVoiceState(prev => ({ ...prev, audioLevel: normalizedLevel }))
        animationFrameRef.current = requestAnimationFrame(updateAudioLevel)
      }
    }
    
    updateAudioLevel()
  }, [voiceState.isRecording])

  const stopWaveAnimation = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }
    setVoiceState(prev => ({ ...prev, audioLevel: 0 }))
  }, [])

  const speakText = useCallback((text: string) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel()
      
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'id-ID'
      utterance.rate = 1.0
      utterance.pitch = 1.0
      utterance.volume = 1.0
      
      utterance.onstart = () => {
        setVoiceState(prev => ({ ...prev, isSpeaking: true }))
      }
      
      utterance.onend = () => {
        setVoiceState(prev => ({ ...prev, isSpeaking: false }))
      }
      
      utterance.onerror = () => {
        setVoiceState(prev => ({ ...prev, isSpeaking: false }))
        setError('Tidak dapat memutar suara.')
      }
      
      synthesisRef.current = utterance
      window.speechSynthesis.speak(utterance)
    } else {
      setError('Browser Anda tidak mendukung sintesis suara.')
    }
  }, [])

  const stopSpeaking = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      setVoiceState(prev => ({ ...prev, isSpeaking: false }))
    }
  }, [])

  const toggleRecording = useCallback(() => {
    if (voiceState.isRecording) {
      stopRecording()
      // Use the transcript as input
      if (voiceState.transcript.trim()) {
        setInputMessage(voiceState.transcript.trim())
      }
    } else {
      startRecording()
    }
  }, [voiceState.isRecording, voiceState.transcript, startRecording, stopRecording])

  const toggleSpeaking = useCallback(() => {
    if (voiceState.isSpeaking) {
      stopSpeaking()
    } else {
      // Speak the last bot message
      const lastBotMessage = messages.filter(m => m.sender === 'bot').pop()
      if (lastBotMessage) {
        speakText(lastBotMessage.content)
      }
    }
  }, [voiceState.isSpeaking, messages, speakText, stopSpeaking])

  const sendMessageToAPI = async (message: string): Promise<string> => {
    try {
      const response = await fetch(ANTIGRAVITY_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer YOUR_ANTIGRAVITY_API_KEY', // Replace with actual API key
        },
        body: JSON.stringify({
          model: 'your-chat-model', // Replace with actual model name
          messages: [
            {
              role: 'system',
              content: 'Anda adalah asisten virtual untuk Madiun Smart Guide. Berikan informasi yang akurat dan membantu tentang tempat wisata, kuliner, dan atraksi di Madiun. Gunakan format Markdown untuk jawaban yang terstruktur.'
            },
            {
              role: 'user',
              content: message
            }
          ],
          max_tokens: 1000,
          temperature: 0.7
        })
      })

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      return data.choices[0]?.message?.content || 'Maaf, saya tidak dapat memproses permintaan Anda saat ini.'
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isTyping) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage.trim(),
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setError(null)
    setIsTyping(true)

    try {
      const botResponse = await sendMessageToAPI(userMessage.content)
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: botResponse,
        sender: 'bot',
        timestamp: new Date()
      }

      setMessages(prev => [...prev, botMessage])
      
      // Parse locations from AI response
      const locations = parseLocationsFromAIResponse(botResponse)
      setDetectedLocations(locations)
      
      // Automatically speak the AI response
      setTimeout(() => {
        speakText(botResponse)
      }, 500)
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Maaf, terjadi kesalahan saat menghubungi server. Silakan coba lagi nanti.',
        sender: 'bot',
        timestamp: new Date(),
        isError: true
      }

      setMessages(prev => [...prev, errorMessage])
      setError('Gagal mengirim pesan. Silakan coba lagi.')
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('id-ID', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const MarkdownRenderer = ({ content }: { content: string }) => (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkBreaks]}
      className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-800 prose-li:text-gray-800 prose-strong:text-gray-900 prose-code:text-gray-800 prose-pre:bg-gray-100 prose-blockquote:border-l-primary-500 prose-blockquote:text-gray-700"
      components={{
        h1: ({children}) => <h1 className="text-lg font-bold text-gray-900 mb-2">{children}</h1>,
        h2: ({children}) => <h2 className="text-base font-semibold text-gray-900 mb-2">{children}</h2>,
        h3: ({children}) => <h3 className="text-sm font-semibold text-gray-900 mb-1">{children}</h3>,
        ul: ({children}) => <ul className="list-disc list-inside space-y-1 mb-2">{children}</ul>,
        ol: ({children}) => <ol className="list-decimal list-inside space-y-1 mb-2">{children}</ol>,
        li: ({children}) => <li className="text-sm">{children}</li>,
        p: ({children}) => <p className="text-sm mb-2 leading-relaxed">{children}</p>,
        strong: ({children}) => <strong className="font-semibold text-gray-900">{children}</strong>,
        em: ({children}) => <em className="italic text-gray-800">{children}</em>,
        code: ({children}) => <code className="bg-gray-100 px-1 py-0.5 rounded text-xs text-gray-800">{children}</code>,
        pre: ({children}) => <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto mb-2">{children}</pre>,
        blockquote: ({children}) => <blockquote className="border-l-4 border-primary-500 pl-3 italic text-gray-700 mb-2">{children}</blockquote>,
        table: ({children}) => <table className="min-w-full border-collapse border border-gray-300 mb-2">{children}</table>,
        thead: ({children}) => <thead className="bg-gray-50">{children}</thead>,
        th: ({children}) => <th className="border border-gray-300 px-2 py-1 text-left text-xs font-semibold text-gray-900">{children}</th>,
        td: ({children}) => <td className="border border-gray-300 px-2 py-1 text-xs text-gray-800">{children}</td>,
        a: ({children, href}) => <a href={href} className="text-primary-600 hover:text-primary-800 underline text-xs" target="_blank" rel="noopener noreferrer">{children}</a>
      }}
    >
      {content}
    </ReactMarkdown>
  )

  return (
    <div className={`flex flex-col h-full bg-whatsapp-incoming ${className}`}>
      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto chat-scrollbar px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
            >
              <div className={`flex items-end gap-2 max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.sender === 'user' 
                    ? 'bg-primary-500 ml-2' 
                    : message.isError 
                    ? 'bg-red-500 mr-2'
                    : 'bg-gray-200 mr-2'
                }`}>
                  {message.sender === 'user' ? (
                    <User className="w-5 h-5 text-white" />
                  ) : message.isError ? (
                    <AlertCircle className="w-5 h-5 text-white" />
                  ) : (
                    <Bot className="w-5 h-5 text-gray-600" />
                  )}
                </div>

                {/* Message Content */}
                <div className="flex-1">
                  {/* Message Bubble */}
                  <div className={`chat-bubble ${
                    message.sender === 'user' 
                      ? 'chat-bubble-outgoing' 
                      : message.isError
                      ? 'bg-red-100 text-red-800 border border-red-200'
                      : 'chat-bubble-incoming'
                  }`}>
                    {message.sender === 'bot' && !message.isError ? (
                      <MarkdownRenderer content={message.content} />
                    ) : (
                      <p className="text-sm leading-relaxed">{message.content}</p>
                    )}
                  </div>
                  <p className={`text-xs text-gray-500 mt-1 px-2 ${
                    message.sender === 'user' ? 'text-right' : 'text-left'
                  }`}>
                    {formatTime(message.timestamp)}
                  </p>

                  {/* Location Cards for Bot Messages */}
                  {message.sender === 'bot' && !message.isError && detectedLocations.length > 0 && (
                    <div className="mt-4 space-y-3">
                      {detectedLocations.map((location, index) => (
                        <LocationCard
                          key={`${message.id}-location-${index}`}
                          location={location}
                          onMapsClick={() => {
                            // Track location card clicks for analytics
                            console.log(`Location card clicked: ${location.name}`)
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start animate-fade-in">
              <div className="flex items-end gap-2">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-gray-600" />
                </div>
                <div className="chat-bubble chat-bubble-incoming">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                    <span className="text-xs text-gray-500">Sedang Mengetik...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Voice Transcript Display */}
      {voiceState.isRecording && voiceState.transcript && (
        <div className="px-4 py-2 bg-blue-50 border-t border-blue-200">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <p className="text-sm text-blue-700 italic">{voiceState.transcript}</p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="px-4 py-2 bg-red-50 border-t border-red-200">
          <p className="text-sm text-red-600 text-center">{error}</p>
        </div>
      )}

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-end gap-2">
            {/* Attachment Button */}
            <button className="p-2 text-gray-500 hover:text-gray-700 transition-colors">
              <Paperclip className="w-5 h-5" />
            </button>

            {/* Voice Recording Button with Wave Animation */}
            <div className="relative">
              <button
                onClick={toggleRecording}
                className={`p-2 rounded-full transition-all ${
                  voiceState.isRecording 
                    ? 'bg-red-500 text-white hover:bg-red-600 animate-pulse' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                disabled={isTyping}
              >
                {voiceState.isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
              
              {/* Wave Animation for Recording */}
              {voiceState.isRecording && (
                <div className="absolute -top-1 -right-1 flex items-center gap-1 bg-red-500 rounded-full p-1">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="w-1 h-4 bg-white rounded-full animate-pulse"
                      style={{
                        animationDelay: `${i * 100}ms`,
                        height: `${4 + Math.random() * 8}px`,
                        opacity: 0.3 + Math.random() * 0.7
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Message Input */}
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ketik pesan Anda..."
                className="w-full px-4 py-3 pr-12 bg-gray-50 border border-gray-300 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                rows={1}
                disabled={isTyping || voiceState.isRecording}
                style={{
                  minHeight: '48px',
                  maxHeight: '120px'
                }}
              />
              
              {/* Character Count */}
              <span className="absolute right-3 bottom-3 text-xs text-gray-400">
                {inputMessage.length}/500
              </span>
            </div>

            {/* Text-to-Speech Button */}
            <button
              onClick={toggleSpeaking}
              className={`p-2 rounded-full transition-all ${
                voiceState.isSpeaking 
                  ? 'bg-green-500 text-white hover:bg-green-600 animate-pulse' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              disabled={messages.filter(m => m.sender === 'bot').length === 0}
            >
              {voiceState.isSpeaking ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>

            {/* Send Button */}
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isTyping}
              className="p-3 bg-primary-500 text-white rounded-full hover:bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2 mt-3">
            <button 
              onClick={() => setInputMessage('Rekomendasi tempat wisata di Madiun')}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
              disabled={isTyping || voiceState.isRecording || voiceState.isSpeaking}
            >
              📍 Tempat wisata
            </button>
            <button 
              onClick={() => setInputMessage('Kuliner khas Madiun yang wajib dicoba')}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
              disabled={isTyping || voiceState.isRecording || voiceState.isSpeaking}
            >
              🍜 Kuliner khas
            </button>
            <button 
              onClick={() => setInputMessage('Penginapan murah di dekat alun-alun')}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
              disabled={isTyping || voiceState.isRecording || voiceState.isSpeaking}
            >
              🏨 Penginapan
            </button>
            <button 
              onClick={() => setInputMessage('Cara ke alun-alun kota Madiun')}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
              disabled={isTyping || voiceState.isRecording || voiceState.isSpeaking}
            >
              🚌 Transportasi
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
