import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Newspaper, Plus, Edit2, Trash2, Eye } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function EventsManagement() {
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('platform');
  const queryClient = useQueryClient();

  const { data: events } = useQuery({
    queryKey: ['platformEvents'],
    queryFn: async () => {
      const settings = await base44.entities.PlatformSettings.filter({ setting_type: 'event' });
      return settings.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    },
    initialData: [],
  });

  const createEventMutation = useMutation({
    mutationFn: async (eventData) => {
      if (editingEvent) {
        await base44.entities.PlatformSettings.update(editingEvent.id, {
          setting_key: `event_${Date.now()}`,
          setting_value: JSON.stringify(eventData),
          setting_type: 'event',
          description: eventData.title
        });
      } else {
        await base44.entities.PlatformSettings.create({
          setting_key: `event_${Date.now()}`,
          setting_value: JSON.stringify(eventData),
          setting_type: 'event',
          description: eventData.title
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['platformEvents']);
      setShowForm(false);
      setEditingEvent(null);
      setTitle('');
      setContent('');
      setCategory('platform');
      alert(editingEvent ? 'Event updated!' : 'Event created!');
    },
  });

  const deleteEventMutation = useMutation({
    mutationFn: async (eventId) => {
      await base44.entities.PlatformSettings.delete(eventId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['platformEvents']);
      alert('Event deleted!');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      alert('Please fill in all fields');
      return;
    }

    const eventData = {
      title: title.trim(),
      content: content.trim(),
      category,
      date: new Date().toISOString(),
    };

    createEventMutation.mutate(eventData);
  };

  const handleEdit = (event) => {
    const eventData = JSON.parse(event.setting_value);
    setEditingEvent(event);
    setTitle(eventData.title);
    setContent(eventData.content);
    setCategory(eventData.category || 'platform');
    setShowForm(true);
  };

  const handleCancelEdit = () => {
    setShowForm(false);
    setEditingEvent(null);
    setTitle('');
    setContent('');
    setCategory('platform');
  };

  return (
    <div className="space-y-6">
      {/* Create/Edit Form */}
      {showForm ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              {editingEvent ? 'Edit Event/News' : 'Create New Event/News'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="category">Category *</Label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="platform">Platform Update</option>
                  <option value="feature">New Feature</option>
                  <option value="event">Upcoming Event</option>
                  <option value="news">Industry News</option>
                  <option value="insight">Insights & Tips</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>

              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter event/news title..."
                  maxLength={200}
                />
              </div>

              <div>
                <Label htmlFor="content">Content *</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your article or insights here..."
                  rows={10}
                  maxLength={5000}
                  className="resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {content.length}/5000 characters
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={createEventMutation.isPending}
                  style={{ backgroundColor: '#11009E' }}
                >
                  {editingEvent ? 'Update' : 'Publish'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancelEdit}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-6">
            <Button
              onClick={() => setShowForm(true)}
              style={{ backgroundColor: '#11009E' }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create New Event/News
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Events List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Newspaper className="w-5 h-5" />
            Published Events & News ({events.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No events or news published yet</p>
              <p className="text-sm">Create your first article above</p>
            </div>
          ) : (
            <div className="space-y-4">
              {events.map((event) => {
                const eventData = JSON.parse(event.setting_value);
                return (
                  <div
                    key={event.id}
                    className="border rounded-lg p-4 hover:border-purple-300 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded">
                            {eventData.category || 'platform'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(event.created_date), { addSuffix: true })}
                          </span>
                        </div>
                        <h3 className="font-bold text-lg mb-2">{eventData.title}</h3>
                        <p className="text-sm text-gray-600 line-clamp-3">
                          {eventData.content}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(event)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this event?')) {
                              deleteEventMutation.mutate(event.id);
                            }
                          }}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}