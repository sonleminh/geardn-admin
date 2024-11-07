import * as yup from 'yup'

export const createSchema = yup.object({
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
  price: yup.number(),
  stock: yup.number(),
  extinfo: yup.object().shape({
    tier_index: yup
      .array(),
      is_pre_order: yup
      .boolean()
  }),
})