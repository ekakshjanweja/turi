"use client";

import { useEffect, useState, FormEvent, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loading } from "@/components/loading";
import { Unauthorized } from "@/components/unauthorized";
import { auth } from "@/lib/auth";
import type {
  Message,
  WebSocketMessage,
  EmailSearchResult,
  EmailSummary,
  EmailReadResult,
  LabelManagerResult,
  GmailLabel,
} from "@/types/websocket";
import {
  Send,
  Mail,
  Bot,
  User,
  AlertCircle,
  CheckCircle2,
  Wifi,
  WifiOff,
  Search,
  Clock,
  Database,
  Calendar,
  AtSign,
  FileText,
  Paperclip,
  Eye,
  MessageSquare,
  Tag,
  Tags,
  Folder,
  FolderOpen,
} from "lucide-react";

const EmailsPage = () => {
  const { data: session, isPending } = auth.useSession();
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Ensure this runs only in the client
    if (typeof window === "undefined") return;

    // Determine WebSocket protocol based on window.location.protocol
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    // Assuming backend is on localhost:8000 for local dev
    // For production, you'll need to use your actual backend host
    const host =
      window.location.hostname === "localhost"
        ? "localhost:8000"
        : window.location.host;
    const wsUrl = `${protocol}//${host}/ws`;

    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("WebSocket connected");
      setIsConnected(true);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          type: "SYSTEM",
          content: "Connected to Email Agent. You can now search your emails!",
          timestamp: new Date(),
        },
      ]);
    };

    ws.onmessage = (event) => {
      console.log("Message from server: ", event.data);
      setIsLoading(false);
      try {
        const parsedMessage: WebSocketMessage = JSON.parse(
          event.data as string
        );

        if (
          parsedMessage.type === "AI_RESPONSE" ||
          parsedMessage.type === "TOOL_RESULT" ||
          parsedMessage.type === "USER_INPUT"
        ) {
          const content =
            typeof parsedMessage.content === "string"
              ? parsedMessage.content
              : JSON.stringify(parsedMessage.content, null, 2);

          const message: Message = {
            id: Date.now().toString(),
            type: parsedMessage.type,
            content: content,
            timestamp: parsedMessage.timestamp
              ? new Date(parsedMessage.timestamp)
              : new Date(),
            toolName: parsedMessage.toolName,
          };

          // Only add USER_INPUT if not already handled optimistically
          if (parsedMessage.type !== "USER_INPUT") {
            setMessages((prev) => [...prev, message]);
          }
        } else {
          // Handle unknown message types as SYSTEM messages
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now().toString(),
              type: "SYSTEM",
              content:
                typeof parsedMessage.content === "string"
                  ? parsedMessage.content
                  : event.data,
              timestamp: new Date(),
            },
          ]);
        }
      } catch (error) {
        // Handle malformed JSON as system message
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            type: "SYSTEM",
            content: event.data,
            timestamp: new Date(),
          },
        ]);
      }
    };

    ws.onclose = (event) => {
      console.log("WebSocket disconnected", event.reason);
      setIsConnected(false);
      setIsLoading(false);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          type: "SYSTEM",
          content: `Disconnected from server. ${
            event.reason || "Connection lost"
          }`,
          timestamp: new Date(),
        },
      ]);
    };

    ws.onerror = (error) => {
      console.error("WebSocket error: ", error);
      setIsLoading(false);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          type: "SYSTEM",
          content: "Connection error occurred.",
          timestamp: new Date(),
        },
      ]);
    };

    setSocket(ws);

    return () => {
      ws.close();
    };
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (input.trim() && socket && socket.readyState === WebSocket.OPEN) {
      const messageToSend: WebSocketMessage = {
        type: "USER_INPUT",
        content: input,
        timestamp: new Date().toISOString(),
      };

      // Add user message optimistically
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          type: "USER_INPUT",
          content: input,
          timestamp: new Date(),
        },
      ]);

      setIsLoading(true);
      socket.send(JSON.stringify(messageToSend));
      setInput("");
    } else if (!isConnected) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          type: "SYSTEM",
          content: "Not connected to server. Please wait for connection.",
          timestamp: new Date(),
        },
      ]);
    }
  };

  const getMessageIcon = (type: string) => {
    switch (type) {
      case "USER_INPUT":
        return <User className="w-4 h-4" />;
      case "AI_RESPONSE":
        return <Bot className="w-4 h-4" />;
      case "TOOL_RESULT":
        return <Database className="w-4 h-4" />;
      case "SYSTEM":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getMessageBadgeColor = (type: string) => {
    switch (type) {
      case "USER_INPUT":
        return "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20";
      case "AI_RESPONSE":
        return "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20";
      case "TOOL_RESULT":
        return "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20";
      case "SYSTEM":
        return "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20";
      default:
        return "bg-muted/50 text-muted-foreground border-border";
    }
  };

  const formatContent = (content: string | object) => {
    if (typeof content === "string") {
      return content;
    }
    return JSON.stringify(content, null, 2);
  };

  const renderToolResult = (content: string | object, toolName?: string) => {
    const contentStr = formatContent(content);

    // Try to parse as structured data for better display
    try {
      const parsed =
        typeof content === "string" ? JSON.parse(content) : content;

      if (toolName === "search_emails" && parsed) {
        // Check if it's the new structured format
        if (parsed.emails && Array.isArray(parsed.emails)) {
          const searchResult = parsed as EmailSearchResult;

          return (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium text-green-700 dark:text-green-400">
                <Search className="w-4 h-4" />
                <span>Email search completed</span>
              </div>

              {/* Search Summary */}
              <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-green-800 dark:text-green-200">
                    Search Query: "{searchResult.query}"
                  </span>
                  <Badge
                    variant="outline"
                    className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700"
                  >
                    {searchResult.totalCount}{" "}
                    {searchResult.totalCount === 1 ? "email" : "emails"} found
                  </Badge>
                </div>
              </div>

              {/* Email Results */}
              {searchResult.emails.length > 0 ? (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email Results
                  </h4>
                  <div className="space-y-2">
                    {searchResult.emails.map((email, index) => (
                      <div
                        key={email.id}
                        className="bg-background border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                      >
                        <div className="space-y-2">
                          {/* Subject */}
                          <div className="flex items-start gap-2">
                            <FileText className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-foreground text-sm leading-5 break-words">
                                {email.subject || "(No subject)"}
                              </p>
                            </div>
                          </div>

                          {/* From */}
                          <div className="flex items-center gap-2">
                            <AtSign className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            <p className="text-sm text-muted-foreground truncate">
                              {email.from}
                            </p>
                          </div>

                          {/* Date */}
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            <p className="text-xs text-muted-foreground">
                              {new Date(email.date).toLocaleString(undefined, {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>

                          {/* Email ID for reference */}
                          <div className="pt-1 border-t border-muted">
                            <p className="text-xs font-mono text-muted-foreground">
                              ID: {email.id}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <Mail className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No emails found for this search</p>
                </div>
              )}
            </div>
          );
        }

        // Fallback for old string array format
        return (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-green-700 dark:text-green-400">
              <Search className="w-4 h-4" />
              <span>Email search completed</span>
            </div>
            <div className="bg-muted/30 rounded-md p-4 space-y-2">
              <div className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                <Database className="w-3 h-3" />
                Raw search results:
              </div>
              <div className="font-mono text-sm whitespace-pre-wrap max-h-64 overflow-y-auto">
                {contentStr}
              </div>
            </div>
          </div>
        );
      }

      if (toolName === "read_email" && parsed) {
        // Check if it's the new structured format
        if (parsed.email && parsed.messageId) {
          const readResult = parsed as EmailReadResult;
          const email = readResult.email;

          return (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium text-blue-700 dark:text-blue-400">
                <Eye className="w-4 h-4" />
                <span>Email details retrieved</span>
              </div>

              {/* Email Details */}
              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 space-y-4">
                {/* Header Info */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    Email ID: {email.id}
                  </span>
                  <Badge
                    variant="outline"
                    className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700"
                  >
                    <MessageSquare className="w-3 h-3 mr-1" />
                    Thread ID: {email.threadId}
                  </Badge>
                </div>

                {/* Subject */}
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-foreground text-base leading-6 break-words">
                        {email.subject || "(No subject)"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* From/To/Date */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-center gap-2">
                    <AtSign className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-muted-foreground">From:</p>
                      <p className="text-sm font-medium truncate">
                        {email.from}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <AtSign className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-muted-foreground">To:</p>
                      <p className="text-sm font-medium truncate">{email.to}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 md:col-span-2">
                    <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Date:</p>
                      <p className="text-sm font-medium">
                        {new Date(email.date).toLocaleString(undefined, {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Content */}
                {(email.textContent || email.htmlContent) && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                        Content:
                      </p>
                    </div>
                    <div className="bg-background border rounded-md p-3 max-h-64 overflow-y-auto">
                      <div className="whitespace-pre-wrap text-sm text-foreground">
                        {email.textContent || (
                          <>
                            <div className="text-xs text-muted-foreground mb-2">
                              [HTML Content - Plain text not available]
                            </div>
                            <div
                              className="prose prose-sm max-w-none"
                              dangerouslySetInnerHTML={{
                                __html: email.htmlContent || "",
                              }}
                            />
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Attachments */}
                {email.attachments && email.attachments.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Paperclip className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                        Attachments ({email.attachments.length}):
                      </p>
                    </div>
                    <div className="space-y-2">
                      {email.attachments.map((attachment, index) => (
                        <div
                          key={attachment.id}
                          className="bg-background border rounded-md p-3 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <Paperclip className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">
                                {attachment.filename}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {attachment.mimeType} •{" "}
                                {Math.round(attachment.size / 1024)} KB
                              </p>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            ID: {attachment.id}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        }
      }

      if (toolName === "list_email_labels" && parsed) {
        // Check if it's the structured label result format
        if (parsed.success !== undefined && parsed.labels) {
          const labelResult = parsed as LabelManagerResult;

          return (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium text-purple-700 dark:text-purple-400">
                <Tags className="w-4 h-4" />
                <span>Gmail labels retrieved</span>
              </div>

              {/* Status Summary */}
              <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-purple-800 dark:text-purple-200">
                    {labelResult.message}
                  </span>
                  <Badge
                    variant="outline"
                    className="bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-700"
                  >
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    {labelResult.success ? "Success" : "Failed"}
                  </Badge>
                </div>
              </div>

              {/* Labels Display */}
              {labelResult.labels && (
                <div className="space-y-4">
                  {/* Summary Stats */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-background border rounded-lg p-3 text-center">
                      <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                        {labelResult.labels.count.total}
                      </div>
                      <div className="text-xs text-muted-foreground">Total</div>
                    </div>
                    <div className="bg-background border rounded-lg p-3 text-center">
                      <div className="text-lg font-semibold text-green-600 dark:text-green-400">
                        {labelResult.labels.count.system}
                      </div>
                      <div className="text-xs text-muted-foreground">System</div>
                    </div>
                    <div className="bg-background border rounded-lg p-3 text-center">
                      <div className="text-lg font-semibold text-orange-600 dark:text-orange-400">
                        {labelResult.labels.count.user}
                      </div>
                      <div className="text-xs text-muted-foreground">User</div>
                    </div>
                  </div>

                  {/* System Labels */}
                  {labelResult.labels.system.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                        <Folder className="w-4 h-4" />
                        System Labels ({labelResult.labels.system.length})
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {labelResult.labels.system.map((label: GmailLabel) => (
                          <div
                            key={label.id}
                            className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Tag className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                <span className="font-medium text-sm text-blue-800 dark:text-blue-200">
                                  {label.name}
                                </span>
                              </div>
                              {label.messagesTotal !== undefined && (
                                <Badge
                                  variant="outline"
                                  className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700 text-xs"
                                >
                                  {label.messagesTotal} msgs
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs font-mono text-blue-600 dark:text-blue-400 mt-1">
                              ID: {label.id}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* User Labels */}
                  {labelResult.labels.user.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                        <FolderOpen className="w-4 h-4" />
                        User Labels ({labelResult.labels.user.length})
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {labelResult.labels.user.map((label: GmailLabel) => (
                          <div
                            key={label.id}
                            className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg p-3"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Tag className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                                <span className="font-medium text-sm text-orange-800 dark:text-orange-200">
                                  {label.name}
                                </span>
                              </div>
                              {label.messagesTotal !== undefined && (
                                <Badge
                                  variant="outline"
                                  className="bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 border-orange-300 dark:border-orange-700 text-xs"
                                >
                                  {label.messagesTotal} msgs
                                </Badge>
                              )}
                            </div>
                            <div className="mt-2 space-y-1">
                              <p className="text-xs font-mono text-orange-600 dark:text-orange-400">
                                ID: {label.id}
                              </p>
                              {label.messageListVisibility && (
                                <p className="text-xs text-orange-600 dark:text-orange-400">
                                  Visibility: {label.messageListVisibility}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* No user labels message */}
                  {labelResult.labels.user.length === 0 && (
                    <div className="text-center py-6 text-muted-foreground">
                      <FolderOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No custom labels found</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        }
      }

      // Handle other label-related tools (create, update, delete, get_or_create)
      if (toolName && (toolName.includes("label") || toolName.includes("Label")) && parsed) {
        const labelResult = parsed as LabelManagerResult;
        
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-purple-700 dark:text-purple-400">
              <Tag className="w-4 h-4" />
              <span>Label operation completed</span>
            </div>

            {/* Status */}
            <div className={`${
              labelResult.success 
                ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800" 
                : "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800"
            } border rounded-lg p-3`}>
              <div className="flex items-center gap-2">
                {labelResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                )}
                <span className={`text-sm font-medium ${
                  labelResult.success 
                    ? "text-green-800 dark:text-green-200" 
                    : "text-red-800 dark:text-red-200"
                }`}>
                  {labelResult.message}
                </span>
              </div>
            </div>

            {/* Label Details (if available) */}
            {labelResult.label && (
              <div className="bg-background border rounded-lg p-4">
                <h4 className="text-sm font-medium text-foreground flex items-center gap-2 mb-3">
                  <Tag className="w-4 h-4" />
                  Label Details
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Name:</span>
                    <span className="text-sm font-medium">{labelResult.label.name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">ID:</span>
                    <span className="text-xs font-mono">{labelResult.label.id}</span>
                  </div>
                  {labelResult.label.type && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Type:</span>
                      <Badge variant="outline" className="text-xs">
                        {labelResult.label.type}
                      </Badge>
                    </div>
                  )}
                  {labelResult.label.messageListVisibility && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Visibility:</span>
                      <span className="text-xs">{labelResult.label.messageListVisibility}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      }
    } catch (error) {
      // Fall back to regular display
      console.warn("Failed to parse tool result as structured data:", error);
    }

    return (
      <div className="space-y-2">
        {toolName && (
          <div className="flex items-center gap-2 text-sm font-medium text-purple-700 dark:text-purple-400">
            <Database className="w-4 h-4" />
            <span>{toolName} executed</span>
          </div>
        )}
        <div className="bg-muted/30 rounded-md p-3 font-mono text-sm whitespace-pre-wrap max-h-64 overflow-y-auto">
          {contentStr}
        </div>
      </div>
    );
  };

  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Authentication checks after all hooks are called
  if (isPending) return <Loading />;
  if (!session?.user) return <Unauthorized />;

  return (
    <main className="max-w-4xl mx-auto p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Mail className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Email Agent</h1>
              <p className="text-muted-foreground">
                AI-powered email search and assistance
              </p>
            </div>
          </div>

          {/* Connection Status */}
          <div className="flex items-center gap-2">
            {isConnected ? (
              <Wifi className="w-4 h-4 text-green-500" />
            ) : (
              <WifiOff className="w-4 h-4 text-muted-foreground" />
            )}
            <Badge
              variant="outline"
              className={`${
                isConnected
                  ? "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20"
                  : "bg-muted/50 text-muted-foreground border-border"
              }`}
            >
              {isConnected ? "Connected" : "Disconnected"}
            </Badge>
          </div>
        </div>

        {/* Chat Window */}
        <div className="bg-card border rounded-lg flex flex-col h-[600px]">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 && isConnected && (
              <div className="text-center py-12">
                <div className="p-3 bg-muted/50 rounded-full w-fit mx-auto mb-4">
                  <Bot className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold mb-2">
                  Hello! I'm your email assistant.
                </h3>
                <p className="text-muted-foreground mb-4">
                  Ask me anything about your emails.
                </p>
                <div className="text-sm text-muted-foreground space-y-2">
                  <div className="flex items-center gap-2 mb-2">
                    <Search className="w-4 h-4" />
                    <span className="font-medium">Try these examples:</span>
                  </div>
                  <p className="font-mono bg-background px-3 py-2 rounded border">
                    "Find emails from john@example.com"
                  </p>
                  <p className="font-mono bg-background px-3 py-2 rounded border">
                    "Show me emails about project updates"
                  </p>
                  <p className="font-mono bg-background px-3 py-2 rounded border">
                    "Find unread emails from last week"
                  </p>
                </div>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.type === "USER_INPUT"
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                {message.type !== "USER_INPUT" && (
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                      {getMessageIcon(message.type)}
                    </div>
                  </div>
                )}

                <div
                  className={`max-w-[80%] rounded-lg p-4 ${
                    message.type === "USER_INPUT"
                      ? "bg-background"
                      : "bg-muted/50 border"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Badge
                      variant="outline"
                      className={`text-xs ${getMessageBadgeColor(
                        message.type
                      )}`}
                    >
                      {message.type === "TOOL_RESULT" && message.toolName
                        ? message.toolName
                        : message.type.replace("_", " ")}
                    </Badge>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTime(message.timestamp)}
                    </span>
                  </div>
                  <div className="text-sm">
                    {message.type === "TOOL_RESULT" ? (
                      renderToolResult(message.content, message.toolName)
                    ) : (
                      <div
                        className={`whitespace-pre-wrap ${
                          message.type === "USER_INPUT"
                            ? "text-foreground"
                            : "text-foreground"
                        }`}
                      >
                        {formatContent(message.content)}
                      </div>
                    )}
                  </div>
                </div>

                {message.type === "USER_INPUT" && (
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                    <Bot className="w-4 h-4 animate-pulse text-primary" />
                  </div>
                </div>
                <div className="bg-muted/50 border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge
                      variant="outline"
                      className="text-xs bg-primary/10 text-primary border-primary/20"
                    >
                      AI processing
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-primary rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-primary rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                    <span>Thinking...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <div className="border-t p-4">
            <form onSubmit={handleSubmit} className="flex gap-3">
              <Input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  isConnected
                    ? "Ask about your emails..."
                    : "Connecting to server..."
                }
                className="flex-1"
                disabled={!isConnected || isLoading}
              />
              <Button
                type="submit"
                disabled={!isConnected || !input.trim() || isLoading}
                size="sm"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
};

export default EmailsPage;
