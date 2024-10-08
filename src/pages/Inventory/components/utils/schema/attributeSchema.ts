import * as yup from 'yup'

export const createSchema = yup.object({
    title: yup.string().required('Nội dung này không được để trống!').max(490, 'Không được vượt quá 490 ký tự!')
    , tags: yup.array().of(
        yup.object().shape({
        value: yup.string().required('Value is required'),
        label: yup.string().required('Label is required'),
      })).required('Nội dung này không được để trống!').min(1, 'Nội dung này không được để trống!')
    
})

export const updateSchema = yup.object({
    title: yup.string().required('Nội dung này không được để trống!').max(490, 'Không được vượt quá 490 ký tự!')
    , tags: yup.array().of(
        yup.object().shape({
        value: yup.string().required('Value is required'),
        label: yup.string().required('Label is required'),
      })).required('Nội dung này không được để trống!').min(1, 'Nội dung này không được để trống!')
   
})