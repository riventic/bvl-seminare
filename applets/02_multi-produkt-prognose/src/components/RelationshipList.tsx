import {
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip
} from '@mui/material';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { ProductRelationship, Product } from '../types';
import { colors } from '../theme/colors';
import { getProductName } from '../utils/relationshipDetection';

interface RelationshipListProps {
  relationships: ProductRelationship[];
  products: Product[];
}

export default function RelationshipList({ relationships, products }: RelationshipListProps) {
  const { t } = useTranslation();

  if (relationships.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {t('relationships.title')}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
            {t('relationships.noRelationships')}
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {t('relationships.title')}
        </Typography>

        <TableContainer sx={{ maxHeight: 400 }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>{t('products.product')}</TableCell>
                <TableCell>{t('relationships.type')}</TableCell>
                <TableCell align="right">{t('relationships.correlation')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {relationships.map((rel, index) => (
                <TableRow key={index} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight="500">
                      {getProductName(rel.productA, products)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      ↔ {getProductName(rel.productB, products)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={
                        rel.type === 'complementary'
                          ? t('relationships.complementary')
                          : rel.type === 'substitute'
                          ? t('relationships.substitute')
                          : t('relationships.neutral')
                      }
                      size="small"
                      icon={
                        rel.type === 'complementary' ? (
                          <TrendingUp size={14} />
                        ) : rel.type === 'substitute' ? (
                          <TrendingDown size={14} />
                        ) : undefined
                      }
                      sx={{
                        bgcolor:
                          rel.type === 'complementary'
                            ? colors.success[100]
                            : rel.type === 'substitute'
                            ? colors.warning[100]
                            : colors.gray[100],
                        color:
                          rel.type === 'complementary'
                            ? colors.success[700]
                            : rel.type === 'substitute'
                            ? colors.warning[700]
                            : colors.gray[700],
                        fontWeight: 500,
                        fontSize: '0.7rem'
                      }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Typography
                      variant="body2"
                      fontWeight="600"
                      sx={{
                        color: rel.correlation > 0 ? colors.success[600] : colors.error[600]
                      }}
                    >
                      {rel.correlation > 0 ? '+' : ''}
                      {rel.correlation.toFixed(2)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {rel.strength === 'strong'
                        ? t('relationships.strong')
                        : rel.strength === 'moderate'
                        ? t('relationships.moderate')
                        : t('relationships.weak')}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
}
