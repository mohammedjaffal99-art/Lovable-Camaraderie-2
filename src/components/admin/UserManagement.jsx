import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Trash2, User } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useLanguage } from "@/components/LanguageContext";

export default function UserManagement() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [userToDelete, setUserToDelete] = useState(null);
  const queryClient = useQueryClient();

  const { data: users = [] } = useQuery({
    queryKey: ['allUsers'],
    queryFn: () => base44.entities.User.list('-created_date'),
    refetchInterval: 5000,
    staleTime: 0,
    cacheTime: 0,
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId) => {
      await base44.entities.User.delete(userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['allUsers']);
      alert('User deleted successfully');
      setUserToDelete(null);
    },
    onError: (error) => {
      alert('Failed to delete user: ' + error.message);
      setUserToDelete(null);
    }
  });

  const filteredUsers = users.filter(u =>
    u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: '#4A90E2' }} />
        <Input
          placeholder={t('users.search')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 h-12 font-semibold border-2"
          style={{ borderColor: '#00BFFF' }}
        />
      </div>

      <div className="grid gap-3">
        {filteredUsers.map((user) => (
          <div key={user.id} className="rounded-xl p-4 bg-white hover:shadow-lg transition-shadow border-2" style={{ borderColor: '#00BFFF' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1">
                {user.photo_1 ? (
                  <img src={user.photo_1} alt={user.full_name} className="w-14 h-14 rounded-full object-cover border-2 shadow-md" style={{ borderColor: '#0055A4' }} />
                ) : (
                  <div className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md" style={{ backgroundColor: '#0055A4' }}>
                    {user.full_name?.[0] || '?'}
                  </div>
                )}

                <div className="flex-1">
                  <h3 className="font-bold text-lg" style={{ color: '#0055A4' }}>{user.full_name}</h3>
                  <p className="text-sm font-semibold" style={{ color: '#4A90E2' }}>{user.email}</p>
                  <div className="flex gap-2 mt-2">
                    <Badge className="font-bold" style={{ backgroundColor: '#0055A4', color: 'white' }}>
                      {user.role}
                    </Badge>
                    {user.role === 'broadcaster' && user.broadcaster_approved && (
                      <Badge className="font-bold" style={{ backgroundColor: '#00BFFF', color: 'white' }}>Approved</Badge>
                    )}
                  </div>
                </div>
              </div>

              <Button
                variant="destructive"
                size="sm"
                onClick={() => setUserToDelete(user)}
                className="font-bold"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-16">
          <User className="w-16 h-16 mx-auto mb-4" style={{ color: '#87CEEB' }} />
          <p className="text-lg font-bold" style={{ color: '#4A90E2' }}>{t('users.noUsers')}</p>
        </div>
      )}

      <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold" style={{ color: '#0055A4' }}>Delete User Account?</AlertDialogTitle>
            <AlertDialogDescription className="text-base font-semibold" style={{ color: '#4A90E2' }}>
              Are you sure you want to delete <strong>{userToDelete?.full_name}</strong> ({userToDelete?.email})? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-bold">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteUserMutation.mutate(userToDelete.id)}
              className="bg-red-600 hover:bg-red-700 font-bold"
            >
              {deleteUserMutation.isPending ? 'Deleting...' : 'Delete User'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}