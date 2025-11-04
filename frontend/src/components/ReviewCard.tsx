interface ReviewCardProps {
  title: string;
  body: string;
  rating: number;
  visibilityUnit: string;
  type: string;
  helpfulCount: number;
  notHelpfulCount: number;
  createdAt?: string | null;
  images?: string[];
}

export default function ReviewCard({
  title,
  body,
  rating,
  visibilityUnit,
  type,
  helpfulCount,
  notHelpfulCount,
  createdAt,
  images = []
}: ReviewCardProps) {
  return (
    <article className="card" style={{ display: 'grid', gap: '1rem' }}>
      <header>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0 }}>{title}</h3>
          <span className="tag">{translateType(type)}</span>
        </div>
        <p style={{ margin: '0.5rem 0 0', color: '#5a6b7d' }}>Unidad {visibilityUnit}</p>
        <p style={{ margin: '0.25rem 0 0', color: '#9aa6b2', fontSize: '0.9rem' }}>
          {createdAt ? new Date(createdAt).toLocaleString() : 'Fecha no disponible'}
        </p>
      </header>
      <p style={{ margin: 0, lineHeight: 1.6 }}>{body}</p>
      {images.length > 0 && (
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {images.slice(0, 3).map((url) => (
            <img
              key={url}
              src={url}
              alt="Imagen de la reseña"
              style={{ width: '120px', height: '80px', objectFit: 'cover', borderRadius: '8px' }}
            />
          ))}
        </div>
      )}
      <footer style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <strong>{'⭐'.repeat(Math.round(rating))}</strong>
        <span style={{ color: '#5a6b7d', fontSize: '0.9rem' }}>
          {helpfulCount} votos útiles · {notHelpfulCount} no útiles
        </span>
      </footer>
    </article>
  );
}

function translateType(type: string) {
  const map: Record<string, string> = {
    noise: 'Ruidos',
    neighbor: 'Vecinos',
    amenity: 'Prestaciones',
    'green-space': 'Espacios verdes',
    general: 'General'
  };
  return map[type] ?? type;
}
