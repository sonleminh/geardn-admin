import { ChangeEvent, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import Input from '@/components/Input';
import SuspenseLoader from '@/components/SuspenseLoader';

import { QueryKeys } from '@/constants/query-key';
import { useNotificationContext } from '@/contexts/NotificationContext';
import { useQueryClient } from '@tanstack/react-query';
import { useFormik } from 'formik';

import { ROUTES } from '@/constants/route';

import {
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  FormControl,
  FormHelperText,
  Grid2,
  InputLabel,
  MenuItem,
  Paper,
  Popper,
  Select,
  SelectChangeEvent,
  SxProps,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Theme,
  Typography,
} from '@mui/material';
import { createSchema, updateSchema } from '../utils/schema/warehouseSchema';
import { useGetEnumByContext } from '@/services/enum';
import { useGetProductList } from '@/services/product';
import { useGetSkusByProductId } from '@/services/sku';
import { IProductSku } from '@/interfaces/IProductSku';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import { formatPrice } from '@/utils/format-price';
import { truncateTextByLine } from '@/utils/css-helper.util';
import { useGetWarehouseList } from '@/services/warehouse';
import { useCreateImportLog, useGetImportLogList } from '@/services/inventory';
import moment from 'moment';
import ButtonWithTooltip from '@/components/ButtonWithTooltip';
import ActionButton from '@/components/ActionButton';

interface IImportItem {
  sku: IProductSku;
  quantity: string;
  price: string;
}

const InventoryImportPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showNotification } = useNotificationContext();

  const [productId, setProductId] = useState<number>();
  const [skuId, setSkuId] = useState<string>('');
  const [price, setPrice] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('');
  const [isEditItem, setIsEditItem] = useState<boolean>(false);
  const [editItemIndex, setEditItemIndex] = useState<number | null>(null);
  const [importItems, setImportItems] = useState<IImportItem[]>([]);

  const { data: warehousesData } = useGetWarehouseList();
  const { data: enumData } = useGetEnumByContext('import-type');

  const { data: importLogsData } = useGetImportLogList();
  const { data: skusData } = useGetSkusByProductId(productId);

  const { mutate: createImportLogMutate, isPending: isCreatePending } =
    useCreateImportLog();

  const formik = useFormik({
    initialValues: {
      warehouseId: '',
      type: '',
      note: '',
    },
    // validationSchema: isEdit ? updateSchema : createSchema,
    validateOnChange: false,
    onSubmit(values) {
      console.log('values', values);
      const payload = {
        warehouseId: +values.warehouseId,
        type: values.type,
        note: values.note,
        items: importItems?.map((item) => ({
          skuId: +item.sku.id,
          price: +item.quantity,
          quantity: +item.quantity,
        })),
      };

      createImportLogMutate(payload, {
        onSuccess() {
          queryClient.invalidateQueries({ queryKey: [QueryKeys.ImportLog] });
          showNotification('Tạo nhập hàng thành công', 'success');
          navigate(ROUTES.INVENTORY);
        },
      });
    },
  });

  const handleChangeValue = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    formik.setFieldValue(name, value);
  };

  const handleSelectChange = (event: SelectChangeEvent<string>) => {
    const { name, value } = event.target;
    formik.setFieldValue(name, value);
  };

  const handleSkuSelect = (event: SelectChangeEvent<string>) => {
    setSkuId(event.target.value);
  };

  const handleSaveItem = () => {
    const isAlreadySelected = importItems.some((item) => {
      return item?.sku?.id === +skuId;
    });
    if (isAlreadySelected && !isEditItem) {
      return showNotification('Sku đã tồn tại', 'error');
    }

    const sku = skusData?.data?.find((sku) => sku?.id === +skuId);

    if (editItemIndex !== null && sku && skuId) {
      const updatedImportItems = importItems;
      updatedImportItems[editItemIndex] = {
        sku: sku,
        price: price,
        quantity: quantity,
      };
      setImportItems(updatedImportItems);
      setProductId(undefined);
      setSkuId('');
      setPrice('');
      setQuantity('');
    } else {
      if (sku && skuId && quantity && price) {
        setImportItems((prev) => [
          ...prev,
          { sku: sku, quantity: quantity, price: price },
        ]);
      }
      setProductId(undefined);
      setSkuId('');
      setPrice('');
      setQuantity('');
    }
  };

  const handleEditImportItem = (item: IImportItem, index: number) => {
    setIsEditItem(true);
    setProductId(item?.sku?.product?.id);
    setSkuId(item?.sku?.id?.toString() ?? '');
    setPrice(item?.price.toString() ?? '');
    setQuantity(item?.quantity.toString() ?? '');
    setEditItemIndex(index);
  };

  const handleDeleteImportItem = (itemIndex: number) => {
    const updAttributeList = importItems?.filter(
      (_, index) => index !== itemIndex
    );
    if (updAttributeList?.length === 0) {
      setIsEditItem(false);
    }
    setImportItems(updAttributeList);
  };

  return (
    <Card sx={{ mt: 3, borderRadius: 2 }}>
      <CardHeader
        title={
          <Typography sx={{ fontSize: 20, fontWeight: 500 }}>
            Nhập hàng
          </Typography>
        }
      />
      <Divider />
      <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell align='center'>STT</TableCell>
                <TableCell>Kho</TableCell>
                <TableCell>Sản phẩm</TableCell>
                <TableCell align='center'>Loại nhập</TableCell>
                <TableCell align='center'>Ghi chú</TableCell>
                <TableCell align='center'>Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {importLogsData?.data?.length ? (
                importLogsData?.data?.map((importLog, index) => (
                  <TableRow key={index}>
                    <TableCell align='center'>{index + 1}</TableCell>
                    <TableCell>{importLog?.warehouse?.name}</TableCell>
                    <TableCell>
                      <Box>
                        {importLog?.items?.map((importLogItem) => (
                          <Box sx={{ display: 'flex' }}>
                            <Typography sx={{ fontSize: 14, fontWeight: 500 }}>
                              {importLogItem?.sku?.product?.name}
                            </Typography>
                            {importLogItem?.sku?.productSkuAttributes?.length &&
                              ' - '}
                            <Box
                              sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                ml: 0.5,
                              }}>
                              {importLogItem?.sku?.productSkuAttributes?.length
                                ? importLogItem?.sku?.productSkuAttributes?.map(
                                    (item) => (
                                      <Typography sx={{ fontSize: 14 }}>
                                        {item?.attributeValue?.attribute?.label}
                                        : {item?.attributeValue?.value}
                                      </Typography>
                                    )
                                  )
                                : ''}
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    </TableCell>
                    <TableCell align='center'>
                      {moment(importLog?.createdAt).format('DD/MM/YYYY')}
                    </TableCell>
                    <TableCell align='center'>
                      {importLog?.note ?? 'Không có'}
                    </TableCell>
                    <TableCell align='center'>
                      <ActionButton>
                        <Box mb={1}>
                          <ButtonWithTooltip
                            color='primary'
                            // onClick={() => navigate(`update/${item?.}`)}
                            variant='outlined'
                            title='Chỉnh sửa'
                            placement='left'>
                            <EditOutlinedIcon />
                          </ButtonWithTooltip>
                        </Box>
                        <Box>
                          <ButtonWithTooltip
                            color='error'
                            variant='outlined'
                            title='Xoá'
                            placement='left'>
                            <DeleteOutlineOutlinedIcon />
                          </ButtonWithTooltip>
                        </Box>
                      </ActionButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell align='center' colSpan={6}>
                    Empty
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
      {isCreatePending && <SuspenseLoader />}
    </Card>
  );
};

export default InventoryImportPage;

const helperTextStyle: SxProps<Theme> = {
  color: 'red',
  fontSize: 13,
};
