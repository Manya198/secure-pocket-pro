import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Eye, EyeOff, Shield } from 'lucide-react';
import { setMasterKey, hashMasterKey } from '@/lib/encryption';

interface MasterPasswordDialogProps {
  isOpen: boolean;
  onUnlock: () => void;
}

export function MasterPasswordDialog({ isOpen, onUnlock }: MasterPasswordDialogProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password.length < 6) {
      setError('Master password must be at least 6 characters');
      return;
    }

    const storedHash = localStorage.getItem('master_password_hash');
    const inputHash = hashMasterKey(password);

    if (storedHash && storedHash !== inputHash) {
      setError('Incorrect master password');
      return;
    }

    if (!storedHash) {
      // First time setup - store the hash
      localStorage.setItem('master_password_hash', inputHash);
    }

    setMasterKey(password);
    setError('');
    setPassword('');
    onUnlock();
  };

  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <DialogTitle>Master Password Required</DialogTitle>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Enter your master password to encrypt and decrypt your credentials securely.
          </p>
          
          <div className="space-y-2">
            <Label htmlFor="master-password">Master Password</Label>
            <div className="relative">
              <Input
                id="master-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your master password"
                className="pr-10"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>

          <Button type="submit" className="w-full">
            Unlock Credentials
          </Button>
        </form>

        <div className="text-xs text-muted-foreground space-y-1">
          <p>🔒 Your credentials are encrypted with AES-256 encryption</p>
          <p>🔑 Master password is never stored, only a hash for verification</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}