interface ServiceCardProps {
  name: string;
  category: string;
  description: string;
  averageRating: number;
  ratingCount: number;
  contact: {
    phone?: string;
    email?: string;
    url?: string;
  };
  tags?: string[];
}

export default function ServiceCard({ name, category, description, averageRating, ratingCount, contact, tags = [] }: ServiceCardProps) {
  return (
    <article className="card" style={{ display: 'grid', gap: '0.75rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ margin: 0 }}>{name}</h3>
          <p style={{ margin: '0.25rem 0 0', color: '#5a6b7d' }}>{category}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <strong>{averageRating.toFixed(1)} ⭐</strong>
          <p style={{ margin: 0, color: '#9aa6b2', fontSize: '0.85rem' }}>{ratingCount} reseñas</p>
        </div>
      </header>
      <p style={{ margin: 0, lineHeight: 1.5 }}>{description}</p>
      {tags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {tags.map((tag) => (
            <span key={tag} className="tag">
              {tag}
            </span>
          ))}
        </div>
      )}
      <footer style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', color: '#3f4bff' }}>
        {contact.phone && <a href={`tel:${contact.phone}`}>📞 {contact.phone}</a>}
        {contact.email && <a href={`mailto:${contact.email}`}>✉️ {contact.email}</a>}
        {contact.url && (
          <a href={contact.url} target="_blank" rel="noopener noreferrer">
            🌐 Sitio web
          </a>
        )}
      </footer>
    </article>
  );
}
