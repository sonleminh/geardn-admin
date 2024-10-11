import * as yup from 'yup'

export const createSchema = yup.object({
  product_id: yup.string().required('Nội dung này không được để trống!').max(50, 'Không được vượt quá 50 ký tự!'),
  attributes: yup.array().max(3, 'Nhập tối đa 3 phân loại!'),
  price: yup.number(),
  quantity: yup.number(),
})

export const updateSchema = yup.object({
  product_id: yup.string().required('Nội dung này không được để trống!').max(50, 'Không được vượt quá 50 ký tự!'),
  attributes: yup.array().max(3, 'Nhập tối đa 3 phân loại!'),
  price: yup.number(),
  quantity: yup.number(),
})