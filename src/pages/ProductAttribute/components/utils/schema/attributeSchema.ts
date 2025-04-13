import * as yup from 'yup'

export const createSchema = yup.object({
    type: yup.string().required('Nội dung này không được để trống!').max(50, 'Không được vượt quá 50 ký tự!')
    , value: yup.string().required('Nội dung này không được để trống!').max(50, 'Không được vượt quá 50 ký tự!')
})

export const updateSchema = yup.object({
  type: yup.string().required('Nội dung này không được để trống!').max(50, 'Không được vượt quá 50 ký tự!')
  , value: yup.string().required('Nội dung này không được để trống!').max(50, 'Không được vượt quá 50 ký tự!')
})