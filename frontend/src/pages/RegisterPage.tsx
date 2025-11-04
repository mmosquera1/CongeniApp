import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import AppLayout from '../components/AppLayout';
import { useApi, ApiEndpoints, RegisterPayload } from '../services/api';

type VerificationMethod = 'geo' | 'document';

export default function RegisterPage() {
  const api = useApi();
  const queryClient = useQueryClient();
  const [verificationMethod, setVerificationMethod] = useState<VerificationMethod>('geo');
  const [geoPoint, setGeoPoint] = useState<{ lat: number; lng: number } | undefined>();
  const [uploading, setUploading] = useState(false);

  const profileQuery = useQuery({
    queryKey: ['profile'],
    queryFn: async () => (await api.get(ApiEndpoints.currentUser)).data
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<RegisterPayload>({
    defaultValues: {
      address: {
        street: '',
        city: '',
        province: '',
        country: 'Argentina',
        postalCode: ''
      }
    }
  });

  useEffect(() => {
    if (profileQuery.data) {
      const profile = profileQuery.data;
      reset({
        fullName: profile.fullName ?? '',
        email: profile.email ?? '',
        unitNumber: profile.unitNumber ?? '',
        phoneNumber: profile.phoneNumber ?? '',
        displayUnit: profile.displayUnit ?? '',
        buildingId: profile.buildingId ?? '',
        address: profile.address ?? {
          street: '',
          city: '',
          province: '',
          country: 'Argentina',
          postalCode: ''
        },
        verificationMethod: (profile.verificationMethod as VerificationMethod) ?? 'geo'
      });
      if (profile.geoPoint) {
        setGeoPoint(profile.geoPoint);
      }
    }
  }, [profileQuery.data, reset]);

  const registerMutation = useMutation({
    mutationFn: async (payload: RegisterPayload) => api.post(ApiEndpoints.registerUser, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      alert('Perfil actualizado');
    },
    onError: () => {
      alert('No se pudo registrar el perfil. Revisa la dirección o intenta cargando documentación.');
    }
  });

  const onSubmit = handleSubmit(async (data) => {
    registerMutation.mutate({
      ...data,
      verificationMethod,
      geoPoint
    });
  });

  const captureLocation = () => {
    if (!navigator.geolocation) {
      alert('Tu navegador no soporta geolocalización automática.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGeoPoint({ lat: position.coords.latitude, lng: position.coords.longitude });
      },
      () => alert('No se pudo obtener tu ubicación. Concede permisos al navegador.'),
      { enableHighAccuracy: true }
    );
  };

  const uploadDocument = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const type = event.target.getAttribute('data-type') as string;
    const formData = new FormData();
    formData.append('type', type);
    formData.append('document', file);

    try {
      setUploading(true);
      await api.post(ApiEndpoints.verificationDocs, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Documento subido correctamente. Un administrador lo revisará.');
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    } catch (error) {
      console.error(error);
      alert('No se pudo subir el documento.');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  return (
    <AppLayout title="Mi perfil residencial">
      <form onSubmit={onSubmit} className="grid" style={{ gap: '1.5rem' }}>
        <section className="card" style={{ display: 'grid', gap: '1rem' }}>
          <h3>Datos personales</h3>
          <div className="grid grid-2">
            <label>
              Nombre completo
              <input {...register('fullName', { required: 'Campo obligatorio' })} />
              {errors.fullName && <span style={errorStyle}>{errors.fullName.message}</span>}
            </label>
            <label>
              Email
              <input type="email" {...register('email', { required: 'Campo obligatorio' })} />
              {errors.email && <span style={errorStyle}>{errors.email.message}</span>}
            </label>
            <label>
              Teléfono
              <input {...register('phoneNumber', { required: 'Campo obligatorio' })} />
              {errors.phoneNumber && <span style={errorStyle}>{errors.phoneNumber.message}</span>}
            </label>
            <label>
              Unidad / Departamento
              <input {...register('unitNumber', { required: 'Campo obligatorio' })} />
              {errors.unitNumber && <span style={errorStyle}>{errors.unitNumber.message}</span>}
            </label>
          </div>
        </section>

        <section className="card" style={{ display: 'grid', gap: '1rem' }}>
          <h3>Dirección y edificio</h3>
          <div className="grid grid-2">
            <label>
              Calle y número
              <input {...register('address.street', { required: 'Campo obligatorio' })} />
              {errors.address?.street && <span style={errorStyle}>{errors.address.street.message as string}</span>}
            </label>
            <label>
              Ciudad
              <input {...register('address.city', { required: 'Campo obligatorio' })} />
              {errors.address?.city && <span style={errorStyle}>{errors.address.city.message as string}</span>}
            </label>
            <label>
              Provincia
              <input {...register('address.province', { required: 'Campo obligatorio' })} />
            </label>
            <label>
              Código postal
              <input {...register('address.postalCode', { required: 'Campo obligatorio' })} />
            </label>
            <label>
              País
              <input {...register('address.country', { required: 'Campo obligatorio' })} />
            </label>
            <label>
              ID del edificio (Firestore)
              <input
                placeholder="Ej: torre-central-01"
                {...register('buildingId', { required: 'Debes indicar tu edificio' })}
              />
              {errors.buildingId && <span style={errorStyle}>{errors.buildingId.message}</span>}
            </label>
            <label>
              Etiqueta pública de la unidad
              <input
                placeholder="Torre A - Piso 4 - Dpto 2"
                {...register('displayUnit', { required: 'Campo obligatorio' })}
              />
              {errors.displayUnit && <span style={errorStyle}>{errors.displayUnit.message}</span>}
            </label>
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <label style={{ flex: '1' }}>
              Método de verificación
              <select value={verificationMethod} onChange={(event) => setVerificationMethod(event.target.value as VerificationMethod)}>
                <option value="geo">Ubicación automática (50 m)</option>
                <option value="document">Subir documentación</option>
              </select>
            </label>

            {verificationMethod === 'geo' && (
              <button type="button" className="btn btn-secondary" onClick={captureLocation}>
                Usar mi ubicación actual
              </button>
            )}
          </div>

          {verificationMethod === 'geo' && geoPoint && (
            <p style={{ color: '#2f9e44' }}>
              Posición capturada ✅ Lat: {geoPoint.lat.toFixed(5)} · Lng: {geoPoint.lng.toFixed(5)}
            </p>
          )}

          {verificationMethod === 'document' && (
            <div className="grid grid-2">
              <label>
                DNI vigente
                <input type="file" accept="image/*,application/pdf" data-type="dni" onChange={uploadDocument} disabled={uploading} />
              </label>
              <label>
                Contrato de alquiler / Escritura
                <input type="file" accept="image/*,application/pdf" data-type="lease" onChange={uploadDocument} disabled={uploading} />
              </label>
              <label>
                Factura de servicio público
                <input type="file" accept="image/*,application/pdf" data-type="utility" onChange={uploadDocument} disabled={uploading} />
              </label>
            </div>
          )}
        </section>

        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          Guardar y enviar verificación
        </button>
      </form>
    </AppLayout>
  );
}

const errorStyle: React.CSSProperties = {
  color: '#d64545',
  fontSize: '0.85rem'
};
