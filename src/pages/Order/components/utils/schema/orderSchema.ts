import * as yup from 'yup'

export const createSchema = yup.object({
  customer: yup.object().shape({
    name: yup.string().required('Nội dung này không được để trống!').max(30, 'Không được vượt quá 30 ký tự!'),
    phone: yup.string().max(15, 'Không được vượt quá 15 ký tự!'),
    mail: yup.string().email('Vui lòng nhập đúng định dạng email').max(30, 'Không được vượt quá 30 ký tự!'),
  }),
  shipment: yup.object().shape({
    method: yup.number().required('Nội dung này không được để trống!'),
  }),
  payment: yup.object().shape({
    method: yup.string().required('Nội dung này không được để trống!'),
  }),
})

export const updateSchema = yup.object({
  customer: yup.object().shape({
    name: yup.string().required('Nội dung này không được để trống!').max(30, 'Không được vượt quá 30 ký tự!'),
    phone: yup.string().max(15, 'Không được vượt quá 15 ký tự!'),
    mail: yup.string().email('Vui lòng nhập đúng định dạng email').max(30, 'Không được vượt quá 30 ký tự!'),
  }),
  shipment: yup.object().shape({
    method: yup.number().required('Nội dung này không được để trống!'),
  }),
  payment: yup.object().shape({
    method: yup.string().required('Nội dung này không được để trống!'),
  }),
})