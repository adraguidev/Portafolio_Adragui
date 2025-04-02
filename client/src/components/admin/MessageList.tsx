import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Message } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const MessageList = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [messageToDelete, setMessageToDelete] = useState<number | null>(null);
  
  // Fetch all messages
  const { data: messages, isLoading } = useQuery<Message[]>({
    queryKey: ['/api/messages'],
  });

  // Mark message as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: (id: number) => apiRequest('POST', `/api/messages/${id}/read`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/messages'] });
      toast({
        title: 'Success',
        description: 'Message marked as read',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to mark message as read',
        variant: 'destructive',
      });
      console.error(error);
    },
  });

  // Delete message mutation
  const deleteMessageMutation = useMutation({
    mutationFn: (id: number) => apiRequest('DELETE', `/api/messages/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/messages'] });
      toast({
        title: 'Success',
        description: 'Message deleted successfully',
      });
      setMessageToDelete(null);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to delete message',
        variant: 'destructive',
      });
      console.error(error);
    },
  });

  // Handle opening a message
  const openMessage = (message: Message) => {
    setSelectedMessage(message);
    
    // If message is unread, mark it as read
    if (!message.read) {
      markAsReadMutation.mutate(message.id);
    }
  };

  // Format date
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, index) => (
          <Card key={index}>
            <CardHeader>
              <div className="flex justify-between">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-4 w-48 mt-1" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-5/6" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {messages && messages.length > 0 ? (
          messages.map((message) => (
            <Card key={message.id} className={`transition-all ${!message.read ? 'border-l-4 border-l-secondary' : ''}`}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg font-medium flex items-center">
                    {message.name}
                    {!message.read && (
                      <Badge variant="secondary" className="ml-2">New</Badge>
                    )}
                  </CardTitle>
                  <span className="text-sm text-muted-foreground">
                    {formatDate(message.createdAt)}
                  </span>
                </div>
                <CardDescription>
                  <a href={`mailto:${message.email}`} className="text-secondary hover:underline">
                    {message.email}
                  </a>
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <p className="font-medium mb-1">
                  {message.subject}
                </p>
                <p className="text-muted-foreground line-clamp-2">
                  {message.message}
                </p>
              </CardContent>
              <CardFooter className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => openMessage(message)}
                >
                  Read
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-destructive hover:bg-destructive/10"
                  onClick={() => setMessageToDelete(message.id)}
                >
                  Delete
                </Button>
              </CardFooter>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">No messages yet.</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Message Detail Dialog */}
      <Dialog open={selectedMessage !== null} onOpenChange={(open) => !open && setSelectedMessage(null)}>
        {selectedMessage && (
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedMessage.subject}</DialogTitle>
              <DialogDescription className="flex justify-between items-center">
                <span>From: {selectedMessage.name} ({selectedMessage.email})</span>
                <span>{formatDate(selectedMessage.createdAt)}</span>
              </DialogDescription>
            </DialogHeader>
            <div className="mt-2 bg-slate-50 p-4 rounded-md whitespace-pre-wrap">
              {selectedMessage.message}
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="outline"
                onClick={() => {
                  window.location.href = `mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`;
                }}
              >
                <i className="ri-mail-send-line mr-2"></i>
                Reply
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  setMessageToDelete(selectedMessage.id);
                  setSelectedMessage(null);
                }}
              >
                <i className="ri-delete-bin-line mr-2"></i>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={messageToDelete !== null} onOpenChange={(open) => !open && setMessageToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the message.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => messageToDelete && deleteMessageMutation.mutate(messageToDelete)}
              disabled={deleteMessageMutation.isPending}
            >
              {deleteMessageMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default MessageList;
