"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, Bot, User, X } from "lucide-react";
import { useNodeStore } from "@/lib/store/store";
import { useNodeId, Handle, Position } from "@xyflow/react";
import { useChatStore } from "@/lib/store/chatStore";
import { useCreateMessage, useDeleteMessages, useMessagesFromCache, useNotesFromCache } from "@/hooks/useCanvasQueries";
import axios from "axios";
// Removed html-react-parser import - using dangerouslySetInnerHTML instead

export default function ChatBlock() {
  const nodeId = useNodeId();
  const { deleteNode, edges, canvasId } = useNodeStore();
  const { isLoading, setIsLoading, clearNodeLoading } = useChatStore();
  const [inputValue, setInputValue] = useState("");
  
  // Get messages from TanStack Query cache
  const allMessages = useMessagesFromCache(canvasId);
  // Filter messages for this specific chat block
  const messages = allMessages.filter(msg => msg.blockId === nodeId);
  const createMessageMutation = useCreateMessage();
  const deleteMessagesMutation = useDeleteMessages();
  
  // Get all notes from cache
  const allNotes = useNotesFromCache(canvasId);
  
  // Calculate data sharing status - get note content from DB
  const connectedEdges = edges.filter(edge => edge.target === nodeId);
  const sourceNodeIds = connectedEdges.map(edge => edge.source);
  
  // Get note data for connected nodes from cache
  const connectedNotesData = sourceNodeIds.map(sourceId => {
    const note = allNotes.find(n => n.id === sourceId);
    return note?.content || '';
  });
  const hasConnectedData = connectedNotesData.some(data => data && data.trim() !== "");
  
  const dataSharingStatus = {
    connectedNodes: sourceNodeIds.length,
    hasData: hasConnectedData,
    totalEdges: connectedEdges.length
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !nodeId || !canvasId || isLoading(nodeId)) return;
    
    const userMessageContent = inputValue;
    
    // Save user message to DB
    createMessageMutation.mutate({
      canvasId,
      nodeId,
      content: userMessageContent,
      role: 'user',
    });
    
    setInputValue("");
    setIsLoading(nodeId, true);

    setTimeout(async () => {
      // Get context from all connected note blocks
      const contextData = connectedNotesData
        .filter(data => data && data.trim() !== "")
        .join("\n\n");
      
      console.log("=== DATA SHARING DEBUG ===");
      console.log("Connected edges:", connectedEdges);
      console.log("Source node IDs:", sourceNodeIds);
      console.log("Final context data length:", contextData.length);
      console.log("Context preview:", contextData.substring(0, 200) + (contextData.length > 200 ? "..." : ""));
      console.log("=== END DEBUG ===");
      
      // Prepare messages for AI API (convert to expected format)
      const formattedMessages = messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      }));
      
      // Add the current user message
      formattedMessages.push({
        role: 'user',
        content: userMessageContent,
      });
      
      try {
        const response = await axios.post("/api/chat", {
          messages: formattedMessages,
          context: contextData,
        });
        console.log("API Response:", response.data);
        
        // Save assistant response to DB
        createMessageMutation.mutate({
          canvasId,
          nodeId,
          content: response.data.response || "No response received",
          role: 'assistant',
        });
      } catch (error) {
        console.error("API Error:", error);
        
        // Enhanced error handling
        let errorMessage = "Sorry, I encountered an error. Please try again.";
        if (axios.isAxiosError(error)) {
          const status = error.response?.status;
          if (status === 401) {
            errorMessage = "API authentication failed. Please check your API key configuration.";
          } else if (status === 429) {
            errorMessage = "Rate limit exceeded. Please try again later.";
          } else if (status && status >= 500) {
            errorMessage = "Server error. Please try again later.";
          }
        }
        
        // Save error message to DB
        createMessageMutation.mutate({
          canvasId,
          nodeId,
          content: errorMessage,
          role: 'assistant',
        });
      }
      setIsLoading(nodeId, false);
    }, 1000);
  };

  const handleDeleteNode = () => {
    if (nodeId && canvasId) {
      // Delete all messages for this chat block from DB
      deleteMessagesMutation.mutate({
        canvasId,
        nodeId,
      });
      clearNodeLoading(nodeId);
      deleteNode(nodeId);
    }
  };

  return (
    <div className="relative">
      <Card className="max-w-[500px] h-full flex flex-col relative">
        {/* Top handles */}
        <Handle type="source" position={Position.Top} />
        <Handle type="target" position={Position.Bottom} />

        {/* Bottom handles */}
        {/* <Handle type="source" position={Position.Bottom} />
        <Handle type="target" position={Position.Bottom} /> */}
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Bot className="h-5 w-5" />
              AI Chat
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDeleteNode}
              className="h-6 w-6 text-muted-foreground hover:text-destructive"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          {/* Data Sharing Status Indicator */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className={`w-2 h-2 rounded-full ${dataSharingStatus.hasData ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
            <span>
              {dataSharingStatus.hasData 
                ? `${dataSharingStatus.connectedNodes} connected note(s)` 
                : dataSharingStatus.connectedNodes > 0 
                  ? `${dataSharingStatus.connectedNodes} connected but no data`
                  : 'No notes connected'}
            </span>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0">
          <ScrollArea className="flex-1 px-6">
            <div className="space-y-4 pb-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {message.role === "assistant" && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                  )}

                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                      <div 
                        className="text-sm whitespace-pre-wrap"
                        dangerouslySetInnerHTML={{ __html: message.content }}
                      />
                    <p className="text-xs opacity-70 mt-1">
                      {new Date(message.createdAt).toLocaleTimeString()}
                    </p>
                  </div>

                  {message.role === "user" && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                      <User className="h-4 w-4 text-primary-foreground" />
                    </div>
                  )}
                </div>
              ))}

              {nodeId && isLoading(nodeId) && (
                <div className="flex gap-3 justify-start">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                  <div className="bg-muted rounded-lg px-4 py-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="p-6 border-t">
            <div className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your message..."
                disabled={nodeId ? isLoading(nodeId) : false}
                className="flex-1"
                onKeyDown={handleKeyDown}
              />
              <Button
                disabled={!inputValue.trim() || (nodeId ? isLoading(nodeId) : false)}
                size="icon"
                onClick={handleSendMessage}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
