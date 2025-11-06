import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import ReviewCard from '../components/ReviewCard';
import ServiceCard from '../components/ServiceCard';
import ListingCard from '../components/ListingCard';
import { useApi, ApiEndpoints } from '../services/api';

export default function Dashboard() {
  const api = useApi();

  const profileQuery = useQuery({
    queryKey: ['profile'],
    queryFn: async () => (await api.get(ApiEndpoints.currentUser)).data
  });

  const reviewsQuery = useQuery({
    queryKey: ['reviews'],
    queryFn: async () => (await api.get(ApiEndpoints.reviews, { params: { limit: 5 } })).data
  });

  const servicesQuery = useQuery({
    queryKey: ['services'],
    queryFn: async () => (await api.get(ApiEndpoints.services, { params: { limit: 4 } })).data
  });

  const listingsQuery = useQuery({
    queryKey: ['listings'],
    queryFn: async () => (await api.get(ApiEndpoints.listings, { params: { limit: 4 } })).data
  });

  const profile = profileQuery.data;

  return (
    <AppLayout
      title="Resumen de la comunidad"
      actions={<Link className="btn btn-primary" to="/reviews/new">Compartir reseña</Link>}
    >
      <section className="grid" style={{ marginBottom: '2rem' }}>
        <div className="card">
          <h3>Estado de verificación</h3>
          {profileQuery.isLoading && <p>Cargando...</p>}
          {profileQuery.isError && <p>No se pudo cargar tu perfil.</p>}
          {profile && (
            <>
              <p style={{ color: '#5a6b7d' }}>Unidad {profile.displayUnit ?? 'sin asignar'}</p>
              <p style={{ fontWeight: 600 }}>
                {translateVerification(profile.verificationStatus)}
              </p>
              {profile.verificationStatus !== 'approved' && (
                <p style={{ color: '#5a6b7d' }}>
                  Completa tus datos o sube documentación desde la sección "Mi perfil".
                </p>
              )}
            </>
          )}
        </div>
        <div className="card">
          <h3>Atajos rápidos</h3>
          <div className="grid grid-2" style={{ marginTop: '1rem' }}>
            <Link className="btn btn-secondary" to="/services">
              Buscar servicios
            </Link>
            <Link className="btn btn-secondary" to="/marketplace">
              Ver mercado
            </Link>
            <Link className="btn btn-secondary" to="/register">
              Actualizar perfil
            </Link>
            <Link className="btn btn-secondary" to="/reviews/new">
              Nueva reseña
            </Link>
          </div>
        </div>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <header style={sectionHeaderStyle}>
          <h3 style={{ margin: 0 }}>Reseñas recientes</h3>
          <Link to="/reviews/new">Calificar vecinos o amenities →</Link>
        </header>
        {reviewsQuery.isLoading && <p>Cargando reseñas...</p>}
        {reviewsQuery.isError && <p>No se pudieron cargar las reseñas.</p>}
        <div className="grid" style={{ gap: '1.25rem' }}>
          {reviewsQuery.data?.length ? (
            reviewsQuery.data.map((review: any) => <ReviewCard key={review.id} {...review} />)
          ) : (
            <p>Aún no hay reseñas. Sé el primero en compartir tu experiencia.</p>
          )}
        </div>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <header style={sectionHeaderStyle}>
          <h3 style={{ margin: 0 }}>Servicios recomendados</h3>
          <Link to="/services">Ver todos los servicios →</Link>
        </header>
        {servicesQuery.isLoading && <p>Cargando servicios...</p>}
        {servicesQuery.isError && <p>No se pudieron cargar los servicios.</p>}
        <div className="grid grid-2">
          {servicesQuery.data?.length ? (
            servicesQuery.data.map((service: any) => <ServiceCard key={service.id} {...service} />)
          ) : (
            <p>Todavía no hay servicios cargados en tu edificio o barrio.</p>
          )}
        </div>
      </section>

      <section>
        <header style={sectionHeaderStyle}>
          <h3 style={{ margin: 0 }}>Mercado de vecinos</h3>
          <Link to="/marketplace">Publicar o ver artículos →</Link>
        </header>
        {listingsQuery.isLoading && <p>Cargando publicaciones...</p>}
        {listingsQuery.isError && <p>No se pudieron cargar las publicaciones.</p>}
        <div className="grid grid-2">
          {listingsQuery.data?.length ? (
            listingsQuery.data.map((listing: any) => <ListingCard key={listing.id} {...listing} />)
          ) : (
            <p>No hay productos publicados por tus vecinos todavía.</p>
          )}
        </div>
      </section>
    </AppLayout>
  );
}

const sectionHeaderStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '1rem'
};

function translateVerification(status?: string) {
  const map: Record<string, string> = {
    approved: 'Verificación aprobada ✅',
    pending: 'Verificación en revisión ⏳',
    rejected: 'Verificación rechazada ❌'
  };
  return map[status ?? 'pending'] ?? 'Sin verificar';
}
