'use client';

import { Loader2, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useDeleteSpecialPrice } from '@/features/customers/api/use-delete-special-price';
import { useUpdateSpecialPrice } from '@/features/customers/api/use-update-special-price';
import { useGetProducts } from '@/features/products/api/use-get-products';

interface CustomerPricingTableProps {
  customerId: string;
  specialPrices?: {
    productId: string;
    customPrice: string; // Decimal comes as string from API usually, or number
    product: {
      name: string;
      basePrice: string;
    };
  }[];
}

export const CustomerPricingTable = ({ customerId, specialPrices = [] }: CustomerPricingTableProps) => {
  const { data: products, isLoading: isLoadingProducts } = useGetProducts();
  const { mutate: updatePrice, isPending: isUpdating } = useUpdateSpecialPrice({ customerId });
  const { mutate: deletePrice, isPending: isDeleting } = useDeleteSpecialPrice({ customerId });

  // Local state for editing prices before saving
  const [editingPrices, setEditingPrices] = useState<Record<string, string>>({});

  const handlePriceChange = (productId: string, value: string) => {
    setEditingPrices((prev) => ({ ...prev, [productId]: value }));
  };

  const handleSave = (productId: string) => {
    const price = parseFloat(editingPrices[productId]);
    if (isNaN(price) || price < 0) return;

    updatePrice(
      { productId, price },
      {
        onSuccess: () => {
          // Clear local edit state on success
          setEditingPrices((prev) => {
            const newState = { ...prev };
            delete newState[productId];
            return newState;
          });
        },
      },
    );
  };

  const handleDelete = (productId: string) => {
    deletePrice(productId);
  };

  const getSpecialPrice = (productId: string) => {
    return specialPrices.find((sp) => sp.productId === productId);
  };

  if (isLoadingProducts) {
    return (
      <div className="flex justify-center p-4">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Special Pricing
        </CardTitle>
        <CardDescription>
          Set custom prices for specific products. These override the base product price.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Base Price</TableHead>
                <TableHead>Custom Price</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products?.map((product) => {
                const specialPrice = getSpecialPrice(product.id);
                const currentEditValue = editingPrices[product.id];
                const displayValue = currentEditValue !== undefined ? currentEditValue : specialPrice?.customPrice?.toString() || '';
                const isModified = currentEditValue !== undefined && currentEditValue !== (specialPrice?.customPrice?.toString() || '');

                return (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{Number(product.basePrice).toFixed(2)}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Default"
                        value={displayValue}
                        onChange={(e) => handlePriceChange(product.id, e.target.value)}
                        className="w-32"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {isModified ? (
                          <Button
                            size="sm"
                            onClick={() => handleSave(product.id)}
                            disabled={isUpdating}
                          >
                            Save
                          </Button>
                        ) : specialPrice ? (
                          <Button
                            size="icon"
                            variant="destructive"
                            onClick={() => handleDelete(product.id)}
                            disabled={isDeleting}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        ) : null}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
