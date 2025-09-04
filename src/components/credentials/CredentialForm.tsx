import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CreateCredential, Credential } from '@/types/credential';
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface CredentialFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateCredential) => Promise<any>;
  credential?: Credential;
  mode: 'create' | 'edit';
}

export function CredentialForm({ isOpen, onClose, onSubmit, credential, mode }: CredentialFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<CreateCredential>({
    defaultValues: credential ? {
      platform: credential.platform,
      username: credential.username,
      password: credential.password,
      email: credential.email || '',
      notes: credential.notes || '',
    } : {
      platform: '',
      username: '',
      password: '',
      email: '',
      notes: '',
    }
  });

  const handleFormSubmit = async (data: CreateCredential) => {
    const result = await onSubmit(data);
    if (result?.error === null) {
      reset();
      onClose();
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Add New Credential' : 'Edit Credential'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="platform">Platform *</Label>
            <Input
              id="platform"
              placeholder="e.g., LinkedIn, Facebook, Twitter"
              {...register('platform', { required: 'Platform is required' })}
            />
            {errors.platform && (
              <p className="text-sm text-destructive">{errors.platform.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Username *</Label>
            <Input
              id="username"
              placeholder="Your username or login ID"
              {...register('username', { required: 'Username is required' })}
            />
            {errors.username && (
              <p className="text-sm text-destructive">{errors.username.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password *</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Your password"
                className="pr-10"
                {...register('password', { required: 'Password is required' })}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email (optional)</Label>
            <Input
              id="email"
              type="email"
              placeholder="Associated email address"
              {...register('email')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any additional notes or information"
              rows={3}
              {...register('notes')}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting 
                ? (mode === 'create' ? 'Adding...' : 'Updating...')
                : (mode === 'create' ? 'Add Credential' : 'Update Credential')
              }
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}