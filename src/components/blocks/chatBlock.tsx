"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, Bot, User, X } from "lucide-react";
import { useNodeStore } from "@/lib/store/store";
import { useNodeId, Handle, Position } from "@xyflow/react";
import { useChatStore } from "@/lib/store/chatStore";
import axios from "axios";
import parse from "html-react-parser";

export default function ChatBlock() {
  const nodeId = useNodeId();
  const { deleteNode, noteData, edges } = useNodeStore();
  const { getMessages, initializeNodeChat, addMessage, isLoading, setIsLoading, clearNodeChat } = useChatStore();
  const [inputValue, setInputValue] = useState("");
  
  // Initialize chat for this node if it doesn't exist
  useEffect(() => {
    if (nodeId) {
      initializeNodeChat(nodeId);
    }
  }, [nodeId, initializeNodeChat]);
  
  // Get messages for this specific node
  const messages = nodeId ? getMessages(nodeId) : [];

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !nodeId || isLoading(nodeId)) return;
    
    const userMessage = {
      id: Math.random().toString(36).substring(2, 15),
      role: "user" as const,
      content: inputValue,
      timestamp: new Date(),
    };
    
    addMessage(nodeId, userMessage);
    setInputValue("");
    setIsLoading(nodeId, true);

    setTimeout(async () => {
      // Find connected note blocks
      console.log("All edges:", edges);
      console.log("Current node ID:", nodeId);
      const connectedEdges = edges.filter(edge => edge.target === nodeId);
      const sourceNodeIds = connectedEdges.map(edge => edge.source);
      
      // Get context from all connected note blocks
      const contextData = sourceNodeIds
        .map(sourceId => noteData[sourceId] || "")
        .filter(data => data.trim() !== "")
        .join("\n\n");
      
      console.log("Node ID:", nodeId);
      console.log("Connected edges:", connectedEdges);
      console.log("Source node IDs:", sourceNodeIds);
      console.log("Note Data:", noteData);
      console.log("Context for this node:", contextData);
      
      const updatedMessages = [...messages, userMessage];
      try {
        const response = await axios.post("/api/chat", {
          messages: updatedMessages,
          context: contextData,
        });
        console.log("API Response:", response.data);
        addMessage(nodeId, {
          id: Math.random().toString(36).substring(2, 15),
          role: "assistant",
          content: response.data.response || "No response received",
          timestamp: new Date(),
        });
      } catch (error) {
        console.error("API Error:", error);
        addMessage(nodeId, {
          id: Math.random().toString(36).substring(2, 15),
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
          timestamp: new Date(),
        });
      }
      setIsLoading(nodeId, false);
    }, 1000);
  };

  const handleDeleteNode = () => {
    if (nodeId) {
      clearNodeChat(nodeId);
      deleteNode(nodeId);
    }
  };

  return (
    <div className="relative">
      <Card className="w-full h-full flex flex-col relative">
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
                      <p className="text-sm whitespace-pre-wrap">
                        {parse(message.content)}
                      </p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString()}
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
