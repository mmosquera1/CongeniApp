import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import AppLayout from '../components/AppLayout';
import { useApi, ApiEndpoints, ReviewPayload } from '../services/api';
import { storage } from '../firebase';
import { useAuthContext } from '../context/AuthContext';

interface ReviewFormValues {
  buildingId: string;
  type: ReviewPayload['type'];
  title: string;
  body: string;
  rating: number;
  images: FileList;
}

export default function NewReviewPage() {
  const api = useApi();
  const { user } = useAuthContext();
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<ReviewFormValues>();

  const createReviewMutation = useMutation({
    mutationFn: async (payload: ReviewPayload) => api.post(ApiEndpoints.reviews, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      alert('Reseña publicada');
      reset();
    },
    onError: () => alert('No se pudo publicar la reseña, intenta nuevamente.')
  });

  const onSubmit = handleSubmit(async (data) => {
    try {
      setUploading(true);
      const imageUrls: string[] = [];

      if (data.images?.length) {
        const files = Array.from(data.images).slice(0, 3);
        for (const file of files) {
          const storageRef = ref(
            storage,
            `reviewImages/${user?.uid}/${Date.now()}-${file.name.replace(/\s+/g, '-')}`
          );
          await uploadBytes(storageRef, file);
          const url = await getDownloadURL(storageRef);
          imageUrls.push(url);
        }
      }

      await createReviewMutation.mutateAsync({
        buildingId: data.buildingId,
        type: data.type,
        title: data.title,
        body: data.body,
        rating: Number(data.rating),
        images: imageUrls
      });
    } catch (error) {
      console.error(error);
      alert('Ocurrió un error al subir las imágenes.');
    } finally {
      setUploading(false);
    }
  });

  return (
    <AppLayout title="Nueva reseña">
      <form onSubmit={onSubmit} className="card" style={{ display: 'grid', gap: '1rem', maxWidth: '720px' }}>
        <label>
          ID del edificio
          <input
            placeholder="Ej: torre-central-01"
            {...register('buildingId', { required: 'Debes indicar el edificio' })}
          />
          {errors.buildingId && <span style={errorStyle}>{errors.buildingId.message}</span>}
        </label>

        <label>
          Tipo de reseña
          <select {...register('type', { required: 'Selecciona una categoría' })}>
            <option value="noise">Ruidos molestos</option>
            <option value="neighbor">Vecino</option>
            <option value="amenity">Prestaciones comunes</option>
            <option value="green-space">Espacios verdes</option>
            <option value="general">General</option>
          </select>
        </label>

        <label>
          Título
          <input {...register('title', { required: 'Escribe un título corto' })} />
          {errors.title && <span style={errorStyle}>{errors.title.message}</span>}
        </label>

        <label>
          Descripción
          <textarea rows={5} {...register('body', { required: 'Describe tu experiencia', minLength: 20 })} />
          {errors.body && <span style={errorStyle}>La reseña debe tener al menos 20 caracteres.</span>}
        </label>

        <label>
          Calificación (1 a 5)
          <input type="number" min={1} max={5} {...register('rating', { required: 'Indica una calificación' })} />
        </label>

        <label>
          Imágenes (máx. 3)
          <input type="file" accept="image/*" multiple {...register('images')} />
          <small style={{ color: '#5a6b7d' }}>Sube fotos en formato JPG o PNG. Máximo 3 archivos.</small>
        </label>

        <button type="submit" className="btn btn-primary" disabled={isSubmitting || uploading}>
          Publicar reseña
        </button>
      </form>
    </AppLayout>
  );
}

const errorStyle: React.CSSProperties = {
  color: '#d64545',
  fontSize: '0.85rem'
};
