import * as yup from 'yup'

export const createSchema = yup.object({
  key: yup.string().required('Nội dung này không được để trống!').max(30, 'Không được vượt quá 30 ký tự!'),
  name: yup.string().required('Nội dung này không được để trống!').max(30, 'Không được vượt quá 30 ký tự!'),
  image: yup.string().required('Nội dung này không được để trống!'),
  is_disabled: yup.boolean().required('Nội dung này không được để trống!')
})

export const updateSchema = yup.object({
  key: yup.string().required('Nội dung này không được để trống!').max(30, 'Không được vượt quá 30 ký tự!'),
  name: yup.string().required('Nội dung này không được để trống!').max(30, 'Không được vượt quá 30 ký tự!'),
  image: yup.string().required('Nội dung này không được để trống!'),
  is_disabled: yup.boolean().required('Nội dung này không được để trống!')
})