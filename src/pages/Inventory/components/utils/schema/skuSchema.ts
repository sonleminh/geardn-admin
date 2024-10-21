import * as yup from 'yup'

export const createSchema = yup.object({
  product_id: yup.string().required('Nội dung này không được để trống!').max(50, 'Không được vượt quá 50 ký tự!'),
  price: yup.number(),
  stock: yup.number(),
  extinfo: yup.object().shape({
    tier_index: yup
      .array(),
      is_pre_order: yup
      .boolean()
  }),
})

export const updateSchema = yup.object({
  product_id: yup.string().required('Nội dung này không được để trống!').max(50, 'Không được vượt quá 50 ký tự!'),
  price: yup.number(),
  stock: yup.number(),
  extinfo: yup.object().shape({
    tier_index: yup
      .array(),
      is_pre_order: yup
      .boolean()
  }),
})