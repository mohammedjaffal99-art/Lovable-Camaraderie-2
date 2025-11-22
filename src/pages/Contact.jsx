
import React, { useState } from 'react';
import { useLanguage } from '@/components/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Mail } from 'lucide-react';
import { toast } from 'sonner';

export default function Contact() {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    
    // Simulate API call
    setTimeout(() => {
      toast.success('Message sent! We\'ll get back to you soon.');
      setFormData({ name: '', email: '', subject: '', message: '' });
      setSending(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen py-12 px-4" style={{ background: 'linear-gradient(135deg, #A8D8EA 0%, #87CEEB 50%, #00BFFF 100%)' }}>
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl p-8 border-4" style={{ borderColor: '#00BFFF' }}>
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#0055A4' }}>
            {t('footer.contact')}
          </h1>
          <p className="text-base font-semibold mb-6" style={{ color: '#4A90E2' }}>
            Get in Touch
          </p>
          
          <div className="grid md:grid-cols-2 gap-10 mb-8">
            <div>
              <h2 className="text-2xl font-extrabold mb-6" style={{ color: '#0055A4' }}>Get in Touch</h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <Mail className="w-7 h-7 mt-1" style={{ color: '#00BFFF' }} />
                  <div>
                    <p className="font-extrabold text-lg" style={{ color: '#0055A4' }}>Email</p>
                    <p className="font-bold" style={{ color: '#4A90E2' }}>support@camaraderie.tv</p>
                  </div>
                </div>
                
                <div className="rounded-xl p-6 border-l-4 shadow-lg" style={{ backgroundColor: '#E0F4FF', borderColor: '#00BFFF' }}>
                  <p className="text-base font-extrabold mb-3" style={{ color: '#0055A4' }}>
                    <strong>For specific inquiries:</strong>
                  </p>
                  <ul className="text-sm font-bold space-y-2" style={{ color: '#4A90E2' }}>
                    <li>• Abuse reports: abuse@camaraderie.tv</li>
                    <li>• Privacy concerns: privacy@camaraderie.tv</li>
                    <li>• DMCA notices: dmca@camaraderie.tv</li>
                    <li>• Legal matters: legal@camaraderie.tv</li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-extrabold mb-6" style={{ color: '#0055A4' }}>Send us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  placeholder="Your Name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="h-12 font-semibold border-2"
                  style={{ borderColor: '#87CEEB' }}
                />
                <Input
                  type="email"
                  placeholder="Your Email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="h-12 font-semibold border-2"
                  style={{ borderColor: '#87CEEB' }}
                />
                <Input
                  placeholder="Subject"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  className="h-12 font-semibold border-2"
                  style={{ borderColor: '#87CEEB' }}
                />
                <Textarea
                  placeholder="Your Message"
                  required
                  rows={6}
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  className="font-semibold border-2"
                  style={{ borderColor: '#87CEEB' }}
                />
                <Button 
                  type="submit" 
                  className="w-full h-14 text-lg font-extrabold shadow-xl hover:shadow-2xl" 
                  style={{ backgroundColor: '#0055A4' }}
                  disabled={sending}
                >
                  {sending ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
