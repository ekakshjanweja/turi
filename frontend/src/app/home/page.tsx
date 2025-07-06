"use client";

import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";
import {
  Message as MessageBox,
  MessageAvatar,
  MessageContent,
} from "@/components/ui/message";
import {
  PromptInput,
  PromptInputAction,
  PromptInputActions,
  PromptInputTextarea,
} from "@/components/ui/prompt-input";
import { AudioContent, Message } from "@/lib/types";
import { ArrowUp, Clock, Square, Volume2, VolumeX } from "lucide-react";
import { useEffect, useRef, useState, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Placeholder } from "@/components/placeholder";

export default function Home() {
  // const { data: session, isPending } = auth.useSession();

  const [messages, setMessages] = useState<Message[]>([]);
  const [audio, setAudio] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isConnected, setIsConnected] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const formatTime = (timestamp?: string) => {
    if (!timestamp)
      return new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getMessageBadgeColor = (type: string) => {
    switch (type) {
      case "USER":
        return "border-blue-200 text-blue-700 bg-blue-50";
      case "AI_RESPONSE":
        return "border-green-200 text-green-700 bg-green-50";
      case "THINKING":
        return "border-yellow-200 text-yellow-700 bg-yellow-50";
      case "CONNECTED":
        return "border-purple-200 text-purple-700 bg-purple-50";
      default:
        return "border-gray-200 text-gray-700 bg-gray-50";
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Cleanup audio element on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        if (audioRef.current.src && audioRef.current.src.startsWith("blob:")) {
          URL.revokeObjectURL(audioRef.current.src);
        }
        audioRef.current = null;
      }
    };
  }, []);

  const handleSubmit = async () => {
    setIsLoading(true);

    const trimmedInput = input.trim();

    setInput("");

    await sendMessage(trimmedInput);

    setIsLoading(false);
  };

  const handleValueChange = (value: string) => {
    setInput(value);
  };

  const eventSourceRef = useRef<EventSource | null>(null);

  const playAudio = useCallback(
    async (audioContent: AudioContent) => {
      // Only play audio if audio is enabled
      if (!audio) {
        console.log("Audio playback is disabled");
        return;
      }

      // Validate audio content
      if (!audioContent?.audioData || !audioContent?.mimeType) {
        console.error("Invalid audio content:", audioContent);
        return;
      }

      try {
        // Create audio element if it doesn't exist
        if (!audioRef.current) {
          audioRef.current = new Audio();
          // Set up global error handling for the audio element
          audioRef.current.addEventListener("error", (e) => {
            console.error("Audio element error:", e);
          });
        }

        // Stop any currently playing audio and clean up previous URL
        if (audioRef.current.src && !audioRef.current.paused) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
          if (audioRef.current.src.startsWith("blob:")) {
            URL.revokeObjectURL(audioRef.current.src);
          }
        }

        // Convert base64 to binary data
        let binaryString;
        try {
          binaryString = atob(audioContent.audioData);
        } catch (decodeError) {
          console.error("Failed to decode base64 audio data:", decodeError);
          return;
        }

        // Convert binary string to Uint8Array
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        // Create blob with proper MIME type
        const audioBlob = new Blob([bytes], { type: audioContent.mimeType });
        const audioUrl = URL.createObjectURL(audioBlob);

        // Set up one-time event listeners for cleanup
        const cleanup = () => {
          URL.revokeObjectURL(audioUrl);
        };

        audioRef.current.addEventListener("ended", cleanup, { once: true });
        audioRef.current.addEventListener("error", cleanup, { once: true });

        // Set source and play
        audioRef.current.src = audioUrl;
        audioRef.current.load(); // Ensure the audio is loaded

        // Play the audio with user interaction handling
        try {
          await audioRef.current.play();
          console.log("Audio playback started successfully");
        } catch (playError) {
          console.error("Failed to play audio:", playError);
          cleanup();

          // If autoplay failed, it might be due to browser autoplay policies
          if (
            playError instanceof DOMException &&
            playError.name === "NotAllowedError"
          ) {
            console.warn(
              "Audio autoplay blocked by browser. User interaction required."
            );
          }
        }
      } catch (error) {
        console.error("Error in playAudio function:", error);
      }
    },
    [audio]
  );

  const connectToSSE = useCallback(
    (clear: boolean) => {
      eventSourceRef.current = new EventSource(
        `http://localhost:8000/agent?audio=${audio}${
          clear ? "&clear=true" : ""
        }`,
        {
          withCredentials: true,
        }
      );

      eventSourceRef.current.onopen = () => {
        console.log("SSE connection opened");
        setIsConnected(true);
      };

      eventSourceRef.current.addEventListener("message", (event) => {
        const message: Message = JSON.parse(event.data);

        if (message.type !== "AUDIO") {
          setMessages((prev) => {
            if (message.type !== "THINKING") {
              const filteredMessages = prev.filter(
                (msg) => msg.type !== "THINKING"
              );
              return [
                ...filteredMessages,
                {
                  ...message,
                  id: Date.now().toString(),
                  timestamp: new Date().toISOString(),
                },
              ];
            }
            return [
              ...prev,
              {
                ...message,
                id: Date.now().toString(),
                timestamp: new Date().toISOString(),
              },
            ];
          });
        } else {
          playAudio(message.content as AudioContent);
        }
      });

      eventSourceRef.current.onerror = (error) => {
        console.error("SSE error:", error);
        setIsConnected(false);
        eventSourceRef.current?.close();
      };
    },
    [audio, setMessages, setIsConnected, playAudio]
  );

  useEffect(() => {
    connectToSSE(true);

    return () => {
      eventSourceRef.current?.close();
    };
  }, [audio, connectToSSE]);

  const sendMessage = async (message: string) => {
    try {
      connectToSSE(false);

      const newMessage: Message = {
        type: "USER",
        content: message,
      };
      setMessages((prev) => [
        ...prev,
        {
          ...newMessage,
          id: Date.now().toString(),
          timestamp: new Date().toISOString(),
        },
      ]);

      const response = await fetch("http://localhost:8000/agent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
        credentials: "include",
      });

      if (!response.ok) {
        console.error("Failed to send message:", response.statusText);
        return;
      }

      const data = await response.json();

      console.log("Message sent successfully:", data);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // if (isPending) {
  //   return <Loader />;
  // }

  // if (!session?.user) {
  //   return (
  //     <>
  //       <p>Unauthorized</p>
  //     </>
  //   );
  // }

  return (
    <div className="flex flex-col max-w-3xl mx-auto p-4 h-full">
      <div className="flex flex-col flex-1 min-h-0">
        <div className="flex-1 border rounded-lg p-4 mb-4 overflow-y-auto space-y-4">
          {messages.length === 0 && isConnected && <Placeholder />}

          {messages.map((message, index) => (
            <MessageBox
              key={message.id || index}
              className={
                message.type === "USER" ? "justify-end" : "justify-start"
              }
            >
              {message.type !== "USER" && (
                <MessageAvatar
                  src=""
                  alt={message.type}
                  fallback={message.type === "AI_RESPONSE" ? "AI" : "S"}
                />
              )}

              <div className="flex flex-col max-w-[80%] space-y-1">
                {/* Message metadata - hide for THINKING messages */}
                {message.type !== "THINKING" && (
                  <div className="flex items-center gap-2 px-2">
                    <Badge
                      variant="outline"
                      className={`text-xs ${getMessageBadgeColor(
                        message.type
                      )}`}
                    >
                      {message.type.replace("_", " ")}
                    </Badge>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTime(message.timestamp)}
                    </span>
                  </div>
                )}

                {/* Message content */}
                <div className="bg-transparent">
                  {message.type === "AUDIO" ? (
                    <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg border border-purple-200">
                      <Volume2 className="w-4 h-4 text-purple-600" />
                      <span className="text-sm text-purple-700">
                        Audio message received and played automatically
                      </span>
                    </div>
                  ) : message.type === "THINKING" ? (
                    <div className="flex items-center justify-center p-3">
                      <Loader size="lg" variant="loading-dots" />
                    </div>
                  ) : (
                    <MessageContent
                      markdown={message.type === "AI_RESPONSE"}
                      className={
                        message.type === "USER"
                          ? "bg-primary text-primary-foreground"
                          : "bg-transparent"
                      }
                    >
                      {typeof message.content === "string"
                        ? message.content
                        : "Audio content"}
                    </MessageContent>
                  )}
                </div>
              </div>

              {message.type === "USER" && (
                <MessageAvatar src="" alt="User" fallback="U" />
              )}
            </MessageBox>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <PromptInput
          value={input}
          onValueChange={handleValueChange}
          isLoading={isLoading}
          onSubmit={handleSubmit}
          className="w-full flex-shrink-0"
        >
          <PromptInputTextarea
            placeholder="Ask me anything..."
            className="min-h-[60px]"
          />

          <PromptInputActions className="justify-end pt-4 gap-2">
            <PromptInputAction
              tooltip={audio ? "Turn audio off" : "Turn audio on"}
            >
              <Button
                variant={audio ? "default" : "outline"}
                size="icon"
                className="h-10 w-10 rounded-full"
                onClick={() => setAudio(!audio)}
              >
                {audio ? (
                  <Volume2 className="size-5" />
                ) : (
                  <VolumeX className="size-5" />
                )}
              </Button>
            </PromptInputAction>
            <PromptInputAction
              tooltip={isLoading ? "Stop generation" : "Send message"}
            >
              <Button
                variant="default"
                size="icon"
                className="h-10 w-10 rounded-full"
                onClick={handleSubmit}
                disabled={!isConnected || !input.trim() || isLoading}
              >
                {isLoading ? (
                  <Square className="size-5 fill-current" />
                ) : (
                  <ArrowUp className="size-5" />
                )}
              </Button>
            </PromptInputAction>
          </PromptInputActions>
        </PromptInput>
      </div>
    </div>
  );
}
