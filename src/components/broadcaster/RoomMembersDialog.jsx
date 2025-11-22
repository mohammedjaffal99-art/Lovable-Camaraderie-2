import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Users, UserCircle } from "lucide-react";
import { createPageUrl } from "@/utils";

export default function RoomMembersDialog({ isOpen, onClose, broadcasterId }) {
  const { data: recentChatters } = useQuery({
    queryKey: ['roomMembers', broadcasterId],
    queryFn: async () => {
      const messages = await base44.entities.ChatMessage.filter(
        { broadcaster_id: broadcasterId, is_private: false },
        '-created_date',
        100
      );
      
      const uniqueUsers = new Map();
      for (const msg of messages) {
        if (!uniqueUsers.has(msg.sender_id)) {
          uniqueUsers.set(msg.sender_id, {
            id: msg.sender_id,
            name: msg.sender_name,
            lastMessage: new Date(msg.created_date)
          });
        }
      }
      
      return Array.from(uniqueUsers.values()).slice(0, 20);
    },
    enabled: isOpen && !!broadcasterId,
    initialData: [],
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md border-4" style={{ borderColor: '#00BFFF' }}>
        <DialogHeader>
          <DialogTitle className="text-2xl font-extrabold flex items-center gap-2" style={{ color: '#0055A4' }}>
            <Users className="w-6 h-6" />
            Room Members
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {recentChatters.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 mx-auto mb-3" style={{ color: '#87CEEB' }} />
              <p className="text-gray-600">No one has chatted yet</p>
            </div>
          ) : (
            recentChatters.map((member) => (
              <a
                key={member.id}
                href={createPageUrl(`BroadcasterProfile?id=${member.id}`)}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50 transition-colors border-2"
                style={{ borderColor: '#E0F4FF' }}
              >
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: '#0055A4' }}>
                  {member.name?.[0] || '?'}
                </div>
                <div className="flex-1">
                  <p className="font-bold" style={{ color: '#0055A4' }}>{member.name}</p>
                  <p className="text-xs text-gray-500">
                    Last active: {member.lastMessage.toLocaleTimeString()}
                  </p>
                </div>
                <UserCircle className="w-5 h-5" style={{ color: '#4A90E2' }} />
              </a>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}