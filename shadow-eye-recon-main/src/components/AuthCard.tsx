
import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, User, Shield, CheckCircle, AlertCircle, Loader } from 'lucide-react';

type AuthMode = 'login' | 'register' | 'reset' | 'verify';

interface ValidationState {
  isValid: boolean;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

const AuthCard: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiMessage, setApiMessage] = useState<{ type: 'success' | 'error' | '', text: string }>({ type: '', text: '' });
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    verificationCode: ''
  });

  const [validations, setValidations] = useState<{
    username: ValidationState;
    email: ValidationState;
    password: ValidationState;
    confirmPassword: ValidationState;
  }>({
    username: { isValid: false, message: '', type: 'info' },
    email: { isValid: false, message: '', type: 'info' },
    password: { isValid: false, message: '', type: 'info' },
    confirmPassword: { isValid: false, message: '', type: 'info' }
  });

  // Real-time validation functions
  const validateUsername = (username: string): ValidationState => {
    if (!username) return { isValid: false, message: '', type: 'info' };
    if (username.length < 3) return { isValid: false, message: 'Mínimo 3 caracteres', type: 'error' };
    if (!/^[a-zA-Z0-9_]+$/.test(username)) return { isValid: false, message: 'Apenas letras, números e _', type: 'error' };
    // Simulate API check
    if (username === 'admin') return { isValid: false, message: 'Usuário já existe', type: 'error' };
    return { isValid: true, message: 'Usuário disponível', type: 'success' };
  };

  const validateEmail = (email: string): ValidationState => {
    if (!email) return { isValid: false, message: '', type: 'info' };
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return { isValid: false, message: 'E-mail inválido', type: 'error' };
    return { isValid: true, message: 'E-mail válido', type: 'success' };
  };

  const validatePassword = (password: string): ValidationState => {
    if (!password) return { isValid: false, message: '', type: 'info' };
    if (password.length < 8) return { isValid: false, message: 'Mínimo 8 caracteres', type: 'error' };
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return { isValid: false, message: 'Deve conter maiúscula, minúscula e número', type: 'warning' };
    }
    return { isValid: true, message: 'Senha forte', type: 'success' };
  };

  const validateConfirmPassword = (confirmPassword: string, password: string): ValidationState => {
    if (!confirmPassword) return { isValid: false, message: '', type: 'info' };
    if (confirmPassword !== password) return { isValid: false, message: 'Senhas não coincidem', type: 'error' };
    return { isValid: true, message: 'Senhas coincidem', type: 'success' };
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Real-time validation
    let validation: ValidationState;
    switch (field) {
      case 'username':
        validation = validateUsername(value);
        setValidations(prev => ({ ...prev, username: validation }));
        break;
      case 'email':
        validation = validateEmail(value);
        setValidations(prev => ({ ...prev, email: validation }));
        break;
      case 'password':
        validation = validatePassword(value);
        setValidations(prev => ({ ...prev, password: validation }));
        // Also re-validate confirm password if it exists
        if (formData.confirmPassword) {
          const confirmValidation = validateConfirmPassword(formData.confirmPassword, value);
          setValidations(prev => ({ ...prev, confirmPassword: confirmValidation }));
        }
        break;
      case 'confirmPassword':
        validation = validateConfirmPassword(value, formData.password);
        setValidations(prev => ({ ...prev, confirmPassword: validation }));
        break;
    }
  };

  const getInputClasses = (validation: ValidationState, hasValidationIcon: boolean = false) => {
    const baseClasses = hasValidationIcon ? 'osint-input w-full pr-20' : 'osint-input w-full pr-12';
    if (!validation.message) return baseClasses;
    
    switch (validation.type) {
      case 'success': return `${baseClasses} input-success`;
      case 'error': return `${baseClasses} input-error`;
      case 'warning': return `${baseClasses} input-warning`;
      default: return baseClasses;
    }
  };

  const getValidationIcon = (validation: ValidationState) => {
    if (!validation.message) return null;
    switch (validation.type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error': return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'warning': return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      default: return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setApiMessage({ type: '', text: '' }); // Clear previous API messages

    // Simulate API call - This line will be replaced for 'register' and 'verify' modes
    // await new Promise(resolve => setTimeout(resolve, 2000));

    if (mode === 'register') {
      // Frontend validation (ensure all fields required by the component are valid)
      // Note: backend only uses email and password for now.
      if (!validations.email.isValid || !validations.password.isValid || !validations.confirmPassword.isValid) {
          setApiMessage({ type: 'error', text: 'Por favor, preencha todos os campos corretamente.' });
          setIsLoading(false);
          return;
      }
      if (formData.password !== formData.confirmPassword) {
          setApiMessage({ type: 'error', text: 'As senhas não coincidem.' });
          setIsLoading(false);
          return;
      }

      try {
        const response = await fetch('http://localhost:3000/api/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: formData.email, password: formData.password }),
        });

        const data = await response.json();

        if (response.ok) {
          setApiMessage({ type: 'success', text: data.message || 'Código de verificação enviado para seu e-mail!' });
          setMode('verify'); // Transition to verification mode
        } else {
          setApiMessage({ type: 'error', text: data.message || 'Falha no registro. Tente novamente.' });
        }
      } catch (error) {
        console.error('Registration error:', error);
        setApiMessage({ type: 'error', text: 'Erro ao conectar com o servidor. Tente novamente mais tarde.' });
      } finally {
        setIsLoading(false);
      }

    } else if (mode === 'reset') { // Keep existing reset logic (simulated for now)
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API
      setApiMessage({ type: 'success', text: 'Se seu e-mail estiver cadastrado, você receberá um código.' });
      setMode('verify');
      setIsLoading(false);
    } else if (mode === 'login') { // Keep existing login logic (simulated for now)
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API
      // Fake login success for now
      setApiMessage({ type: 'success', text: 'Login bem-sucedido!' });
      setIsLoading(false);
      // console.log('Simulating login...');
    } else if (mode === 'verify') {
      if (!formData.email || !formData.verificationCode || formData.verificationCode.length !== 6) {
        setApiMessage({ type: 'error', text: 'Por favor, insira um código de verificação válido (6 caracteres).' });
        setIsLoading(false);
        return;
      }
      try {
        const response = await fetch('http://localhost:3000/api/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: formData.email, code: formData.verificationCode }),
        });

        const data = await response.json();

        if (response.ok) {
          setApiMessage({ type: 'success', text: data.message || 'E-mail verificado com sucesso! Você já pode fazer login.' });
          // Optionally, reset parts of the form or change mode
          setFormData(prev => ({
              ...prev,
              verificationCode: '',
              // Potentially clear password fields too, or reset to initial state for login
              // username: '', // if you want to clear username
              // password: '',
              // confirmPassword: '',
          }));
          setMode('login'); // Redirect to login mode after successful verification
        } else {
          setApiMessage({ type: 'error', text: data.message || 'Falha na verificação. Código inválido ou expirado.' });
        }
      } catch (error) {
        console.error('Verification error:', error);
        setApiMessage({ type: 'error', text: 'Erro ao conectar com o servidor. Tente novamente mais tarde.' });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const renderModeContent = () => {
    switch (mode) {
      case 'login':
        return (
          <>
            {apiMessage.text && (
              <div className={`p-3 mb-4 rounded-md text-sm ${
                apiMessage.type === 'success' ? 'bg-green-100 text-green-700' :
                apiMessage.type === 'error' ? 'bg-red-100 text-red-700' : ''
              }`}>
                {apiMessage.text}
              </div>
            )}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-osint-accent/10 rounded-full">
                <Shield className="w-8 h-8 text-osint-accent" />
              </div>
              <h2 className="text-3xl font-bold osint-text-gradient mb-2">OSINT Intelligence</h2>
              <p className="text-osint-dark-300">Acesse sua conta</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="w-5 h-5 text-osint-dark-400" />
                </div>
                <input
                  type="text"
                  placeholder="Usuário"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  className="osint-input w-full pl-12"
                  required
                />
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-osint-dark-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Senha"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="osint-input w-full pl-12 pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-osint-dark-400 hover:text-osint-accent transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="osint-button w-full flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <div className="loading-spinner mr-2" />
                    Entrando...
                  </>
                ) : (
                  'Entrar'
                )}
              </button>
            </form>

            <div className="mt-6 text-center space-y-3">
              <button
                onClick={() => setMode('reset')}
                className="text-osint-accent hover:text-osint-accent-light transition-colors"
              >
                Esqueci minha senha
              </button>
              <div className="text-osint-dark-300">
                Não tem conta?{' '}
                <button
                  onClick={() => setMode('register')}
                  className="text-osint-accent hover:text-osint-accent-light transition-colors"
                >
                  Cadastre-se
                </button>
              </div>
            </div>
          </>
        );

      case 'register':
        return (
          <>
            {apiMessage.text && (
              <div className={`p-3 mb-4 rounded-md text-sm ${
                apiMessage.type === 'success' ? 'bg-green-100 text-green-700' :
                apiMessage.type === 'error' ? 'bg-red-100 text-red-700' : ''
              }`}>
                {apiMessage.text}
              </div>
            )}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-osint-accent/10 rounded-full">
                <User className="w-8 h-8 text-osint-accent" />
              </div>
              <h2 className="text-3xl font-bold osint-text-gradient mb-2">Criar Conta</h2>
              <p className="text-osint-dark-300">Junte-se à nossa plataforma</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                    <User className="w-5 h-5 text-osint-dark-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Usuário"
                    value={formData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    className={getInputClasses(validations.username, true) + ' pl-12'}
                    required
                  />
                  {validations.username.message && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      {getValidationIcon(validations.username)}
                    </div>
                  )}
                </div>
                {validations.username.message && (
                  <p className={`text-sm ${
                    validations.username.type === 'success' ? 'text-green-500' :
                    validations.username.type === 'error' ? 'text-red-500' :
                    validations.username.type === 'warning' ? 'text-yellow-500' : 'text-blue-500'
                  }`}>
                    {validations.username.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                    <Mail className="w-5 h-5 text-osint-dark-400" />
                  </div>
                  <input
                    type="email"
                    placeholder="E-mail"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={getInputClasses(validations.email, true) + ' pl-12'}
                    required
                  />
                  {validations.email.message && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      {getValidationIcon(validations.email)}
                    </div>
                  )}
                </div>
                {validations.email.message && (
                  <p className={`text-sm ${
                    validations.email.type === 'success' ? 'text-green-500' :
                    validations.email.type === 'error' ? 'text-red-500' : 'text-blue-500'
                  }`}>
                    {validations.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                    <Lock className="w-5 h-5 text-osint-dark-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Senha"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={getInputClasses(validations.password, true) + ' pl-12'}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-8 pr-3 flex items-center text-osint-dark-400 hover:text-osint-accent transition-colors z-20"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                  {validations.password.message && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      {getValidationIcon(validations.password)}
                    </div>
                  )}
                </div>
                {validations.password.message && (
                  <p className={`text-sm ${
                    validations.password.type === 'success' ? 'text-green-500' :
                    validations.password.type === 'error' ? 'text-red-500' :
                    validations.password.type === 'warning' ? 'text-yellow-500' : 'text-blue-500'
                  }`}>
                    {validations.password.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                    <Lock className="w-5 h-5 text-osint-dark-400" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirmar Senha"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className={getInputClasses(validations.confirmPassword, true) + ' pl-12'}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-8 pr-3 flex items-center text-osint-dark-400 hover:text-osint-accent transition-colors z-20"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                  {validations.confirmPassword.message && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      {getValidationIcon(validations.confirmPassword)}
                    </div>
                  )}
                </div>
                {validations.confirmPassword.message && (
                  <p className={`text-sm ${
                    validations.confirmPassword.type === 'success' ? 'text-green-500' :
                    validations.confirmPassword.type === 'error' ? 'text-red-500' : 'text-blue-500'
                  }`}>
                    {validations.confirmPassword.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading || !validations.username.isValid || !validations.email.isValid || !validations.password.isValid || !validations.confirmPassword.isValid}
                className="osint-button w-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="loading-spinner mr-2" />
                    Criando conta...
                  </>
                ) : (
                  'Criar Conta'
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <div className="text-osint-dark-300">
                Já tem conta?{' '}
                <button
                  onClick={() => setMode('login')}
                  className="text-osint-accent hover:text-osint-accent-light transition-colors"
                >
                  Entrar
                </button>
              </div>
            </div>
          </>
        );

      case 'reset':
        return (
          <>
            {apiMessage.text && (
              <div className={`p-3 mb-4 rounded-md text-sm ${
                apiMessage.type === 'success' ? 'bg-green-100 text-green-700' :
                apiMessage.type === 'error' ? 'bg-red-100 text-red-700' : ''
              }`}>
                {apiMessage.text}
              </div>
            )}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-osint-orange/10 rounded-full">
                <Mail className="w-8 h-8 text-osint-orange" />
              </div>
              <h2 className="text-3xl font-bold osint-text-gradient mb-2">Redefinir Senha</h2>
              <p className="text-osint-dark-300">Enviaremos um código para seu e-mail</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                    <Mail className="w-5 h-5 text-osint-dark-400" />
                  </div>
                  <input
                    type="email"
                    placeholder="Seu e-mail"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={getInputClasses(validations.email, true) + ' pl-12'}
                    required
                  />
                  {validations.email.message && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      {getValidationIcon(validations.email)}
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !validations.email.isValid}
                className="osint-button w-full flex items-center justify-center disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <div className="loading-spinner mr-2" />
                    Enviando código...
                  </>
                ) : (
                  'Enviar Código'
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => setMode('login')}
                className="text-osint-accent hover:text-osint-accent-light transition-colors"
              >
                Voltar ao login
              </button>
            </div>
          </>
        );

      case 'verify':
        return (
          <>
            {apiMessage.text && (
              <div className={`p-3 mb-4 rounded-md text-sm ${
                apiMessage.type === 'success' ? 'bg-green-100 text-green-700' :
                apiMessage.type === 'error' ? 'bg-red-100 text-red-700' : ''
              }`}>
                {apiMessage.text}
              </div>
            )}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-osint-blue/10 rounded-full">
                <CheckCircle className="w-8 h-8 text-osint-blue" />
              </div>
              <h2 className="text-3xl font-bold osint-text-gradient mb-2">Verificação</h2>
              <p className="text-osint-dark-300">Digite o código enviado para seu e-mail</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Código de verificação"
                  value={formData.verificationCode}
                  onChange={(e) => setFormData(prev => ({ ...prev, verificationCode: e.target.value }))}
                  className="osint-input w-full text-center text-2xl tracking-widest"
                  maxLength={6}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || formData.verificationCode.length !== 6}
                className="osint-button w-full flex items-center justify-center disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <div className="loading-spinner mr-2" />
                    Verificando...
                  </>
                ) : (
                  'Verificar'
                )}
              </button>
            </form>

            <div className="mt-6 text-center space-y-3">
              <button className="text-osint-accent hover:text-osint-accent-light transition-colors">
                Reenviar código
              </button>
              <div>
                <button
                  onClick={() => setMode('login')}
                  className="text-osint-dark-300 hover:text-foreground transition-colors"
                >
                  Voltar ao login
                </button>
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <div className="osint-card w-full max-w-md p-8 animate-fade-in">
      {renderModeContent()}
    </div>
  );
};

export default AuthCard;
