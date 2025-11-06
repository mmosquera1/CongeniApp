import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import AppLayout from '../components/AppLayout';
import ListingCard from '../components/ListingCard';
import { useApi, ApiEndpoints, ListingPayload } from '../services/api';
import { storage } from '../firebase';
import { useAuthContext } from '../context/AuthContext';

interface StatusForm {
  listingId: string;
  status: 'active' | 'reserved' | 'sold';
}

export default function MarketplacePage() {
  const api = useApi();
  const queryClient = useQueryClient();
  const { user } = useAuthContext();
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState<FileList | null>(null);

  const listingsQuery = useQuery({
    queryKey: ['listings'],
    queryFn: async () => (await api.get(ApiEndpoints.listings)).data
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<ListingPayload>();

  const {
    register: registerStatus,
    handleSubmit: handleStatus,
    formState: { isSubmitting: statusSubmitting }
  } = useForm<StatusForm>();

  const createListingMutation = useMutation({
    mutationFn: async (payload: ListingPayload) => api.post(ApiEndpoints.listings, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      reset();
      setFiles(null);
      alert('Publicación creada');
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ listingId, status }: StatusForm) =>
      api.patch(ApiEndpoints.listingStatus(listingId), { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      alert('Estado actualizado');
    }
  });

  const onSubmitListing = handleSubmit(async (data) => {
    try {
      setUploading(true);
      let imageUrls: string[] = [];
      if (files?.length) {
        const selected = Array.from(files).slice(0, 6);
        imageUrls = await Promise.all(
          selected.map(async (file) => {
            const storageRef = ref(
              storage,
              `marketplace/${user?.uid}/${Date.now()}-${file.name.replace(/\s+/g, '-')}`
            );
            await uploadBytes(storageRef, file);
            return getDownloadURL(storageRef);
          })
        );
      }

      await createListingMutation.mutateAsync({
        ...data,
        price: Number(data.price),
        imageUrls
      });
    } catch (error) {
      console.error(error);
      alert('No se pudieron subir las imágenes.');
    } finally {
      setUploading(false);
    }
  });

  const onSubmitStatus = handleStatus((data) => {
    updateStatusMutation.mutate(data);
  });

  return (
    <AppLayout title="Mercado de vecinos">
      <section className="card" style={{ marginBottom: '2rem', display: 'grid', gap: '1rem' }}>
        <h3>Publicar artículo</h3>
        <form onSubmit={onSubmitListing} className="grid grid-2" style={{ gap: '1rem' }}>
          <label>
            Título
            <input {...register('title', { required: 'Campo obligatorio' })} />
            {errors.title && <span style={errorStyle}>{errors.title.message}</span>}
          </label>
          <label>
            ID del edificio
            <input {...register('buildingId', { required: 'Campo obligatorio' })} placeholder="torre-central-01" />
            {errors.buildingId && <span style={errorStyle}>{errors.buildingId.message}</span>}
          </label>
          <label style={{ gridColumn: '1 / -1' }}>
            Descripción
            <textarea rows={4} {...register('description', { required: 'Describe el producto' })} />
          </label>
          <label>
            Precio
            <input
              type="number"
              step="0.01"
              {...register('price', { required: 'Indica un precio', valueAsNumber: true })}
            />
          </label>
          <label>
            Moneda
            <input {...register('currency', { required: true })} placeholder="ARS" />
          </label>
          <label>
            Condición
            <select {...register('condition', { required: true })}>
              <option value="new">Nuevo</option>
              <option value="used">Usado</option>
            </select>
          </label>
          <label style={{ gridColumn: '1 / -1' }}>
            Imágenes (máx. 6)
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(event) => setFiles(event.target.files)}
            />
          </label>
          <button type="submit" className="btn btn-primary" disabled={isSubmitting || uploading}>
            Publicar artículo
          </button>
        </form>
      </section>

      <section className="grid" style={{ gap: '1.5rem' }}>
        <div>
          <h3>Publicaciones disponibles</h3>
          {listingsQuery.isLoading && <p>Cargando artículos...</p>}
          {listingsQuery.isError && <p>No se pudieron cargar las publicaciones.</p>}
          <div className="grid grid-2">
            {listingsQuery.data?.length ? (
              listingsQuery.data.map((listing: any) => <ListingCard key={listing.id} {...listing} />)
            ) : (
              <p>No hay artículos publicados.</p>
            )}
          </div>
        </div>

        <div className="card">
          <h3>Actualizar estado</h3>
          <form onSubmit={onSubmitStatus} className="grid" style={{ gap: '1rem' }}>
            <label>
              ID del artículo
              <input {...registerStatus('listingId', { required: true })} placeholder="ID del documento" />
            </label>
            <label>
              Estado
              <select {...registerStatus('status')}>
                <option value="active">Disponible</option>
                <option value="reserved">Reservado</option>
                <option value="sold">Vendido</option>
              </select>
            </label>
            <button type="submit" className="btn btn-secondary" disabled={statusSubmitting}>
              Guardar cambios
            </button>
          </form>
        </div>
      </section>
    </AppLayout>
  );
}

const errorStyle: React.CSSProperties = {
  color: '#d64545',
  fontSize: '0.85rem'
};
