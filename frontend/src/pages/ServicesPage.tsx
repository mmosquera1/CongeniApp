import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import AppLayout from '../components/AppLayout';
import ServiceCard from '../components/ServiceCard';
import { useApi, ApiEndpoints, ServicePayload } from '../services/api';

interface RateForm {
  serviceId: string;
  value: number;
  comment: string;
}

export default function ServicesPage() {
  const api = useApi();
  const queryClient = useQueryClient();

  const servicesQuery = useQuery({
    queryKey: ['services'],
    queryFn: async () => (await api.get(ApiEndpoints.services)).data
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<ServicePayload>({
    defaultValues: {
      contact: {}
    }
  });

  const {
    register: registerRate,
    handleSubmit: handleRate,
    formState: { isSubmitting: ratingSubmitting }
  } = useForm<RateForm>();

  const createServiceMutation = useMutation({
    mutationFn: async (payload: ServicePayload) => api.post(ApiEndpoints.services, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      reset();
      alert('Servicio publicado correctamente');
    }
  });

  const rateServiceMutation = useMutation({
    mutationFn: async ({ serviceId, value, comment }: RateForm) =>
      api.post(ApiEndpoints.serviceRatings(serviceId), { value: Number(value), comment }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      alert('¡Gracias por tu valoración!');
    }
  });

  const onSubmitService = handleSubmit((data) => {
    createServiceMutation.mutate(data);
  });

  const onRateService = handleRate((data) => {
    rateServiceMutation.mutate(data);
  });

  return (
    <AppLayout title="Servicios para tu comunidad">
      <section className="card" style={{ display: 'grid', gap: '1rem', marginBottom: '2rem' }}>
        <h3>Recomendar servicio</h3>
        <form onSubmit={onSubmitService} className="grid grid-2" style={{ gap: '1rem' }}>
          <label>
            Nombre del servicio
            <input {...register('name', { required: 'Campo obligatorio' })} />
            {errors.name && <span style={errorStyle}>{errors.name.message}</span>}
          </label>
          <label>
            Categoría
            <input {...register('category', { required: 'Campo obligatorio' })} />
          </label>
          <label>
            ID de edificio (opcional)
            <input {...register('buildingId')} placeholder="torre-central-01" />
          </label>
          <label>
            ID de barrio (opcional)
            <input {...register('neighborhoodId')} placeholder="barrio-parque-norte" />
          </label>
          <label style={{ gridColumn: '1 / -1' }}>
            Descripción
            <textarea rows={4} {...register('description', { required: 'Describe el servicio' })} />
          </label>
          <label>
            Teléfono de contacto
            <input {...register('contact.phone')} />
          </label>
          <label>
            Email de contacto
            <input type="email" {...register('contact.email')} />
          </label>
          <label>
            Sitio web
            <input {...register('contact.url')} placeholder="https://" />
          </label>
          <label style={{ gridColumn: '1 / -1' }}>
            Etiquetas (separadas por coma)
            <input
              placeholder="urgencias, 24hs, recomendado"
              {...register('tags', {
                setValueAs: (value) =>
                  typeof value === 'string' && value.length > 0
                    ? value.split(',').map((tag: string) => tag.trim())
                    : []
              })}
            />
          </label>
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            Publicar servicio
          </button>
        </form>
      </section>

      <section className="grid" style={{ gap: '1.5rem' }}>
        <div>
          <h3>Servicios de la comunidad</h3>
          {servicesQuery.isLoading && <p>Cargando servicios...</p>}
          {servicesQuery.isError && <p>No se pudieron cargar los servicios.</p>}
          <div className="grid grid-2">
            {servicesQuery.data?.length ? (
              servicesQuery.data.map((service: any) => <ServiceCard key={service.id} {...service} />)
            ) : (
              <p>No hay servicios registrados por el momento.</p>
            )}
          </div>
        </div>

        <div className="card">
          <h3>Calificar un servicio</h3>
          <form onSubmit={onRateService} className="grid" style={{ gap: '1rem' }}>
            <label>
              ID del servicio
              <input {...registerRate('serviceId', { required: true })} placeholder="ID del documento" />
            </label>
            <label>
              Puntuación
              <select {...registerRate('value', { valueAsNumber: true })}>
                <option value={5}>5 - Excelente</option>
                <option value={4}>4 - Muy bueno</option>
                <option value={3}>3 - Bueno</option>
                <option value={2}>2 - Regular</option>
                <option value={1}>1 - Malo</option>
              </select>
            </label>
            <label>
              Comentario
              <textarea rows={3} {...registerRate('comment')} placeholder="Cuéntanos tu experiencia" />
            </label>
            <button type="submit" className="btn btn-secondary" disabled={ratingSubmitting}>
              Enviar valoración
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
