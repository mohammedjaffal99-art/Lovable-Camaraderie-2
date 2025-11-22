import React, { useState } from 'react';
import { MessageCircle, Bug, Lightbulb } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function ReportBugs() {
  const [user, setUser] = React.useState(null);
  const [type, setType] = React.useState('bug');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  React.useEffect(() => {
    base44.auth.me().then((u) => {
      setUser(u);
      setEmail(u.email);
    }).catch(() => setUser(null));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await base44.integrations.Core.SendEmail({
        from_name: 'Camaraderie.tv Feedback',
        to: 'support@camaraderie.tv',
        subject: `[${type === 'bug' ? 'BUG' : 'SUGGESTION'}] ${subject}`,
        body: `
          Type: ${type === 'bug' ? 'Bug Report' : 'Feature Suggestion'}
          From: ${email}
          User: ${user?.full_name || 'Guest'}
          
          Description:
          ${description}
        `
      });

      toast.success(type === 'bug' ? 'Bug report submitted!' : 'Suggestion submitted!');
      setSubject('');
      setDescription('');
    } catch (error) {
      toast.error('Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen py-8 px-4" style={{ background: 'linear-gradient(135deg, #A8D8EA 0%, #87CEEB 50%, #00BFFF 100%)' }}>
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-white" style={{ textShadow: '0 2px 10px rgba(0,85,164,0.3)' }}>
            Report Bugs & Suggestions
          </h1>
          <p className="text-base font-semibold text-white" style={{ textShadow: '0 1px 5px rgba(0,85,164,0.2)' }}>Help us improve Camaraderie.tv</p>
        </div>

        <Card className="bg-white shadow-2xl border-2" style={{ borderColor: '#00BFFF' }}>
          <CardHeader>
            <CardTitle className="text-3xl font-extrabold" style={{ color: '#0055A4' }}>Submit Your Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label className="text-lg font-extrabold mb-4 block" style={{ color: '#0055A4' }}>What would you like to report?</Label>
                <RadioGroup value={type} onValueChange={setType} className="space-y-3">
                  <div className="flex items-center space-x-3 p-5 rounded-2xl border-2 cursor-pointer hover:bg-blue-50 shadow-lg" 
                       style={{ borderColor: type === 'bug' ? '#0055A4' : '#E0F4FF' }}>
                    <Label htmlFor="bug" className="cursor-pointer flex-1">
                      <div className="font-extrabold text-lg" style={{ color: '#0055A4' }}>Bug Report</div>
                      <div className="text-base font-bold" style={{ color: '#4A90E2' }}>Something isn't working correctly</div>
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-5 rounded-2xl border-2 cursor-pointer hover:bg-blue-50 shadow-lg"
                       style={{ borderColor: type === 'suggestion' ? '#0055A4' : '#E0F4FF' }}>
                    <Label htmlFor="suggestion" className="cursor-pointer flex-1">
                      <div className="font-extrabold text-lg" style={{ color: '#0055A4' }}>Feature Suggestion</div>
                      <div className="text-base font-bold" style={{ color: '#4A90E2' }}>I have an idea to improve the platform</div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label htmlFor="email" className="font-bold" style={{ color: '#0055A4' }}>Your Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-1 h-12 font-semibold border-2"
                  style={{ borderColor: '#87CEEB' }}
                />
              </div>

              <div>
                <Label htmlFor="subject" className="font-bold" style={{ color: '#0055A4' }}>Subject *</Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder={type === 'bug' ? 'Briefly describe the bug' : 'Briefly describe your suggestion'}
                  required
                  className="mt-1 h-12 font-semibold border-2"
                  style={{ borderColor: '#87CEEB' }}
                />
              </div>

              <div>
                <Label htmlFor="description" className="font-bold" style={{ color: '#0055A4' }}>Description *</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={type === 'bug' ? 
                    'Please describe what happened, what you expected, and steps to reproduce the issue...' :
                    'Please describe your feature idea and how it would improve the platform...'}
                  required
                  rows={8}
                  className="mt-1 font-semibold border-2"
                  style={{ borderColor: '#87CEEB' }}
                />
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="w-full text-white h-14 text-lg font-extrabold shadow-xl hover:shadow-2xl"
                style={{ backgroundColor: '#0055A4' }}>
                {submitting ? 'Submitting...' : `Submit ${type === 'bug' ? 'Bug Report' : 'Suggestion'}`}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-8 bg-white rounded-2xl p-8 shadow-xl border-2" style={{ borderColor: '#00BFFF' }}>
          <h3 className="font-extrabold text-2xl mb-3" style={{ color: '#0055A4' }}>Thank You!</h3>
          <p className="text-lg font-bold" style={{ color: '#4A90E2' }}>
            Your feedback helps us improve Camaraderie.tv for everyone. We review all submissions and will get back to you if we need more information.
          </p>
        </div>
      </div>
    </div>
  );
}