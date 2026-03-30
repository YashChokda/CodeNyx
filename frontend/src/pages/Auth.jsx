import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { auth, db } from '../config/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setUser } = useApp();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      let cred;
      if (isLogin) {
        cred = await signInWithEmailAndPassword(auth, email, password);
      } else {
        cred = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, 'users', cred.user.uid), {
          email: cred.user.email, role: 'Innovator', createdAt: new Date().toISOString()
        });
      }
      const profile = await getDoc(doc(db, 'users', cred.user.uid));
      setUser({ uid: cred.user.uid, email: cred.user.email, ...profile.data() });
      navigate('/domain');
    } catch (err) {
      setError(err.message.replace('Firebase: ', ''));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10 animate-fade-in">
          <h1 className="font-heading text-4xl md:text-5xl text-amber-400 mb-3">Vision To Venture</h1>
          <p className="text-gray-400 text-lg">Turn bold ideas into real-world impact</p>
        </div>
        <div className="glass-card animate-slide-up">
          <div className="flex mb-6 border-b border-dark-border">
            {['Login', 'Sign Up'].map((t, i) => (
              <button key={t} onClick={() => { setIsLogin(i === 0); setError(''); }}
                className={`flex-1 pb-3 text-sm font-medium transition-all ${(isLogin ? 0 : 1) === i ? 'text-amber-400 border-b-2 border-amber-400' : 'text-gray-500'}`}>
                {t}
              </button>
            ))}
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)}
              className="input-field" required />
            <input type="password" placeholder="Password (min 6 chars)" value={password} onChange={e => setPassword(e.target.value)}
              className="input-field" required minLength={6} />
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Please wait...' : isLogin ? 'Login as Innovator' : 'Create Account'}
            </button>
          </form>
          <p className="text-center text-xs text-gray-500 mt-6">Role: <span className="text-amber-400/70">Innovator</span></p>
        </div>
      </div>
    </div>
  );
}
