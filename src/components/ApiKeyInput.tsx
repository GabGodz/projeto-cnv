import React, { useState, useEffect } from 'react';
import { Key, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ApiKeyInputProps {
  onApiKeySet: (apiKey: string) => void;
}

const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ onApiKeySet }) => {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isStored, setIsStored] = useState(false);

  useEffect(() => {
    const storedKey = localStorage.getItem('gemini-api-key');
    if (storedKey) {
      setApiKey(storedKey);
      setIsStored(true);
      onApiKeySet(storedKey);
    }
  }, [onApiKeySet]);

  const handleSave = () => {
    if (apiKey.trim()) {
      localStorage.setItem('gemini-api-key', apiKey.trim());
      setIsStored(true);
      onApiKeySet(apiKey.trim());
    }
  };

  const handleClear = () => {
    localStorage.removeItem('gemini-api-key');
    setApiKey('');
    setIsStored(false);
    onApiKeySet('');
  };

  return (
    <div className="card-glass max-w-md mx-auto">
      <div className="flex items-center gap-3 mb-4">
        <Key className="w-6 h-6 text-accent" />
        <h3 className="text-xl font-semibold">API Key do Gemini</h3>
      </div>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="api-key" className="text-sm font-medium">
            Chave da API
          </Label>
          <div className="relative mt-1">
            <Input
              id="api-key"
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full px-3"
              onClick={() => setShowKey(!showKey)}
            >
              {showKey ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {isStored && (
          <div className="bg-success/20 border border-success/20 rounded-lg p-3">
            <p className="text-sm text-success">
              ✓ API Key salva e configurada
            </p>
          </div>
        )}

        <div className="flex gap-2">
          <Button 
            onClick={handleSave}
            disabled={!apiKey.trim() || isStored}
            className="flex-1"
          >
            {isStored ? 'Salva' : 'Salvar'}
          </Button>
          
          {isStored && (
            <Button 
              variant="outline"
              onClick={handleClear}
            >
              Limpar
            </Button>
          )}
        </div>

        <p className="text-xs text-muted-foreground">
          A chave será salva localmente no seu navegador para uso durante a sessão.
        </p>
      </div>
    </div>
  );
};

export default ApiKeyInput;