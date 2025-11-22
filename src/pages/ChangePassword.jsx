import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock } from "lucide-react";
import { showToast } from "@/components/ui/toast-utils";
import RequireClientRole from '../components/auth/RequireClientRole';

export default function ChangePassword() {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);

  const validateForm = () => {
    const errors = [];
    
    if (!oldPassword) errors.push({ field: 'oldPassword', label: 'Current password is required' });
    if (!newPassword) errors.push({ field: 'newPassword', label: 'New password is required' });
    if (newPassword && newPassword.length < 8) errors.push({ field: 'newPassword', label: 'New password must be at least 8 characters' });
    if (!confirmPassword) errors.push({ field: 'confirmPassword', label: 'Please confirm your new password' });
    if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      errors.push({ field: 'confirmPassword', label: 'Passwords do not match' });
    }
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (errors.length > 0) {
      setValidationErrors(errors);
      showToast.missingFields();
      setTimeout(() => {
        const firstMissing = errors[0].field;
        const element = document.getElementById(firstMissing);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Ensure we remove previous error highlighting before adding new ones
          // (This logic would typically be managed by the Input component itself or a more complex validation system)
          // For now, we only add if it's not there, assuming the ErrorSummary reset would clear it visually
          element.classList.add('border-red-500', 'border-2');
        }
      }, 100);
      return;
    }

    setLoading(true);
    const toastId = showToast.loading('Updating password...');

    try {
      await base44.auth.updatePassword({
        old_password: oldPassword,
        new_password: newPassword
      });

      setValidationErrors([]);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showToast.success('✅ Password updated successfully!', { id: toastId });
    } catch (error) {
      showToast.error('Failed to update password. Please check your current password.', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <RequireClientRole allowedRoles={["admin"]}>
      <div className="min-h-screen py-12 px-4" style={{ background: 'linear-gradient(135deg, #A8D8EA 0%, #87CEEB 50%, #00BFFF 100%)' }}>
        <div className="max-w-md mx-auto">
          <Card className="shadow-2xl border-4" style={{ borderColor: '#00BFFF' }}>
            <CardHeader className="rounded-t-lg" style={{ background: 'linear-gradient(90deg, #0055A4, #00BFFF)' }}>
              <CardTitle className="text-2xl font-bold text-white flex items-center gap-2">
                <Lock className="w-6 h-6" />
                Change Password
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="oldPassword" className="font-bold">Current Password *</Label>
                  <Input
                    id="oldPassword"
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="Enter current password"
                    className={validationErrors.find(e => e.field === 'oldPassword') ? 'border-red-500 border-2' : ''}
                  />
                </div>

                <div>
                  <Label htmlFor="newPassword" className="font-bold">New Password *</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 8 characters"
                    className={validationErrors.find(e => e.field === 'newPassword') ? 'border-red-500 border-2' : ''}
                  />
                </div>

                <div>
                  <Label htmlFor="confirmPassword" className="font-bold">Confirm New Password *</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className={validationErrors.find(e => e.field === 'confirmPassword') ? 'border-red-500 border-2' : ''}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full font-bold shadow-lg"
                  style={{ backgroundColor: '#0055A4' }}
                >
                  {loading ? 'Updating...' : 'Update Password'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </RequireClientRole>
  );
}