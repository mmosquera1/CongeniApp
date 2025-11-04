import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Navigate } from 'react-router-dom';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { useAuthContext } from '../context/AuthContext';

interface AuthFormValues {
  email: string;
  password: string;
}

export default function AuthPage() {
  const [isRegister, setIsRegister] = useState(false);
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<AuthFormValues>();

  if (user) {
    return <Navigate to="/" replace />;
  }

  const onSubmit = async (values: AuthFormValues) => {
    try {
      if (isRegister) {
        await createUserWithEmailAndPassword(auth, values.email, values.password);
        navigate('/register');
      } else {
        await signInWithEmailAndPassword(auth, values.email, values.password);
        navigate('/');
      }
    } catch (error) {
      console.error('Auth error', error);
      alert('No se pudo completar la operación. Verifica tus datos.');
    }
  };

  const handleGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      navigate('/register');
    } catch (error) {
      console.error('Google auth error', error);
      alert('No se pudo autenticar con Google.');
    }
  };

  return (
    <div className="container" style={{ maxWidth: '420px', marginTop: '4rem' }}>
      <div className="card">
        <h2>{isRegister ? 'Crear cuenta' : 'Iniciar sesión'}</h2>
        <p style={{ color: '#5a6b7d' }}>
          {isRegister
            ? 'Crea una cuenta para acceder a la comunidad y completar tu perfil residencial.'
            : 'Ingresa a tu cuenta para ver reseñas de vecinos, servicios y el mercado local.'}
        </p>

        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'grid', gap: '1rem', marginTop: '1.5rem' }}>
          <label>
            Correo electrónico
            <input
              type="email"
              placeholder="tu-email@ejemplo.com"
              {...register('email', { required: 'El email es obligatorio' })}
            />
            {errors.email && <span style={errorStyle}>{errors.email.message}</span>}
          </label>

          <label>
            Contraseña
            <input
              type="password"
              placeholder="••••••••"
              {...register('password', { required: 'La contraseña es obligatoria', minLength: 6 })}
            />
            {errors.password && <span style={errorStyle}>La contraseña debe tener al menos 6 caracteres.</span>}
          </label>

          <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
            {isRegister ? 'Crear cuenta' : 'Ingresar'}
          </button>
        </form>

        <button className="btn btn-secondary" style={{ width: '100%', marginTop: '1rem' }} onClick={handleGoogle}>
          Continuar con Google
        </button>

        <p style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          {isRegister ? '¿Ya tienes una cuenta?' : '¿Aún no tienes cuenta?'}{' '}
          <button
            type="button"
            onClick={() => setIsRegister((prev) => !prev)}
            style={{
              border: 'none',
              background: 'none',
              color: '#2741d9',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            {isRegister ? 'Inicia sesión' : 'Crea una cuenta'}
          </button>
        </p>
      </div>
    </div>
  );
}

const errorStyle: React.CSSProperties = {
  color: '#d64545',
  fontSize: '0.85rem'
};
