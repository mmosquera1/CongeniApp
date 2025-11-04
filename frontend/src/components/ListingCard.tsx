interface ListingCardProps {
  title: string;
  description: string;
  price: number;
  currency: string;
  condition: 'new' | 'used';
  imageUrls?: string[];
  status: string;
}

export default function ListingCard({ title, description, price, currency, condition, imageUrls = [], status }: ListingCardProps) {
  const currencyFormatter = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency
  });

  return (
    <article className="card" style={{ display: 'grid', gap: '0.75rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0 }}>{title}</h3>
        <span className="tag">{condition === 'new' ? 'Nuevo' : 'Usado'}</span>
      </header>
      <p style={{ margin: 0, color: '#5a6b7d' }}>{description}</p>
      {imageUrls.length > 0 && (
        <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto' }}>
          {imageUrls.slice(0, 3).map((url) => (
            <img
              key={url}
              src={url}
              alt="Artículo"
              style={{ width: '120px', height: '80px', objectFit: 'cover', borderRadius: '8px' }}
            />
          ))}
        </div>
      )}
      <footer style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <strong>{currencyFormatter.format(price)}</strong>
        <span style={{ color: status === 'active' ? '#2f9e44' : '#9aa6b2' }}>{translateStatus(status)}</span>
      </footer>
    </article>
  );
}

function translateStatus(status: string) {
  const statuses: Record<string, string> = {
    active: 'Disponible',
    reserved: 'Reservado',
    sold: 'Vendido'
  };
  return statuses[status] ?? status;
}
