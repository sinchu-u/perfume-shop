export const formatPrice = (price) => {
  if (price === null || price === undefined) return '—';
  return new Intl.NumberFormat('uk-UA', {
    style: 'currency',
    currency: 'UAH',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

export const formatDate = (dateString) => {
  return new Intl.DateTimeFormat('uk-UA', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(dateString));
};

export const getOrderStatusLabel = (status) => {
  const labels = {
    0: 'Очікує оплати',
    1: 'Оплачено',
    2: 'Пакується',
    3: 'Відправлено',
    4: 'Доставлено',
    Pending: 'Очікує оплати',
    Paid: 'Оплачено',
    Packing: 'Пакується',
    Shipped: 'Відправлено',
    Delivered: 'Доставлено',
  };
  return labels[status] ?? String(status);
};

export const getOrderStatusColor = (status) => {
  const colors = {
    0: '#8B6F4E',
    1: '#27AE60',
    2: '#2980B9',
    3: '#8E44AD',
    4: '#2C3E2D',
    Pending: '#8B6F4E',
    Paid: '#27AE60',
    Packing: '#2980B9',
    Shipped: '#8E44AD',
    Delivered: '#2C3E2D',
  };
  return colors[status] ?? '#8A8A7E';
};

export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http')) return imagePath;
  return `http://localhost:5246${imagePath}`;
};

export const renderStars = (rating) => {
  const full = Math.round(rating);
  return '★'.repeat(full) + '☆'.repeat(5 - full);
};
