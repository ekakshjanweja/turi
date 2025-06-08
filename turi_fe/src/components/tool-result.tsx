import { Badge } from "@/components/ui/badge";
import {
  ArrowUp,
  Square,
  Mail,
  Bot,
  User,
  AlertCircle,
  CheckCircle2,
  Search,
  Clock,
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
import type {
  EmailSearchResult,
  EmailSummary,
  EmailReadResult,
  LabelManagerResult,
  GmailLabel,
} from "@/types/types";

interface ToolResultProps {
  content: string | object;
  toolName?: string;
}

export function ToolResult({ content, toolName }: ToolResultProps) {
  const formatContent = (content: string | object) => {
    if (typeof content === "string") {
      return content;
    }
    return JSON.stringify(content, null, 2);
  };

  const contentStr = formatContent(content);

  try {
    const parsed = typeof content === "string" ? JSON.parse(content) : content;

    if (toolName === "search_emails" && parsed) {
      if (parsed.emails && Array.isArray(parsed.emails)) {
        const searchResult = parsed as EmailSearchResult;

        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-chart-1">
              <Search className="w-4 h-4" />
              <span>Email search completed</span>
            </div>

            <div className="bg-chart-1/10 border border-chart-1/20 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-chart-1">
                  Search Query: "{searchResult.query}"
                </span>
                <Badge
                  variant="outline"
                  className="bg-chart-1/10 text-chart-1 border-chart-1/30"
                >
                  {searchResult.totalCount}{" "}
                  {searchResult.totalCount === 1 ? "email" : "emails"} found
                </Badge>
              </div>
            </div>

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
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className="text-xs bg-primary/10 text-primary"
                            >
                              #{index + 1}
                            </Badge>
                            <span className="text-xs text-muted-foreground font-mono">
                              {email.id}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-start gap-2">
                            <FileText className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-foreground text-base leading-6 break-words">
                                {email.subject || "(No subject)"}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="flex items-center gap-2">
                            <AtSign className="w-4 h-4 text-primary flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="text-xs text-muted-foreground">
                                From:
                              </p>
                              <p className="text-sm font-medium truncate">
                                {email.from}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-primary flex-shrink-0" />
                            <div>
                              <p className="text-xs text-muted-foreground">
                                Date:
                              </p>
                              <p className="text-sm font-medium">
                                {new Date(email.date).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <Mail className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No emails found matching your search</p>
              </div>
            )}
          </div>
        );
      }
    }

    if (toolName === "read_email" && parsed) {
      // Check if it's the new structured format
      if (parsed.email && parsed.messageId) {
        const emailResult = parsed as EmailReadResult;
        const email = emailResult.email;

        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-chart-1">
              <Eye className="w-4 h-4" />
              <span>Email content retrieved</span>
            </div>

            <div className="bg-background border rounded-lg p-4 space-y-4">
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="text-xs bg-primary/10 text-primary"
                >
                  <MessageSquare className="w-3 h-3 mr-1" />
                  Thread ID: {email.threadId}
                </Badge>
              </div>

              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <FileText className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-foreground text-base leading-6 break-words">
                      {email.subject || "(No subject)"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <AtSign className="w-4 h-4 text-primary flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-muted-foreground">From:</p>
                    <p className="text-sm font-medium truncate">{email.from}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <AtSign className="w-4 h-4 text-primary flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-muted-foreground">To:</p>
                    <p className="text-sm font-medium truncate">{email.to}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 md:col-span-2">
                  <Calendar className="w-4 h-4 text-primary flex-shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Date:</p>
                    <p className="text-sm font-medium">
                      {new Date(email.date).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {(email.textContent || email.htmlContent) && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary" />
                    <p className="text-sm font-medium text-primary">Content:</p>
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

              {email.attachments && email.attachments.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Paperclip className="w-4 h-4 text-primary" />
                    <p className="text-sm font-medium text-primary">
                      Attachments ({email.attachments.length}):
                    </p>
                  </div>
                  <div className="space-y-2">
                    {email.attachments.map((attachment) => (
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
                              {(attachment.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                        </div>
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

    if (
      toolName &&
      (toolName.includes("label") || toolName.includes("Label")) &&
      parsed
    ) {
      const labelResult = parsed as LabelManagerResult;

      return (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-chart-3">
            <Tag className="w-4 h-4" />
            <span>Label operation completed</span>
          </div>

          <div
            className={`${
              labelResult.success
                ? "bg-chart-1/10 border-chart-1/20"
                : "bg-destructive/10 border-destructive/20"
            } border rounded-lg p-3`}
          >
            <div className="flex items-center gap-2">
              {labelResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-chart-1" />
              ) : (
                <AlertCircle className="w-4 h-4 text-destructive" />
              )}
              <span className="text-sm font-medium">{labelResult.message}</span>
            </div>
          </div>

          {labelResult.labels && (
            <div className="space-y-4">
              <div className="bg-chart-1/10 border border-chart-1/20 rounded-lg p-3">
                <h4 className="text-sm font-semibold text-chart-1 mb-2">
                  Label Summary
                </h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <p className="font-medium text-foreground">
                      {labelResult.labels.count.total}
                    </p>
                    <p className="text-xs text-muted-foreground">Total</p>
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-foreground">
                      {labelResult.labels.count.system}
                    </p>
                    <p className="text-xs text-muted-foreground">System</p>
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-foreground">
                      {labelResult.labels.count.user}
                    </p>
                    <p className="text-xs text-muted-foreground">User</p>
                  </div>
                </div>
              </div>

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
                        className="bg-chart-4/10 border border-chart-4/20 rounded-lg p-3"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Tag className="w-4 h-4 text-chart-4" />
                            <span className="font-medium text-sm text-chart-4">
                              {label.name}
                            </span>
                          </div>
                          {label.messagesTotal !== undefined && (
                            <Badge
                              variant="outline"
                              className="bg-chart-4/10 text-chart-4 border-chart-4/30 text-xs"
                            >
                              {label.messagesTotal} msgs
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      );
    }
  } catch (error) {
    // Fall back to plain text display
  }

  return <pre className="whitespace-pre-wrap text-sm">{contentStr}</pre>;
}
