import { Box, Typography, Checkbox, FormControlLabel, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { Product } from '../types';

interface ProductSelectorProps {
  products: Product[];
  selectedProducts: Set<string>;
  onChange: (selected: Set<string>) => void;
}

export default function ProductSelector({ products, selectedProducts, onChange }: ProductSelectorProps) {
  const { t } = useTranslation();

  const handleToggle = (productId: string) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    onChange(newSelected);
  };

  const handleSelectAll = () => {
    onChange(new Set(products.map(p => p.id)));
  };

  const handleDeselectAll = () => {
    onChange(new Set());
  };

  return (
    <Box sx={{ pt: 2, pb: 1, px: 2, borderTop: '1px solid', borderColor: 'divider' }}>
      {/* Header row with title and action buttons */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1, flexWrap: 'wrap' }}>
        <Typography variant="body2" fontWeight="600">
          {t('chart.showProducts')} ({selectedProducts.size} {t('products.of')} {products.length})
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button size="small" variant="text" onClick={handleSelectAll} sx={{ minWidth: 'auto', px: 1, py: 0.5 }}>
            <Typography variant="caption">{t('products.selectAll')}</Typography>
          </Button>
          <Button size="small" variant="text" onClick={handleDeselectAll} sx={{ minWidth: 'auto', px: 1, py: 0.5 }}>
            <Typography variant="caption">{t('products.deselectAll')}</Typography>
          </Button>
        </Box>
      </Box>

      {/* Horizontal row of checkboxes */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
        {products.map(product => (
          <FormControlLabel
            key={product.id}
            control={
              <Checkbox
                size="small"
                checked={selectedProducts.has(product.id)}
                onChange={() => handleToggle(product.id)}
                sx={{
                  py: 0,
                  color: product.color,
                  '&.Mui-checked': {
                    color: product.color
                  }
                }}
              />
            }
            label={<Typography variant="caption">{product.name}</Typography>}
            sx={{ mr: 1, mb: 0 }}
          />
        ))}
      </Box>
    </Box>
  );
}
